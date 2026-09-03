# Shard 043: Shared Runtime Projection Addendum - 2026-08-13

Source: `Plans/FinalGUISpec.md`

Source lines: L5290-L26356

Source SHA256: `75353a8d3278f32136ccd84b1d3526d638c05770acdf4b1c617783ed59ac85de`

---

## Shared Runtime Projection Addendum - 2026-08-13

The GUI consumes shared runtime projections and owner-defined state; it does not
become a lifecycle, policy, receipt, command, event, or persistence authority.
Every runtime-backed surface carries freshness, exact object identity, disabled
or wait reason when applicable, and canonical receipt/artifact routes. A stale or
conflicted projection may remain inspectable, but it cannot silently authorize a
mutation. Controls without complete Commands and production Wiring coverage are
disabled with the owner-supplied reason or omitted.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/usage-feature.md

### F3-506 - Thread Shell Detail And Reconnect Projection

```yaml
plan_unit_id: F3-506
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Thread rails render lightweight ThreadShell rows, visibly pinned threads may render bounded PinnedSummary data,
  and only the focused thread subscribes to ThreadDetail transcript, tool, and activity streams. Cached domain
  state, durable outbox state, server continuation, reconnect replay or snapshot progress, buffered-live catch-up,
  and stream-coalescing freshness remain visible without full-detail fanout, duplicate effects, fabricated
  provider activity, or loss of immediate approval, failure, cancellation, completion, security, or lease-loss changes.
gui_related: true
gui_classification_reason: This unit defines visible thread-list density, focused detail, offline queueing, reconnect, catch-up, and stream presentation.
depends_on: [ACD-445, SIR-004, SIR-005]
unblocks: []
acceptance_criteria:
  - Large thread lists subscribe to ThreadShell only; pinning adds bounded PinnedSummary and focus alone adds ThreadDetail.
  - The UI distinguishes cached, synchronizing, current, stale, and failed domain state from transport connectivity.
  - Queued, waiting, retryable, cancelled, rejected-stale, and accepted outbox outcomes do not imply a provider call or invite an idempotency-bypassing resend.
  - Reconnect shows epoch-fenced replay or snapshot plus buffered-live convergence, and coalescing never hides an owner-defined immediate transition.
  - Client loss is shown as loss of observation or control connectivity, not cancellation of admitted server-owned work.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future GUI thread shell-detail offline-reconnect and coalescing matrix]
risk_class: gui_thread_projection_fanout_or_reconnect_drift
reasoning_tier: high
context_scope: shared_runtime_thread_projection
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: gui_thread_runtime_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md
preserved_exact_tokens: [ThreadShell, PinnedSummary, ThreadDetail, continuing on the server]
negative_constraints: [Do not subscribe every list row to full detail., Do not make client cache canonical., Do not treat disconnect as cancellation., Do not invent reconnect or outbox state in the GUI.]
owner_hints: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, Plans/Shared_Integration_Runtime.md]
```

### F3-507 - Work Readiness Lease And Evidence Projection

```yaml
plan_unit_id: F3-507
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime-backed GUI surfaces consume ObservableWork, InstallationResolver, installation lifecycle, authentication,
  route readiness, RuntimeResourceGovernor admission, leases, and OperationalAwarenessService as separate read-only
  projections. They show exact Host, Environment, and Source target; requested and effective state; freshness;
  typed wait, conflict, pressure, disabled, and reevaluation reasons; and canonical receipt, log, and artifact
  drill-through without collapsing discovery, installation, process exit, authentication, readiness, Usage, lease
  possession, or awareness into one success indicator.
gui_related: true
gui_classification_reason: This unit defines visible work truth, setup and readiness disclosure, conflicts, waits, and evidence navigation.
depends_on: [SIR-003, SIR-006, SIR-007, UF-091]
unblocks: []
acceptance_criteria:
  - ObservableWork phase, typed wait reason, reevaluation condition, cancellation, and terminal outcome remain distinct from spinner or command-dispatch state.
  - Provider setup exposes an explicit official-source action for the exact Host and Environment; first provider-CLI acquisition is never shown as automatic, baseline, preseeded, or silent.
  - Installation evidence, authentication, account or route readiness, and Usage are separate rows or clearly separate axes, and unknown evidence never renders ready.
  - Lease collision, stale holder or generation, cleanup pending, resource pressure, and awareness current, partial, stale, unavailable, or conflicted states retain owner-defined disabled and remediation reasons.
  - Receipt, log, and artifact actions use canonical object routes and reveal no secret, raw registry, or protected AuthBrowserSession detail.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future GUI ObservableWork installation-readiness lease-awareness and drill-through matrix]
risk_class: gui_runtime_success_or_authority_conflation
reasoning_tier: high
context_scope: shared_runtime_work_readiness_projection
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/Shared_Integration_Runtime.md, Plans/usage-feature.md]
node_compile_hint: {mode: gui_work_readiness_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
preserved_exact_tokens: [ObservableWork, InstallationResolver, RuntimeResourceGovernor, OperationalAwarenessService]
negative_constraints: [Do not infer readiness from PATH, version text, process exit, authentication, lease ownership, or awareness., Do not let a stale projection authorize mutation., Do not create GUI-local receipts or remediation state.]
owner_hints: [Plans/FinalGUISpec.md, Plans/Shared_Integration_Runtime.md, Plans/Release_Supply_Chain.md, Plans/Multi-Account.md]
```

### F3-508 - BSD And Conditional Advice Presentation

```yaml
plan_unit_id: F3-508
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  BSD presentation consumes the independent Off, Auto, and On policy with effective default and recommended value Auto.
  Silent and duplicate-suppressed outcomes add no transcript item; material advice appears as
  one compact attributable advisory note with freshness and receipt or Usage drill-through. Timeout, refusal,
  quota, fallback loss, malformed output, or provider failure never blocks or changes primary-work outcome.
  Time-Traveling conditional-rule effects appear only as bounded activity or receipt explanations and are not
  rewind, restore, branch navigation, permission, approval, or mutation controls.
gui_related: true
gui_classification_reason: This unit defines user-visible BSD mode, advisory notes, silence, failures, and conditional-rule explanations.
depends_on: [ACD-446, GRS-045, RM-050, SIR-010, UF-091]
unblocks: []
acceptance_criteria:
  - Off shows no advisory provider call, Auto indicates only owner-defined risk or phase evaluation, and On indicates eligible-turn evaluation subject to quota.
  - Silent or duplicate-suppressed advice produces no transcript message while retaining permitted operational and Usage evidence.
  - Advice is visually distinct from system, assistant, approval, and safety authority and cannot expose an enabled mutation control.
  - Missing command or production-wiring coverage leaves BSD mode mutation and affected Goal controls disabled or omitted; this owner mints no command ID.
  - AuthBrowserSession, secrets, unredacted artifacts, tools, approval controls, and hidden memory are absent from advice and details.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future GUI BSD silent-duplicate-failure-authority and conditional-rule matrix]
risk_class: gui_advisory_authority_or_visibility_drift
reasoning_tier: high
context_scope: bsd_conditional_rule_presentation
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, Plans/Goal_Runtime_System.md, Plans/Run_Modes.md]
node_compile_hint: {mode: gui_bsd_advice_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
preserved_exact_tokens: [Off, Auto, On, effective default Auto, AuthBrowserSession]
negative_constraints: [Do not present advice as authority., Do not let advisory failure block primary work., Do not expose protected browser state., Do not imply Time-Traveling is rewind.]
owner_hints: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, Plans/Run_Modes.md, Plans/usage-feature.md]
```

### F3-509 - Developer Session MCP And Protected Browser Projection

```yaml
plan_unit_id: F3-509
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Developer-service GUI consumes typed DebugSession, EvalSession, MCP lifecycle, and PM-native Browser Program
  projections without merging their lifecycles. Debug and Eval views retain exact target, owner, lease, generation,
  wait, output, artifact, restart, and cleanup state; MCP shows requested and effective availability, transport,
  initialization, capability, authentication, epoch, retry, subscription, and rollback state; ordinary Browser
  views show BrowserWorkspace, BrowserPage, controller lease, PageGeneration, and read-only observer status.
  Protected AuthBrowserSession content and controls render only inside its foreground human-only surface; every
  other GUI consumer may receive only policy-permitted redacted lifecycle or denial metadata.
gui_related: true
gui_classification_reason: This unit defines visible debug, evaluation, MCP, browser-session, controller, and protected human-auth boundaries.
depends_on: [SIR-008, MI-040, SMPFS-139, SMPFS-140, SMPFS-141, SMPFS-142, SMPFS-143, SMPFS-144]
unblocks: []
acceptance_criteria:
  - DebugSession and EvalSession views never collapse DAP frame evaluation into persistent kernels or imply a hidden global Eval session.
  - MCP projections distinguish requested and effective axes, old-epoch state, the bounded one-retry rule, subscription rollback, and disabled reason without inventing server truth.
  - Browser controller ownership, read-only observation, PageGeneration, lease conflict, and stale-action rejection are visible and focus or tab selection never implies mutation authority.
  - The ordinary browser surface names only PM-native Browser Program and Expert Browser Program capabilities and exposes no PM Playwright facade, compatibility label, command, port, MCP route, package, or capture engine.
  - AuthBrowserSession is human-only, ephemeral, domain-restricted, and redacted; agents, tools, BSD, awareness detail, recorders, DOM or PageRepresentation readers, screenshots, console, network capture, and storage export have zero visibility or control.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-030 through ATS-035 future executable matrices, future GUI developer-session MCP browser-boundary matrix]
risk_class: gui_developer_session_or_protected_browser_boundary_escape
reasoning_tier: high
context_scope: developer_session_mcp_browser_projection
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md, Plans/MCP_Integration.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
node_compile_hint: {mode: gui_developer_runtime_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
preserved_exact_tokens: [DebugSession, EvalSession, MCP, Browser Program, Expert Browser Program, AuthBrowserSession, PageGeneration, human-only]
negative_constraints: [Do not merge developer-service lifecycles., Do not infer controller authority from focus., Do not expose a PM Playwright surface., Do not expose protected authentication content or controls outside the human-only surface.]
owner_hints: [Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md, Plans/MCP_Integration.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
```

### F3-003 - Object-First Concern Search

```yaml
plan_unit_id: F3-003
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Global and Orchestrator search distinguish local tab filtering from object-first cross-tab
  route-aware search so concern, evidence, history, ledger, and graph results land on canonical
  object routes.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: object-first_concern_search
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0004"
preserved_exact_tokens:
- "Search in this tab"
- "Search Orchestrator"
- "Orchestrator search"
- "tab-local search"
- "/filtering"
- "object-first"
- "cross-tab"
- "route-aware"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-004 - Concern Surface Record Schema

```yaml
plan_unit_id: F3-004
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Concern surfaces expose Progress, Seams, Evidence, History, and Ledger views over concern-linked
  evidence, package rollups, exact source references, split/supersession, and canonical concern
  record schema fields.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concern_surface_record_schema
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0005"
preserved_exact_tokens:
- "Progress"
- "Seams"
- "Evidence"
- "History"
- "Ledger"
- "/evidence"
- "/package"
- "/routing"
- "/blocked/remediation"
- "/corroboration/graph"
- "/recovery"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Concern record surfaces expose canonical record schema rather than a flattened summary row."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-005 - Concern Lineage And Guided Actions

```yaml
plan_unit_id: F3-005
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Concern lineage transitions use merge, split, and superseded with retained lineage refs,
  redirects, and guided flows for structural actions instead of one-click menus or free-text
  history.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concern_lineage_and_guided_actions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0005"
preserved_exact_tokens:
- "merge"
- "split"
- "superseded"
- "resolution_kind = split"
- "/redirect"
- "merged-away"
- "/newer"
- "/split/supersession"
- "guided flows"
negative_constraints:
- "Object-specific context menus must not expose mutation actions merely because a generic shell menu has a matching verb."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-006 - Projection Trust Grammar

```yaml
plan_unit_id: F3-006
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Projection-backed surfaces display projection_freshness and projection_health as runtime trust
  grammar, keep trust_tier under browser/preview semantics, and expose trust state and last
  updated as first-class UI fields.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: projection_trust_grammar
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0006"
preserved_exact_tokens:
- "projection_freshness"
- "projection_health"
- "trust_tier"
- "/browser"
- "/degraded"
- "/trust"
- "trust state"
- "last updated"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-007 - Shared Attention Labels

```yaml
plan_unit_id: F3-007
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Shared attention labels carry owner route, projection state, and account or provider context for
  approval, seam blocking, graph patches, recovery, provider/account pressure, and projection
  degradation.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shared_attention_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0006"
preserved_exact_tokens:
- "Waiting on user approval"
- "Seam integration blocked"
- "Graph patch required"
- "Recovery in progress"
- "Provider/account pressure"
- "Projection trust degraded"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-008 - Freshness Gated Mutations

```yaml
plan_unit_id: F3-008
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Projection-backed surfaces use freshness_state values current, refreshing, stale, degraded, and
  unavailable, and stale or degraded states narrow, disable, or require canonical/current
  revalidation before mutation-bearing actions.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: freshness_gated_mutations
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0006"
preserved_exact_tokens:
- "freshness_state"
- "current"
- "refreshing"
- "stale"
- "degraded"
- "unavailable"
- "last_updated_at"
- "data_source_kind"
- "degraded_reason"
- "action_gate_reason"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale or degraded projection state narrows or disables mutation-bearing actions until revalidation."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-009 - Progress Only Widget Hostability

```yaml
plan_unit_id: F3-009
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Only Progress remains widget-hosted in the current Orchestrator model; tier-era tabs,
  task/subtask fields, older event names, and legacy GUI inventory entries remain compatibility
  signals behind native Orchestrator surfaces.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: progress_only_widget_hostability
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0007"
preserved_exact_tokens:
- "Progress"
- "Tiers"
- "widget.tier_tree"
- "widget.current_task"
- "widget.progress_bars"
- "tier_id"
- "HITL"
- "PuppetMasterEvent"
- "/task/subtask"
- "wizard_attention_required"
negative_constraints:
- "FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling."
compatibility_only_notes:
- "Tier-centric Orchestrator and Widget_System vocabulary is preserved only as compatibility/search vocabulary."
stale_retired_dispositions:
- "Six-tab Tiers carry-through and tier-oriented Progress widgets are stale compatibility inputs."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-010 - Widget Layout Migration Scope

```yaml
plan_unit_id: F3-010
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Widget layout migration uses widget_layout as the active layout family while dashboard_layout
  and dashboard_layout:v1 remain read-only migration or backup names with explicit persistence
  scope.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: widget_layout_migration_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0007"
preserved_exact_tokens:
- "dashboard_layout:v1"
- "widget_layout:v1:dashboard"
- "widget_layout"
- "dashboard_layout"
- "read-only migration backups"
- "orchestrator:progress"
negative_constraints: []
compatibility_only_notes:
- "dashboard_layout and dashboard_layout:v1 are backup/migration names."
stale_retired_dispositions:
- "Retired layout keys are read-only migration backups."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-011 - Blocked HITL Escalation Identity

```yaml
plan_unit_id: F3-011
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Blocked-notice and graph HITL consumers expose blocked_sequence, approval_scope_key, report_ref,
  startup_recovered, action_available, escalation_level, and ordered allowed_action_ids instead of
  a second approval identity.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_hitl_escalation_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0008"
preserved_exact_tokens:
- "blocked_sequence"
- "approval_scope_key"
- "report_ref"
- "startup_recovered"
- "action_available"
- "escalation_level"
- "allowed_action_ids[]"
- "hitl_request_id"
negative_constraints: []
compatibility_only_notes:
- "hitl_request_id is compatibility display metadata, not a second HITL approval identity."
stale_retired_dispositions:
- "Skeletal blocked-notice flow fields are stale-survivor cleanup targets."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-012 - Action Confirmation Policy

```yaml
plan_unit_id: F3-012
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Bulk live actions choose light, strong, or hard_gate confirmation based on blocked/recovery
  lineage and exact target preview, with destructive remove defaulting strong and hard gates
  showing allowed actions and consequences.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: action_confirmation_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0009"
preserved_exact_tokens:
- "light"
- "strong"
- "hard_gate"
- "/remove"
- "/recovery"
- "archive/prune"
- "worktree cleanup"
- "safe batch semantic"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-013 - Mutation Gate Preconditions

```yaml
plan_unit_id: F3-013
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime mutation and recovery controls require schema/gate preconditions for allowed_action_ids,
  trust, account capability, and runtime capability; stale visibility is not action authority.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: mutation_gate_preconditions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0009"
preserved_exact_tokens:
- "/schema/gate"
- "allowed_action_ids"
- "allowed_action_ids[]"
- "freshness /trust"
- "/runtime"
- "Stale visibility is not action authority"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale visibility is not action authority when projection trust drops."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-014 - DAE Replay Boundary

```yaml
plan_unit_id: F3-014
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  DAE tool-event reconstruction needs richer event payloads and a reconciled outcome taxonomy
  before GUI surfaces can replay DAE tool-event history as authoritative runtime state.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dae_replay_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0009"
preserved_exact_tokens:
- "DAE tool-event reconstruction"
- "richer event payloads"
- "outcome taxonomy"
- "authoritative runtime state"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-015 - Canonical Term System

```yaml
plan_unit_id: F3-015
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The canonical term system owns stable object state/action names from docs and runtime contracts.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: canonical_term_system
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0010"
preserved_exact_tokens:
- "canonical term system"
- "/state/action"
- "/runtime/contracts"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Canonical term ownership is separate from help and contextual help ownership."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-016 - Help And Contextual Affordances

```yaml
plan_unit_id: F3-016
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The help entry system owns explainer pages and cards, while contextual help owns inline
  tooltips, badges, hover copy, and small what-is-this affordances.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: help_and_contextual_affordances
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0010"
preserved_exact_tokens:
- "explainer pages"
- "/cards"
- "tooltips"
- "badges"
- "hover copy"
- "what is this?"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-017 - Notification Routing Semantics

```yaml
plan_unit_id: F3-017
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Notification and attention copy route alert-level, event-family, backbone event, action, and
  condition-aging terms through shared owner docs, preserving resolved versus dismissed or
  acknowledged semantics.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: notification_routing_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0011"
preserved_exact_tokens:
- "alert-level"
- "event-family"
- "attention_required"
- "blocked"
- "resolved"
- "dismissed"
- "/acknowledged"
- "Action Required"
negative_constraints:
- "Active blockers must never appear unblocked through dismissal alone."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-018 - Sparse Tab Badges

```yaml
plan_unit_id: F3-018
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Tab badges stay sparse and purposeful, with the Progress badge representing meaningful
  action-required count and other tabs using targeted counts or dot-badges.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: sparse_tab_badges
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0011"
preserved_exact_tokens:
- "Progress"
- "/action-required"
- "dot-badges"
- "unread-like counters"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-019 - Object First Route Destinations

```yaml
plan_unit_id: F3-019
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Canonical route payloads target source_control, repository_automation, docker_manager, or document_pane;
  the legacy github_actions input normalizes to repository_automation with a GitHub automation binding and never
  creates another occupant. Routes normalize message, scheduler, package, lane, worktree, concern, promotion, and graph lineage
  through one object-first route shape.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: object_first_route_destinations
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0012"
preserved_exact_tokens:
- "source_control"
- "repository_automation"
- "github_actions (migration-read alias only)"
- "docker_manager"
- "document_pane"
- "/message"
- "/package/lane"
- "/worktree/concern/promotion/graph"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-020 - Route Payload Owner Boundary

```yaml
plan_unit_id: F3-020
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Contracts_V0 owns the canonical route payload, target model, and object_kind enum while
  Glossary.md owns user-facing object_kind vocabulary for help and downstream copy.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: route_payload_owner_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0012"
preserved_exact_tokens:
- "Contracts_V0"
- "Contracts_V0.md"
- "object_kind"
- "Glossary.md"
- "canonical route payload"
- "target model"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0 owns route payload schema; Glossary.md owns user-facing object_kind vocabulary."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-021 - Project Summary Attention Projections

```yaml
plan_unit_id: F3-021
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  project_summary is an overwritten current-state projection while project_attention_item rows
  preserve active, resolved, dismissed, quieted, source_object_ref, remediation.resolved, account
  display, actor, route-payload, and projection semantics.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: project_summary_attention_projections
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0014"
preserved_exact_tokens:
- "project_summary"
- "project_attention_item"
- "/dismissed/quieted"
- "source_object_ref"
- "remediation.resolved"
- "/actor"
- "project-attention projections"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-022 - Concrete Account GUI Display

```yaml
plan_unit_id: F3-022
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Provider dispatch and account identity GUI surfaces display concrete-account request,
  account_switch_reason, account, execution-role, model variant, role-scoped pool selection,
  operational identity, switch history, and trust state.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concrete_account_gui_display
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0015"
preserved_exact_tokens:
- "ProviderRequestEnvelope"
- "account_switch_reason"
- "/account"
- "execution-role"
- "/model/variant"
- "role-scoped pool selection"
- "operational identity"
- "switch-history"
negative_constraints:
- "The GUI must not imply shared token ownership across accounts, providers, or execution roles."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-023 - Requested Identity Owner Boundary

```yaml
plan_unit_id: F3-023
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Prompt_Pipeline locks requested/effective identity semantics including concrete-account intent,
  while tier-era override ownership remains compatibility vocabulary only.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: requested_identity_owner_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0015"
preserved_exact_tokens:
- "Prompt_Pipeline.md"
- "/effective"
- "concrete-account intent"
- "tier-era override ownership"
- "compatibility vocabulary"
negative_constraints: []
compatibility_only_notes:
- "Tier-era override ownership is compatibility vocabulary only."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-024 - Operational Identity Rows

```yaml
plan_unit_id: F3-024
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Operational identity is distinct from provider-account identity, and worker identity rows must
  expose execution_role and operational target context before GUI surfaces treat them as complete
  runtime identity.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: operational_identity_rows
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0016"
preserved_exact_tokens:
- "operational identity"
- "provider-account identity"
- "execution_role"
- "operational target context"
- "lane-backed operational identity"
- "Source Control"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-025 - Projection Vocabulary Compatibility

```yaml
plan_unit_id: F3-025
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Compatibility-only source vocabulary is noncanonical, and live wording must use owner
  terminology for projection freshness versus projection health.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: projection_vocabulary_compatibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0017"
preserved_exact_tokens:
- "Projection freshness vs projection health"
- "Compatibility-only source vocabulary"
- "noncanonical"
- "owner terminology"
negative_constraints: []
compatibility_only_notes:
- "Compatibility-only source vocabulary is noncanonical; live wording uses owner terminology."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-026 - Compliance And Slint Baseline

```yaml
plan_unit_id: F3-026
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec follows DRY_Rules and Contracts_V0, uses Puppet Master naming and deterministic
  defaults, and establishes Rust stable 1.96.1 plus Slint 1.17.1 with slint_build and renderer choices as the
  authoritative implementation baseline.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: compliance_and_slint_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0020"
preserved_exact_tokens:
- "Plans/DRY_Rules.md"
- "Plans/Contracts_V0.md"
- "Puppet Master"
- "Rust stable 1.96.1"
- "Slint 1.17.1"
- "slint_build"
- "winit + Skia"
- "FemtoVG-wgpu"
- "software renderer"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Compliance statement preserves SSOT references and deterministic Decision_Policy defaults."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-027 - GUI Rewrite Shell Summary

```yaml
plan_unit_id: F3-027
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Slint GUI replaces the Iced GUI with an IDE shell of Activity Bar, Primary Content, Side
  Panel, Bottom Panel, status bar, deterministic themes, detachable panels, dashboard
  rearrangement, and event-driven updates.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: gui_rewrite_shell_summary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0022"
preserved_exact_tokens:
- "Iced-based GUI"
- "Slint 1.17.1"
- "IDE-shell layout"
- "Activity Bar"
- "Primary Content"
- "Side Panel"
- "Bottom Panel"
- "Retro Dark"
- "Retro Light"
- "Basic Modern"
- "invoke_from_event_loop"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-028 - New Surfaces And Promoted Workflows

```yaml
plan_unit_id: F3-028
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI surface set includes Usage, File Manager, editor surface, Chat, Agent Activity,
  Artifacts, Source Control, Actions & Pipelines, Docker Manager, Run & Debug, Assistant Debug Mode,
  project switching, language detection, audio feedback, catalog/sync, and SSH remote editing.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: new_surfaces_and_promoted_workflows
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0022"
preserved_exact_tokens:
- "Usage page"
- "File Manager panel"
- "Chat panel"
- "Agent Activity pane"
- "Artifacts"
- "Source Control"
- "GitHub Actions"
- "Docker Manager"
- "Run & Debug"
- "Assistant Debug Mode"
- "SSH remote editing"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-029 - Core Stack Technologies

```yaml
plan_unit_id: F3-029
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The core GUI stack uses Rust, Slint markup compiled by slint_build, winit plus Skia with
  FemtoVG-wgpu and software fallbacks, redb for layout persistence, seglog for events, and Tantivy
  for search.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: core_stack_technologies
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0024"
preserved_exact_tokens:
- "Rust"
- "Slint 1.17.1"
- "slint_build"
- "winit + Skia"
- "winit + FemtoVG-wgpu"
- "Software renderer"
- "redb"
- "seglog"
- "Tantivy"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-030 - GUI Technology Exclusion

```yaml
plan_unit_id: F3-030
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The native desktop GUI does not use React, Tauri, JavaScript/TypeScript, HTML/CSS, or DOM-rendered
  product UI; it is Rust + Slint `.slint` markup. The Slint/WASM web target may use only minimal
  HTML/canvas bootstrap and generated/minimal JavaScript glue to load the Slint WASM canvas client,
  attach assets and canvas, and connect to approved local services; it must not become an HTML/CSS/JS
  product shell.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Native desktop GUI source remains Rust + Slint `.slint` markup and does not use React, Tauri, JavaScript/TypeScript, HTML/CSS, or DOM-rendered product UI."
- "Slint/WASM web GUI source uses only minimal HTML/canvas bootstrap and generated/minimal JavaScript glue needed to load the WASM canvas client, attach assets and canvas, and connect to approved local services."
- "HTML/CSS/JS product shell, React product UI, Tauri product UI, and DOM-rendered product UI remain forbidden for both native desktop and web product surfaces."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
- "python3 scripts/pm-plans-verify.py validate-gui-asset-policy"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: gui_technology_exclusion
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0025"
preserved_exact_tokens:
- "No React/Tauri/DOM-rendered product UI"
- "minimal HTML/canvas bootstrap"
- "generated/minimal JavaScript glue"
- "HTML/CSS/JS product shell"
- "Rust + Slint `.slint` markup"
negative_constraints:
- "React, Tauri, DOM-rendered product UI, and HTML/CSS/JS product shells are not used for the GUI implementation."
- "The Slint/WASM web target may not expand its bootstrap HTML/canvas and generated/minimal JavaScript glue into a product UI shell."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-031 - Slint Build Integration

```yaml
plan_unit_id: F3-031
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Slint build integration compiles ui/app.slint via build.rs using CompilerConfiguration with
  cosmic style, while visual differences come from a Theme global rather than base style changes.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_build_integration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0026"
preserved_exact_tokens:
- "build.rs"
- "CompilerConfiguration"
- "cosmic"
- "ui/app.slint"
- "slint_build::compile_with_config"
- "Theme global"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-032 - Provider Backend Eligibility Boundary

```yaml
plan_unit_id: F3-032
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Provider CLI backend eligibility remains separate from Slint renderer selection, and Cursor CLI
  must be re-evaluated as an ACP-capable first-class CLI backend before GUI diagnostics classify
  it as legacy stream transport.
gui_related: false
gui_classification_reason: >-
  This unit defines terminology, owner-boundary, runtime, storage, or governance behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: provider_backend_eligibility_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0027"
preserved_exact_tokens:
- "Provider CLI backend eligibility"
- "Slint renderer selection"
- "Cursor CLI"
- "ACP-capable"
- "first-class CLI backend"
- "legacy stream transport"
negative_constraints: []
compatibility_only_notes:
- "Cursor CLI legacy stream classification is deferred until ACP-capable backend eligibility is re-evaluated."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-033 - Slint Backend Selection Diagnostics

```yaml
plan_unit_id: F3-033
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Slint backend selection uses SLINT_BACKEND, persisted app preference, compiled default order,
  deterministic fallback, startup diagnostics, and setup surfaces that show the selected backend.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_backend_selection_diagnostics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0027"
preserved_exact_tokens:
- "SLINT_BACKEND"
- "slint::BackendSelector"
- "winit + Skia"
- "winit + FemtoVG-wgpu"
- "emergency software renderer"
- "startup diagnostic"
- "selected backend"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-034 - IDE Shell Structure Diagram

```yaml
plan_unit_id: F3-034
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The master layout uses a fixed title bar, activity bar, primary content area, right side panel,
  collapsible bottom panel, and status bar with the dimensions and roles shown by the IDE shell
  diagram.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: ide_shell_structure_diagram
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0029"
preserved_exact_tokens:
- "TITLE BAR"
- "ACT BAR"
- "PRIMARY CONTENT AREA"
- "SIDE PANEL"
- "BOTTOM PANEL"
- "STATUS BAR"
- "48px"
- "240-480px"
- "120-300px"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-035 - Structural Zones And Side Panel Rule

```yaml
plan_unit_id: F3-035
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec structural zones use Slint layouts with fixed title/activity/status bars, flexible
  primary content, a side panel resizable between a 220px minimum and a 50vw maximum, collapsible
  bottom panel, and right-hand side-panel occupants rather than separate page surfaces.
  Superseded lineage (2026-07-16, kept findable): the prior contract specified a 240-480px side
  panel.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: structural_zones_and_side_panel_rule
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0030"
preserved_exact_tokens:
- "HorizontalLayout"
- "VerticalLayout"
- "240-480px"
- "Activity Bar surface slot"
- "/File"
- "/Source"
- "/GitHub"
- "/etc"
- "migration labels"
negative_constraints:
- "Legacy labels such as /File, /Source, /GitHub, and /etc must not bypass the right-hand side-panel model."
compatibility_only_notes:
- "Legacy labels /File, /Source, /GitHub, and /etc are migration labels for occupants or groups."
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-036 - Status Bar Indexing Indicator

```yaml
plan_unit_id: F3-036
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The status bar shows project-sensitive sparse n-gram index build or refresh progress only when
  useful, while Search results own the unindexed annotation for true raw-ripgrep fallback.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: status_bar_indexing_indicator
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0030"
preserved_exact_tokens:
- "Building search index - first build may take several minutes"
- "Indexing"
- "Refreshing index"
- "(unindexed)"
- "raw ripgrep"
- ">2 seconds"
negative_constraints:
- "The UI must not imply Search is fully unindexed when a stale-but-valid snapshot is still serving grep or Search."
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale-but-valid snapshots may serve Search while refresh progress is shown."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-037 - System Tray Behavior

```yaml
plan_unit_id: F3-037
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When minimize to tray is enabled, close minimizes instead of quitting, the tray icon reflects
  orchestrator state, click restores focus, the tray menu offers Show/Hide, Pause/Resume
  Orchestrator, and Quit, and notifications respect system settings.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: system_tray_behavior
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0031"
preserved_exact_tokens:
- "minimize to tray"
- "Close button"
- "Tray icon"
- "Show/Hide"
- "Pause/Resume Orchestrator"
- "Quit"
- "HITL approval required"
- "rate limit hit"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-038 - Workspace Tab Project Switching

```yaml
plan_unit_id: F3-038
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Project switching is a workspace-tab operation through Projects, project/session browser,
  command palette, and switch commands; the title bar may show compact context but no longer owns
  the primary project-switch shell.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: workspace_tab_project_switching
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0032"
preserved_exact_tokens:
- "title bar no longer owns primary project switching"
- "workspace-tab"
- "Projects view"
- "project/session browser"
- "command palette"
- "active workspace tab"
- "new workspace tab"
negative_constraints:
- "The title-bar dropdown or strip is non-canonical as the primary project-switch shell."
- "Shell semantics must not assume only one active project context exists at a time."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-039 - Spacing And Density Tokens

```yaml
plan_unit_id: F3-039
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Global spacing, border, active indicator, divider, hard-shadow, and density metrics define
  compact shell layout and panel behavior at desktop and collapsed sizes.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: spacing_and_density_tokens
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0033"
preserved_exact_tokens:
- "XS"
- "SM"
- "MD"
- "LG"
- "XL"
- "2px"
- "3px left-edge accent stripe"
- "Hard shadow"
- "1920x1080"
- "1280x720"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-040 - Reference Space Accounting

```yaml
plan_unit_id: F3-040
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Reference space accounting records expected title/status/activity/side/bottom panel dimensions
  and resulting primary content dimensions for 1920x1080 and 1280x720 layouts.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: reference_space_accounting
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0034"
preserved_exact_tokens:
- "1920x1080"
- "1280x720"
- "48px"
- "380px"
- "160px"
- "1492px"
- "868px"
- "1184px"
- "644px"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-041 - Activity Bar Surface Slot

```yaml
plan_unit_id: F3-041
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Activity Bar is the canonical entry point for persistent right-hand side-panel operational
  surfaces, with required surfaces occupying one right-hand side-panel slot and bottom runtime
  territory kept separate from editor-hosted browsing and preview.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: activity_bar_surface_slot
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0036"
preserved_exact_tokens:
- "Activity Bar"
- "single right-hand side-panel slot"
- "primary-content pages"
- "re-docked"
- "bottom runtime zone"
- "terminal/output/problems/debug/ports"
negative_constraints:
- "Side-panel surfaces must not be described as canonical primary-content pages unless the statement is explicitly about a routed detail page."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md"
- "ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-042 - Canonical Side Panel Inventory

```yaml
plan_unit_id: F3-042
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The canonical side-panel inventory and labels are search, chat, files, source_control,
  repository_automation, docker_manager, artifacts, run_debug, testing, and agents with
  matching labels, tooltips, shortcuts, and command IDs. The testing and agents
  panels joined the inventory per the 2026-07-16 shell sweep promotion (F3-451, F3-452).
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "The side-panel inventory is canonical at 10 panels."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: canonical_side_panel_inventory
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0036"
preserved_exact_tokens:
- "search"
- "chat"
- "files"
- "source_control"
- "repository_automation"
- "docker_manager"
- "artifacts"
- "run_debug"
- "Canonical side-panel descriptions"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The notifications side panel joined the inventory per the 2026-07-16 shell sweep promotion (F3-453) and is retired from the inventory per PMConcept7 title-bar notifications (2026-07-23); the shared alert store and ack/snooze lifecycle survive in F3-453, and durable alerts render via the title-bar notification stack (F3-460) and sprout inbox panel (F3-461)."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-043 - Actions And Pipelines Side Panel Owner Boundary

```yaml
plan_unit_id: F3-043
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Actions & Pipelines is the repository_automation side-panel owner for shell entry, label,
  command-palette surface ID, detachable state, and route-open behavior. Forge_Integrations owns
  the provider-neutral shell and AutomationBinding boundary; GitHub_Integration and other provider
  owners retain their hosted workflow/pipeline, log, artifact, and administration semantics.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: repository_automation_side_panel_owner_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0037"
preserved_exact_tokens:
- "repository_automation"
- "Actions & Pipelines"
- "AutomationBinding"
- "Current Branch"
- "Workflows"
- "Settings"
- "Plans/GitHub_Integration.md"
- "shell-surface owner-boundary"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-044 - Run And Debug Side Panel Owner Boundary

```yaml
plan_unit_id: F3-044
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Run & Debug is the run_debug side-panel owner for runtime diagnostics entry and reveal/focus
  behavior for Problems, Output, Debug Console, and Ports without creating duplicate runtime
  records.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: run_and_debug_side_panel_owner_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0038"
preserved_exact_tokens:
- "run_debug"
- "Problems"
- "Output"
- "Debug Console"
- "Ports"
- "no duplicate runtime records"
- "bottom runtime zone panes"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-045 - Search Panel UI And Result Routing

```yaml
plan_unit_id: F3-045
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Search is a one-visible-at-a-time side-panel occupant with explicit open-focus behavior,
  user/content search UI, grep-style result rows, replace-in-files, and shared OpenFile path/range
  routing.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: search_panel_ui_and_result_routing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0039"
preserved_exact_tokens:
- "/open-focus"
- "/user-search"
- "/content-search"
- "/word/regex"
- "OpenFile"
- "FinalGUISpec.md §15.3"
- "replace-in-files"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-046 - Search Indexing Control And Freshness

```yaml
plan_unit_id: F3-046
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Search owns indexing controls for enable/disable, rebuild, large-file threshold default 10 MB,
  generated-file exclusions, follow-symlinks, visible freshness states, cancellation, and remote
  watcher freshness copy without duplicate watcher setup.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: search_indexing_control_and_freshness
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0039"
preserved_exact_tokens:
- "search-owner"
- "10 MB"
- "CancellationToken"
- "indexed/stale/unindexed/fallback"
- "follow-symlinks"
- "no duplicate watcher"
- "GitHub_Integration.md"
negative_constraints:
- "The GUI must not imply duplicate watcher setup for remote search freshness."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-047 - Object Record Search Results

```yaml
plan_unit_id: F3-047
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Tantivy full-text indexing is not enough for Orchestrator search; rows targeting
  Orchestrator-owned content expose object/record identity and record routes so inspectors and
  audit views land on canonical runtime objects.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: object_record_search_results
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0039"
preserved_exact_tokens:
- "Tantivy"
- "object/record identity"
- "/record"
- "canonical runtime object"
- "Orchestrator search"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-048 - Search Ownership Taxonomy And IDs

```yaml
plan_unit_id: F3-048
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Search ownership is divided across command-palette fuzzy search, FileManager local tree search,
  assistant chat-domain search, Tools project codesearch, LSP semantic search, and Search-panel
  content/find/replace results with explicit state and command IDs.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: search_ownership_taxonomy_and_ids
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0039"
preserved_exact_tokens:
- "fuzzy-search"
- "Chat History Search"
- "chatsearch"
- "codesearch"
- "logsearch"
- "search_panel_state"
- "cmd.search.*"
- "find-in-files"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-049 - Panel Concept And Alias Reconciliation

```yaml
plan_unit_id: F3-049
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Historical concept labels map to canonical side panels: GITHUB ACTIONS migrates to Actions &
  Pipelines with a GitHub automation binding, while Docker Manager and Source Control remain
  separate; DOCKER MANAGE migrates to Docker Manager, Unraid focuses Docker Manager Publish /
  Unraid, and aliases use canonical side-panel IDs.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_concept_and_alias_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0039"
preserved_exact_tokens:
- "Concepts/PuppetMasterDashComp.html"
- "DOCKER MANAGE"
- "UNRAID"
- "cmd.panel.switch"
- "Publish / Unraid"
- "source_control"
- "repository_automation"
- "github_actions"
negative_constraints:
- "The activity bar MUST NOT expose a Git icon that opens GITHUB ACTIONS."
- "unraid does not survive as a first-class panel ID or first-class shell shortcut."
compatibility_only_notes:
- "Older combined Git/GitHub docs are migration evidence only."
stale_retired_dispositions:
- "Concept artifact labels are historical design evidence, not live owner paths."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-050 - Account Help Copy And Pinning Propagation

```yaml
plan_unit_id: F3-050
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Account-switch propagation is visible at shell boundaries, namespace help/copy inventory is
  authored by namespace, and GitHub Actions workflow pinning owns pin/unpin state, badges,
  provenance, stale-pin warnings, and over-pinning tradeoffs.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: account_help_copy_and_pinning_propagation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0039"
preserved_exact_tokens:
- "effective account"
- "hard-refresh"
- "redaction"
- "namespace help copy"
- "cmd.github.actions.pin"
- "cmd.github.actions.unpin"
- "/build/deploy"
- "/event/storage"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale-pin warnings are GitHub Actions affordance state."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-051 - Cross Surface Scaling And Stream Parity

```yaml
plan_unit_id: F3-051
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Graph-heavy and stream-heavy surfaces provide table/list equivalents with keyboard and
  screen-reader parity plus bounded windows, page sizes, live-row caps, memory caps, filter-first
  rules, and stream controls.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: cross_surface_scaling_and_stream_parity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0040"
preserved_exact_tokens:
- "/table"
- "/screen-reader"
- "/graph"
- "initial_window"
- "page_size"
- "max_live_rows"
- "max_in_memory_rows"
- "filter-first"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Orchestrator_Page.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-052 - Advanced Subview Discoverability

```yaml
plan_unit_id: F3-052
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Deep subviews stay discoverable through visible affordances, Command Palette coverage, Customize
  or Show Advanced actions, default-open/collapsed state, pinned sections, remembered expansion,
  and summary versus detail modes.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: advanced_subview_discoverability
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0040"
preserved_exact_tokens:
- "Command Palette coverage"
- "Customize"
- "/Show Advanced"
- "default-open"
- "default-collapsed"
- "pinned sections"
- "remembered expansion state"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-053 - Panel UX State Storage Boundary

```yaml
plan_unit_id: F3-053
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel-specific UX state such as expansion, filters, selected rows, worktree, template, registry,
  and restore state must not be co-mingled with global policy settings owned by Settings
  Branching/Health or Settings Advanced.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_ux_state_storage_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0040"
preserved_exact_tokens:
- "co-mingled"
- "Settings > Branching / Health"
- "Settings > Advanced"
- "per-panel records"
- "/worktree"
- "/template"
- "/registry"
negative_constraints:
- "Panel-specific UX state must not be co-mingled with global policy settings."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Orchestrator_Page.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-054 - Command Palette Overlay And Prefix Modes

```yaml
plan_unit_id: F3-054
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Ctrl+K or Ctrl+P opens a 500-600px centered top-third command palette with fuzzy project
  navigation, commands, recent items, files, explicit open targets, and prefix modes for commands,
  file/symbol mention, and slash commands.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: command_palette_overlay_and_prefix_modes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0041"
preserved_exact_tokens:
- "Ctrl+K"
- "Ctrl+P"
- "500-600px"
- ">"
- "@"
- "/"
- "fuzzy search"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-055 - Command Palette Search Boundaries

```yaml
plan_unit_id: F3-055
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The command palette is transient project-scoped navigation and launcher search; Search owns
  persistent find/replace result state, File Manager owns local tree search, LSP owns semantic
  surfaces, and auto-retrieval remains project-scoped rather than active-worktree scoped.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: command_palette_search_boundaries
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0041"
preserved_exact_tokens:
- "transient project-scoped"
- "Search side panel"
- "persistent result list"
- "File Manager search"
- "LSP symbol"
- "Auto-retrieval"
- "project-scoped"
negative_constraints:
- "GUI search surfaces must not imply auto-retrieval corpus was narrowed to only the active worktree."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-056 - Search Command Family And Domain Taxonomy

```yaml
plan_unit_id: F3-056
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Search command family includes cmd.search.show, find_in_files, replace_in_files,
  open_result, navigation/toggle/scope/expand/collapse/replace actions, while shell taxonomy
  separates command palette, Search side panel, File Manager, LSP, and chat-domain search.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: search_command_family_and_domain_taxonomy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0041"
preserved_exact_tokens:
- "cmd.search.show"
- "find_in_files"
- "replace_in_files"
- "open_result"
- "/history/message"
- "toggle_regex"
- "replace_all"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-057 - Breadcrumb Strip

```yaml
plan_unit_id: F3-057
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The primary content breadcrumb strip is retired per Jared's 2026-07-16 decision; no breadcrumb
  strip renders above primary content, and group/page orientation is carried by the compacted
  page header. Retired lineage (kept findable): the prior contract specified a 20px tall strip
  displaying Group > Page with clickable breadcrumb items for quick navigation within a group.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: breadcrumb_strip
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0042"
preserved_exact_tokens:
- "Group > Page"
- "20px"
- "clickable"
- "Breadcrumb"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The Group > Page breadcrumb strip is retired per the 2026-07-16 shell sweep promotion; the prior 20px strip contract is preserved above as retired lineage."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-058 - Shortcut Registry And Orchestrator Candidates

```yaml
plan_unit_id: F3-058
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Search, File Manager, Source Control, Chat, Artifacts, runtime, and Orchestrator shortcut
  candidates register through the shortcut registry, appear in Settings Shortcuts, and map through
  command catalog bindings.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shortcut_registry_and_orchestrator_candidates
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0043"
preserved_exact_tokens:
- "Settings > Shortcuts"
- "cmd.search.*"
- "cmd.file.*"
- "cmd.chat.*"
- "cmd.source_control.*"
- "fit graph"
- "toggle generation overlay"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-059 - Shortcut Tiers And Platform Normalization

```yaml
plan_unit_id: F3-059
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Shortcut tiers define day-one, productive, and power-user bindings including Ctrl+K,
  chat/file/search/runtime/debug commands, and a Rust-side registry normalizes Cmd on macOS and
  Ctrl on Windows/Linux while auto-generating help.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shortcut_tiers_and_platform_normalization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0043"
preserved_exact_tokens:
- "Ctrl+K"
- "Ctrl+Shift+F"
- "Ctrl+Shift+`"
- "F5"
- "F10"
- "F11"
- "Rust-side registry"
- "Cmd on macOS"
- "Ctrl on Windows/Linux"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md"
- "ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-060 - Detachable Panel Identity And Required Surfaces

```yaml
plan_unit_id: F3-060
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Detachable panels keep the same canonical surface identity and required detachable surfaces
  include Search, Chat, File Manager, bottom terminal workspace, and editor-embedded terminal
  panels promoted out of the editor stack.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: detachable_panel_identity_and_required_surfaces
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0045"
preserved_exact_tokens:
- "detachable panels"
- "same canonical surface identity"
- "Search panel"
- "Chat panel"
- "File Manager panel"
- "bottom terminal workspace"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-061 - Terminal Detachment Boundaries And Labels

```yaml
plan_unit_id: F3-061
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal detachment keeps the bottom terminal workspace canonical, treats browser/remoted
  terminal access as sibling presentation over the same PTY model, blocks third-party mutation of
  core terminal semantics, and stabilizes derived labels after rename.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_detachment_boundaries_and_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0045"
preserved_exact_tokens:
- "bottom terminal canonical"
- "browser/session model"
- "/presentation"
- "/remoted"
- "PTY model"
- "third-party plugins"
- "/derived labels"
negative_constraints:
- "Arbitrary third-party plugins or open-ended extension hooks cannot mutate core terminal rendering, input, or session semantics."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-062 - Bottom Runtime Workgroup IA

```yaml
plan_unit_id: F3-062
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The bottom runtime zone uses workgroup-first terminal information architecture with workgroups,
  leaf-pane subtabs, optional split-pane trees, left/center/right regions, and a retired
  command-log strip.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: bottom_runtime_workgroup_ia
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0046"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0047"
preserved_exact_tokens:
- "workgroup-first"
- "workgroups"
- "subtabs"
- "split-pane tree"
- "left / center / right"
- "command-log strip is retired"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The separate command-log strip is retired from the canonical layout."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-063 - Terminal Split Grid And Editor Embeddings

```yaml
plan_unit_id: F3-063
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal split grids use visible gutters/resizers, workgroup accents, no split-parent opacity
  enter animation, and editor-hosted stacks that reference existing terminal leaf panes rather
  than creating second terminal sessions.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_split_grid_and_editor_embeddings
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0048"
preserved_exact_tokens:
- "gutters"
- "resizers"
- "workgroup accent"
- "split-parent opacity"
- "existing terminal leaf pane"
- "second terminal session"
negative_constraints:
- "The terminal grid must not use a split-parent opacity enter animation that dims all children during reorder or drag operations."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-064 - Terminal Drag And Drop Contract

```yaml
plan_unit_id: F3-064
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal drag-and-drop accepts pane, subtab, and workgroup payloads, handles same-group pane
  reorder, workgroup drops to editor, stale hover/opacity cleanup, and pane-body drop targets.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_drag_and_drop_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0049"
preserved_exact_tokens:
- "pane"
- "subtab"
- "workgroup payloads"
- "same-group pane reorder"
- "stale hover"
- "opacity"
- "pane-body content"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "DnD cleanup must clear stale hover, opacity, and drag classes after rebuild or dragend."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-065 - Terminal Motion Accessibility Boundary

```yaml
plan_unit_id: F3-065
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Reduced motion applies to terminal enter animations where still used, while removed split-parent
  fade effects remain removed.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_motion_accessibility_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0050"
preserved_exact_tokens:
- "reduced motion"
- "terminal enter animations"
- "split-parent fade effects"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-066 - Panel Dock State Machine

```yaml
plan_unit_id: F3-066
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel docking uses DOCKED and FLOATING states with PanelDock and DockSide variants for right,
  left, and bottom docking, including snap-to-edge and close-floating-window transitions.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_dock_state_machine
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0051"
preserved_exact_tokens:
- "DOCKED"
- "FLOATING"
- "PanelDock"
- "DockSide"
- "Right"
- "Left"
- "Bottom"
- "WindowId"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-067 - Undock Triggers

```yaml
plan_unit_id: F3-067
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panels undock through double-click title tab, drag away from edge, pop-out button, right-click
  tab menu, keyboard shortcut Ctrl+Shift+\, or command palette actions.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: undock_triggers
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0052"
preserved_exact_tokens:
- "Double-click"
- "Drag"
- "Pop-out button"
- "Right-click"
- "Ctrl+Shift+\\"
- "Command palette"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-068 - Floating Panel Snap Zones

```yaml
plan_unit_id: F3-068
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Floating panel snap zones use a 25px edge threshold, a 2px Theme.accent-blue visual cue, instant
  no-easing snap animation, and dock on drop.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: floating_panel_snap_zones
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0053"
preserved_exact_tokens:
- "25px"
- "2px"
- "Theme.accent-blue"
- "instant"
- "no easing"
- "Snap Zones"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-069 - Slint Multi Window Shared Data

```yaml
plan_unit_id: F3-069
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Docked and floating panels render the same Slint component with shared Rust-backed data using
  Window, Arc/RwLock, VecModel, Rc<VecModel<T>>, ModelNotify, and invoke_from_event_loop instead
  of polling timers.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_multi_window_shared_data
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0054"
preserved_exact_tokens:
- "Slint `Window`"
- "Arc<RwLock<...>>"
- "VecModel"
- "Rc<VecModel<T>>"
- "ModelNotify"
- "invoke_from_event_loop"
- "NOT via polling timers"
negative_constraints:
- "Scalar property sync must use invoke_from_event_loop from background threads, not polling timers."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-070 - Detach Discoverability Signals

```yaml
plan_unit_id: F3-070
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel detach discovery uses a 6-dot grip with tooltip copy, an explicit Pop Out button, and a
  one-time first-run hint for Chat or File Manager.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: detach_discoverability_signals
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0055"
preserved_exact_tokens:
- "6 dots"
- "Drag to detach, or double-click to pop out."
- "Pop Out"
- "This panel can be popped out into its own window."
- "Try it"
- "Dismiss"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-071 - Project Scoped Panel Persistence

```yaml
plan_unit_id: F3-071
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel dock state, activity bar icon order, and last visible panel persist per project in redb
  scoped by project_id and restore on startup or project switch, with disconnected-monitor
  fallback.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: project_scoped_panel_persistence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0056"
preserved_exact_tokens:
- "dock state"
- "activity bar icon order"
- "last visible"
- "per project"
- "redb"
- "project_id"
- "floating window"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-072 - Panel Recovery And Focus Edge Cases

```yaml
plan_unit_id: F3-072
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel edge-case recovery keeps shared models synchronized in place, re-docks orphaned floating
  windows on monitor disconnect, resolves snap conflicts deterministically, restores focus to main
  window, prevents cross-window tab traversal, and clamps panel sizes.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_recovery_and_focus_edge_cases
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0057"
preserved_exact_tokens:
- "Rc<VecModel<T>>"
- "monitor disconnect"
- "focus returns"
- "Tab key does NOT cross window boundaries"
- "240px"
- "80px"
- "24px"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-073 - Theme Family Selector Contract

```yaml
plan_unit_id: F3-073
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI exposes exactly eight built-in theme choices across four families, Friendly Dark,
  Friendly Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, and Basic Light,
  with Basic Dark as the untouched first-open/fresh-project factory default. An existing explicit
  saved Project selection survives, and a copied Project receives a detached selection snapshot.
  The former Friendly Dark default and the earlier three-choice Retro Dark/Retro Light/Basic
  contract are superseded lineage kept findable; all eight variants remain supported.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "Basic Dark is used only at the untouched first-open/fresh-project factory boundary; an existing saved Project selection and a copied Project's detached snapshot take precedence."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: theme_family_selector_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0059"
preserved_exact_tokens:
- "Retro Dark"
- "Retro Light"
- "Basic"
- "exactly three built-in theme choices"
- "fourth user-facing built-in theme promise"
negative_constraints:
- "Basic internal palette choice must not create a fourth user-facing built-in theme promise."
compatibility_only_notes: []
stale_retired_dispositions:
- "Friendly Dark as the factory default is superseded by the later Basic Dark first-open/fresh-project contract; Friendly Dark remains a supported variant."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-074 - Theme Token Matrix

```yaml
plan_unit_id: F3-074
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The theme token matrix defines colors, accents, fonts, hard shadows, border widths, radii,
  effects flags, opacity, padding scale, and scrollbar width for all eight built-in variants:
  the Retro Dark, Retro Light, Basic Light, and Basic Dark tables live in section 6.2, and the
  Friendly Dark, Friendly Light, Glass Dark, and Glass Light tables live in the Theme System
  addendum - 2026-07-16 as F3-426 spec data.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: theme_token_matrix
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0060"
preserved_exact_tokens:
- "background"
- "surface"
- "accent-blue"
- "accent-magenta"
- "accent-lime"
- "accent-orange"
- "display-font"
- "pixel-grid-enabled"
- "scanline-opacity"
- "padding-scale"
- "scrollbar-width"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-075 - Retro Effects Generation And Fallback Tiling

```yaml
plan_unit_id: F3-075
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Retro pixel grid and paper texture are generated as tiled images from Rust at startup using
  SharedPixelBuffer, do not use RenderingNotifier, and fall back to manual tiling or a large
  generated tile when ImageFit.repeat is unavailable.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: retro_effects_generation_and_fallback_tiling
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0061"
preserved_exact_tokens:
- "SharedPixelBuffer"
- "Do NOT use `RenderingNotifier`"
- "ImageFit.repeat"
- "GridLayout"
- "Flickable"
- "tiled images"
negative_constraints:
- "Do not use RenderingNotifier for retro texture generation."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-076 - Conditional Theme Overlay Composition

```yaml
plan_unit_id: F3-076
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Theme retro overlays are optional root components bound to Theme.retro-effects-enabled and
  paper-texture flags; implementations must not branch component logic on theme beyond overlay
  presence.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: conditional_theme_overlay_composition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0061"
preserved_exact_tokens:
- "Theme.retro-effects-enabled"
- "PixelGridOverlay"
- "PaperTextureOverlay"
- "paper-texture-enabled"
- "no theme-logic branching"
negative_constraints:
- "Implementations must not branch component logic on theme; only overlay presence or absence changes."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-077 - Theme Switching Live Restart Rules

```yaml
plan_unit_id: F3-077
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Theme switching is live for colors, spacing, borders, overlays, and same-family switches, and
  requires restart for cross-family switches that change loaded font families (Retro's
  Orbitron/Rajdhani, Friendly's Cal Sans/Quicksand/Nunito, or Glass/Basic system fonts); Glass
  and Basic share system fonts so switches between them may be live. Auto presentation mode
  follows the same within-family live rule: when the OS appearance (prefers-color-scheme)
  changes, the selected family resolves to its other variant instantly with no restart.
  Superseded lineage
  (2026-07-16, kept findable): the prior rule named restart for font family changes between
  Retro and Basic and kept Basic one built-in theme family.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: theme_switching_live_restart_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0062"
preserved_exact_tokens:
- "live colors"
- "spacing"
- "borders"
- "overlays"
- "restart required"
- "font family"
- "same-family instant"
- "Basic remains one family"
- "Auto presentation mode"
- "prefers-color-scheme"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-078 - Slint Theme Global Token Contract

```yaml
plan_unit_id: F3-078
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Slint theme global exposes the canonical ThemeMode values for all eight built-in variants
  (friendly-dark, friendly-light, glass-dark, glass-light, retro-dark, retro-light, basic-light,
  basic-dark) and theme token properties for colors, accents, retro effects, paper texture,
  borders, padding, scrollbar width, line height, and base font size, with the property defaults
  illustrative per active variant and basic-dark as the untouched first-open/fresh-project
  factory mode. The former friendly-dark default is superseded lineage. The
  ThemePresentationMode dimension (light, dark, auto) resolves family + mode to one of the same
  eight token sets; in auto the effective variant tracks the OS appearance
  (prefers-color-scheme) live and feeds the identical per-variant tokens.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible theme tokens, visual presentation, and Slint GUI styling state.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_theme_global_token_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0063"
preserved_exact_tokens:
- "ThemeMode"
- "friendly-dark"
- "friendly-light"
- "glass-dark"
- "glass-light"
- "retro-dark"
- "retro-light"
- "basic-light"
- "basic-dark"
- "accent-blue"
- "accent-magenta"
- "accent-lime"
- "accent-orange"
- "paper-texture-enabled"
- "base-font-size"
- "ThemePresentationMode"
- "prefers-color-scheme"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The former friendly-dark default-mode clause is superseded; it remains theme lineage, not the factory selection."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-079 - Rust ThemeVariant Runtime Application

```yaml
plan_unit_id: F3-079
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Rust-side ThemeVariant applies all theme tokens to the Slint AppWindow at runtime for all eight
  built-in variants (FriendlyDark, FriendlyLight, GlassDark, GlassLight, RetroDark, RetroLight,
  BasicLight, and BasicDark), including disabling retro effects for non-Retro variants and
  applying the glass composition tokens only for the Glass variants. In auto presentation mode
  the Rust runtime resolves the active variant via the OS appearance signal
  (prefers-color-scheme) and re-applies the resolved variant tokens live when it changes.
gui_related: true
gui_classification_reason: >-
  This unit defines runtime application of GUI theme and visual styling tokens.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rust_themevariant_runtime_application
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0063"
preserved_exact_tokens:
- "ThemeVariant"
- "RetroDark"
- "RetroLight"
- "BasicLight"
- "BasicDark"
- "apply_to"
- "AppWindow"
- "disable effects"
- "auto presentation mode"
- "prefers-color-scheme"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-080 - Custom Theme Schema And Base Inheritance

```yaml
plan_unit_id: F3-080
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Custom themes are TOML files under the Puppet Master themes directory, specify metadata plus
  token overrides, and inherit unspecified tokens from any built-in variant base named by the
  base field (basic-*, retro-*, glass-*, or friendly-*, for example base = "basic-dark").
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible custom theme configuration and theme authoring behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: custom_theme_schema_and_base_inheritance
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0064"
preserved_exact_tokens:
- "~/.puppet-master/themes/<name>.toml"
- "Solarized Dark"
- 'base = "basic-dark"'
- "token overrides"
- "[meta]"
- "[colors]"
- "[effects]"
- "[fonts]"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-081 - Custom Theme Loading Validation And Hot Reload

```yaml
plan_unit_id: F3-081
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Theme loading scans custom theme TOML files on startup, validates token schema, skips invalid
  files with warning/toast disclosure, and hot-reloads modified active themes while prompting for
  restart on font changes.
gui_related: true
gui_classification_reason: >-
  This unit defines visible theme loading, validation, toast, and live theme update behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: custom_theme_loading_validation_and_hot_reload
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0064"
preserved_exact_tokens:
- ".toml"
- "Theme '{name}' has errors -- see log for details"
- "file watcher"
- "Hot reload"
- "re-scan"
- "font changes"
- "prompt for restart"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-082 - Theme Selector Management Surface

```yaml
plan_unit_id: F3-082
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The title-bar theme selector is a morphing sun/moon icon trigger (sun = manual Light, moon =
  manual Dark, continuous sun-to-moon morph = Auto) opening a menu with a Light/Dark/Auto
  segmented control above four theme-family rows (Friendly, Glass, Retro, Basic); each family
  row shows built-in and custom theme metadata with swatch previews, and a family row becomes a
  dropdown when >4 themes are available in it (built-in + custom). In Auto the selected family
  resolves to its dark or light variant by following the OS appearance (prefers-color-scheme)
  live. Settings > General exposes the theme family + mode controls and theme folder, create,
  import, and export actions.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible theme selector controls and Settings theme management UI.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: theme_selector_management_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0064"
preserved_exact_tokens:
- ">4 themes"
- "color swatch preview"
- "[built-in]"
- "[custom]"
- "Manage themes"
- "Open themes folder"
- "Create new theme"
- "Import theme"
- "Export theme"
- "Light/Dark/Auto"
- "prefers-color-scheme"
- "morphing sun/moon icon trigger"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-083 - Terminal Theme Ownership And Semantic Catalog

```yaml
plan_unit_id: F3-083
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal theme selection supports preview before apply, fast switching, search, contrast
  readability signals, instant apply/revert, and semantic terminal palettes rather than raw
  ANSI-only theme ownership.
gui_related: true
gui_classification_reason: >-
  This unit defines visible terminal theme, preview, palette, and readability behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_theme_ownership_and_semantic_catalog
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0064"
preserved_exact_tokens:
- "terminal color-scheme selection"
- "preview before apply"
- "fast switching"
- "/search"
- "/contrast"
- "instant apply/revert"
- "semantic, not raw ANSI-only"
- "/fun/funky"
- "/expressive"
negative_constraints:
- "Terminal theme schema is semantic, not raw ANSI-only."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Settings > Terminal owns durable terminal appearance/theme/color, default cwd, font, and default behavior controls."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-084 - Custom Font Fallback And Theme Preview

```yaml
plan_unit_id: F3-084
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Custom themes may reference user font files, missing fonts fall back to the base theme with a
  warning toast, and hovering a theme entry shows a live preview widget card before click-to-apply.
gui_related: true
gui_classification_reason: >-
  This unit defines visible custom font fallback and theme preview presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: custom_font_fallback_and_theme_preview
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0064"
preserved_exact_tokens:
- "~/.puppet-master/fonts/"
- ".ttf"
- ".otf"
- ".woff2"
- "missing font"
- "falls back"
- "warning toast"
- "small widget card"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-085 - Theme WCAG Accessibility Contract

```yaml
plan_unit_id: F3-085
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Retro themes may prioritize aesthetic over strict WCAG AA accent compliance, while the Basic
  theme must meet WCAG 2.1 AA for all text and interactive elements with the specified normal and
  large-text contrast ratios.
gui_related: true
gui_classification_reason: >-
  WCAG contrast and theme accessibility are user-visible visual presentation requirements even
  though the source span was initially inferred false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: accessibility_gui
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: theme_wcag_accessibility_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0065"
preserved_exact_tokens:
- "WCAG 2.1 AA"
- "4.5:1"
- "3:1"
- "ACID_LIME"
- "Retro themes"
- "Basic theme"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#13, ContractName:Plans/DRY_Rules.md#7"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-086 - Views Section Owner Boundary

```yaml
plan_unit_id: F3-086
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI surface owns visible display of concerns, progress, artifacts, and help through scoped
  views, while Contracts_V0 owns concern definitions, approval-scope semantics, and route/open
  ownership.
gui_related: true
gui_classification_reason: >-
  This unit defines visible view-surface ownership and interaction boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: views_section_owner_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0066"
preserved_exact_tokens:
- "concerns"
- "progress"
- "artifacts"
- "help"
- "Plans/Contracts_V0.md"
- "visible widget and interaction layer"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Canonical concern definitions, approval scope semantics, and route/open ownership are defined in Plans/Contracts_V0.md."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-087 - Orchestrator Projection Trust And Stale Mutation Gating

```yaml
plan_unit_id: F3-087
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Orchestrator projection state separates freshness from health, reserves trust_tier for preview
  or browser semantics, discloses stale/degraded states, and narrows or disables mutation controls
  until canonical/current revalidation succeeds.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible projection state, copy, and disabled mutation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: orchestrator_projection_trust_and_stale_mutation_gating
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0067"
preserved_exact_tokens:
- "current"
- "refreshing"
- "stale"
- "degraded"
- "unavailable"
- "projection_freshness"
- "projection_health"
- "trust_tier"
- "/degraded"
negative_constraints:
- "Projection-freshness copy never borrows Preview trust_tier or treats browser trust as runtime projection trust."
compatibility_only_notes: []
stale_retired_dispositions:
- "trust_tier is reserved for preview/browser semantics only rather than acting as the general projection-state bucket."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-088 - Orchestrator Progress Widget Scope And Tab View-State

```yaml
plan_unit_id: F3-088
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Only Progress is widget-composed inside Orchestrator; non-Progress tabs use native view-state,
  dense tabs require slice loading and virtualization, and Progress renders coherent historical
  snapshots when focused on a historical run.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Orchestrator widget layout, tab state, and dense-view behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: orchestrator_progress_widget_scope_and_tab_view_state
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0067"
preserved_exact_tokens:
- "Only `Progress`"
- "orchestrator:progress"
- "view-state"
- "Slice-based loading"
- "virtualization"
- "lazy expansion"
- "demand-loaded inspectors"
- "historical snapshots"
negative_constraints:
- "Non-Progress tabs use native view-state contracts rather than widget-layout fields."
compatibility_only_notes:
- "Legacy widget-composed tab keys `orchestrator:tiers`, `orchestrator:evidence`, `orchestrator:history`, and `orchestrator:ledger` plus generic `/remove/move/resize` behavior are migration aliases."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-089 - Legacy Tier Alias Translation And Native Object Routing

```yaml
plan_unit_id: F3-089
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Legacy Tiers, phase/task/subtask, TierChanged, tier_id, widget canvas, and tier-first
  Orchestrator vocabulary remain compatibility aliases only; native GUI routing normalizes through
  object-first route_target, package, seam, lane, and runtime-object behavior.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible navigation, labels, and migration aliases in GUI surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: compatibility_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: legacy_tier_alias_translation_and_native_object_routing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0067"
preserved_exact_tokens:
- "Tiers"
- "phase/task/subtask"
- "TierChanged"
- "tier_id"
- "route_target"
- "package `/seam/lane`"
- "`/package/node`"
- "widget.tier_tree"
- "widget.progress_bars"
negative_constraints:
- "`Progress` widgets must not teach active-tier, `phase-task-subtask`, or `tier-targeted` terminal semantics as the primary operational mental model."
compatibility_only_notes:
- "`Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` carry-through references to `Tab 2: Tiers`, `orchestrator:tiers`, and `FinalGUISpec section 7.7` are legacy aliases only."
- "Legacy tier-era `Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` signals are compatibility inputs only."
- "The old `all Orchestrator tabs are widget canvases` model from `Widget_System.md` and `Orchestrator_Page.md` is compatibility-only."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-090 - Orchestrator Surface Boundaries And Record-Backed Audit

```yaml
plan_unit_id: F3-090
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Source Control owns Git-native mutations, Orchestrator owns operational explanation and recovery
  context, History owns chronological durable story, Ledger owns exact record inspection, and GUI
  downstream surfaces consume Orchestrator routing/projection decisions.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Orchestrator boundary, navigation, and audit-surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: orchestrator_surface_boundaries_and_record_backed_audit
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0067"
preserved_exact_tokens:
- "Source Control"
- "Orchestrator"
- "History"
- "Ledger"
- "record-backed slices"
- "provider `/runtime`"
- "/routing/projection"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "`Source Control` is the execution surface for Git-native mutations, while `Orchestrator` remains the operational surface explaining why those actions matter."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-091 - Dashboard Orchestrator Chat Attention Routing

```yaml
plan_unit_id: F3-091
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard Orchestrator widgets, blocked-node CTAs, thread badges, and live-run cards route
  through one Dashboard to Orchestrator to chat-thread attention contract with overseer/thread,
  lane, active-object, seam, lane, and package-node context.
gui_related: true
gui_classification_reason: >-
  This unit defines visible dashboard, Orchestrator, chat, CTA, and attention-routing behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_orchestrator_chat_attention_routing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0067"
preserved_exact_tokens:
- "widget.orchestrator_status"
- "widget.current_task"
- "dashboard -> Orchestrator -> chat `CTA`"
- "/seam/lane-aware"
- "/seams/lanes"
- "/package/node"
- "blocked-node CtAs"
negative_constraints: []
compatibility_only_notes:
- "Dashboard CtAs demote tiers-first widgets or layouts to compatibility-only presentation."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-092 - Seams Lazy Rollups And Action-Surface Triage

```yaml
plan_unit_id: F3-092
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Seams load compact seam/lane rollups before lazy package and node details, and action surfaces
  classify affordances by navigation versus mutation, palette visibility, shortcut eligibility,
  multi-target safety, and confirmation or reversibility.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Seams expansion, inspector, and action-surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: seams_lazy_rollups_and_action_surface_triage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0067"
preserved_exact_tokens:
- "`Seams`"
- "/seams/lanes"
- "/package/node"
- "navigation vs mutation"
- "palette visibility"
- "shortcut eligibility"
- "/action-light"
- "/high-consequence"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-093 - Shared Runtime Status And Disabled Control Explanations

```yaml
plan_unit_id: F3-093
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime-backed surfaces share one status vocabulary and disabled-control explanation model:
  badges derive from canonical reason codes, and disabled mutation controls expose inline reason,
  hover/focus detail, keyboard accessibility, and recovery CTA.
gui_related: true
gui_classification_reason: >-
  This unit defines visible status labels, badges, disabled controls, tooltips, and recovery UI.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shared_runtime_status_and_disabled_control_explanations
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0068"
preserved_exact_tokens:
- "Running"
- "Ready"
- "Blocked"
- "Needs Attention"
- "Degraded"
- "Stale"
- "Detached"
- "Not Configured"
- "disabled-control"
negative_constraints:
- "/text/badge meaning must stay consistent and derive from canonical reason codes rather than panel-local copy."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-094 - Deep-Link Context And Shell Route Contract

```yaml
plan_unit_id: F3-094
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Deep links from receipts, blocked views, and owner-route attention preserve visible context by
  applying clearable context filters or isolated focus modes, and shell navigation consumes shared
  route contracts before reviving stale tier or widgetized assumptions.
gui_related: true
gui_classification_reason: >-
  This unit defines visible deep-link, shell navigation, filter, and focus behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: deep_link_context_and_shell_route_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0068"
preserved_exact_tokens:
- "Operation receipts"
- "visible context filter chip"
- "isolated focus mode"
- "/search"
- "/focus"
- "Shell `/navigation`"
- "deep-link"
- "stale `Tiers`"
negative_constraints:
- "Shell navigation must consume the shared route contract before reviving stale Tiers or widgetized Orchestrator surface assumptions."
compatibility_only_notes:
- "Shell navigation and deep-link handling must not revive stale Tiers or widgetized Orchestrator surface assumptions."
stale_retired_dispositions:
- "Shell `/navigation` and `deep-link` handling consume the shared route contract before reviving stale `Tiers` or widgetized Orchestrator assumptions."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-095 - Explain This State Evidence Contract

```yaml
plan_unit_id: F3-095
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Explain this state is a GUI affordance on status and blocked UI that may auto-open on first
  block, offers ELI5 plus expert detail, and derives explanations only from canonical reason
  codes, validation fields, allowed actions, state chains, and receipt projections.
gui_related: true
gui_classification_reason: >-
  This unit defines visible explanation affordances and evidence-backed state copy.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: explain_this_state_evidence_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0068"
preserved_exact_tokens:
- "Explain this state"
- "ELI5"
- "expert detail"
- "allowed_action_ids[]"
- "/blocked/diverged/degraded"
- "/event/storage"
- "/events/storage"
- "/tradeoffs"
negative_constraints:
- "The GUI says what data is unavailable instead of filling the gap with generic copy."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-096 - Target Banners Empty States And Dense Accessibility

```yaml
plan_unit_id: F3-096
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Destructive, targeted, and remote-mutating surfaces show effective target/context banners,
  preserve canonical empty-state taxonomy, keep hide-when-unused surfaces discoverable, and provide
  non-color accessibility for dense custom surfaces.
gui_related: true
gui_classification_reason: >-
  This unit defines visible target banners, empty states, accessibility, and discoverability.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: accessibility_gui
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: target_banners_empty_states_and_dense_accessibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0068"
preserved_exact_tokens:
- "/targeted"
- "/runtime/context"
- "Not relevant"
- "Not configured"
- "Unavailable"
- "No data yet"
- "No results for current filter"
- "/screen-reader"
- "/table"
negative_constraints:
- "Empty-state taxonomy entries are distinct states, not interchangeable copy."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-097 - Blocked Recovery Owner-Routed Action Family

```yaml
plan_unit_id: F3-097
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Blocked-state recovery uses one owner-routed action family across Orchestrator, destination
  panels, Dashboard, modal approvals, graph dialogs, chat actions, UI, runtime, and chat-thread
  resolution.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible blocked/recovery routing and remediation affordances.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: owner_route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_recovery_owner_routed_action_family
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0068"
preserved_exact_tokens:
- "Blocked-state integration"
- "owner route"
- "recovery CTA"
- "allowed actions"
- "Dashboard CtAs"
- "modal `/toast` approvals"
- "graph-local dialogs"
- "/recovery"
negative_constraints:
- "If a destination panel cannot host the requested recovery action, it links back to the owner route with the original receipt/filter context preserved; it must not create a competing remediation path."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Resolution-thread ownership belongs to the canonical attention/blocked route, not the surface that happened to display the prompt."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-098 - Governance Policy Outcomes And Partial Receipts

```yaml
plan_unit_id: F3-098
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Governance and policy outcomes render as blocked outcomes with distinct remediation pivots,
  partial receipts, exact policy-blocked object and stage disclosure, resume revalidation, and
  original/current policy or remote outcome retention.
gui_related: true
gui_classification_reason: >-
  This unit defines visible governance-blocked state, receipt, remediation, and revalidation UI.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: governance_policy_outcomes_and_partial_receipts
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0068"
preserved_exact_tokens:
- "Governance and policy outcomes"
- "blocked outcomes"
- "Gatekeeper/Kyverno/Pod"
- "remote_mismatch"
- "partial `/receipts`"
- "/stage"
- "renamed_redirected"
- "transferred targets"
negative_constraints:
- "Governance and policy outcomes are blocked outcomes, not generic failures."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-099 - Progress Catalog Default Drill Targets

```yaml
plan_unit_id: F3-099
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Orchestrator consumes the named Progress catalog from FinalGUISpec Appendix C, with the promoted
  13-widget Progress catalog and each widget's default drill target preserved.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Progress widgets and their user-facing drill targets.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: progress_catalog_default_drill_targets
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0069"
preserved_exact_tokens:
- "progress.run-overview"
- "progress.current-task"
- "progress.lane-health"
- "progress.node-throughput"
- "progress.blocked-concerns"
- "progress.approval-queue"
- "progress.recovery-status"
- "progress.artifact-receipts"
- "progress.worktree-state"
- "progress.account-pressure"
- "progress.account-switches"
- "progress.escalation-stack"
- "progress.attention-summary"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-100 - Progress State Action And Alert Labels

```yaml
plan_unit_id: F3-100
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Progress UI labels include the canonical state, action, and alert taxonomy used by Progress
  widgets and attention views.
gui_related: true
gui_classification_reason: >-
  State, action, and alert labels are user-visible UI copy even though the parent span was
  initially inferred non-GUI.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: progress_state_action_and_alert_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0070"
preserved_exact_tokens:
- "queued"
- "running"
- "attention_required"
- "blocked"
- "recovering"
- "degraded"
- "complete"
- "Inspect"
- "Retry recovery"
- "degraded_projection"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-101 - Progress Event Taxonomy And Condition Aging

```yaml
plan_unit_id: F3-101
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Progress event taxonomy and condition-aging policy preserve event names and quiet/resurface rules,
  with advisory warnings allowed to quiet after a stable refresh while blocked and escalated states
  never auto-quiet.
gui_related: false
gui_classification_reason: >-
  Event taxonomy and aging policy are runtime/state semantics rather than direct GUI layout or
  visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: progress_event_taxonomy_and_condition_aging
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0070"
preserved_exact_tokens:
- "run_started"
- "node_started"
- "node_completed"
- "concern_opened"
- "approval_requested"
- "approval_decided"
- "recovery_started"
- "recovery_completed"
- "artifact_published"
- "account_switched"
- "blocked and escalated never auto-quiet"
negative_constraints:
- "`blocked` and `escalated` never auto-quiet."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-102 - Shared Route Payload And Widget Command Routing

```yaml
plan_unit_id: F3-102
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Search results, palette actions, widgets, recovery links, and cross-surface pivots emit one
  shared route/deep-link payload; resume_url is only serialized transport, and widget actions plus
  cmd.nav wrappers use the shared command and wiring/gate stack.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible routing, navigation, widget action, and command behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shared_route_payload_and_widget_command_routing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0071"
preserved_exact_tokens:
- "route/deep-link payload"
- "resume_url"
- "/serialization"
- "widget-local action ids"
- "cmd.nav"
- "cmd.nav.*"
- "/wiring/gate"
- "target_kind"
negative_constraints:
- "Catalog commands cannot bypass owner checks or force every consumer surface to restate route semantics."
- "`resume_url` is the serialized transport form of that payload, not a second routing model."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-103 - Chat Usage Graph Evidence Object-First Pivots

```yaml
plan_unit_id: F3-103
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat, Usage, graph, and evidence surfaces consume the object-first route model, preserving
  usage_event and attempt pivots, work-package identity, correlation_id passthroughs, and
  bidirectional evidence/artifact linkage.
gui_related: true
gui_classification_reason: >-
  This unit defines visible cross-surface pivots, search jumps, and route/open behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_usage_graph_evidence_object_first_pivots
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0071"
preserved_exact_tokens:
- "jump-to-message"
- "usage_event"
- "/object"
- "/search/jump"
- "/correlation"
- "correlation_id"
- "/seam/promotion/account/lane"
- "/coverage/evidence"
- "HITL"
negative_constraints:
- "Chat may store `resume_url` for recovery portability, but it must not fall back to path-first opening."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "`human-in-the-loop` / `human-in-the-loop.md` carries direct canon-supersession for HITL behavior."
- "The Evidence pane owns verdicts `/receipts/findings/reports`; the Artifacts pane owns screenshots `/recordings/diffs/reports/generated` docs `/etc`."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-104 - Route Compatibility Records And Tier Identity Cleanup

```yaml
plan_unit_id: F3-104
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Legacy tier runtime, usage, evidence, blocked notice, and wizard resume records are compatibility
  records only and cannot reassert tier identity over object routes or restore tier_id as
  cross-surface runtime identity.
gui_related: false
gui_classification_reason: >-
  Compatibility record cleanup and identity precedence are routing/data semantics rather than GUI
  visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: compatibility_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: route_compatibility_records_and_tier_identity_cleanup
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0071"
preserved_exact_tokens:
- "tier_runtime_record"
- "tier-keyed `usage_record`"
- "tier-adjacent `evidence_record`"
- "thread_blocked_notice"
- "wizard_runtime_state"
- "resume_url"
- "tier_id"
negative_constraints:
- "Compatibility records cannot reassert tier identity over object routes."
- "`switch-aware` usage/history views cannot restore `tier_id` as the cross-surface runtime identity."
compatibility_only_notes:
- "Canonical-record cleanup treats tier runtime, usage, evidence, blocked notice, and wizard resume records as compatibility records."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-105 - Crosswalk FileManager Open Primitive Boundaries

```yaml
plan_unit_id: F3-105
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Crosswalk exposes route-target and identity-native open behavior alongside command and document
  pane primitives; FileManager keeps OpenFile for workspace files, while runtime identity opens use
  OpenSubject or route_target over canonical object identity.
gui_related: false
gui_classification_reason: >-
  Open primitive boundaries and route identity are cross-surface routing semantics, not direct GUI
  layout or styling work.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: crosswalk_filemanager_open_primitive_boundaries
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0071"
preserved_exact_tokens:
- "Crosswalk.md"
- "route_target"
- "OpenSubject"
- "OpenFile"
- "OpenFile { path... }"
- "tab_id"
- "subject_id"
- "object_kind"
- "object_id"
negative_constraints:
- "`subject_id` is for openable `/renderable` content subjects only; it must not become a second generic object taxonomy beside `object_kind` / `object_id`."
- "`tab_id` does not replace destination class, subject identity, or object identity."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "`FileManager` keeps `OpenFile { path... }` for workspace-file opens."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-106 - Concern Route Payload Fields And Overrides

```yaml
plan_unit_id: F3-106
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Concern route payloads are object-first with concern identity, focused run, target tab, selected
  concern preservation, small route_target identity, secondary inspector_target metadata, and
  destination/context overrides only when restoration requires them.
gui_related: true
gui_classification_reason: >-
  This unit defines visible concern search results, drill-downs, inspectors, and recovery links.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concern_route_payload_fields_and_overrides
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0071"
preserved_exact_tokens:
- "object_kind: concern"
- "object_id: concern_id"
- "focused_run_id"
- "target_tab"
- "concern_id"
- "route_target"
- "doc:"
- "artifact:"
- "inspector_target"
negative_constraints:
- "`inspector_target` is secondary metadata, not primary identity."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-107 - Indexing Settings Admin Surface

```yaml
plan_unit_id: F3-107
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Indexing settings expose project-search index controls for enablement, thresholds, generated and
  custom exclusions, follow-symlinks default OFF, partial remote cache controls, disk usage, cache
  eviction confirmation, and rebuild.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Settings controls for search indexing administration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: indexing_settings_admin_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0073"
preserved_exact_tokens:
- "enable/disable index"
- "large file threshold"
- "follow-symlinks toggle default OFF"
- "/partial"
- "manual cache eviction"
- "Rebuild Index"
- "remote-only cache controls"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-108 - Settings Provider Web Row Disclosure

```yaml
plan_unit_id: F3-108
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings provider and web rows preserve row-level health/error disclosure, last-failure
  messaging, availability, support-tier visibility, readiness state, provider identity, and
  contextual help without moving provider routing ownership out of Tools.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Settings row disclosure and help/autocomplete behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: settings_provider_web_row_disclosure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0074"
preserved_exact_tokens:
- "row-level health/error disclosure"
- "last-failure messaging"
- "support-tier visibility"
- "/web help/autocomplete"
- "provider identity"
- "readiness state"
- "Plans/Tools.md"
negative_constraints:
- "Provider routing ownership must not move out of `Plans/Tools.md`."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row contract includes provider identity, support tier, readiness state, last failure, and contextual help."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-109 - Unified Settings Tab Registry

```yaml
plan_unit_id: F3-109
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The unified Settings surface is the search-first one-box model (F3-432) with category chips,
  bloom panels, and shelves; the former 19-tab registry is preserved as owner-routing and
  search/migration lineage so run-touched settings content keeps a resolvable owner mapping,
  unsupported or hidden items remain searchable and command-addressable, and placement routes to
  owner docs instead of copying their detailed behavior.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Settings tab structure, labels, searchability, and owner routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "The former 19-tab registry is preserved as owner-routing lineage, includes Terminal, and every registry owner mapping remains resolvable."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: unified_settings_tab_registry
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0074"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:11"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:9"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:18"
preserved_exact_tokens:
- "Settings Tab Registry"
- "19-tab Settings registry"
- "General"
- "Models / Providers"
- "Tiers (retired alias)"
- "Branching"
- "Verification"
- "Memory"
- "Budgets"
- "Advanced"
- "Terminal"
- "Permissions"
- "LSP"
- "Interview"
- "Media"
- "Auth"
- "Health"
- "Rules"
- "Shortcuts"
- "Skills"
- "Plugins"
- "24 tabs across 5 groups"
- "Nodes, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML"
negative_constraints:
- "Hidden or unsupported tabs remain searchable and command-addressable instead of disappearing silently."
compatibility_only_notes:
- "`Tiers (retired alias)` is compatibility/search alias only; visible execution navigation uses Nodes, Packages, Lanes, Seams, or Branching surfaces."
stale_retired_dispositions:
- "`24 tabs across 5 groups` and the legacy `Nodes, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML` list are stale migration/source-lineage notes only."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-110 - Settings Help Scope And Legacy Alias Migration

```yaml
plan_unit_id: F3-110
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings is the tooltip-heavy help surface for setting meaning and precedence, may expose
  package/seam/lane/run/account-aware scopes, and migrates older Tiers, tiers.slint, and TierTree
  settings rows as aliases only.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible Settings help copy, scope labels, and legacy alias presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: compatibility_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: settings_help_scope_and_legacy_alias_migration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0074"
preserved_exact_tokens:
- "tooltip-heavy `/help`"
- "global"
- "/project"
- "/seam/lane/run/account-aware"
- "Tiers"
- "tiers.slint"
- "TierTree"
- "node/package/lane/seam"
negative_constraints:
- "Detailed behavior remains in the owner docs; FinalGUISpec owns discoverability, grouping, disabled-state copy, and cross-surface routing."
compatibility_only_notes:
- "Settings rows that still arrive from older run artifacts under `Tiers`, `tiers.slint`, or `TierTree` migrate to this registry as aliases only."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-111 - Storage Usage Inspector Owner Boundaries

```yaml
plan_unit_id: F3-111
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec exposes storage and usage detail, history, ledger, runtime, and receipt inspector
  entrypoints while storage-plan and usage-feature remain owner docs for storage, usage record
  truth, projection rules, key registration, projector rebuild, and receipt row shape.
gui_related: true
gui_classification_reason: >-
  This unit defines visible inspector entrypoints and cross-surface routing to owner truths.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: owner_route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: storage_usage_inspector_owner_boundaries
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0074"
preserved_exact_tokens:
- "/detail/history/ledger/runtime"
- "effective_account_id"
- "redb-backed projection pages"
- "seglog-derived views"
- "projector `/rebuild`"
- "receipt row shape"
- "storage-plan.md"
- "usage-feature.md"
negative_constraints:
- "FinalGUISpec may expose receipt summaries only by routing to storage-plan owner truth."
compatibility_only_notes:
- "`Plans/usage-feature.md` / `/usage-feature.md` may surface usage-local and tier-local legacy identity only as migration vocabulary."
stale_retired_dispositions: []
owner_boundary_notes:
- "`Plans/storage-plan.md` / `/storage-plan.md` and `Plans/usage-feature.md` / `/usage-feature.md` remain the consumer docs for storage and usage record truth."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-112 - Runtime Override Display And Operational Identity Grammar

```yaml
plan_unit_id: F3-112
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime-related Settings, inspectors, and history surfaces share requested/effective override
  display grammar and use the bounded operational-identity payload with kind, requested_ref,
  effective_ref, selection_reason, and partial_capability fields.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Settings, inspector, and history display grammar.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: runtime_override_display_and_operational_identity_grammar
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0074"
preserved_exact_tokens:
- "requested/effective deltas"
- "support-state"
- "source snapshot"
- "requested value"
- "effective value"
- "switch or clamp reason"
- "operational-identity"
- "{ kind, requested_ref?, effective_ref?, selection_reason?, partial_capability? }"
negative_constraints:
- "Provider-, registry-, Kubernetes-, and future surface-specific identities may extend the `kind` vocabulary without adding hidden credential ownership."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-113 - Agent Config Provider Skill Row Surface

```yaml
plan_unit_id: F3-113
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent Config owns the visible provider, model, account, instruction, Skills, and Personas
  management surface, mirrors Skills owner vocabulary, exposes row source/readiness/recovery
  context, and leaves durable preferences to Settings.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Agent Config rows, vocabulary, and management surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_config_provider_skill_row_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0075"
preserved_exact_tokens:
- "Agent Config"
- "Skills"
- "Personas"
- "bundled"
- "protected_core"
- "catalog_installed"
- "manual_import"
- "project_local"
- "global_local"
- "pm_enhanced"
- "ready_with_warnings"
negative_constraints:
- "Settings remains the durable preference surface."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-114 - Agent Config Personas Tab Contract

```yaml
plan_unit_id: F3-114
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Agent Config Personas tab exposes persona library editing, runtime preferences, skill refs,
  row eligibility and compatibility disclosure, read-only protected core built-ins, and editable
  restorable bundled specialty Personas.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Agent Config Personas tab behavior and controls.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_config_personas_tab_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0075"
preserved_exact_tokens:
- "create"
- "edit"
- "delete"
- "disable"
- "restore default"
- "reorder"
- "chat-selectable eligibility"
- "child/subagent eligibility"
- "protected/core"
- "bundled-specialty"
negative_constraints:
- "Protected core built-ins are read-only and not deletable, disableable, or shadowable."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-115 - Agent Config Provider Entry Diagnostics

```yaml
plan_unit_id: F3-115
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent Config provider data records and diagnostics expose durable provider entry identity,
  auth_surface metadata, local provider storage paths, bootstrap evidence filenames, Cursor
  trust/cache evidence, and independent account-local drift state.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Agent Config diagnostics and provider row evidence.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_config_provider_entry_diagnostics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0075"
preserved_exact_tokens:
- "provider_entry_id"
- "runtime_platform_id"
- "model_provider_id"
- "auth_surface"
- "$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/"
- "~/.local/share/puppet-master/providers/<provider_entry_id>/"
- "gemini-credentials.json"
- "google_accounts.json"
- "~/.cache/cursor-compile-cache"
negative_constraints:
- "Provider/profile diagnostics expose local setup state without making Settings the owner."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-116 - Agent Config Setup Evidence Failover And Default Crew

```yaml
plan_unit_id: F3-116
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent-Config setup copy separates setup success from operational evidence, exposes stable
  selection and failover reason codes plus requested/effective runtime controls, and owns Default
  Crew default-config confirmation and provider constraint explanation.
gui_related: true
gui_classification_reason: >-
  This unit defines visible setup, failover, provider-gap, and Default Crew controls.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_config_setup_evidence_failover_and_default_crew
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0075"
preserved_exact_tokens:
- "Validating..."
- "Revalidate"
- "manual_pin"
- "provider_default"
- "preferred_account_retained"
- "highest_priority_eligible"
- "lowest_pressure_eligible"
- "auth_surface_match"
- "server_profile_default"
- "honored"
- "skipped"
- "clamped"
- "Default Crew"
- "Copilot"
negative_constraints:
- "`provider-home` paths, scheduler mechanics, and overlay configuration internals stay hidden unless a concrete `/debug` or audit use case requires persisted evidence."
compatibility_only_notes:
- "`provider-specific` remains or `/quota` probes belong in Usage and expanded account/runtime inspectors, not in setup success copy."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-117 - Docker Manager Shell Boundary And Alias Disposition

```yaml
plan_unit_id: F3-117
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Docker Manager is the docker_manager side-panel shell surface for container-related navigation,
  disabled-state copy, deep-subview discoverability, Settings entrypoints, and routing, while the
  container owner doc retains runtime/auth/registry/publish behavior and unresolved payload
  mismatch ownership.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible Docker Manager shell placement, labels, aliases, and routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: owner_route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: docker_manager_shell_boundary_and_alias_disposition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0076"
preserved_exact_tokens:
- "docker_manager"
- "Publish / Unraid"
- "needs_review"
- "/failure"
- "DOCKER MANAGE"
- "Docker Manage"
- "docker_manage_surface_state"
- "Persona Editor"
negative_constraints:
- "Legacy Docker Manage aliases must not create a second activity-bar slot or remain embedded under Persona Editor."
compatibility_only_notes:
- "Legacy `DOCKER MANAGE`, `Docker Manage`, `docker_manage_surface_state`, and separate Unraid panel references are migration aliases."
stale_retired_dispositions: []
owner_boundary_notes:
- "`Plans/Containers_Registry_and_Unraid.md` owns Docker runtime, auth, registry, publish, Unraid, Podman, Kubernetes, receipt, and detection behavior."
- "`needs_review` versus `/failure` payload semantics remain an automation-first operator-flow mismatch until the container owner resolves it."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-118 - Account Binding And Runtime Identity Resolver Display

```yaml
plan_unit_id: F3-118
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings and inspectors distinguish requested account policy from requested account binding,
  show requested/effective account and switch reason, propagate execution_role with operational
  identity, and render resolver source, request, and execution axes deterministically.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Settings and inspector identity display grammar.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: account_binding_and_runtime_identity_resolver_display
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0076"
preserved_exact_tokens:
- "requested_account_id"
- "requested_account_policy"
- "requested_account_binding"
- "none"
- "preferred"
- "required"
- "execution_role"
- "settings_resolution { source_snapshot, request_snapshot, execution_snapshot, switch_reason, resolution_status }"
negative_constraints:
- "`required` must bind or block."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-119 - Panel Settings Persistence And Agent-Config Naming

```yaml
plan_unit_id: F3-119
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel-specific persistence and visibility controls live in Settings only when durable app or
  project preferences, are grouped by owning surface, and Settings/inspector language names
  Agent-Config and effective runtime concepts instead of generic provider settings.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Settings grouping, persistence boundaries, and inspector naming.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_settings_persistence_and_agent_config_naming
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0076"
preserved_exact_tokens:
- "Source Control / Branching"
- "GitHub Actions"
- "Docker Manager / Kubernetes"
- "Terminal"
- "File Manager"
- "Models / Providers"
- "Agent-Config"
- "Effective Runtime inspectors"
- "skill/MCP status"
negative_constraints:
- "Active runtime object selection, live run actions, and transient inspector focus remain in the owning panel."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-120 - Terminal Settings Durable Preferences Owner

```yaml
plan_unit_id: F3-120
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings > Terminal is the in-product cheat sheet and durable preferences owner for terminal
  defaults, high-frequency preview/change controls, shortcut mappings, conflict explanations,
  terminal appearance, profile/cwd, transcript retention, performance, diagnostics, and
  project/workspace scope labels.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Terminal Settings surfaces, labels, preferences, and explanations.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_settings_durable_preferences_owner
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0077"
preserved_exact_tokens:
- "Settings > Terminal"
- "in-product cheat sheet"
- "/preferences"
- "/theme/font/rendering"
- "/selection/copy/paste"
- "/profile/cwd"
- "/transcript"
- "/performance"
- "/workspace"
- "/tab"
negative_constraints:
- "Live-session and pane/session-local actions stay in Terminal runtime UI rather than Settings."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Settings > Terminal is also the terminal-specific `/coverage` and `/reconciliation` landing zone for durable GUI preferences that are not owned by Tools or storage."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-121 - Terminal Settings Coverage Groups And Shortcut Discovery

```yaml
plan_unit_id: F3-121
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings > Terminal groups Appearance, layout and Workspaces, Shell and Startup, Interaction,
  and Diagnostics, and keeps terminal shortcut discovery in-product, remappable, and distinct from
  TUI-owned keys and app-level layout actions.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Terminal Settings groups and shortcut discovery controls.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_settings_coverage_groups_and_shortcut_discovery
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0077"
preserved_exact_tokens:
- "/coverage"
- "/reconciliation"
- "Appearance"
- "/layout"
- "Shell & Startup"
- "Interaction"
- "Diagnostics"
- "/remappable"
- "/TUI-owned"
- "/shortcuts/behaviors"
negative_constraints:
- "Shortcut discovery prioritizes true terminal operations over layout-management and other app-level actions."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-122 - Agent Config Skills Tab Readiness Badges

```yaml
plan_unit_id: F3-122
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent Config surfaces a Skills tab that mirrors the Skills owner contract and shows source,
  readiness, persona-reference, auto-invocation, missing-capability, and catalog-update badges
  without turning Settings into the skill-management owner.
gui_related: true
gui_classification_reason: This unit defines a visible Agent Config tab, rows, badges, and owner-boundary copy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_config_skills_tab_readiness_badges
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0078"
preserved_exact_tokens:
- "Skills tab"
- "referenced_by_persona"
- "auto_invokable"
- "requires_missing_capability"
- "catalog_update_available"
negative_constraints:
- "Do not turn Settings into the skill-management owner."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Agent Config mirrors the Skills owner contract."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-123 - Project Summary Rollups Trust And Status Vocabulary

```yaml
plan_unit_id: F3-123
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Project summary rows and cards expose activity, attention, health, owner, projection-trust,
  historical-only, idle, and status-vocabulary rollups with canonical blocked episodes taking
  precedence over weaker derived warnings.
gui_related: true
gui_classification_reason: This unit defines visible project cards, badges, status vocabulary, and trust disclosure.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: project_summary_rollups_trust_and_status_vocabulary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0079"
preserved_exact_tokens:
- "project_summary"
- "activity_state"
- "attention_state"
- "health_state"
- "historical_only"
- "/degraded"
- "projection_trust_state"
- "Dashboard"
- "Orchestrator"
- "Projects"
negative_constraints:
- "Canonical blocked episodes take precedence over weaker derived warnings when summary rollups disagree."
compatibility_only_notes: []
stale_retired_dispositions:
- "Project-summary cards derived from stale or `/degraded` projections downgrade confidence without manufacturing a blocked state."
owner_boundary_notes:
- "Dashboard remains the `/urgency/entry` surface, Orchestrator owns operational depth, and Projects is the multi-project `/management` surface."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-124 - Project Attention Items Routing And Summary Cards

```yaml
plan_unit_id: F3-124
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Project attention items are reusable attention rows with stable identity, primary route payload,
  projection-trust disclosure, blocked-owner metadata, severity, dismissibility, active state, and
  shared routing across attention-center rows, cards, commands, search results, and summary cards.
gui_related: true
gui_classification_reason: This unit defines visible attention rows, summary cards, routing, and project UI behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: project_attention_items_routing_and_summary_cards
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0079"
preserved_exact_tokens:
- "project_attention_item"
- "primary_route_payload"
- "quiet_only"
- "Run Summary"
- "Seam Summary"
- "Concern Summary"
- "Account / Usage Pressure"
- "Recent Major Events"
negative_constraints:
- "`quiet_only` never hides a canonical blocked condition."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Project-attention routing is shared by attention-center rows, project cards, command palette actions, and search results."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-125 - Concern Record Actions Trust Escalation And Help Terms

```yaml
plan_unit_id: F3-125
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Concern and trust-state escalation surfaces expose the durable concern record, distinct concern
  actions, degraded-trust routing, stable glossary terms, layered help, and canonical help-entry
  pages across chat, inspectors, commands, Orchestrator, Dashboard, thread badges, and notifications.
gui_related: true
gui_classification_reason: This unit defines visible concern, escalation, notification, and help surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concern_record_actions_trust_escalation_and_help_terms
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0080"
preserved_exact_tokens:
- "concern_id"
- "acknowledged"
- "dismissed"
- "resolved"
- "degraded-trust"
- "projection trust"
- "escalation ladder"
- "resolution_kind"
negative_constraints:
- "Concern, review finding, annotation, blocked episode, and graph patch request remain distinct concepts."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Concern and trust-state escalation share one conversational `/tooling` surface contract."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-126 - Notification Cadence Quieting Resurfacing And Owner Taxonomy

```yaml
plan_unit_id: F3-126
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Notification and project-facing help surfaces share cadence, severity, quieting, recurrence,
  owner-route timing, dismissal/resolution rationale, blocked-owner taxonomy, and five-level
  escalation ladder behavior.
gui_related: true
gui_classification_reason: This unit defines visible notification, banner, card, toast, badge, and help copy behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: notification_cadence_quieting_resurfacing_and_owner_taxonomy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0080"
preserved_exact_tokens:
- "/cards/toasts/badges"
- "attention_required"
- "blocked"
- "Runtime"
- "Package Overseer"
- "Seam Overseer"
- "Corroboration"
- "Graph Patch"
- "Recovery"
- "User"
- "External Resource"
- "info"
- "watch"
- "escalated"
negative_constraints:
- "Canonical blocked episodes are never suppressed by quiet windows."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-127 - Minimum Concern Record Shape And Compatibility Labels

```yaml
plan_unit_id: F3-127
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The minimum concern record shape preserves concern identity, project/run/scope/source/evidence
  references, severity, category, status, visibility, attention, chatworthy, owner, creator,
  resolver, governance fields, and a blocking_effect separate from severity while compatibility
  labels normalize to the concern/escalation/help model.
gui_related: false
gui_classification_reason: This unit defines durable record shape and compatibility vocabulary rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: record_schema_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: minimum_concern_record_shape_and_compatibility_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0081"
preserved_exact_tokens:
- "system-notification"
- "project-card"
- "primary-reason"
- "pressure-summary"
- "help-system"
- "blocking_effect"
- "severity"
- "governance"
negative_constraints:
- "`blocking_effect` stays explicitly separate from `severity`."
compatibility_only_notes:
- "Compatibility labels normalize to this concern/escalation/help surface model."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-128 - Alert Evidence Gate Incident Bundling And Timelines

```yaml
plan_unit_id: F3-128
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Alerts gate hard-block presentation on canonical exhausted or blocked evidence, bundle cascades
  under a parent incident with child CTAs ordered after root-cause CTAs, and preserve historical
  timeline fields plus compact route keys.
gui_related: true
gui_classification_reason: This unit defines visible alert, notification, CTA, and timeline behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: alert_evidence_gate_incident_bundling_and_timelines
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0082"
preserved_exact_tokens:
- "/exceeded"
- "soft warning"
- "hard block"
- "parent-incident"
- "raised_at"
- "source_surface"
- "root_cause_key"
- "/run/worktree/workflow/container/workload"
negative_constraints:
- "Child consequence CTAs may appear only after the root-cause CTA."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-129 - Runtime Attention Ownership Routing And Authority

```yaml
plan_unit_id: F3-129
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime and Kubernetes attention items are owned by Docker Manager first, mirrored by Dashboard
  and Orchestrator, route common issue classes to their primary owner, focus non-active project
  issues precisely, and declare freshness/authority order when mirrors disagree.
gui_related: true
gui_classification_reason: This unit defines visible runtime attention routing, mirrored surfaces, and authority copy.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: owner_route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: runtime_attention_ownership_routing_and_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0082"
preserved_exact_tokens:
- "Docker Manager"
- "/container/rollout"
- "/focus"
- "/authority"
- "updating"
- "state may be outdated"
- "Dashboard"
- "Orchestrator"
negative_constraints:
- "Mirror surfaces show the same attention item as a deep link to the owner rather than offering a competing remediation flow."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Runtime/Kubernetes attention items are owned by Docker Manager first."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-130 - Alert Auto Resolution Aging Coalescing And Bulk Actions

```yaml
plan_unit_id: F3-130
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime alert lifecycle covers auto-resolution, historical seen state, acknowledge, snooze,
  mute, condition-aging defaults, attention/root-cause coalescing, repeated notification rules,
  and bulk action preview/result/rollback semantics.
gui_related: true
gui_classification_reason: This unit defines visible alert lifecycle, badges, interruptions, and bulk action UI.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: alert_auto_resolution_aging_coalescing_and_bulk_actions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0082"
preserved_exact_tokens:
- "/auto-resolution"
- "/seen"
- "/snooze/mute"
- "attention_key"
- "root_cause_key"
- "/count"
- "partial-success"
- "per-target"
- "/exported"
negative_constraints:
- "A mute or snooze must not suppress blocking confirmations or `security-sensitive` failures."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-131 - Chat Panel Workspace And Layout

```yaml
plan_unit_id: F3-131
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Chat Panel is the canonical threaded assistant workspace for Ask, Agent, Debug, Plan, and
  Deep Plan modes, with a 70/30 message/composer split, optional planning side panel, and sticky
  header over independently scrolling messages.
gui_related: true
gui_classification_reason: This unit defines visible chat workspace, mode, panel, and layout behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_panel_workspace_and_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0083"
preserved_exact_tokens:
- "Ask"
- "Agent"
- "Debug"
- "Plan"
- "Deep Plan"
- "70%"
- "30%"
- "Plan panel"
negative_constraints:
- "When not in a planning mode, the plan panel stays hidden rather than showing an empty placeholder."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-132 - Thread Context Detail And Message Info Surfaces

```yaml
plan_unit_id: F3-132
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Thread headers expose context indicators, usage/status detail, compact-now intent, thread-scoped
  context detail tabs, curated/raw views, under-message actions, and info-popovers that follow
  Assistant Chat and Contracts label rules, including visible progress and failure/degraded feedback for explicit
  Compact Now actions plus already-running, cancelled, no-op, unavailable, retry, reload, completed, and failed
  command-result states.
gui_related: true
gui_classification_reason: This unit defines visible thread context, message details, action rows, and popovers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: thread_context_detail_and_message_info_surfaces
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0084"
- "Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance"
- "Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094"
preserved_exact_tokens:
- "More Details"
- "Compact Now"
- "context.compaction.failed"
- "already_running"
- "cancelled"
- "no_op"
- "retry_scheduled"
- "Curated"
- "Raw"
- "under-message icon row"
- "/model/persona/account"
- "runtime identity fields"
negative_constraints:
- "Compact Now must not dispatch compaction until the user chooses that action."
- "Compact Now failure must not be silent or logs-only."
- "The preserved context.compaction.failed token is historical source lineage; visible failure comes from the command result/receipt projection and no context.compaction.* EventRecord is emitted."
compatibility_only_notes: []
stale_retired_dispositions:
- "The former context.compaction.failed event implication is retired because no context.compaction.* family is registered in Event Authority."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-133 - Thread Header Live Controls

```yaml
plan_unit_id: F3-133
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Thread header live controls include editable title, mode badge, persona and model indicators,
  token-count summary, and quick actions for search, rename, duplicate, archive, and thread
  settings.
gui_related: true
gui_classification_reason: Thread header controls are visible GUI controls even though the source span was inferred false.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: thread_header_live_controls
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0085"
preserved_exact_tokens:
- "editable thread title"
- "mode badge"
- "persona indicator"
- "model indicator"
- "token-count summary"
- "thread search"
- "rename"
- "duplicate"
- "archive"
- "thread settings"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-134 - Virtualized Message Stream And Activity Cards

```yaml
plan_unit_id: F3-134
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Message stream live behavior uses virtualized stable-identity message rows, inline activity-card
  rendering with compact/expanded/detail line caps, sticky unread and new-message affordances, and
  auto-follow state for streaming output.
gui_related: true
gui_classification_reason: This unit defines visible message stream, activity card, and scrolling behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: virtualized_message_stream_and_activity_cards
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0085"
preserved_exact_tokens:
- "activity-card"
- "5 lines"
- "15 lines"
- "50 lines"
- "New messages below"
- "jump-to-latest"
- "/auto-follow"
- "stable message identity"
negative_constraints:
- "Streaming updates mutate existing rows rather than replacing the full list."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-135 - Composer Controls And Plan Panel Affordances

```yaml
plan_unit_id: F3-135
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Composer and plan-mode affordances include multiline input, Steer/Queue mode selection,
  attachment, send/stop, disabled-state explanation, active-plan panel status, active-step focus,
  and jumps to linked documents or evidence.
gui_related: true
gui_classification_reason: This unit defines visible composer controls and planning panel UI.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: composer_controls_and_plan_panel_affordances
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0086"
preserved_exact_tokens:
- "Steer"
- "Queue"
- "attachment button"
- "send / stop button"
- "disabled-state explanation"
- "active step"
- "linked documents"
- "provider settings layout stays OUT"
negative_constraints:
- "Provider settings layout stays OUT of this GUI widget contract while provider-runtime docs remain provisional."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-136 - Composer Queue Rules And State Vocabulary

```yaml
plan_unit_id: F3-136
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Composer queued messages are transient FIFO entries capped at two, not restart-persisted, and
  use the pending, in_progress, completed, blocked, and skipped state vocabulary while superseded
  remains plan-level only.
gui_related: true
gui_classification_reason: This unit defines visible composer queue behavior and queue state labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: composer_queue_rules_and_state_vocabulary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0086"
preserved_exact_tokens:
- "FIFO"
- "max 2 entries"
- "pending | in_progress | completed | blocked | skipped"
- "superseded"
- "not restart-persisted"
negative_constraints:
- "`superseded` is plan-level only and not a queue item state."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-137 - Slash Palette Approvals And Shell Surface Ownership

```yaml
plan_unit_id: F3-137
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat slash commands, mode switches, and tool approvals route through the canonical chat/runtime
  command catalog, preserve thread context and composer focus, mirror the final reserved slash set,
  and must not duplicate shell surface ownership for Problems, Output, Ports, or Debug Console.
gui_related: true
gui_classification_reason: This unit constrains visible slash palette, approval dialog, and chat-local controls.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: owner_route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slash_palette_approvals_and_shell_surface_ownership
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0086"
preserved_exact_tokens:
- "/web"
- "/web search"
- "/web fetch"
- "/web extract"
- "/web research"
- "/web crawl"
- "/web map"
- "/skill"
- "/cancel"
- "Problems"
- "Output"
- "Ports"
- "Debug Console"
negative_constraints:
- "Chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console."
compatibility_only_notes:
- "The `/cancel` alias is deprecated."
stale_retired_dispositions:
- "Deprecated `/cancel` remains an alias only."
owner_boundary_notes:
- "Slash commands, mode switches, and tool approvals remain routed through the canonical chat/runtime command catalog."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-138 - File Manager Tree Owner Boundary And Reveal Disclosure

```yaml
plan_unit_id: F3-138
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  File Manager is the persistent project-tree side panel for tree navigation and file discovery,
  defers detailed tree behavior to FileManager, and exposes local filtering, reveal disclosure,
  read-only Git row badges, detached-panel alignment, and owner-boundary routing.
gui_related: true
gui_classification_reason: This unit defines visible File Manager side panel, tree, row, and reveal behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: file_manager_tree_owner_boundary_and_reveal_disclosure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0087"
preserved_exact_tokens:
- "File Manager Panel"
- "Plans/FileManager.md"
- "/hidden"
- "/ignored"
- "active repo/worktree chip"
- "Git status badges"
- "Source Control"
negative_constraints:
- "File Manager owns tree navigation and file discovery, but not semantic search, diff-local search, or runtime artifact browsing."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Detailed tree, drag-and-drop, and open-file behavior defers to `Plans/FileManager.md`."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-139 - File Manager Actions Clipboard Model And Operational Coverage

```yaml
plan_unit_id: F3-139
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  File Manager tree actions, command family, workspace-node clipboard model, terminal reveal
  routing, operational GUI coverage seams, and explicit cross-section ownership references are
  MVP implementation-ready PM-native obligations.
gui_related: true
gui_classification_reason: This unit defines visible File Manager actions, context menus, clipboard, and routing behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: file_manager_actions_clipboard_model_and_operational_coverage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0087"
preserved_exact_tokens:
- "cmd.file"
- "cmd.file.*"
- "/Cut/Paste"
- "/drop"
- "/file-manager/remote/review/runtime"
- "/open/save/export"
- "cmd.terminal.open"
- "cmd.terminal.show"
- "§7.16"
- "§7.18"
- "§7.20"
negative_constraints:
- "Missing actions must not remain anonymous context-menu-only behavior."
- "These are PM-native obligations, not competitor-derived features to add blindly."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Remote-LSP GUI projections consume host-aware owner contracts such as `(server_id, root)` only as display context until the LSP owner provides the stronger root identity."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-140 - File Editor Core Capabilities And Preview Pipeline

```yaml
plan_unit_id: F3-140
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  File Editor is the canonical in-app editing surface with shared buffers, tabbed editor groups,
  diff view, preview modes, LSP-backed affordances, remote editing disclosure, recoverable buffers,
  and a shared preview pipeline for document and media types.
gui_related: true
gui_classification_reason: This unit defines visible File Editor editing, preview, LSP, and tab behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: file_editor_core_capabilities_and_preview_pipeline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0088"
preserved_exact_tokens:
- "shared buffers"
- "diff view"
- "markdown"
- "mermaid"
- "HTML"
- "SVG"
- "image"
- "runtime_unavailable"
- "/indexing-state"
- "/offline/stale-state"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-141 - Embedded Editor And External Reference Negative Constraints

```yaml
plan_unit_id: F3-141
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Embedded editor, browser-coupled, local-operational, native-style, implementation-reference, and
  external product lessons are constrained inputs only and must not replace PM-owned workspace
  identity, Slint/Rust architecture, durability, accessibility, or explicit service boundaries.
gui_related: true
gui_classification_reason: This unit constrains visible workbench/editor GUI architecture and compatibility references.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: compatibility_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: embedded_editor_and_external_reference_negative_constraints
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0088"
preserved_exact_tokens:
- "/browser-coupled"
- "/shared-doc"
- "/render-root"
- "bench-05"
- "bench-28"
- "no feature cargo cult"
- "no hanging agents"
- "no hidden indexing/startup cost"
- "no clutter and split/focus complexity"
negative_constraints:
- "DOM/browser-coupled assumptions must not shape the canonical Slint/Rust architecture."
- "External workspace/editor product lessons are constraints, not feature cargo cult."
compatibility_only_notes:
- "local-operational and `/native-style` references are implementation inputs for explicit PM workbench seams."
stale_retired_dispositions:
- "Collaborative `/online` editors are references only, not authorities for PM state or durability."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-142 - Native Workbench Service Boundary And Rust Slint Ownership

```yaml
plan_unit_id: F3-142
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PM remains a native workbench with explicit file-tree, diff, LSP, terminal, workspace-service,
  buffer, indexing, remote/session, persistence, AI orchestration, and durable task/artifact
  boundaries, with Slint owning pane/layout/status chrome rather than text render logic.
gui_related: true
gui_classification_reason: This unit defines visible workbench shell ownership and Rust/Slint GUI boundaries.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: native_workbench_service_boundary_and_rust_slint_ownership
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0088"
preserved_exact_tokens:
- "/workbench"
- "/file-tree/diff/LSP/terminal"
- "Rust + Slint"
- "Slint owns pane layout"
- "workbench `/pane/review/task` chrome"
- "/LSP/remote/auth"
- "/clipboard/session"
- "/rendering/DPI"
negative_constraints:
- "PM is not a server-heavy/server-rooted file app or a thin control plane over another IDE."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Rust-owned core services keep workspace services, buffers, diff, indexing, remote/session state, persistence, AI orchestration, and durable AI task/artifact records."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-143 - Browser Session Vocabulary And Compatibility Aliases

```yaml
plan_unit_id: F3-143
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser and preview flows preserve logical subject and browser-session identity, route open
  commands through canonical browser/session commands, and treat legacy preview_mode,
  browser_panel, Bottom Panel Browser, generic Browser tab, and bottom-panel-primary labels as
  compatibility aliases only.
gui_related: true
gui_classification_reason: This unit constrains visible browser/preview commands, tabs, aliases, and session routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: compatibility_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_session_vocabulary_and_compatibility_aliases
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0088"
preserved_exact_tokens:
- "cmd.browser.*"
- "workspace_preview"
- "detached_preview"
- "preview_subject_id"
- "browser_session_id"
- "normal_browsing"
- "Open in Browser"
- "Open in Detached Browser"
- "runtime_unavailable"
negative_constraints:
- "`Bottom Panel Browser`, generic `Browser tab`, bottom-panel-primary, and normal-browsing wording are not canonical owners for built-in browser or click-to-context flows."
compatibility_only_notes:
- "Legacy `preview_mode` and `browser_panel` labels are compatibility aliases only."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-144 - Diff Review Feedback Editor Lessons And MVP Seam Inventory

```yaml
plan_unit_id: F3-144
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Diff/review GUI feedback, constrained editor-engine and search lessons, and the master seam
  inventory remain explicit MVP implementation-ready GUI contracts for editor, browser, terminal,
  artifacts, panels, route targets, sessions, previews, generated documents, IME/input, and
  clipboard behavior.
gui_related: true
gui_classification_reason: This unit defines visible diff/review feedback and shell-wide GUI seam behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: diff_review_feedback_editor_lessons_and_mvp_seam_inventory
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0088"
preserved_exact_tokens:
- "files-touched strips"
- "hunk-action UI"
- "conflict-review UI"
- "scrollbar heat-map"
- "bench-13"
- "bench-04"
- "OpenFile"
- "OpenSubject"
- "route_target"
- "never `/optional/future`"
negative_constraints:
- "The master seam inventory is MVP and implementation-ready, never `/optional/future`."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-145 - Inline Note Activation And Send To Chat Chip

```yaml
plan_unit_id: F3-145
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Inline Note Mode activation exposes selection-scoped Add Note, keyboard context-menu access,
  disabled durable annotations for unstable preview anchors, and visible removable send-to-chat
  context chips with provenance and target-picking when chat ownership is ambiguous.
gui_related: true
gui_classification_reason: This unit defines visible editor annotation, context menu, and chat-context chip behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: inline_note_activation_and_send_to_chat_chip
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0089"
preserved_exact_tokens:
- "Add Note"
- "Shift+F10"
- "Send selection to chat"
- "pre-send"
- "/pill"
- "chat-input-area"
- "/composer"
- "/provenance"
- "target picker"
negative_constraints:
- "Durable annotation actions stay disabled unless stable semantic anchor IDs are available."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-146 - Annotation Persistence Status And Shared Components

```yaml
plan_unit_id: F3-146
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Inline annotations capture selection, text, note, category, gutter markers, hover content,
  durable note records, live-region status changes, stable status labels, and shared annotation,
  drawer, and context chip components reused across document review surfaces.
gui_related: true
gui_classification_reason: This unit defines visible annotation markers, drawers, status labels, and shared components.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: annotation_persistence_status_and_shared_components
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0089"
preserved_exact_tokens:
- "note_record.v1:{bundle_id}:{note_id}"
- "/live-region"
- "addressed"
- "still_open"
- "cannot_apply"
- "AnnotationActionMenu"
- "AnnotationDrawer"
- "ContextChipStrip"
- "browser-gated"
negative_constraints:
- "Final-review gating copy must say no open annotations, not no open notes."
- "ContextChipStrip must stay separate from durable annotations."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-147 - Agent Activity Surface

```yaml
plan_unit_id: F3-147
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent Activity is the canonical inspection view for delegated work, investigations, bundle
  review progress, and embedded review documents, including active and historical activity state
  plus direct links to related messages, artifacts, investigation records, and bundles.
gui_related: true
gui_classification_reason: This unit defines a visible inspection view and activity list.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_activity_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0090"
preserved_exact_tokens:
- "Agent Activity"
- "delegated work"
- "investigations"
- "bundle review progress"
- "child-run / subagent activity"
- "running"
- "queued"
- "blocked"
- "remediation"
- "completed"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-148 - Log And Audit Inspector

```yaml
plan_unit_id: F3-148
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PM ships lightweight in-thread transparency and a dedicated searchable log/audit inspector with
  compact summary rows, on-demand payload dereference, filtering, search, time-range queries,
  drill-down, export, and explicit logsearch/logread GUI surfacing.
gui_related: true
gui_classification_reason: This unit defines visible log/audit inspector rows and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: log_and_audit_inspector
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0091"
preserved_exact_tokens:
- "5-item compact format"
- "/url/task"
- "/filter/drill-down"
- "/operation"
- "logsearch"
- "logread"
- "on-demand only"
- "source/page counts"
negative_constraints:
- "The inspector does not eagerly expand large refs or blobs."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md"
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-149 - Embedded Document Pane

```yaml
plan_unit_id: F3-149
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The embedded document pane is a visible shared-buffer review/document surface for Interview,
  Builder, and bundle-review workflows, with persisted selection, scroll, review stage, approval
  state, shared File Editor buffers, and adjacent findings or approval gates.
gui_related: true
gui_classification_reason: Embedded document panes are visible review/document UI despite the source span inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: embedded_document_pane
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0092"
preserved_exact_tokens:
- "document_pane_state:v1:{project_id}:{page_context}"
- "Interview"
- "Builder"
- "bundle-review workflows"
- "shared source-of-truth buffers"
- "File Editor"
negative_constraints:
- "Findings summaries and approval gates render adjacent to the document, not inside unrelated chat-local controls."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-150 - Bundle Controls And Review Gate

```yaml
plan_unit_id: F3-150
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Bundle controls govern revision loops and approval readiness with Resubmit sending unresolved
  notes as revision context, final approval blocked until notes are handled, status progression,
  bundle registry persistence, and linked note records.
gui_related: true
gui_classification_reason: Bundle controls and review gates are visible controls despite the source span inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: bundle_controls_and_review_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0093"
preserved_exact_tokens:
- "Resubmit"
- "draft -> in_review -> all_notes_resolved -> approved -> merged"
- "bundle_registry.v1:{project_id}:{bundle_id}"
- "note_record.v1:*"
negative_constraints:
- "Final approval is blocked until every note is resolved, responded to, or dismissed."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-151 - Bottom Runtime Zone Host

```yaml
plan_unit_id: F3-151
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The bottom runtime zone is the canonical host for Terminal, Problems, Output, Debug Console,
  Ports, and linked runtime-adjacent panes with stable tab identity, restore behavior,
  owner-pane reveal, dev-session state, badges, and recovery visibility.
gui_related: true
gui_classification_reason: The bottom runtime zone is a visible shell area despite the source span inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: bottom_runtime_zone_host
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0094"
preserved_exact_tokens:
- "Terminal"
- "Problems"
- "Output"
- "Debug Console"
- "Ports"
- "tabbed runtime panes"
- "historical/live badges"
negative_constraints:
- "Terminal/browser/editor integrations reveal the owning pane rather than minting parallel per-feature consoles."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-152 - Terminal And Browser Tab Identity

```yaml
plan_unit_id: F3-152
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal sections, terminal tabs, browser tabs, and detached previews remain identity-stable
  across docking, focus changes, and restart recovery, with persisted tab selection, order, labels,
  pin state, browser-session routing, and owning runtime/preview status.
gui_related: true
gui_classification_reason: This unit defines visible terminal/browser tabs, labels, pin state, and preview ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_and_browser_tab_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0095"
preserved_exact_tokens:
- "Terminal sections"
- "terminal tabs"
- "browser tabs"
- "detached previews"
- "canonical browser-session identities"
- "hot reload"
- "preview refresh status"
negative_constraints:
- "Browser and preview tabs never silently migrate ownership to chat."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-153 - Debug Problems Output And Ports

```yaml
plan_unit_id: F3-153
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The runtime zone provides Problems, Output, Debug Console, and Ports panes with diagnostics,
  file links, stream search, active debug output, detected port accessibility, browser actions,
  hot-reload controls, and Run & Debug reveal/focus behavior.
gui_related: true
gui_classification_reason: This unit defines visible runtime-zone panes and Run & Debug focus behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_problems_output_and_ports
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0096"
preserved_exact_tokens:
- "Problems"
- "Output"
- "Debug Console"
- "Ports"
- "open-in-browser actions"
- "hot-reload controls"
- "Run & Debug"
negative_constraints:
- "`Run & Debug` side-panel actions reveal and focus these bottom-panel panes rather than creating duplicate runtime records."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-154 - Atomic Widget Catalog Scope

```yaml
plan_unit_id: F3-154
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Section 8 defines the atomic widget catalog used to compose pages and panels and aligns detailed
  widget references with the local Widget Catalog plus Widget_System hostability and catalog-linkage sections.
gui_related: true
gui_classification_reason: This unit defines visible widget catalog scope and GUI composition vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "Widget reference owners resolve to Plans/FinalGUISpec.md#8-widget-catalog and Widget_System hostability/catalog-linkage sections rather than missing standalone widget reference docs."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: atomic_widget_catalog_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0097"
preserved_exact_tokens:
- "atomic"
- "widget catalog"
- "Plans/WIDGETS_VISUAL_REFERENCE.md"
- "Plans/WIDGETS_QUICK_REFERENCE.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Plans/WIDGETS_VISUAL_REFERENCE.md and Plans/WIDGETS_QUICK_REFERENCE.md are retired standalone-doc placeholders; current owners are Plans/FinalGUISpec.md#8-widget-catalog and Plans/Widget_System.md."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
- "Plans/Widget_System.md"
```

### F3-155 - SelectableText Contract

```yaml
plan_unit_id: F3-155
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  SelectableText is the canonical non-editable text primitive for logs, snippets, copyable labels,
  and read-only structured values, preserving selection, copy, context-menu participation, and
  stable layout during incremental updates.
gui_related: true
gui_classification_reason: This unit defines a visible text widget and copy/selection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: selectabletext_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0098"
preserved_exact_tokens:
- "SelectableText"
- "non-editable"
- "copy"
- "§10.9"
- "stable layout"
negative_constraints:
- "SelectableText supports copy without converting the field into an editable input."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-156 - Widget Categories And Catalog Rules

```yaml
plan_unit_id: F3-156
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Widget categories cover layout, input, display, feedback, and navigation families, and catalog
  rules require atomic behavior, focus, theme-token reuse, accessible labels, stable identity, and
  deterministic fallback states across surfaces.
gui_related: true
gui_classification_reason: This unit defines visible widget families and accessibility/fallback behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: widget_categories_and_catalog_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0099"
preserved_exact_tokens:
- "SplitPane"
- "TabGroup"
- "Panel"
- "TextInput"
- "Dropdown"
- "Toggle"
- "Slider"
- "Tree"
- "Toast"
- "CommandPalette"
negative_constraints:
- "Page widgets in `Plans/Widget_System.md` are composed from this catalog and are not a substitute for the atomic widget list here."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-157 - State Management Reactive Tree

```yaml
plan_unit_id: F3-157
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  State management follows a reactive state tree with observable projections consumed by Slint
  models and shell surfaces.
gui_related: true
gui_classification_reason: This unit defines GUI-facing Slint model and shell surface state behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: state_management_reactive_tree
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0100"
preserved_exact_tokens:
- "reactive state tree"
- "observable projections"
- "Slint models"
- "shell surfaces"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-158 - State Architecture And Slint Projection Updates

```yaml
plan_unit_id: F3-158
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Canonical runtime and durable state live in Rust-owned records and projections; Slint surfaces
  subscribe to observable projections rather than polling, and UI models update through batched
  invoke_from_event_loop mutations.
gui_related: true
gui_classification_reason: This unit defines GUI model update behavior and Slint projection subscriptions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: state_architecture_and_slint_projection_updates
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0101"
preserved_exact_tokens:
- "Rust-owned records/projections"
- "observable projections"
- "polling"
- "invoke_from_event_loop"
negative_constraints:
- "Slint surfaces subscribe to observable projections rather than polling."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Canonical runtime and durable state live in Rust-owned records/projections."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-159 - State Category Taxonomy

```yaml
plan_unit_id: F3-159
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  State categories distinguish UI state, session state, project state, and global state, including
  persistence boundaries for hover, local selection, transient expansion, sessions, threads,
  workspace tabs, projects, and cross-project preferences.
gui_related: true
gui_classification_reason: This unit defines GUI state categories that affect surface behavior and persistence.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: state_category_taxonomy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0102"
preserved_exact_tokens:
- "UI state"
- "Session state"
- "Project state"
- "Global state"
- "hover"
- "local selection"
- "thread"
- "workspace tab"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-160 - Command Mutation State Flow

```yaml
plan_unit_id: F3-160
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  State flow uses commands as the mutation boundary, writes mutations to canonical projections
  first, and renders UI updates from projection state rather than optimistic ad hoc local rewrites
  unless explicitly marked pending.
gui_related: true
gui_classification_reason: This unit defines GUI command/mutation/update behavior and pending-state rendering.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: command_mutation_state_flow
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0103"
preserved_exact_tokens:
- "User action -> Command -> State mutation -> UI update"
- "commands"
- "mutation boundary"
- "canonical projections"
- "pending"
negative_constraints:
- "UI updates render from the new projection state rather than optimistic ad hoc local rewrites unless explicitly marked pending."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Commands are the mutation boundary."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-161 - State Conflict Resolution

```yaml
plan_unit_id: F3-161
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  State conflict resolution uses last-write-wins for UI state, merge strategy for project state
  when multiple durable sources contribute, and separate inspectability for requested versus
  effective runtime values.
gui_related: true
gui_classification_reason: This unit defines GUI state conflict and inspector-visible requested/effective behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: state_conflict_resolution
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0104"
preserved_exact_tokens:
- "last-write-wins"
- "UI state"
- "merge strategy"
- "project state"
- "requested vs effective runtime values"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-162 - Persistence Promotion Shell Records And Widget Layout

```yaml
plan_unit_id: F3-162
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Persistence boundaries discard unpromoted ephemeral state, require stable keys and versioned
  migrations, rewrite deprecated keys during forward migration, and keep shell persistence plus
  Orchestrator Progress widget layout in narrow project shell records.
gui_related: true
gui_classification_reason: This unit defines GUI shell persistence, widget layout, and view-state storage behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persistence_promotion_shell_records_and_widget_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0105"
preserved_exact_tokens:
- "stable keys"
- "versioned migrations"
- "/floating"
- "/document"
- "/chat/editor"
- "project_state"
- "source_control.project_state.{project_id}"
- "widget_layout:v1:orchestrator:progress"
- "app-global"
- "project-scoped"
negative_constraints:
- "`widget_layout` entries must name `project_id` when they depend on project state."
compatibility_only_notes:
- "Migration reads from deprecated keys are allowed only during forward migration and must rewrite to the canonical family."
stale_retired_dispositions:
- "Deprecated key reads are forward-migration only."
owner_boundary_notes:
- "Shell persistence remains in narrow project shell records, not in canonical blocked or `/attention` truth."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-163 - View State Boundaries And FileManager Handoff Identity

```yaml
plan_unit_id: F3-163
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Per-surface state may persist view details such as line, range, active subview, compare target,
  panel layout, browser tab state, and widget layout only as view state, while FileManager restore
  and handoff preserve repo/worktree and history-checkpoint identity through backend-driven
  pipelines.
gui_related: true
gui_classification_reason: This unit constrains GUI view-state persistence and FileManager restore behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: route_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: view_state_boundaries_and_filemanager_handoff_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0105"
preserved_exact_tokens:
- "line"
- "range"
- "active_subview"
- "repo_id"
- "worktree_id"
- "/history/checkpoint"
- "route identity"
negative_constraints:
- "Per-surface state must not replace canonical route identity."
- "FileManager restore must not treat path opens as the only canonical document identity."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FileManager restore and handoff state preserves `repo_id`, `worktree_id`, identity-backed `/history/checkpoint` references, and backend-driven restore pipelines."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-164 - Context Management Provenance And Disclosure

```yaml
plan_unit_id: F3-164
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Context management combines thread context, Investigation Context, editor/file references, and
  review/document references with stable identity, owner surface, canonical usage/state counters,
  token summaries, and visible pruning, compaction, and restoration disclosure.
gui_related: true
gui_classification_reason: Context disclosure and context surfaces are user-visible GUI behavior despite the source span inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: context_management_provenance_and_disclosure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0106"
preserved_exact_tokens:
- "Investigation Context"
- "editor/file references"
- "review/document references"
- "stable identity"
- "owner surface"
- "usage counters"
- "token summaries"
- "pruning"
- "compaction"
- "rehydrated"
negative_constraints:
- "Context management must not hide provenance."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Context usage counters and token summaries derive from canonical usage/state projections."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-165 - Agent Config Instruction Source And Projection Preview

```yaml
plan_unit_id: F3-165
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent-Config must expose a PM-owned canonical instruction editor plus per-target
  provider-native rendered previews, and the locked `/provider` surface must be named
  consistently across Settings, persistent Effective Runtime inspectors, provider entries,
  account/profile rows, instruction projections, and skill/MCP status.
gui_related: true
gui_classification_reason: >-
  This unit defines the visible Agent-Config instruction editor and provider-native projection
  previews.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_config_instruction_source_and_projection_preview
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0107"
preserved_exact_tokens:
- "Agent-Config"
- "/provider"
- "canonical instruction editor"
- "provider-native projection target"
- "Settings"
- "/inspector"
- "Effective Runtime inspectors"
- "provider entries"
- "account/profile rows"
- "instruction projections"
- "skill/MCP status"
- "ContractName:Plans/Multi-Account.md"
- "ContractName:Plans/Prompt_Pipeline.md"
- "ContractName:Plans/Skills_System.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Consumes Multi-Account, Prompt Pipeline, and Skills System owner contracts without moving their ownership into FinalGUISpec."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-166 - Projection Control States And Manual Override

```yaml
plan_unit_id: F3-166
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Per-target projection control state is closed to `controlled`, `manual_override`, and
  `projection_failed`; Manual Override is the visible label for manual override state, direct
  edits to controlled targets require switching only that target first, and failed projections
  expose repair or retry actions without pretending they are current.
gui_related: true
gui_classification_reason: >-
  This unit defines visible projection state labels, repair actions, and edit gating in the
  Agent-Config GUI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: projection_control_states_and_manual_override
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0107"
preserved_exact_tokens:
- "controlled"
- "manual_override"
- "projection_failed"
- "Manual Override"
- "repair/retry actions"
- "semantic sync is broken"
- "canonical-source change"
negative_constraints:
- "Direct edits to a PM-controlled provider-native projection target require switching only that target to Manual Override first."
- "Projection failures must not pretend the target is current."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-167 - Confirmation Level Taxonomy And Reversibility

```yaml
plan_unit_id: F3-167
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Action surfaces classify confirmation level as `none`, `light`, `strong`, or `hard_gate` and
  separately record reversibility so navigation, low-risk state changes, destructive
  mutations, and runtime-blocked recovery gates do not collapse into one generic dialog.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible confirmation levels for action surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: confirmation_level_taxonomy_and_reversibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0109"
preserved_exact_tokens:
- "none"
- "light"
- "strong"
- "hard_gate"
- "reversibility"
- "moderate-impact"
- "delete"
- "reset"
- "merge"
- "publish"
- "repository creation"
- "credential removal"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-168 - Concern Merge Split Confirmation Mapping

```yaml
plan_unit_id: F3-168
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Concern acknowledgement and `/dismiss` actions map to `light` or `strong` confirmation by
  severity and `/blocking` effect, while merge and `/split` always use `strong` confirmation
  because they alter structural lineage.
gui_related: true
gui_classification_reason: >-
  This unit defines visible confirmation behavior for concern and lineage-changing actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concern_merge_split_confirmation_mapping
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0109"
preserved_exact_tokens:
- "/dismiss"
- "/blocking"
- "merge"
- "/split"
- "strong"
- "severity"
- "structural lineage"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-169 - Scoped Identity Runtime Route Boundary

```yaml
plan_unit_id: F3-169
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Scoped-identity runtime families remain object-first and resolver-backed: GUI routes carry
  owning object plus scope, while `Contracts_V0.md` owns scoped-identity resolver rules and
  prevents family-specific top-level route fields.
gui_related: false
gui_classification_reason: >-
  This unit is a route and resolver ownership constraint rather than a visual widget
  requirement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: scoped_identity_runtime_route_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0109"
preserved_exact_tokens:
- "Scoped-identity runtime families"
- "object-first"
- "resolver-backed"
- "Contracts_V0.md"
- "scoped-identity resolver rules"
- "family-specific top-level route fields"
negative_constraints:
- "Scoped-identity route families must not create family-specific top-level route fields."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0.md owns the scoped-identity resolver rules."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-170 - Reversible Editor Undo Scope

```yaml
plan_unit_id: F3-170
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  `Ctrl+Z` / `Cmd+Z` is supported only where the owning surface allows reversible edits,
  including safe file operations, text editing, and message editing; git-native history
  actions and external side effects are not labeled as editor undo.
gui_related: true
gui_classification_reason: >-
  This unit defines keyboard undo behavior in user-visible editor and message surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: reversible_editor_undo_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0110"
preserved_exact_tokens:
- "Ctrl+Z"
- "Cmd+Z"
- "file operations"
- "text editing"
- "message editing"
- "Git-native history actions"
- "external side effects"
- "editor undo"
negative_constraints:
- "Git-native history actions and external side effects are not mislabeled as editor undo."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-171 - Source Control Restore And Diff Boundary

```yaml
plan_unit_id: F3-171
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Git/source-control discard, compare, and stage actions are not editor undo; restore points,
  rollback, and revert-last-agent-edit stay explicit restore-history commands, and the File
  Editor exposes diff heat-map, change-marker, and scrollbar change-marker state while routing
  revert to the owning Source Control or FileSafe command.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible source-control, restore-history, and File Editor review
  affordances.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: source_control_restore_and_diff_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0110"
preserved_exact_tokens:
- "discard"
- "compare"
- "stage"
- "restore points"
- "rollback"
- "revert-last-agent-edit"
- "diff heat-map/change-marker"
- "scrollbar change-marker"
- "Source Control"
- "FileSafe command"
negative_constraints:
- "Restore-history commands must not be buried behind git-panel affordances."
- "The File Editor must route revert operations to the owning Source Control or FileSafe command."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Source Control and FileSafe own the actual revert commands."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-172 - Loading States And Stale Labels

```yaml
plan_unit_id: F3-172
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Panel and page loads use skeleton screens, discrete actions use inline spinners or progress
  indicators, and prior validated content remains visible during refresh with stale or
  degraded labels.
gui_related: true
gui_classification_reason: >-
  This unit defines visible loading indicators and stale/degraded display labels.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: loading_states_and_stale_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0111"
preserved_exact_tokens:
- "skeleton screens"
- "inline spinners"
- "progress indicators"
- "prior validated content"
- "stale/degraded labels"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The `stale/degraded` labels are live loading-state vocabulary, not retired wording."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-173 - Error Display Severity Surfaces

```yaml
plan_unit_id: F3-173
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Field validation failures render as inline errors, transient non-blocking failures render as
  toast notifications, and failures that block progress or risk destructive ambiguity render
  as blocking dialogs.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible error presentation surfaces despite the source inference
  being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: error_display_severity_surfaces
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0112"
preserved_exact_tokens:
- "inline errors"
- "field validation"
- "toast notifications"
- "transient non-blocking failures"
- "blocking dialogs"
- "destructive ambiguity"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-174 - Empty State Onboarding And Shortcuts

```yaml
plan_unit_id: F3-174
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Empty panels show helpful onboarding content, clear next actions, and contextual shortcuts
  instead of blank chrome.
gui_related: true
gui_classification_reason: >-
  This unit defines visible empty-panel content despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: empty_state_onboarding_and_shortcuts
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0113"
preserved_exact_tokens:
- "Empty panels"
- "onboarding content"
- "next actions"
- "contextual shortcuts"
- "blank chrome"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-175 - Blocked And Recovery Surface Distinction

```yaml
plan_unit_id: F3-175
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Blocked state, retry, remediation, and recovery affordances use the canonical
  blocked/recovery contract and remain visually distinct from ordinary paused or idle states.
gui_related: true
gui_classification_reason: >-
  This unit defines visible blocked, retry, remediation, and recovery states despite the
  source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_and_recovery_surface_distinction
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0114"
preserved_exact_tokens:
- "Blocked state"
- "retry"
- "remediation"
- "recovery affordances"
- "canonical blocked/recovery contract"
- "paused"
- "idle"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The canonical blocked/recovery contract owns blocked and recovery semantics."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-176 - Event Driven Refresh Canon

```yaml
plan_unit_id: F3-176
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Event-driven updates are canonical: UI state refreshes on relevant runtime, filesystem, or
  provider events rather than generic timers.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI refresh behavior driven by runtime, filesystem, and provider events.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: event_driven_refresh_canon
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0115"
preserved_exact_tokens:
- "Event-driven updates"
- "UI state refresh"
- "runtime"
- "filesystem"
- "provider events"
- "generic timers"
negative_constraints:
- "Generic timers must not become the normal correctness model for shell refresh."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-177 - Polling Freshness Exception

```yaml
plan_unit_id: F3-177
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Polling is allowed only for external systems that do not provide push updates, such as
  GitHub Actions status checks; those intervals are freshness aids and must not become the
  correctness model for the rest of the shell.
gui_related: true
gui_classification_reason: >-
  This unit defines the visible freshness exception for external systems.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: polling_freshness_exception
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0115"
preserved_exact_tokens:
- "polling"
- "external systems"
- "GitHub Actions status checks"
- "freshness aids"
- "correctness model"
- "rest of the shell"
negative_constraints:
- "Polling intervals must not become the correctness model for the rest of the shell."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-178 - Human In The Loop Approval Surfaces

```yaml
plan_unit_id: F3-178
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Sensitive-operation approval surfaces present explicit action summary, affected resources,
  approval and deny actions, and an audit trail link to the originating thread, run, or bundle
  while preserving context.
gui_related: true
gui_classification_reason: >-
  This unit defines visible approval surfaces despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: human_in_the_loop_approval_surfaces
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0116"
preserved_exact_tokens:
- "Sensitive operations"
- "explicit action summary"
- "affected resources"
- "approval / deny actions"
- "audit trail"
- "originating thread, run, or bundle"
negative_constraints:
- "Approval surfaces must never auto-approve hidden follow-up side effects."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-179 - Context Menus And Clipboard Payload Families

```yaml
plan_unit_id: F3-179
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Context menus are the canonical discoverability surface for copy, paste, Add Note, file
  actions, and selection-scoped operations, and copy, paste, share, and export actions keep
  text clipboard, file-operation clipboard, chat context insertion, OS export, `/download`,
  remote-host transfer, and `/paste/share` families separate.
gui_related: true
gui_classification_reason: >-
  This unit defines visible context menus and clipboard command separation despite the source
  inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: context_menus_and_clipboard_payload_families
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0117"
preserved_exact_tokens:
- "Context menus"
- "copy"
- "paste"
- "Add Note"
- "file actions"
- "selection-scoped operations"
- "Text clipboard"
- "file-operation clipboard"
- "chat context insertion"
- "OS export"
- "/download"
- "remote-host transfer"
- "/paste/share"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Clipboard payload families carry distinct permissions, undo models, remote availability, and confirmation copy."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-180 - Exact Path And Value Copy

```yaml
plan_unit_id: F3-180
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Non-text path and value copy actions copy the exact underlying value via the shared
  clipboard helper and do not depend on text rendering quirks.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible copy actions despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: exact_path_and_value_copy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0118"
preserved_exact_tokens:
- "Non-text path/value copy actions"
- "exact underlying value"
- "shared clipboard helper"
- "text rendering quirks"
negative_constraints:
- "Non-text path/value copy actions must not depend on text rendering quirks."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-181 - Read Only Selection Copy

```yaml
plan_unit_id: F3-181
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Read-only text, code blocks, logs, and labels remain selectable and copyable without
  entering edit mode.
gui_related: true
gui_classification_reason: >-
  This unit defines selectable read-only GUI text behavior despite the source inference being
  false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: read_only_selection_copy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0119"
preserved_exact_tokens:
- "Read-only text"
- "code blocks"
- "logs"
- "labels"
- "selectable"
- "copyable"
- "edit mode"
negative_constraints:
- "Read-only copy must not require entering edit mode."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-182 - Clipboard Safety Feedback

```yaml
plan_unit_id: F3-182
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Clipboard actions provide lightweight success feedback for non-obvious values and never copy
  redacted or hidden-secret placeholders as though they were the real value.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible clipboard feedback and secret redaction behavior despite the
  source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: clipboard_safety_feedback
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0120"
preserved_exact_tokens:
- "Clipboard actions"
- "lightweight success feedback"
- "redacted"
- "hidden-secret placeholders"
- "real value"
negative_constraints:
- "Clipboard actions must never copy redacted or hidden-secret placeholders as though they were the real value."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-183 - LSP Owner Contract Alignment

```yaml
plan_unit_id: F3-183
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  LSP canon preserves the MVP operation inventory, normalized parameter shapes, and result
  envelope: `workspaceSymbol` carries `query`, position-based operations use `path` plus
  `position`, and `rename` requires `path`, `position`, and `newName` with approval gating.
gui_related: false
gui_classification_reason: >-
  This unit is an owner-contract and parameter-shape constraint; the GUI consumer unit is
  separate.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: lsp_owner_contract_alignment
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0121"
preserved_exact_tokens:
- "MVP operation inventory"
- "normalized parameter shapes"
- "result envelope"
- "workspaceSymbol"
- "query"
- "path"
- "position"
- "rename"
- "newName"
- "approval gating"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This section consumes the linked LSP owner contract and stays aligned with it."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-184 - LSP GUI Labels And Rename Approval

```yaml
plan_unit_id: F3-184
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  LSP GUI consumers preserve the nine `read-op` set by long-name and short-name aliases only
  as display or compatibility labels; canonical operations remain owner names, diagnostics
  stays context or panel data, and rename is approval-gated.
gui_related: true
gui_classification_reason: >-
  This unit defines LSP GUI labels, operation display compatibility, diagnostics display, and
  approval-gated rename behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: lsp_gui_labels_and_rename_approval
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0121"
preserved_exact_tokens:
- "nine `read-op` set"
- "long-name and short-name aliases"
- "diagnostics"
- "rename"
- "approval-gated"
- "goToDefinition"
- "findReferences"
- "hover"
- "documentSymbol"
- "workspaceSymbol"
- "goToImplementation"
- "prepareCallHierarchy"
- "incomingCalls"
- "outgoingCalls"
- "ok | partial | unavailable | error"
negative_constraints: []
compatibility_only_notes:
- "Long-name and short-name LSP aliases are display/compatibility labels only."
stale_retired_dispositions: []
owner_boundary_notes:
- "Canonical LSP operation names remain owned by the LSP owner contract."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-185 - Loading To Live Layout Stability

```yaml
plan_unit_id: F3-185
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When moving from placeholder to real data, the GUI preserves layout footprint and focus so
  the interface does not jump unexpectedly.
gui_related: true
gui_classification_reason: >-
  This unit defines placeholder-to-real-data GUI transitions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: loading_to_live_layout_stability
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0122"
preserved_exact_tokens:
- "placeholder"
- "real data"
- "layout footprint"
- "focus"
- "jump unexpectedly"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-186 - Detached Surface Continuity

```yaml
plan_unit_id: F3-186
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Detached panels and windows preserve identity, selection, and keyboard focus expectations
  when they are re-docked.
gui_related: true
gui_classification_reason: >-
  This unit defines visible detached panel/window behavior despite the source inference being
  false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: detached_surface_continuity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0123"
preserved_exact_tokens:
- "Detached panels"
- "windows"
- "identity"
- "selection"
- "keyboard focus"
- "re-docked"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-187 - Sound Effects Accessibility Boundary

```yaml
plan_unit_id: F3-187
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Optional sound effects may reinforce approvals required, run completion, or error escalation
  events, but remain user-controllable, accessible, and never the sole carrier of important
  information.
gui_related: true
gui_classification_reason: >-
  This unit defines optional user-facing sound effects and their accessibility constraints
  despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: sound_effects_accessibility_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0124"
preserved_exact_tokens:
- "sound effects"
- "approvals required"
- "run completion"
- "error escalation"
- "user-controllable"
- "accessible"
- "never the sole carrier"
negative_constraints:
- "Sound effects must never be the sole carrier of important information."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-188 - Anti Flicker Core Principle

```yaml
plan_unit_id: F3-188
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI must never visually jump or flicker when background data updates arrive, and users
  must not lose scroll position or see layout shifts during normal operation.
gui_related: true
gui_classification_reason: >-
  This unit defines visual anti-flicker behavior for background updates.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: anti_flicker_core_principle
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0126"
preserved_exact_tokens:
- "jump"
- "flicker"
- "background data updates"
- "scroll position"
- "layout shifts"
negative_constraints:
- "The GUI must never visually jump or flicker when background data updates arrive."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-189 - Scroll Preservation And New Content Indicator

```yaml
plan_unit_id: F3-189
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When new items enter a `VecModel` such as chat messages, log lists, evidence lists, or
  bounded terminal transcript projections, the GUI preserves scroll position unless the user
  is at the bottom; if the user is reviewing history, it holds position and shows a New
  messages below indicator.
gui_related: true
gui_classification_reason: >-
  This unit defines visible list scroll preservation and new-content indication.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: scroll_preservation_and_new_content_indicator
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0127"
preserved_exact_tokens:
- "VecModel"
- "chat messages"
- "log lists"
- "evidence lists"
- "bounded terminal transcript projections"
- "viewport-y"
- "ListView"
- "bottom threshold"
- "New messages below"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-190 - Batched Updates And Stable List Keys

```yaml
plan_unit_id: F3-190
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Multiple simultaneous property changes are batched into one `invoke_from_event_loop` call,
  and each `VecModel` item uses a stable ID rather than just an index so Slint can reconcile
  updates without destroying and recreating rows.
gui_related: true
gui_classification_reason: >-
  This unit constrains Slint model update behavior to avoid partial renders.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: batched_updates_and_stable_list_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0127"
preserved_exact_tokens:
- "invoke_from_event_loop"
- "stable ID"
- "not just an index"
- "VecModel"
- "orchestrator status + progress + transcript projection updates"
negative_constraints:
- "Do not call `invoke_from_event_loop` three times for three properties when one batched update can apply all changes."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-191 - Incremental VecModel Mutation

```yaml
plan_unit_id: F3-191
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When only one list item changes, the GUI updates the existing model entry with
  `VecModel::set_row_data()` and uses `VecModel::push()` or `VecModel::remove()` for additions
  and removals instead of clearing and rebuilding the whole model.
gui_related: true
gui_classification_reason: >-
  This unit constrains Slint list mutation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: incremental_vecmodel_mutation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0127"
preserved_exact_tokens:
- "VecModel::clear()"
- "set_row_data()"
- "VecModel::push()"
- "VecModel::remove()"
- "existing model entry"
negative_constraints:
- "Never call `VecModel::clear()` plus re-add all items when only one item changed."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-192 - Layout Stability And Debounced Persistence

```yaml
plan_unit_id: F3-192
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Status badges, progress bars, optional error/loading elements, panel resize, and card
  rearrangement keep layout stable through fixed/reserved space or smooth reveal behavior, and
  layout persistence writes to redb are debounced 300-500ms to avoid disk thrashing and UI
  stutter.
gui_related: true
gui_classification_reason: >-
  This unit defines visual layout stability and persistence debounce behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: layout_stability_and_debounced_persistence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0127"
preserved_exact_tokens:
- "Fixed-size containers"
- "progress bars"
- "Reserve space"
- "animation"
- "debounce"
- "redb"
- "300-500ms"
- "disk thrashing"
- "UI stutter"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-193 - Terminal Core Anti Flicker Boundary

```yaml
plan_unit_id: F3-193
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Live terminal rendering follows the Section 15 terminal-core architecture: high-frequency
  mutable grid, native screen/buffer state, diff-based painting, and off-UI-thread PTY/buffer
  ingestion and processing, while DOM/React/webview-style document-UI terminal cores are
  non-ship.
gui_related: true
gui_classification_reason: >-
  This unit constrains terminal rendering architecture and excludes non-ship web-style
  terminal cores.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_core_anti_flicker_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0128"
preserved_exact_tokens:
- "Section 15 terminal-core architecture"
- "high-frequency mutable grid"
- "DOM/React/webview-style document-UI terminal cores"
- "non-ship"
- "native screen/buffer state"
- "diff-based painting"
- "off-UI-thread PTY/buffer ingestion"
negative_constraints:
- "DOM/React/webview-style document-UI terminal cores are non-ship."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-194 - Terminal Projection Throttling And Ring Buffers

```yaml
plan_unit_id: F3-194
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Bounded terminal transcript or plain-log projections may use visible `VecModel`/`ListView`
  row windows; rapid output is throttled to max 30fps, rows are batched within 33ms, ring
  buffers stay in Rust, and high-volume output uses ring-buffer-backed `/virtualized`
  projections so 4-split terminal panes keep layout ratios stable.
gui_related: true
gui_classification_reason: >-
  This unit defines visible terminal projection update bounds while preserving the live-core
  boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_projection_throttling_and_ring_buffers
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0128"
preserved_exact_tokens:
- "VecModel"
- "ListView"
- "max 30fps"
- "33ms"
- "Ring buffers stay in Rust"
- "visible transcript"
- "plain-log projection window"
- "/virtualized"
- "4-split terminal panes"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-195 - Responsive Breakpoints And Overlay Drawers

```yaml
plan_unit_id: F3-195
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Window width breakpoints map to full, compact, collapsed, and single-column layouts, and
  narrow `/overlays` or drawers keep AnnotationDrawer, AnnotationActionMenu, and
  ContextChipStrip keyboard-accessible.
gui_related: true
gui_classification_reason: >-
  This unit defines responsive breakpoints, collapsed panels, and overlay/drawer behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: responsive_breakpoints_and_overlay_drawers
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0130"
preserved_exact_tokens:
- ">= 1360px"
- "1080-1359px"
- "720-1079px"
- "< 720px"
- "/overlays"
- "drawers"
- "AnnotationDrawer"
- "AnnotationActionMenu"
- "ContextChipStrip"
- "keyboard-shortcut"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-196 - Side Panel Responsive Widths

```yaml
plan_unit_id: F3-196
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Side panels adapt at 480px+, 360-479px, 280-359px, and 240px minimum widths by reducing
  text, moving footer context to icons or context percent, and placing extras behind an
  overflow menu with tooltips where needed.
gui_related: true
gui_classification_reason: >-
  This unit defines side-panel responsive control density.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: side_panel_responsive_widths
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0131"
preserved_exact_tokens:
- "480px+"
- "360-479px"
- "280-359px"
- "240px (minimum)"
- "Mode tabs"
- "tooltip on hover"
- "overflow menu"
- "context %"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-197 - Dashboard Grid Responsive Columns

```yaml
plan_unit_id: F3-197
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard grid columns respond to width: two columns below 1200px, three columns from
  1200-1600px, and four columns above 1600px.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Dashboard grid column counts despite the source inference being
  false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_grid_responsive_columns
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0132"
preserved_exact_tokens:
- "< 1200px"
- "1200-1600px"
- "> 1600px"
- "2 columns"
- "3 columns"
- "4 columns"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-198 - Activity Bar Responsive Navigation

```yaml
plan_unit_id: F3-198
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Activity bar remains 48px at all breakpoints and becomes primary navigation below 720px
  with panels opening as overlay drawers; shared binder and document-review surfaces keep
  document switching/status on the left binder rail, annotation management on the right
  rail/drawer, selection actions inline, and chat separate.
gui_related: true
gui_classification_reason: >-
  This unit defines Activity Bar responsive navigation and shared binder responsive rules.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: activity_bar_responsive_navigation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0133"
preserved_exact_tokens:
- "Activity bar"
- "48px"
- "< 720px"
- "overlay drawers"
- "/binder"
- "left binder rail"
- "right binder rail"
- "AnnotationActionMenu"
- "ContextChipStrip"
- "chat itself remains a separate panel"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-199 - Binder Review Placement And Chat Separation

```yaml
plan_unit_id: F3-199
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Concept lineage from `Concepts/PuppetMasterDashComp.html` narrows wizard binder placement
  without making that concept file a live owner: the left rail contains `wizard-doc-pill`,
  central content is `wizard-binder-view`, the top toolbar is `wizard-binder-toolbar`,
  annotation UI is right-side/drawer/overlay, and chat remains the separate `#chatPanel` /
  `chatPanel` side panel with `ContextChipStrip` send-to-chat chips.
gui_related: true
gui_classification_reason: >-
  This unit preserves concept-lineage placement constraints without making the concept file a
  live owner.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: binder_review_placement_and_chat_separation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0133"
preserved_exact_tokens:
- "Concepts/PuppetMasterDashComp.html"
- "/PuppetMasterDashComp.html"
- "wizard-doc-pill"
- "wizard-binder-view"
- "wizard-binder-toolbar"
- "annotation-review"
- "#chatPanel"
- "chatPanel"
- "queued-intervention"
- "send-to-chat"
- "ContextChipStrip"
negative_constraints:
- "Annotation UI must not live in the left document rail or in a browser-style `annotation-review` modal."
- "Chat must remain a separate side panel, not embedded inside the binder review surface."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The concept file is lineage only and is not a live owner."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-200 - Basic Theme Accessibility Option

```yaml
plan_unit_id: F3-200
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Basic theme is the primary accessibility-friendly option, with no decorative effects,
  WCAG AA 4.5:1 minimum contrast, screen-readable system fonts, minimum 14px body text, 1.6
  line height, 0.02em letter spacing, 4px border radius, no hard shadows, and reduced-motion
  respect.
gui_related: true
gui_classification_reason: >-
  This unit defines the visible Basic accessibility theme.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: basic_theme_accessibility_option
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0135"
preserved_exact_tokens:
- "Basic theme"
- "pixel grid"
- "paper texture"
- "scanlines"
- "WCAG AA"
- "4.5:1"
- "14px"
- "1.6 line height"
- "0.02em letter spacing"
- "4px border radius"
- "prefers-reduced-motion"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-201 - Focus Indicator Theme Rules

```yaml
plan_unit_id: F3-201
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  All themes show visible focus indicators: Retro Dark/Light use an ACID_LIME 2px border, and
  Basic uses a high-contrast 2px ring with 2px offset in accent-blue.
gui_related: true
gui_classification_reason: >-
  This unit defines visible focus indicators despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: focus_indicator_theme_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0136"
preserved_exact_tokens:
- "Retro Dark/Light"
- "ACID_LIME"
- "2px border"
- "Basic"
- "High-contrast 2px ring"
- "2px offset"
- "accent-blue"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-202 - Keyboard Navigation Contract

```yaml
plan_unit_id: F3-202
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  All interactive elements are reachable by Tab; focus order follows Activity bar to primary
  content to side panel to bottom panel to status bar; lists, tables, and trees support
  Up/Down, Enter, Escape, Home/End, and type-ahead filtering where appropriate.
gui_related: true
gui_classification_reason: >-
  This unit defines keyboard navigation and focus order.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: keyboard_navigation_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0137"
preserved_exact_tokens:
- "Tab navigation"
- "Activity bar -> primary content -> side panel -> bottom panel -> status bar"
- "Up/Down arrow navigation"
- "Enter"
- "Escape"
- "Home/End"
- "Type-ahead filtering"
- "thread list"
- "project list"
- "file tree"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-203 - Screen Reader Mitigation Contract

```yaml
plan_unit_id: F3-203
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Because Slint screen reader support is limited, interactive components set `accessible-role`
  and `accessible-label` where available in current stable Slint, panel dock/floating state and theme
  name are exposed to assistive technology, and keyboard shortcuts are discoverable via
  command palette.
gui_related: true
gui_classification_reason: >-
  This unit defines Slint accessibility mitigations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: screen_reader_mitigation_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0138"
preserved_exact_tokens:
- "Slint 1.17.1"
- "accessible-role"
- "accessible-label"
- "docked/floating"
- "Theme name"
- "assistive technology"
- "command palette"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-204 - Minimum Touch And Click Targets

```yaml
plan_unit_id: F3-204
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  All clickable and draggable controls are at least 24px in height and width for reliable
  interaction.
gui_related: true
gui_classification_reason: >-
  This unit defines visible control hit-target sizing despite the source inference being
  false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: minimum_touch_and_click_targets
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0139"
preserved_exact_tokens:
- "clickable/draggable controls"
- "24px"
- "height/width"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-205 - Slint Root Widgets And Views Layout

```yaml
plan_unit_id: F3-205
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Slint UI tree includes `build.rs`, `ui/app.slint`, `ui/theme.slint`, reusable
  `ui/widgets/*` components, and `ui/views/*` page-level views including dashboard, settings,
  wizard, interview, nodes, evidence, metrics, history, memory, ledger, coverage, projects,
  setup, usage, file_editor, agent_activity, and not_found.
gui_related: true
gui_classification_reason: >-
  This unit covers the Slint root, theme, reusable widget, and page-level view file layout
  from the directory map.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_root_widgets_and_views_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "build.rs"
- "slint_build::compile(\"ui/app.slint\")"
- "ui/app.slint"
- "theme.slint"
- "widgets/"
- "panel_card.slint"
- "status_badge.slint"
- "selectable_text.slint"
- "command_palette.slint"
- "views/"
- "dashboard.slint"
- "settings.slint"
- "usage.slint"
- "file_editor.slint"
- "agent_activity.slint"
- "not_found.slint"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-206 - Slint Panels And Windows Layout

```yaml
plan_unit_id: F3-206
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Slint panel and window files live under `ui/panels/` and `ui/windows/`, including chat, file
  manager, bottom runtime panel, shared browser panel, debug panel, floating panel, and about
  window surfaces.
gui_related: true
gui_classification_reason: >-
  This unit covers visible detachable panel and secondary-window Slint file placement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_panels_and_windows_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "panels/"
- "chat_panel.slint"
- "file_manager_panel.slint"
- "bottom_panel.slint"
- "browser_panel.slint"
- "debug_panel.slint"
- "windows/"
- "floating_panel.slint"
- "about.slint"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-207 - Rust App And Bridge Layout

```yaml
plan_unit_id: F3-207
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Rust app and bridge code is organized under `src/main.rs`, `src/app.rs`, and `src/bridge/`
  modules for theme sync, VecModel setup/model factories, callback wiring, and multi-window
  lifecycle.
gui_related: true
gui_classification_reason: >-
  This unit covers the Rust app entrypoint and Slint bridge modules that feed GUI state.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rust_app_and_bridge_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "src/main.rs"
- "BackendSelector"
- "src/app.rs"
- "AppState"
- "message routing"
- "bridge/"
- "theme_bridge.rs"
- "model_bridge.rs"
- "callback_bridge.rs"
- "window_bridge.rs"
- "VecModel"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-208 - Rust Panels Effects And Theme Layout

```yaml
plan_unit_id: F3-208
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Rust panel, effects, and theme modules include panel registry, dock/undock layout, snap
  zones, pixel grid and paper texture generation, color palettes, design tokens, ThemeVariant
  application, and custom theme TOML loading.
gui_related: true
gui_classification_reason: >-
  This unit covers Rust-side panel registry, layout, effects, and theme modules that support
  GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rust_panels_effects_and_theme_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "src/panels/"
- "registry.rs"
- "PanelRegistry"
- "layout.rs"
- "snap.rs"
- "effects/"
- "grid_texture.rs"
- "paper_texture.rs"
- "SharedPixelBuffer"
- "theme/"
- "palette.rs"
- "tokens.rs"
- "variants.rs"
- "ThemeVariant"
- "custom_loader.rs"
- "TOML files"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-209 - Browser Integration Layout

```yaml
plan_unit_id: F3-209
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser integration modules live under `src/browser/` and cover wry webview lifecycle, URL
  navigation, bookmark persistence, and click-to-context element capture.
gui_related: true
gui_classification_reason: >-
  This unit covers browser integration modules for user-visible webview, bookmarks, and
  click-to-context behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_integration_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "browser/"
- "webview.rs"
- "wry webview lifecycle"
- "URL navigation"
- "bookmarks.rs"
- "Bookmark persistence"
- "context_capture.rs"
- "Click-to-context element capture"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-210 - Debug And SSH Module Layout

```yaml
plan_unit_id: F3-210
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug and SSH support modules live under `src/debug/` and `src/ssh/`, covering DAP protocol
  client, breakpoint management, launch configuration parsing, SSH/SFTP connection management,
  remote filesystem abstraction, and system keychain credential storage.
gui_related: false
gui_classification_reason: >-
  This unit is backend/debug/remote module organization, not itself a visual surface contract.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_and_ssh_module_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "debug/"
- "dap_client.rs"
- "DAP protocol client"
- "breakpoints.rs"
- "launch_config.rs"
- "ssh/"
- "connection.rs"
- "SSH/SFTP connection management"
- "remote_fs.rs"
- "keychain.rs"
- "System keychain credential storage"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-211 - Audio Module Layout

```yaml
plan_unit_id: F3-211
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Audio modules live under `src/audio/` and cover rodio-based audio playback plus
  event-to-sound mapping.
gui_related: false
gui_classification_reason: >-
  This unit is audio backend module organization; user-facing sound UX is covered by F3-187.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: audio_module_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "audio/"
- "player.rs"
- "rodio-based audio playback"
- "events.rs"
- "Event-to-sound mapping"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-187 owns user-facing sound effects accessibility behavior."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-212 - Catalog And Sync Module Layout

```yaml
plan_unit_id: F3-212
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Catalog and sync modules live under `src/catalog/` and `src/sync/`, covering catalog index
  fetch/cache, one-click install logic, bundle export, bundle import, and conflict resolution.
gui_related: false
gui_classification_reason: >-
  This unit is catalog and sync backend module organization, not itself a visual surface
  contract.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: catalog_and_sync_module_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "catalog/"
- "index.rs"
- "Catalog index fetch/cache"
- "installer.rs"
- "One-click install logic"
- "sync/"
- "exporter.rs"
- "Bundle export"
- "importer.rs"
- "Bundle import + conflict resolution"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-213 - Detection And Hot Reload Module Layout

```yaml
plan_unit_id: F3-213
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Detection and hot-reload modules live under `src/detect/` and `src/hotreload/`, covering
  project root scanning for marker files, notify-based file watching, and build command
  execution.
gui_related: false
gui_classification_reason: >-
  This unit is detection and hot-reload backend module organization, not itself a visual
  surface contract.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: detection_and_hot_reload_module_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0141"
preserved_exact_tokens:
- "detect/"
- "scanner.rs"
- "Project root scanning for marker files"
- "hotreload/"
- "watcher.rs"
- "notify-based file watcher"
- "builder.rs"
- "Build command execution"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-214 - Slint Conditional View Switching

```yaml
plan_unit_id: F3-214
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Slint page switching uses conditional `if` blocks keyed by `root.current-page` so hidden
  views have zero runtime cost and widget trees are destroyed and recreated with the
  condition.
gui_related: true
gui_classification_reason: >-
  This unit defines visible lazy page rendering in Slint.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_conditional_view_switching
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0142"
preserved_exact_tokens:
- "conditional `if` blocks"
- "root.current-page"
- "DashboardView"
- "ProjectsView"
- "SettingsView"
- "Hidden views have zero runtime cost"
- "Widget trees are destroyed"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-215 - Standard Virtualized List Models

```yaml
plan_unit_id: F3-215
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat messages, file trees, log outputs, evidence lists, and other long GUI lists use Slint
  `ListView` with `VecModel`.
gui_related: true
gui_classification_reason: >-
  This unit defines visible long-list rendering behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: standard_virtualized_list_models
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0143"
preserved_exact_tokens:
- "Chat messages"
- "file trees"
- "log outputs"
- "evidence lists"
- "ListView"
- "VecModel"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-216 - Large Dataset And Terminal List Boundary

```yaml
plan_unit_id: F3-216
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Extremely large datasets use a custom `Model` trait backed by a ring buffer; live terminal
  rendering is excluded from the normal list rule and follows the Section 15 screen/buffer,
  diff-painting, off-UI-thread PTY/buffer architecture, while only bounded terminal transcript
  or plain-log projections use `VecModel`/`ListView`.
gui_related: true
gui_classification_reason: >-
  This unit constrains GUI list virtualization and live terminal rendering boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: large_dataset_and_terminal_list_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0143"
preserved_exact_tokens:
- "100k+ log lines"
- "custom `Model` trait"
- "ring buffer"
- "Live terminal rendering is excluded"
- "Section 15 screen/buffer"
- "diff-based painting"
- "off-UI-thread PTY/buffer"
- "bounded terminal transcript"
- "plain-log projections"
negative_constraints:
- "Live terminal rendering must not be implemented as a normal `VecModel`/`ListView` list."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-217 - Shell Layout And Editor Persistence Keys

```yaml
plan_unit_id: F3-217
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  GUI shell persistence includes `layout:v1`, `widget_layout:v1:dashboard`,
  `activity_bar_order:v1`, `theme:v1`, `editor_state:v1:{project_id}`,
  `filetree_state:v1:{project_id}`, `search_panel_state.v1:{project_id}`,
  `project_state:v1:{project_id}`, `gha_panel_state.v1:{project_id}`, and
  `artifact_panel_state.v1:{project_id}` with their debounce/write frequencies and owner
  ContractRefs. Shell theme and layout are Project-scoped snapshots: a genuinely absent
  first-open/fresh-project snapshot receives Basic Dark and the factory layout, an existing
  Project's explicit saved theme/layout survives every open and Project switch, and Project
  copy materializes a detached destination snapshot with no continuing source inheritance.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI shell, layout, editor, search, project, GitHub Actions, and artifact
  persistence keys.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "A genuinely fresh Project seeds Basic Dark plus factory layout, existing explicit saved theme/layout survives startup and switching, and a copied Project owns an independent detached destination snapshot."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shell_layout_and_editor_persistence_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0145"
preserved_exact_tokens:
- "layout:v1"
- "widget_layout:v1:dashboard"
- "activity_bar_order:v1"
- "theme:v1"
- "editor_state:v1:{project_id}"
- "filetree_state:v1:{project_id}"
- "search_panel_state.v1:{project_id}"
- "project_state:v1:{project_id}"
- "gha_panel_state.v1:{project_id}"
- "artifact_panel_state.v1:{project_id}"
- "ContractName:Plans/storage-plan.md"
- "ContractName:Plans/FileManager.md"
- "ContractName:Plans/LSPSupport.md"
negative_constraints:
- "`layout:v1` is not terminal topology or terminal session identity."
- "Do not reapply factory theme/layout over an existing Project or keep a copied Project live-linked to its source snapshot."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Project state is a lightweight shell/UX projection cache, not a canonical state store."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-218 - Chat Settings Review Persistence Keys

```yaml
plan_unit_id: F3-218
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat, settings, and review persistence includes `settings:v1`, `config:v1`, `chat_state:v1`,
  `wizard_state:v1:{project_id}`, document pane/checkpoint records, review finding/approval
  records, debug investigation records, bundle/note records, slash command keys, and
  `projects:v1`.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI chat, settings, wizard, document, review, bundle, note, command, and
  project persistence keys.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_settings_review_persistence_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0145"
preserved_exact_tokens:
- "settings:v1"
- "config:v1"
- "chat_state:v1"
- "wizard_state:v1:{project_id}"
- "document_pane_state:v1:{project_id}:{page_context}"
- "document_checkpoints:v1:{project_id}"
- "review_findings_summary:v1:{project_id}:{run_id}"
- "review_approval_gate:v1:{project_id}:{run_id}"
- "debug_investigation_record.v1:{project_id}:{investigation_id}"
- "bundle_registry.v1:{project_id}:{bundle_id}"
- "note_record.v1:{bundle_id}:{note_id}"
- "slash_commands:v1"
- "projects:v1"
- "ContractName:Plans/assistant-chat-design.md"
- "ContractName:Plans/Prompt_Pipeline.md"
negative_constraints:
- "`config:v1` is subordinate to `settings:v1`, not a competing global config key."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-219 - Preview Browser LSP Account Remote Keys

```yaml
plan_unit_id: F3-219
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Preview, browser, LSP, account, MCP, skill, web operation, terminal, and remote GUI
  persistence keys include preview state/source artifact, browser session/profile state,
  canonical per-file editor buffer recovery, search query, LSP session/diagnostics, provider
  account/server profile, pressure/switch records, MCP/skill records, `web_operation_payload`,
  terminal layout/session summaries, and `ssh_remotes/{id}`. The former
  `editor_unsaved_buffer.v1:{project_id}:{document_id}` token is source-lineage only; live
  buffer recovery uses `editor_state.v1:{project_id}:{file_path_hash}`.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI preview, browser, recovery, LSP, account, MCP, skill, web-operation,
  terminal, and remote persistence keys.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: preview_browser_lsp_account_remote_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0145"
preserved_exact_tokens:
- "preview_state.v1:{project_id}:{preview_subject_id}"
- "preview_source_artifact.v1:{project_id}:{artifact_id}"
- "browser_session_state.v1:{project_id}:{browser_session_id}"
- "browser_profile_state.v1:{project_id}:{profile_scope}"
- "editor_state.v1:{project_id}:{file_path_hash}"
- "search_query_state.v1:{project_id}:{query_session_id}"
- "lsp_session_state.v1:{project_id}:{host_id}:{server_id}:{root_identity}"
- "lsp_diagnostics_snapshot.v1:{project_id}:{host_id}:{server_id}:{root_identity}"
- "provider_account_record.v1:{provider_id}:{account_id}"
- "mcp_server_record.v1:{mcp_server_id}"
- "skill_record.v1:{skill_id}"
- "web_operation_payload"
- "terminal_layout.v1:{project_id}"
- "terminal_session.v1:{terminal_session_id}"
- "ssh_remotes/{id}"
- "ContractName:Plans/GitHub_Integration.md"
- "ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
negative_constraints:
- "Per-file buffer recovery MUST NOT imply that a local or remote file write succeeded."
compatibility_only_notes: []
stale_retired_dispositions:
- "`editor_unsaved_buffer.v1:{project_id}:{document_id}` and wildcard `editor_unsaved_buffer.v1:*` are source-lineage only; they are not registered live write keys."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-220 - GUI Persistence Alias And Owner Routing Notes

```yaml
plan_unit_id: F3-220
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  GUI persistence summaries replace stale `ssh_connections:v1`, stale `browser_state.v1` /
  `browser_state:v1`, and deprecated `dashboard_layout:v1` with canonical key families;
  preserve editor workspace, hot-reload, and onboarding colon-form keys only as admitted
  migration inputs; and route Search/LSP, viewer-mode, and MCP readiness through owner-doc
  precision without creating local storage, MCP, account, or cost authority.
gui_related: true
gui_classification_reason: >-
  This unit preserves stale/deprecated alias rules and owner-routing constraints for GUI
  persistence.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: gui_persistence_alias_and_owner_routing_notes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0145"
preserved_exact_tokens:
- "ssh_connections:v1"
- "preview_state.v1:*"
- "preview_source_artifact.v1:*"
- "browser_session_state.v1:*"
- "browser_profile_state.v1:*"
- "browser_state.v1"
- "browser_state:v1"
- "dashboard_layout:v1"
- "widget_layout:v1:dashboard"
- "editor_state:v1:{project_id}"
- "editor_workspace_state.v1:{project_id}"
- "hotreload_state:v1:{project_id}"
- "hotreload_state.v1:{project_id}"
- "onboarding:v1"
- "onboarding_state.v1:{project_id}"
- "/viewer-mode"
- "pm.lock"
- "mcp_server_record"
- "mcp_runtime_availability"
- "/account/readiness"
negative_constraints:
- "GUI persistence must not imply ordinary edit capability when durable storage is locked or `pm.lock` cannot be acquired."
- "Cost-display and `/account/readiness` copy must not create local MCP, account, or cost buckets."
compatibility_only_notes: []
stale_retired_dispositions:
- "`ssh_connections:v1`, single-blob browser state keys, and `dashboard_layout:v1` are stale/deprecated aliases only."
- "Editor workspace, hot-reload, and onboarding colon-form aliases are read-only StorageMigrationCoordinator inputs, never ordinary-open fallback or new-write keys."
owner_boundary_notes:
- "Search, LSP, MCP readiness, usage/cost, and account/readiness copy route through their owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-221 - Terminal Persistence Compatibility Boundary

```yaml
plan_unit_id: F3-221
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal GUI persistence imports the full storage-owned terminal key catalog, resolves
  wildcard audit shorthands to concrete key families, and treats GUI-facing
  `terminal_layout.v1` / `terminal_session.v1` rows as projection and compatibility summaries
  only before claiming restore liveness.
gui_related: true
gui_classification_reason: >-
  This unit preserves terminal GUI persistence compatibility and storage-owner boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_persistence_compatibility_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0145"
preserved_exact_tokens:
- "terminal_workspace_state.v1:{project_id}:{workspace_tab_id}"
- "terminal_section_record.v1:{project_id}:{terminal_section_id}"
- "terminal_tab_record.v1:{project_id}:{terminal_tab_id}"
- "terminal_pane_record.v1:{project_id}:{terminal_pane_id}"
- "terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}"
- "terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}"
- "editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}"
- "terminal_session_record.v1:{project_id}:{terminal_session_id}"
- "terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}"
- "terminal_workspace_state.v1:*"
- "terminal_command_block.v1:*"
- "terminal_layout.v1"
- "terminal_session.v1"
negative_constraints:
- "Terminal GUI persistence must not fork a local subset of the storage-owned terminal key catalog."
- "Restore and open/focus flows must resolve through the storage key catalog before claiming liveness."
compatibility_only_notes:
- "GUI-facing `terminal_layout.v1` / `terminal_session.v1` rows are projection and compatibility summaries only."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/storage-plan.md owns the complete terminal key catalog."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-222 - Usage Seglog And Rollup Production

```yaml
plan_unit_id: F3-222
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Usage events for tokens, cost, platform, provider/pricing tier, session, and thread_id
  append to seglog, while analytics scan jobs produce redb rollups for 5h/7d counters, tool
  latency, and error rates.
gui_related: false
gui_classification_reason: >-
  This unit defines persistence and analytics production rather than a visual surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: usage_seglog_and_rollup_production
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0146"
preserved_exact_tokens:
- "Usage events"
- "tokens"
- "cost"
- "platform"
- "provider/pricing tier"
- "session"
- "thread_id"
- "seglog"
- "tier"
- "entitlement or pricing metadata"
- "not decomposition-tier identity"
- "Analytics scan jobs"
- "redb"
- "5h/7d counters"
- "tool latency"
- "error rates"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-223 - Usage Dashboard Rollup Consumption

```yaml
plan_unit_id: F3-223
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Usage view and Dashboard read redb rollups rather than raw seglog, and per-thread usage
  derives from seglog events filtered by `thread_id`.
gui_related: true
gui_classification_reason: >-
  This unit defines Usage view and Dashboard consumption of persisted rollups.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: usage_dashboard_rollup_consumption
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0146"
preserved_exact_tokens:
- "Usage view"
- "dashboard"
- "redb rollups"
- "not raw seglog"
- "Per-thread usage"
- "thread_id"
negative_constraints:
- "Usage view and dashboard must not read raw seglog directly."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-224 - Tantivy GUI Search Indices

```yaml
plan_unit_id: F3-224
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Tantivy indices support Chat panel search for human and agent messages, Evidence search, and
  Ledger search.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI-searchable Tantivy indices.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: tantivy_gui_search_indices
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0147"
preserved_exact_tokens:
- "Tantivy"
- "Chat history search"
- "human and agent messages"
- "Chat panel search"
- "Evidence search"
- "Ledger search"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-225 - Startup Shell State Restore

```yaml
plan_unit_id: F3-225
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  On startup, the GUI restores layout, theme, dashboard widget layout, activity bar order,
  editor workspace and per-file dirty buffers, active project-facing shell state, historical
  hot-reload state, project onboarding/tour state, and safe detached-window coordinates from
  canonical persistence keys. Resettable corruption is secured before a disclosed reset;
  canonical editor loss uses mandatory-backup recovery and never becomes a false empty project.
gui_related: true
gui_classification_reason: >-
  This unit defines startup restoration of visible shell state.
split_recommended: false
depends_on: [F3-458]
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: startup_shell_state_restore
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0148"
preserved_exact_tokens:
- "layout:v1"
- "theme:v1"
- "widget_layout:v1:dashboard"
- "activity_bar_order:v1"
- "editor_workspace_state.v1:{project_id}"
- "editor_state.v1:{project_id}:{file_path_hash}"
- "project_state:v1:{project_id}"
- "hotreload_state.v1:{project_id}"
- "onboarding_state.v1:{project_id}"
- "disconnected monitor"
- "safe detached coordinate"
- "ContractName:Plans/storage-plan.md"
- "ContractName:Plans/FileManager.md"
- "ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "`dashboard_layout:v1`, `editor_state:v1:{project_id}`, `hotreload_state:v1:{project_id}`, and `onboarding:v1` are read-only coordinator migration inputs; ordinary startup does not use them as fallbacks."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-226 - Startup Terminal Restore Boundary

```yaml
plan_unit_id: F3-226
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Startup terminal restore reads `terminal_layout.v1:{project_id}` plus linked terminal
  session and canonical terminal record families, preserves section/tab/pane identity before
  liveness verification, prefers prior selected terminal containers, keeps structural restore
  copy separate from live PTY proof, and treats deprecated `terminal_state:v1` as
  compatibility input only.
gui_related: true
gui_classification_reason: >-
  This unit constrains terminal startup restore and live-state claims.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: startup_terminal_restore_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0148"
preserved_exact_tokens:
- "terminal_layout.v1:{project_id}"
- "terminal_session.v1:{terminal_session_id}"
- "terminal_state:v1"
- "section, tab, and pane identity"
- "live-state badges"
- "project `/reopen`"
- "/restored"
- "/exited"
- "/disconnected"
- "/restart"
- "/session-aware"
- "/layout"
- "ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
- "Startup restore must not fall back to a default single-pane layout when durable terminal layout exists."
- "Startup restore must not create new empty terminals automatically when saved terminal containers exist."
- "Structural restore must not be presented as live PTY proof."
compatibility_only_notes:
- "Deprecated `terminal_state:v1` may be ingested only by compatibility readers that rewrite into canonical terminal key families."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-227 - Crash Recovery Nonterminal State

```yaml
plan_unit_id: F3-227
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Crash recovery restores provable nonterminal state including chat draft/active thread
  selection, wizard form state, document pane selection and view, document checkpoints, review
  findings and approval state, and active project, while not restoring transient queue
  continuity.
gui_related: true
gui_classification_reason: >-
  This unit defines visible nonterminal state recovery after crash or unexpected shutdown.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: crash_recovery_nonterminal_state
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0149"
preserved_exact_tokens:
- "crash"
- "unexpected shutdown"
- "chat_state:v1"
- "queue state is transient"
- "wizard_state:v1:{project_id}"
- "document_pane_state:v1:{project_id}:{page_context}"
- "document"
- "plan_graph"
- "document_checkpoints"
- "review findings"
- "approval state"
- "Active project"
- "ContractName:Plans/storage-plan.md"
- "ContractName:Plans/assistant-chat-design.md"
- "ContractName:Plans/FileManager.md"
negative_constraints:
- "Crash recovery must not invent continuity that PM cannot prove."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-228 - Terminal Dev And Privileged Session Recovery

```yaml
plan_unit_id: F3-228
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal and dev-session recovery restores terminal workspace state, verified-live or
  historical terminal records, canonical recovery outcomes, workflow records, explicit
  historical banners, and privileged-session interrupted records; `docker exec/attach`,
  `kubectl exec`, and `kubectl port-forward` never auto-resume live attachment after crash or
  restart.
gui_related: true
gui_classification_reason: >-
  This unit constrains terminal/dev-session recovery and privileged attach semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_dev_and_privileged_session_recovery
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0149"
preserved_exact_tokens:
- "terminal sections"
- "verified-live"
- "historical records"
- "restored_live"
- "restored_exited"
- "restored_disconnected"
- "restored_without_history"
- "docker exec/attach"
- "kubectl exec"
- "kubectl port-forward"
- "auto-resume"
- "interrupted_session"
- "Reconnect / Start new session"
- "historical evidence"
negative_constraints:
- "Puppet Master MUST NOT fake live PTY continuity after restart."
- "Privileged interactive sessions never `auto-resume` a live attachment after crash or restart."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-229 - Log Stream GitHub Actions And Historical Restore

```yaml
plan_unit_id: F3-229
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Recovered log streams store source identity plus resume cursor or `/bookmark`; GitHub
  Actions recovery distinguishes remote still executing, completed while app was down, and
  local observation interrupted; historical inspection restores run, tab, node attempt,
  filters, graph detail, receipt drawer, degraded historical target labels, and requires
  source revalidation before claiming live follow.
gui_related: true
gui_classification_reason: >-
  This unit defines visible log stream, GitHub Actions, and historical inspection recovery.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: log_stream_github_actions_and_historical_restore
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0149"
preserved_exact_tokens:
- "log_stream_session"
- "resume cursor"
- "/bookmark"
- "remote run still executing"
- "remote run completed while app was down"
- "local observation interrupted"
- "gap marker"
- "uninterrupted local stream continuity"
- "run_id"
- "node `/attempt`"
- "graph `/detail`"
- "receipt `/detail` drawer"
- "historical_view"
- "paused_snapshot"
- "follow"
negative_constraints:
- "Recovered log streams must not claim uninterrupted local stream continuity without proof."
- "Restored `follow` intent requires source revalidation before a live stream is claimed."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-230 - Operation Observer Receipt Reconciliation

```yaml
plan_unit_id: F3-230
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Crash-interrupted operation observers finalize receipts with explicit lifecycle states and
  Orchestrator restart reconciliation uses external-continuity classifications for hosted
  runs, containers, or Kubernetes rollouts that continued while the UI observer was down.
gui_related: false
gui_classification_reason: >-
  This unit defines backend receipt lifecycle and external-continuity classification rather
  than a visual surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: operation_observer_receipt_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0149"
preserved_exact_tokens:
- "started"
- "observation_interrupted"
- "reconciled_completed"
- "reconciled_failed"
- "abandoned_unknown"
- "exec"
- "/attach"
- "port-forward"
- "log streams"
- "workflow-run"
- "publish `/deploy`"
- "external-continuity"
- "resumable_local"
- "externally_continued"
- "externally_completed"
- "stale_historical"
- "unknown_after_crash"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "`stale_historical` is a lifecycle classification, not a deleted concept."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-231 - Composer Queue Restore Rules

```yaml
plan_unit_id: F3-231
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  After restore, Stop/Edit/Resend attach only to the most recent user-sent message, Edit and
  Resend discard later history/work as specified, FIFO queueing remains max two messages, Stop
  does not clear queue, Stop disables only when a run completes and no next message is queued,
  queue state is not restored across reload/restart, and fenced-code copy remains available.
gui_related: true
gui_classification_reason: >-
  This unit constrains visible composer and queue state after restore.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: composer_queue_restore_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0149"
preserved_exact_tokens:
- "Stop/Edit/Resend"
- "most recent user-sent message"
- "discards all later history/work"
- "FIFO"
- "max 2 queued messages"
- "Stop does NOT clear the queue"
- "queue state is transient"
- "always-visible copy affordance"
- "fenced code blocks"
negative_constraints:
- "Restore does not invent queue continuity."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This recovery section consumes Plans/assistant-chat-design.md#4 Message submission, queued editing, interrupt, and stop."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-232 - Browser Runtime Artifact Recovery Boundary

```yaml
plan_unit_id: F3-232
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser sessions preserve their own restore policy and never become terminal-owned shells;
  attention surfaces, command cards, and runtime panes pivot back to restored canonical
  identity; artifact pass reports require owner `/thread/run/attempt/account` lineage,
  pass-report fields, and wizard interview producer alignment before the GUI treats them as
  canonical.
gui_related: true
gui_classification_reason: >-
  This unit preserves browser/runtime/artifact owner boundaries during recovery.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_runtime_artifact_recovery_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0149"
preserved_exact_tokens:
- "browser sessions"
- "restore policy"
- "terminal-owned shells"
- "attention surfaces"
- "command cards"
- "linked runtime panes"
- "restored canonical identity"
- "Project_Output_Artifacts"
- "Project_Output_Artifacts.md"
- "/event"
- "/thread/run/attempt/account"
- "pass-report `/fields`"
- "wizard `/interview`"
- "ContractName:Plans/Runtime_Artifacts_Panel.md"
- "ContractName:Plans/Wiring_Matrix.md"
- "ContractName:Plans/Contracts_V0.md"
negative_constraints:
- "Browser sessions must never silently become terminal-owned shells."
- "GUI artifact pass reports must not be treated as canonical before lineage and producer alignment resolve."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-233 - Iced To Slint Existing View Mapping

```yaml
plan_unit_id: F3-233
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Existing Iced views map to Slint view locations across Home, Run, Data, Settings, and
  fallback surfaces, including dashboard, projects, wizard, interview, nodes, settings-merged
  config/login/doctor, setup, metrics, evidence, history, ledger, memory, coverage, and
  not_found.
gui_related: true
gui_classification_reason: >-
  This unit preserves existing view migration mapping into Slint locations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: iced_to_slint_existing_view_mapping
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0151"
preserved_exact_tokens:
- "Plans/Skills_System.md"
- "/Skills_System.md"
- "Plans/MCP_Integration.md"
- "/MCP_Integration.md"
- "Plans/orchestrator-subagent-integration.md"
- "/orchestrator-subagent-integration.md"
- "dashboard.rs"
- "views/dashboard.slint"
- "projects.rs"
- "views/projects.slint"
- "wizard.rs"
- "views/wizard.slint"
- "interview.rs"
- "views/interview.slint"
- "tiers.rs"
- "views/nodes.slint"
- "config.rs"
- "settings.rs"
- "login.rs"
- "doctor.rs"
- "views/settings.slint"
- "not_found.rs"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-234 - New Slint Surfaces Mapping

```yaml
plan_unit_id: F3-234
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  New Slint surfaces include `views/usage.slint`, `views/file_editor.slint`, embedded
  `views/agent_activity.slint`, side-panel `panels/chat_panel.slint`, and side-panel
  `panels/file_manager_panel.slint`.
gui_related: true
gui_classification_reason: >-
  This unit preserves new Slint page and panel mappings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: new_slint_surfaces_mapping
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0151"
preserved_exact_tokens:
- "views/usage.slint"
- "views/file_editor.slint"
- "views/agent_activity.slint"
- "panels/chat_panel.slint"
- "panels/file_manager_panel.slint"
- "Primary content"
- "Side panel"
- "Embedded"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-235 - Widget Migration Equivalents

```yaml
plan_unit_id: F3-235
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  All 25 retired Rust/Iced-lineage widgets map to Slint equivalents; canvas-based widgets use
  `SharedPixelBuffer` plus `Image`, nonterminal logs or degraded/plain historical terminal
  transcript projections use read-only `TextEdit` or custom `ListView`, context menu is
  custom, and animations use property transitions and `animate`.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI widget migration equivalents.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: widget_migration_equivalents
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0152"
preserved_exact_tokens:
- "All 25 current Iced widgets"
- "pixel_grid"
- "paper_texture"
- "step_circle"
- "budget_donut"
- "usage_chart"
- "SharedPixelBuffer"
- "Image"
- "text_editor::Content"
- "TextEdit"
- "ListView"
- "Context menu"
- "property transitions"
- "animate"
- "ContractName:Plans/Contracts_V0.md#8"
- "PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-236 - Slint Event Animation Scaling Migration

```yaml
plan_unit_id: F3-236
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Subscriptions based on 50ms polling are replaced with event-driven `invoke_from_event_loop`;
  live terminal rendering remains under the Section 15 terminal-core architecture and is not a
  normal text-editor/list widget; dynamic UI scaling uses Slint native global/window scale
  factor only.
gui_related: true
gui_classification_reason: >-
  This unit constrains event, terminal, and scale migration into Slint.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_event_animation_scaling_migration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0152"
preserved_exact_tokens:
- "Subscriptions"
- "50ms polling"
- "event-driven `invoke_from_event_loop`"
- "live terminal rendering"
- "Section 15 terminal-core architecture"
- "UI scale 0.75-1.5"
- "Slint native global/window scale factor"
- "Iced token-multiplication layers"
negative_constraints:
- "Do not port Iced token-multiplication layers into Slint view code."
- "Live terminal rendering is not a normal text-editor/list widget."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-237 - Rust Data Type Preservation

```yaml
plan_unit_id: F3-237
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Current data types including AppTheme, Page, CurrentItem, ProgressState, OutputLine,
  BudgetDisplayInfo, and DoctorCheckResult remain in Rust; only their Slint representations
  via properties and models change, while backend event system, orchestrator state, and
  persistence remain unchanged.
gui_related: false
gui_classification_reason: >-
  This unit preserves backend data-type ownership and event/persistence continuity rather than
  GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rust_data_type_preservation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0153"
preserved_exact_tokens:
- "16.4"
- "AppTheme"
- "Page"
- "CurrentItem"
- "ProgressState"
- "OutputLine"
- "BudgetDisplayInfo"
- "DoctorCheckResult"
- "Rust"
- "Slint representations"
- "properties and models"
- "backend event system"
- "orchestrator state"
- "persistence remain unchanged"
negative_constraints:
- "Backend event system, orchestrator state, and persistence must not be changed by GUI representation migration."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-238 - Clipboard Migration Gate

```yaml
plan_unit_id: F3-238
unit_type: validation_rule
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Clipboard migration gate status is PASS only when native editor/chat/terminal input
  clipboard behavior works, read-only terminal/log output supports selection/copy without
  editable paste, no custom text-widget clipboard handler remains, non-text copy exceptions
  remain scoped to ClipboardHelper path/value contexts, build verification passes, and GUI
  scenarios meet expected results.
gui_related: true
gui_classification_reason: >-
  This unit defines a GUI validation gate for clipboard migration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: clipboard_migration_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0154"
preserved_exact_tokens:
- "Clipboard migration gate status"
- "PASS"
- "Native Copy/Paste/Select All"
- "File Editor input"
- "chat composer input"
- "terminal command input"
- "Read-only terminal/log output"
- "No custom text-widget clipboard handler"
- "ClipboardHelper"
- "cargo check"
- "Ctrl/Cmd+A/C/X/V"
- "Non-text Copy Path/Copy Value"
- "ContractName:Plans/FinalGUISpec.md#10.9.1"
- "ContractName:Plans/DRY_Rules.md#7"
- "SchemaID:Spec_Lock.json#locked_decisions.ui"
negative_constraints:
- "Clipboard gate cannot pass unless all required criteria are true."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-239 - ImageFit Repeat Fallback Risk

```yaml
plan_unit_id: F3-239
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `ImageFit.repeat` availability risk is mitigated as follows: Check current stable Slint,
  then use SharedPixelBuffer generated tiles or manual GridLayout tiling and test at build time.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: imagefit_repeat_fallback_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "ImageFit.repeat"
- "Slint 1.17.1"
- "SharedPixelBuffer"
- "GridLayout"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-240 - Multi Window Lifecycle Risk

```yaml
plan_unit_id: F3-240
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Multi-window lifecycle edge cases` risk is mitigated as follows: Rust state machine
  manages create/destroy, close-to-dock/collapse, layout state, focus, data sync, and
  disconnected monitor redock behavior.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: multi_window_lifecycle_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Multi-window lifecycle edge cases"
- "window create/destroy"
- "dock or collapse"
- "focus management"
- "data sync"
- "disconnected monitor"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-241 - Limited Screen Reader Risk

```yaml
plan_unit_id: F3-241
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Limited screen reader support` risk is mitigated as follows: Comprehensive keyboard
  navigation, accessible-role/label where Slint supports them, documented limitations, and
  Basic theme readability mitigate limited screen reader support.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: limited_screen_reader_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Limited screen reader support"
- "accessible-role"
- "accessible-label"
- "Basic theme"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-242 - Context Menu Risk

```yaml
plan_unit_id: F3-242
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `No built-in context menu` risk is mitigated as follows: Custom ContextMenu uses
  TouchArea pointer events and delegates clipboard operations to native TextInput
  copy/paste/select-all without custom clipboard state.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: context_menu_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "No built-in context menu"
- "ContextMenu"
- "TouchArea"
- "TextInput.copy()"
- "paste()"
- "select-all()"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-243 - Docking Framework Risk

```yaml
plan_unit_id: F3-243
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `No built-in docking framework` risk is mitigated as follows: Custom PanelRegistry
  handles dock/undock state, snap detection, and window lifecycle and should be implemented
  early.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: docking_framework_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "No built-in docking framework"
- "PanelRegistry"
- "dock/undock"
- "snap detection"
- "window lifecycle"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-244 - Font Family Restart Risk

```yaml
plan_unit_id: F3-244
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Font family change requires restart` risk is mitigated as follows: Font-family setting
  changes show restart prompt and fonts preload at startup for instant within-family switches.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: font_family_restart_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Font family change requires restart"
- "restart prompt"
- "Pre-load fonts"
- "Dark <-> Light"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-245 - Four Split Terminal Performance Risk

```yaml
plan_unit_id: F3-245
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `4-split terminal performance` risk is mitigated as follows: Terminal panes use native
  screen/buffer state, diff painting, off-UI-thread PTY/buffer processing, bounded ring
  buffers, one PTY per pane, bounded transcript projections, and max 30fps throttling.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: four_split_terminal_performance_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "4-split terminal performance"
- "native screen/buffer state"
- "diff-based painting"
- "off-UI-thread PTY/buffer"
- "max 10k retained rows"
- "one PTY per pane"
- "~500 visible rows"
- "max 30fps"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-246 - Platform Window Manager Risk

```yaml
plan_unit_id: F3-246
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Platform-specific window manager issues` risk is mitigated as follows: macOS snapping,
  Linux compositing, and Windows DPI scaling are tested with fallback behavior.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: platform_window_manager_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Platform-specific window manager issues"
- "macOS window snapping"
- "Linux compositing"
- "Windows DPI scaling"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-247 - Large Settings Navigation Risk

```yaml
plan_unit_id: F3-247
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Large Settings page complexity` risk preserves the stale `24 tabs across 5 groups` label
  only as migration lineage; the live Settings surface is the search-first one-box model over the
  19-item owner-routing registry, mitigated by the fuzzy search contract, category bloom
  navigation, shelves, command-palette deep links, and real-data testing. Superseded mitigation
  lineage (2026-07-16, kept findable): mandatory two-level sidebar navigation, collapsible group
  headers, sidebar search, deep links.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: large_settings_navigation_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:11"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:9"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:18"
preserved_exact_tokens:
- "Large Settings page complexity"
- "24 tabs"
- "5 groups"
- "Two-level sidebar navigation"
- "collapsible headers"
- "Settings search bar"
- "Open setting: {name}"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "`24 tabs across 5 groups` is stale migration residue, not the live Settings count."
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-248 - Migration Scope Risk

```yaml
plan_unit_id: F3-248
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Migration scope` risk is mitigated as follows: The 23-view migration is prioritized by
  theme/shell, Dashboard/Settings, Chat/File Manager, then remaining views, with each view
  migrated independently.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: migration_scope_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Migration scope"
- "18 existing views + 5 new = 23 total"
- "Theme system + shell layout"
- "Dashboard + Settings"
- "Chat + File Manager"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-249 - Invoke From Event Loop Saturation Risk

```yaml
plan_unit_id: F3-249
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `invoke_from_event_loop saturation` risk is mitigated as follows: High-frequency
  terminal output keeps ingestion/diff computation off the UI thread and pushes bounded
  paint/projection deltas at 33ms/30fps without raw line-widget churn.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: invoke_from_event_loop_saturation_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "invoke_from_event_loop saturation"
- "1000+ lines/sec"
- "33ms"
- "30fps"
- "VecModel per frame"
negative_constraints:
- "Do not model the live terminal core as raw lines pushed into `VecModel` per frame."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-250 - Chat Message Memory Bounds Risk

```yaml
plan_unit_id: F3-250
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Chat message memory bounds` risk is mitigated as follows: Long chat sessions use a soft
  cap such as 5000 messages per thread, archive old messages to disk, and expose Load earlier
  messages.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_message_memory_bounds_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Chat message memory bounds"
- "5000 messages per thread"
- "archive oldest messages"
- "Load earlier messages"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-251 - Theme Property Update Batching Risk

```yaml
plan_unit_id: F3-251
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Theme global property update batching` risk is mitigated as follows: Theme switches set
  all theme properties in one callback because Slint batches property changes within a single
  invoke_from_event_loop call.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: theme_property_update_batching_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Theme global property update batching"
- "20+ theme properties"
- "invoke_from_event_loop"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-252 - Dashboard Drag Reorder Risk

```yaml
plan_unit_id: F3-252
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Dashboard card drag-and-drop` risk is mitigated as follows: Dashboard drag/reorder uses
  an MVP ordered-list model with drag-handle and click-to-swap, with full drag-and-drop as
  enhancement and tests for 2-12 cards.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_drag_reorder_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Dashboard card drag-and-drop"
- "drag-handle"
- "click-to-swap"
- "2-12"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-253 - Floating Window Model Sync Risk

```yaml
plan_unit_id: F3-253
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Floating window data sync race conditions` risk is mitigated as follows: All model
  mutations use invoke_from_event_loop on the main event loop, floating windows share
  Rc<VecModel>, and models are mutated in place.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: floating_window_model_sync_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Floating window data sync race conditions"
- "single writer"
- "Rc<VecModel>"
- "Never clone+replace the model"
negative_constraints:
- "Never clone+replace the model; always mutate in-place."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-254 - LSP Lifecycle Risk

```yaml
plan_unit_id: F3-254
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `LSP server lifecycle management` risk is mitigated as follows: LSP supervision keys by
  host_id, server_id, and root_identity, launches lazily, restarts boundedly, and exposes
  stale/degraded/unavailable state instead of mirroring remote projects locally.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: lsp_lifecycle_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "LSP server lifecycle management"
- "host_id"
- "server_id"
- "root_identity"
- "stale/degraded/unavailable"
- "remote projects locally"
negative_constraints:
- "Do not silently mirror remote projects locally."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-255 - External Drag Drop Platform Risk

```yaml
plan_unit_id: F3-255
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `External drag-and-drop platform APIs` risk is mitigated as follows: External drag/drop
  abstracts Windows IDropTarget, macOS NSDraggingDestination, Linux Xdnd/Wayland, or Slint
  native drop events behind a trait with cross-platform tests.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: external_drag_drop_platform_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "External drag-and-drop platform APIs"
- "Windows IDropTarget"
- "macOS NSDraggingDestination"
- "Linux Xdnd/Wayland"
- "Slint exposes native drop events"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-256 - HTML Preview Webview Risk

```yaml
plan_unit_id: F3-256
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `HTML preview webview` risk is mitigated as follows: HTML hot-reload preview uses
  wry/native child window when available and otherwise surfaces runtime_unavailable with
  remediation and degraded browser capability messaging.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: html_preview_webview_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "HTML preview webview"
- "/webview"
- "Skia renderer pipeline"
- "wry"
- "runtime_unavailable"
- "degraded browser capability"
negative_constraints:
- "Do not substitute static HTML snapshots or screenshots as pseudo-browser behavior."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-257 - Steer Mid Stream Risk

```yaml
plan_unit_id: F3-257
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Steer submission mid-stream injection` risk is mitigated as follows: Steer messages
  during assistant generation are buffered and prepended at the next token boundary, then
  tested for coherent partial-generation handling.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: steer_mid_stream_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Steer submission mid-stream injection"
- "next token boundary"
- "partial generation + steer"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-258 - Webview Embedding Conflict Risk

```yaml
plan_unit_id: F3-258
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Webview embedding (`wry`) conflicts` risk is mitigated as follows: Browser and HTML
  preview webviews use native child windows positioned within Slint layout areas, keep browser
  ownership editor/workspace-tab-first, and never make bottom-panel browser-adjacent panes the
  canonical browser host.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: webview_embedding_conflict_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Webview embedding (`wry`) conflicts"
- "native child windows"
- "editor/workspace-tab-first"
- "bottom-panel browser-adjacent panes"
- "canonical browser host"
negative_constraints:
- "Bottom-panel browser-adjacent panes must never become the canonical browser host."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-259 - DAP Debugger Reliability Risk

```yaml
plan_unit_id: F3-259
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `DAP debugger reliability` risk is mitigated as follows: DAP requests use timeouts,
  crashed adapters auto-restart once, debugger surfaces clear unresponsive errors, and
  concurrent debug sessions are permitted per project under the multi-session policy
  (F3-484), with exactly one focused session at a time.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dap_debugger_reliability_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "DAP debugger reliability"
- "10s for evaluate"
- "30s for launch"
- "Auto-restart crashed adapters once"
- "Cap concurrent debug sessions to 1 per project"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "The one-session-per-project concurrency cap is retired per the Run & Debug Revival Addendum - 2026-07-27; multi-session policy is owned by F3-484."
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-260 - SSH Connection Stability Risk

```yaml
plan_unit_id: F3-260
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `SSH connection stability` risk is mitigated as follows: SSH uses keep-alives, retains
  local buffer/stale snapshot on disconnect, auto-retries once, exposes Reconnect, and never
  silently falls back to local execution for remote-mode projects.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: ssh_connection_stability_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "SSH connection stability"
- "Keep-alive packets every 30s"
- "Reconnect"
- "remote-mode projects"
negative_constraints:
- "Never silently fall back to local execution for remote-mode projects."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-261 - Catalog Availability Risk

```yaml
plan_unit_id: F3-261
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Catalog service availability` risk is mitigated as follows: Catalog operations work
  offline with a bundled fallback index and cached last-fetched index, with outdated-cache
  banner when needed.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: catalog_availability_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Catalog service availability"
- "fallback index"
- "last-fetched index"
- "Catalog may be outdated"
- "offline"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-262 - Sound Effects Audio Risk

```yaml
plan_unit_id: F3-262
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Sound effects cross-platform audio` risk is mitigated as follows: If rodio/audio device
  availability fails, sound effects disable silently and Settings hides or labels the toggle
  without error toasts.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: sound_effects_audio_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Sound effects cross-platform audio"
- "rodio"
- "PulseAudio/ALSA"
- "audio unavailable"
- "No error toasts"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-263 - Custom Theme Validation Risk

```yaml
plan_unit_id: F3-263
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Custom theme validation` risk is mitigated as follows: Custom theme TOML loading
  validates colors, tokens, and syntax, skips invalid themes with warning toast on Settings
  open, never crashes, and falls back to base values.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: custom_theme_validation_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Custom theme validation"
- "TOML"
- "warning toast"
- "Never crash"
- "base theme values"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-264 - Settings Tab Count Risk

```yaml
plan_unit_id: F3-264
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Settings page tab count (24 tabs)` risk preserves the stale `24 tabs across 5 groups`
  label only as risk-lineage; the live Settings surface is the search-first one-box model over
  the 19-item owner-routing registry, mitigated by the fuzzy search contract, category bloom
  navigation, shelves, and command-palette deep links. Superseded mitigation lineage
  (2026-07-16, kept findable): mandatory two-level sidebar navigation, collapsible groups, top
  search/filter.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: settings_tab_count_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:11"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:9"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:18"
preserved_exact_tokens:
- "Settings page tab count (24 tabs)"
- "Two-level sidebar navigation is mandatory"
- "Group headers are collapsible"
- "Search/filter"
- "Open setting: {name}"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "`Settings page tab count (24 tabs)` and `24 tabs across 5 groups` are stale risk-lineage labels, not the live Settings count."
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-265 - Project Switch Reload Performance Risk

```yaml
plan_unit_id: F3-265
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Project switch state reload performance` risk is mitigated as follows: Project
  switching loads config, file tree, editor tabs, LSP/Search/Source Control projections, then
  chat threads in priority order with skeleton placeholders and a sub-500ms interactive
  target.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: project_switch_reload_performance_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "Project switch state reload performance"
- "priority order"
- "skeleton placeholders"
- "<500ms to interactive"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-266 - File Watcher Resource Risk

```yaml
plan_unit_id: F3-266
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `File watcher resource consumption` risk is mitigated as follows: Hot reload and preview
  watchers use notify debounced mode, watch relevant source dirs, cap watchers, and disclose
  fallback when root-only watching is required.
gui_related: true
gui_classification_reason: >-
  This unit preserves one row of the user-visible Slint migration risks and mitigations table.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_risk
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: file_watcher_resource_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0155"
preserved_exact_tokens:
- "File watcher resource consumption"
- "notify"
- "debounced mode"
- ">10k files"
- "inotify/FSEvents"
- "root-only watching"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The row remains part of the FinalGUISpec risk/mitigation matrix."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-267 - Promoted Feature Directionality Decision

```yaml
plan_unit_id: F3-267
unit_type: decision
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Ledger directionality is closed for items `#18`, `#19`, `#28`, `#29`, `#31`, `#36`, `#50`,
  `#52`, and `#56`; these are locked requirements, not directional ideas, and only sections
  explicitly labeled FUTURE FEATURE or OPEN QUESTION remain open by intent.
gui_related: true
gui_classification_reason: >-
  This unit locks promoted feature status and user-visible scope.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: promoted_feature_directionality_decision
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0156"
preserved_exact_tokens:
- "#18"
- "#19"
- "#28"
- "#29"
- "#31"
- "#36"
- "#50"
- "#52"
- "#56"
- "locked requirements"
- "directional ideas"
- "FUTURE FEATURE"
- "OPEN QUESTION"
- "No features in this specification are deferred."
negative_constraints:
- "Do not treat promoted features in this specification as deferred."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-268 - Promoted Feature Owner Matrix

```yaml
plan_unit_id: F3-268
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Former future considerations are MVP scope and route to their owner docs for
  browser/click-to-context, search, instant project switch, sound effects, hot reload,
  instructions editor, custom themes, language/LSP navigation, catalog, sync, SSH, run/debug,
  and browser/terminal tabs.
gui_related: true
gui_classification_reason: >-
  This unit maps user-visible promoted features to owner documents and surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: promoted_feature_owner_matrix
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0156"
preserved_exact_tokens:
- "Built-in browser / click-to-context"
- "Search / find in files / replace in files"
- "Instant project switch"
- "Sound effects"
- "Hot reload controls"
- "In-app instructions editor"
- "Additional themes / custom themes"
- "Language/framework auto-detection and LSP-aware navigation"
- "Catalog / one-click install"
- "Sync bundle manager"
- "SSH remote editing"
- "Run/debug configurations"
- "Browser/terminal tabs, pinning, and preview modes"
- "ContractName:Plans/FileManager.md"
- "ContractName:Plans/GitHub_Integration.md"
- "ContractName:Plans/LSPSupport.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Promoted feature details remain fully specified in their owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-269 - Appendix Reference Hygiene

```yaml
plan_unit_id: F3-269
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Appendix A reference rows must point at live owner documents or live section anchors, and
  LF-007 stale-reference cleanup requires FinalGUISpec and assistant-chat references to keep
  live explicit links or remove stale references rather than leaving repairs implicit in
  packet scope.
gui_related: false
gui_classification_reason: >-
  This unit is a cross-reference governance constraint rather than a GUI surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: appendix_reference_hygiene
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0157"
preserved_exact_tokens:
- "Reference rows"
- "live owner documents"
- "live section anchors"
- "nonexistent section numbers"
- "LF-007"
- "Plans/assistant-chat-design.md#20. References"
- "Plans/FinalGUISpec.md#Appendix A: Cross-References"
- "stale-reference repairs"
- "packet scope"
negative_constraints:
- "Reference rows must not point at nonexistent section numbers."
- "Stale-reference repairs must not remain implicit in packet scope."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-270 - Appendix Cross Reference Inventory

```yaml
plan_unit_id: F3-270
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Appendix A preserves the cross-reference inventory that routes FinalGUISpec consumers to
  live owner docs for chat, FileManager, usage, HITL, wizard, storage, rules context,
  Glossary, newfeatures, subagent integrations, worktree/FileSafe/MiscPlan, Skills,
  feature-list, tools, providers, widgets/artifacts, Run Graph, LSP, rewrite tie-in, and
  internal clipboard coverage.
gui_related: true
gui_classification_reason: >-
  This unit preserves GUI-relevant owner/consumer cross-reference inventory rows.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: appendix_cross_reference_inventory
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0157"
preserved_exact_tokens:
- "Plans/assistant-chat-design.md"
- "Plans/FileManager.md"
- "Plans/usage-feature.md"
- "Plans/human-in-the-loop.md"
- "Plans/chain-wizard-flexibility.md"
- "Plans/storage-plan.md"
- "Plans/agent-rules-context.md"
- "Plans/Glossary.md"
- "Plans/newfeatures.md"
- "Plans/interview-subagent-integration.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/FileSafe.md"
- "Plans/MiscPlan.md"
- "Plans/Skills_System.md"
- "Plans/feature-list.md"
- "Plans/newtools.md"
- "Plans/Commands_System.md"
- "Plans/UI_Command_Catalog.md"
- "Plans/Permissions_System.md"
- "Plans/MCP_Integration.md"
- "Plans/Tools.md"
- "Plans/Provider_OpenCode.md"
- "Plans/Widget_System.md"
- "Plans/Run_Graph_View.md"
- "Plans/LSPSupport.md"
- "Plans/rewrite-tie-in-memo.md"
negative_constraints: []
compatibility_only_notes:
- "`Plans/Commands_System.md` row includes deprecated aliases as compatibility context."
stale_retired_dispositions: []
owner_boundary_notes:
- "The referenced owner docs retain canonical ownership for their domains."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-271 - Locked UI Framework Shell Decisions

```yaml
plan_unit_id: F3-271
unit_type: decision
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Implementation decisions are final for Slint 1.17.1 on Rust stable 1.96.1, winit+Skia with FemtoVG-wgpu fallback,
  no React/JS/TS/HTML/CSS shell, IDE shell layout, four theme families (eight built-in themes,
  untouched first-open/fresh-project factory default Basic Dark; the former Friendly Dark and
  prior three-family defaults remain superseded lineage), Settings owned by `Plans/Settings_System.md`,
  the Doctor registry/router/projection owned by `Plans/newtools.md` N2-151, Login retained by
  auth/account owners, and Final GUI limited to their presentation, chrome, theme, layout, and motion,
  event-driven updates, redb/seglog/Tantivy persistence/search, model/platform dropdowns, and
  product name Puppet Master.
gui_related: true
gui_classification_reason: >-
  This unit locks visible shell, framework, theme, settings, and persistence decisions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: locked_ui_framework_shell_decisions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0158"
preserved_exact_tokens:
- "Rust stable 1.96.1"
- "Slint 1.17.1"
- "winit + Skia"
- "winit + FemtoVG-wgpu"
- "No React/JS/TS/HTML/CSS"
- "IDE shell layout"
- "Activity Bar + Primary Content + Side Panel + Bottom Panel"
- "Retro Dark, Retro Light, Basic Modern"
- "Settings restructure"
- "Event-driven updates"
- "redb"
- "seglog"
- "Tantivy"
- "Model/platform selection via dropdowns"
- "Puppet Master"
negative_constraints:
- "These decisions are final and must not be revisited during implementation."
compatibility_only_notes: []
stale_retired_dispositions:
- "The Friendly Dark factory-default and unified Settings + Login + Doctor ownership summaries are superseded by the later factory-default and owner-routing contracts."
owner_boundary_notes:
- "Settings_System owns the Settings shell and ordinary-setting semantics; N2-151 owns Doctor registry/router/projection; auth/account owners retain Login; Final GUI owns presentation only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-272 - Locked Promoted Runtime Browser Debug Decisions

```yaml
plan_unit_id: F3-272
unit_type: decision
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Former future considerations are MVP, the bottom runtime zone includes the classical
  debugger surface, browser runtime is capability-first rather than crate-name-first, and the
  classical debugger uses DAP distinct from Assistant Debug Mode.
gui_related: true
gui_classification_reason: >-
  This unit locks promoted GUI/runtime/browser/debug scope decisions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: locked_promoted_runtime_browser_debug_decisions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0158"
preserved_exact_tokens:
- "All 12 former future considerations are MVP"
- "Bottom runtime zone includes the classical debugger surface"
- "Terminal, Problems, Output, Ports, and Debugger / DAP Debugger"
- "browser-capable preview/browsing is not a bottom-panel debug substitute"
- "Browser runtime contract is capability-first, not crate-name-first"
- "stale `wry` wording"
- "Classical debugger uses DAP"
- "Assistant Debug Mode"
negative_constraints:
- "Do not substitute bottom-panel debug surfaces for canonical browser-capable preview/browsing."
- "Do not hard-lock browser runtime implementation to stale `wry` wording."
compatibility_only_notes: []
stale_retired_dispositions:
- "stale `wry` wording is compatibility context, not an implementation lock."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-273 - Locked SSH Credential Decision

```yaml
plan_unit_id: F3-273
unit_type: decision
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  SSH uses system keychain and agent flows; credentials stay in OS-managed stores and never in
  config files.
gui_related: false
gui_classification_reason: >-
  This unit locks SSH credential storage behavior, not a visual surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: locked_ssh_credential_decision
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0158"
preserved_exact_tokens:
- "SSH uses system keychain / agent flows"
- "credentials"
- "OS-managed stores"
- "never in config files"
- "ContractName:Plans/assistant-chat-design.md"
- "ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
- "ContractName:Plans/rewrite-tie-in-memo.md"
negative_constraints:
- "Credentials must never be stored in config files."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-274 - Dashboard Widget Grid Addendum Scope

```yaml
plan_unit_id: F3-274
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Appendix C extends Dashboard section 7.2 from a rearrangeable card grid to a full widget
  grid with grid-based resizing and introduces the Dashboard add-widget flow.
gui_related: true
gui_classification_reason: >-
  This unit defines the Dashboard widget-grid addendum entry point.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_widget_grid_addendum_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0159"
preserved_exact_tokens:
- "Appendix C"
- "Dashboard Widget Grid and Widget Catalog Integration"
- "Addendum -- 2026-02-23"
- "Dashboard (section 7.2)"
- "rearrangeable card grid"
- "full widget grid"
- "grid-based resizing"
- "add-widget flow"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-275 - Dashboard Widget Grid Upgrade

```yaml
plan_unit_id: F3-275
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard section 7.2 upgrades from a simple rearrangeable card grid to a full widget grid
  with configurable col_span/row_span, drag-to-reorder, edge resize, grid snapping, responsive
  columns, and 8px widget gutters.
gui_related: true
gui_classification_reason: >-
  This unit defines the visible Dashboard widget-grid upgrade.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_widget_grid_upgrade
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0160"
preserved_exact_tokens:
- "Dashboard (section 7.2)"
- "rearrangeable card grid"
- "full **widget grid**"
- "col_span"
- "row_span"
- "drag-to-reorder"
- "resized"
- "grid-snapping"
- "2 at <1200px"
- "3 at 1200-1600px"
- "4 at >1600px"
- "8px"
- "ContractName:Plans/Widget_System.md#3"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Widget grid behavior consumes Plans/Widget_System.md section 3."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-276 - Dashboard Widget Visual And CTA Continuity

```yaml
plan_unit_id: F3-276
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard default widget conversion preserves existing Dashboard card types, card visual
  style, retro paper texture, drag handle, elevated CTA surfaces, accent-left-border, and CTA
  behavior for HITL approval, run interrupted, rate limit, warning, and
  `wizard_attention_required` cards.
gui_related: true
gui_classification_reason: >-
  This unit preserves Dashboard widget visual continuity and CTA behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_widget_visual_and_cta_continuity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0160"
preserved_exact_tokens:
- "All existing Dashboard card types"
- "paper texture"
- "retro themes"
- "drag handle"
- "4px crosshatch pattern"
- "CtA cards"
- "accent-left-border"
- "HITL approval"
- "run interrupted"
- "rate limit"
- "warning"
- "wizard_attention_required"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-277 - Default Dashboard Widget Layout

```yaml
plan_unit_id: F3-277
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Default Dashboard layout includes `widget-orchestrator-progress`, `widget-active-lanes`, and
  `widget-recent-results` with IDs `orch-progress-v1`, `lanes-view-v1`, and `results-v1`.
gui_related: true
gui_classification_reason: >-
  This unit defines the default visible Dashboard widgets.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: default_dashboard_widget_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0161"
preserved_exact_tokens:
- "widget-orchestrator-progress"
- "orch-progress-v1"
- "current run progress"
- "node execution status"
- "lane state"
- "widget-active-lanes"
- "lanes-view-v1"
- "worktree allocation state"
- "widget-recent-results"
- "results-v1"
- "artifact links"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-278 - Dashboard Add Widget Flow And Control

```yaml
plan_unit_id: F3-278
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard exposes Add Widget through a menu, floating action button, or toolbar control; it
  opens the Widget Catalog overlay filtered to the named Dashboard catalog unless an owner has
  promoted another dashboard widget, lets the user choose placement and sizing, places widgets at
  the next available grid position with default size, and persists layout immediately.
gui_related: true
gui_classification_reason: >-
  This unit defines the visible Dashboard add-widget workflow and control.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "The Dashboard Add Widget selectable set uses the four-entry named catalog unless another owner promotes a new dashboard widget."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_add_widget_flow_and_control
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0162"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0164"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:10"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:8"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:17"
preserved_exact_tokens:
- "Add Widget"
- "Dashboard menu"
- "floating action button"
- "bottom-right corner"
- "Dashboard toolbar"
- "Widget Catalog overlay"
- "Plans/Widget_System.md section 4.2"
- "Hostable Pages"
- "Dashboard"
- "widget.quota_summary"
- "widget.budget_donuts"
- "widget.analytics_chart"
- "widget.tool_usage"
- "widget.multi_account"
- "widget.orchestrator_status"
- "widget.current_task"
- "widget.progress_bars"
- "Layout persisted immediately"
- "ContractName:Plans/Widget_System.md#4"
negative_constraints: []
compatibility_only_notes:
- "The broader widget.* list is compatibility/candidate-library lineage unless promoted by an owner doc."
stale_retired_dispositions:
- "The duplicated C.3/C.4 add-widget/catalog blocks are reconciled; the larger widget.* list is not the Dashboard named catalog."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-279 - Exact Four-Widget Dashboard Catalog Canon

```yaml
plan_unit_id: F3-279
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Dashboard named widget catalog is exactly `widget-orchestrator-progress`,
  `widget-active-lanes`, `widget-recent-results`, and `widget-custom-metrics`; Widget_System
  consumes this named catalog directly without inventing or synthesizing widget IDs.
gui_related: true
gui_classification_reason: >-
  This unit preserves the Dashboard named-widget catalog.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The Dashboard named widget catalog contains exactly four entries."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: exact_four_widget_dashboard_catalog
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0163"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:10"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:8"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:17"
preserved_exact_tokens:
- "named widget catalog"
- "exactly 4 widgets"
- "widget-orchestrator-progress"
- "widget-active-lanes"
- "widget-recent-results"
- "widget-custom-metrics"
- "Puppet Master native"
- "user-generated, optional"
- "Core widgets"
- "Custom widgets"
- "Widget_System"
- "does not invent new widget IDs"
- "synthesize missing entries"
- "widget.quota_summary"
- "widget.budget_donuts"
- "widget.analytics_chart"
- "widget.tool_usage"
- "widget.multi_account"
- "widget.orchestrator_status"
- "widget.current_task"
- "widget.progress_bars"
negative_constraints:
- "Widget_System must not invent new widget IDs or synthesize missing entries."
compatibility_only_notes:
- "The broader widget.* catalog is future/candidate/library lineage unless promoted by an owner doc."
stale_retired_dispositions:
- "Duplicate Appendix C C.3/C.4 sections and the broader widget.* Dashboard list are not peer canon."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-280 - Atomic Vs Page Widget Catalog Boundary

```yaml
plan_unit_id: F3-280
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec section 8 owns atomic UI components, while Plans/Widget_System.md section 2
  owns composed page widgets that users add, remove, move, or resize on Dashboard, Usage, and
  Orchestrator tabs; page widgets compose atomic components and the two catalogs must not be
  conflated.
gui_related: true
gui_classification_reason: >-
  This unit preserves the UI catalog ownership boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: atomic_vs_page_widget_catalog_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0165"
preserved_exact_tokens:
- "FinalGUISpec Widget Catalog"
- "atomic UI components"
- "StyledButton"
- "StyledInput"
- "StyledBadge"
- "TreeView"
- "CodeBlock"
- "Plans/Widget_System.md section 2"
- "composed page widgets"
- "OrchestratorStatus"
- "BudgetDonuts"
- "NodeTree"
- "LedgerTable"
- "Dashboard, Usage page, and Orchestrator tabs"
negative_constraints:
- "Atomic UI components must not be treated as page widgets."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns atomic UI components; Widget_System owns composed page widgets."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-281 - Dashboard Layout Key Migration

```yaml
plan_unit_id: F3-281
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard layout persistence migrates from `dashboard_layout:v1` card-order input to
  `widget_layout:v1:dashboard` by mapping card IDs to Widget Catalog IDs, assigning default
  grid positions/sizes, and writing the richer widget layout schema.
gui_related: false
gui_classification_reason: >-
  This unit defines storage migration logic rather than a visible GUI surface.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_layout_key_migration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0160"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0166"
preserved_exact_tokens:
- "dashboard_layout:v1"
- "widget_layout:v1:dashboard"
- "card-order list"
- "richer schema"
- "On first load"
- "card ID list"
- "Widget Catalog ID"
- "default grid positions and sizes"
- "ContractName:Plans/storage-plan.md"
- "ContractName:Plans/Widget_System.md#7"
negative_constraints: []
compatibility_only_notes:
- "`dashboard_layout:v1` is migration input only."
stale_retired_dispositions:
- "`dashboard_layout:v1` is deprecated after migration."
owner_boundary_notes:
- "storage-plan.md and Widget_System.md own storage namespace and widget schema details."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-282 - Dashboard Layout Legacy Retirement And Precedence

```yaml
plan_unit_id: F3-282
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  After widget layout migration, future reads use `widget_layout:v1:dashboard` only; if both
  dashboard layout keys exist, `widget_layout:v1:dashboard` takes precedence and
  `dashboard_layout:v1` does not remain canonical.
gui_related: false
gui_classification_reason: >-
  This unit constrains legacy dashboard layout key usage.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: dashboard_layout_legacy_retirement_and_precedence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0166"
preserved_exact_tokens:
- "Future reads"
- "widget_layout:v1:dashboard only"
- "If both keys exist"
- "takes precedence"
- "dashboard_layout:v1"
- "deprecated migration input only"
- "does not remain canonical"
negative_constraints:
- "`dashboard_layout:v1` must not remain canonical after migration completes."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-283 - Persona Editor Compatibility State Matrix

```yaml
plan_unit_id: F3-283
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Persona editor shows provider support states `supported`, `partially supported`, and
  `unsupported` for Persona controls and renders normal editing, warning styling/tooltips, or
  disabled controls with explanations for Claude Code, Cursor CLI, OpenCode, and Direct/API
  providers.
gui_related: true
gui_classification_reason: >-
  This unit defines the visible Persona editor compatibility matrix.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persona_editor_compatibility_state_matrix
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0169"
preserved_exact_tokens:
- "Persona editor"
- "supported"
- "partially supported"
- "unsupported"
- "platform/model/variant/temperature/top_p/reasoning_effort/talkativeness/tool-permission coupling/subagents"
- "warning styling"
- "explanatory tooltip"
- "disabled control plus explanation"
- "Claude Code"
- "Cursor CLI"
- "OpenCode"
- "Direct/API providers"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-284 - Talkativeness Support State Rule

```yaml
plan_unit_id: F3-284
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  `talkativeness` is a Persona instruction-layer control, not a transport/runtime sampling
  knob; its support state follows Persona prompt-body support.
gui_related: false
gui_classification_reason: >-
  This unit defines Persona support semantics rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: talkativeness_support_state_rule
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0169"
preserved_exact_tokens:
- "talkativeness"
- "Persona instruction-layer control"
- "transport/runtime sampling knob"
- "Persona prompt-body support"
negative_constraints:
- "`talkativeness` must not be treated as a transport/runtime sampling knob."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-285 - Expanded Persona Editor Field Set

```yaml
plan_unit_id: F3-285
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Persona editor supports fields for default platform/model/variant, temperature, top_p,
  reasoning_effort, talkativeness, preferred/discouraged tools, tool usage guidance, and
  aliases.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Persona editor fields despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: expanded_persona_editor_field_set
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0170"
preserved_exact_tokens:
- "default_platform"
- "default_model"
- "default_variant"
- "temperature"
- "top_p"
- "reasoning_effort"
- "talkativeness"
- "preferred_tools"
- "discouraged_tools"
- "tool_usage_guidance"
- "aliases"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-286 - Talkativeness Labels And Enum Values

```yaml
plan_unit_id: F3-286
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  `talkativeness` renders as a fixed single-select with canonical labels and enum values from
  `Talk a lot more` / `talk_a_lot_more` through `Talk less` / `talk_less`, with `Model
  default` stored as `model_default`.
gui_related: true
gui_classification_reason: >-
  This unit defines visible talkativeness labels and stored values.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: talkativeness_labels_and_enum_values
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0170"
preserved_exact_tokens:
- "fixed single-select"
- "Talk a lot more"
- "talk_a_lot_more"
- "Talk more"
- "talk_more"
- "Talk a little more"
- "talk_a_little_more"
- "Model default"
- "model_default"
- "Talk a little less"
- "talk_a_little_less"
- "Talk less"
- "talk_less"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-287 - Persona Compatibility Panel Copy Examples

```yaml
plan_unit_id: F3-287
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Persona compatibility panel can communicate provider-specific support examples for Claude
  Code, Cursor CLI, and Direct/API providers.
gui_related: true
gui_classification_reason: >-
  This unit preserves visible Persona compatibility copy examples.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persona_compatibility_panel_copy_examples
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0171"
preserved_exact_tokens:
- "Claude Code: supports model preference and effort; temperature/top_p not exposed in official CLI settings."
- "Cursor CLI: supports prompt/rules steering and some model selection; low-level runtime controls are limited or undocumented."
- "Direct/API providers: strongest support for exact runtime controls."
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-288 - Requested Effective Persona Surface Identity Boundary

```yaml
plan_unit_id: F3-288
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Surface-level Persona controls consume the linked owner contract: runtime identity preserves
  requested/effective naming and account/provider identity fields, retires local `_id`
  substitutes, and consumer surfaces use only `requested_persona`, `effective_persona`, and
  `effective_account_label`.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime identity and owner-field boundaries for Persona surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: requested_effective_persona_surface_identity_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0172"
preserved_exact_tokens:
- "This section consumes the linked owner contract"
- "requested and effective naming"
- "account/provider identity fields"
- "local _id substitutes"
- "Plans/Personas.md"
- "requested_persona"
- "effective_persona"
- "effective_account_label"
negative_constraints:
- "Consumer surfaces must not invent local Persona field substitutes."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/Personas.md owns requested/effective Persona fields."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-289 - Active Run Persona Display Fields

```yaml
plan_unit_id: F3-289
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Active-run UI displays requested Persona when explicit, effective Persona, selection
  source/reason, effective platform/model, effective variant/effort where present, and skipped
  Persona controls where applicable.
gui_related: true
gui_classification_reason: >-
  This unit defines visible active-run Persona fields.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: active_run_persona_display_fields
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0173"
preserved_exact_tokens:
- "requested Persona"
- "effective Persona"
- "selection source/reason"
- "effective platform"
- "effective model"
- "effective variant/effort"
- "skipped Persona controls"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-290 - Persona Display Surface Coverage

```yaml
plan_unit_id: F3-290
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Persona display applies to chat status strip/header, interview activity card, requirements
  builder progress/status UI, orchestrator activity/run inspection surfaces, subagent inline
  blocks, and multi-pass reviewer status rows.
gui_related: true
gui_classification_reason: >-
  This unit defines surfaces that must display Persona/runtime identity.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persona_display_surface_coverage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0173"
preserved_exact_tokens:
- "chat status strip or header"
- "interview activity card"
- "requirements builder progress/status UI"
- "orchestrator activity and run inspection surfaces"
- "subagent inline blocks"
- "multi-pass reviewer status rows"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-291 - Agent Trace Summary Operator Card Fields

```yaml
plan_unit_id: F3-291
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug and run activity surfaces expose `agent_trace_summary` with subagent, tool span,
  failed attempt, and artifact reference counts so cards summarize agent work without
  expanding raw traces by default.
gui_related: true
gui_classification_reason: >-
  This unit defines operator-facing agent trace summary card fields.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: agent_trace_summary_operator_card_fields
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0173"
preserved_exact_tokens:
- "agent_trace_summary"
- "subagent_count"
- "tool_span_count"
- "failed_attempt_count"
- "artifact_refs[]"
- "operator-facing cards"
- "raw traces"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-292 - Natural Language Persona Invocation Feedback

```yaml
plan_unit_id: F3-292
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Natural-language Persona requests render explicit feedback such as `Persona: Collaborator
  (User requested)`, session-lock variants, turn-scoped clearing, and child-run/delegation
  feedback for subagent-only Persona requests such as Explorer or Bash.
gui_related: true
gui_classification_reason: >-
  This unit defines visible natural-language Persona invocation feedback.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: natural_language_persona_invocation_feedback
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0174"
preserved_exact_tokens:
- "Persona: Collaborator (User requested)"
- "Persona: Researcher (User requested, session lock)"
- "turn-scoped"
- "previous/auto state"
- "Explorer"
- "Bash"
- "child-run/delegation feedback"
- "direct chat Persona locks"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-293 - Provider Gap Disclosure Locations

```yaml
plan_unit_id: F3-293
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  GUI never implies that a provider honored a Persona control when it did not; skipped
  controls are disclosed in inline status text, tooltip, activity detail popover, or run
  detail/history panel.
gui_related: true
gui_classification_reason: >-
  This unit defines where skipped Persona controls are disclosed.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: provider_gap_disclosure_locations
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0175"
preserved_exact_tokens:
- "provider honored a Persona control"
- "inline status text"
- "tooltip"
- "activity detail popover"
- "run detail/history panel"
negative_constraints:
- "The GUI must never imply that a provider honored a Persona control when it did not."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-294 - Disclosure Status Semantics And Payload

```yaml
plan_unit_id: F3-294
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Provider-gap disclosure semantics are `Honored`, `Skipped`, and `Clamped`, and every
  disclosure includes control name, requested value, effective value if any, and
  human-readable reason.
gui_related: false
gui_classification_reason: >-
  This unit defines provider-gap disclosure data semantics rather than visual placement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: disclosure_status_semantics_and_payload
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0176"
preserved_exact_tokens:
- "Honored"
- "Skipped"
- "Clamped"
- "control name"
- "requested value"
- "effective value"
- "human-readable reason"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-295 - Disclosure Timing Placement And Provider Naming

```yaml
plan_unit_id: F3-295
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Known limitations render disabled or warning-badged in place before execution;
  runtime-discovered limitations surface inline and persist to run detail/history; disclosures
  name the provider explicitly.
gui_related: true
gui_classification_reason: >-
  This unit defines visible disclosure timing, placement, and provider-specific copy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: disclosure_timing_placement_and_provider_naming
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0176"
preserved_exact_tokens:
- "disabled"
- "warning-badged"
- "active surface"
- "run detail/history"
- "Claude Code ignored reasoning_effort=high; provider does not support that control on this model"
negative_constraints:
- "When a limitation is known before execution, do not let the user believe it is actionable."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-296 - Persona Mapping Editors

```yaml
plan_unit_id: F3-296
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings or surface-specific configuration supports Persona defaults mapped to Interview
  stages/phases, Requirements Builder steps/passes, Orchestrator node/package/lane/seam
  mappings, and Multi-Pass review passes, with per-mapping platform/model selection and
  compatibility warnings.
gui_related: true
gui_classification_reason: >-
  This unit defines surface-specific Persona mapping editors despite the source inference
  being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persona_mapping_editors
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0177"
preserved_exact_tokens:
- "Interview stages/phases"
- "Requirements Builder steps/passes"
- "Orchestrator node/package/lane/seam mappings"
- "Multi-Pass review passes"
- "platform/model selection"
- "compatibility warnings"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-297 - Rendering Surface Scope And Inventory

```yaml
plan_unit_id: F3-297
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Rendering surface scope covers Markdown, Mermaid, HTML, SVG, and images in the Slint GUI and
  treats browser-capable rendering as shared across Chat Panel, File Editor, Embedded Document
  Pane, editor-tab Browser, detached preview/browser windows, ordinary automation browser windows,
  and bottom-panel browser-adjacent surfaces. Protected AuthBrowserSession is a separate foreground
  human-only security surface and is excluded from this shared rendering/capture inventory.
gui_related: true
gui_classification_reason: >-
  This unit defines the rendering addendum and shared browser-capable surface inventory.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rendering_surface_scope_and_inventory
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0179"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0180"
preserved_exact_tokens:
- "Rendering Surface Addendum (2026-03-07)"
- "Markdown"
- "Mermaid"
- "HTML"
- "SVG"
- "image rendering"
- "Chat Panel"
- "File Editor"
- "Embedded Document Pane"
- "Editor-tab Browser surface"
- "workspace_preview"
- "detached_preview"
- "automation_session"
- "auth_session"
- "Bottom-panel browser-adjacent surfaces"
- "ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
- "ContractName:Plans/FileManager.md"
- "ContractName:Plans/storage-plan.md"
negative_constraints:
- "Bottom-panel browser-adjacent surfaces do not own the canonical browsing session."
- "The auth_session token is legacy source-lineage only; protected AuthBrowserSession cannot be captured, inspected, recorded, persisted, or controlled through shared rendering surfaces."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-298 - Browser Derived Chat Capture Chips

```yaml
plan_unit_id: F3-298
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser-derived capture chips appear in the Chat composer chip strip with bounded preview,
  page/source label, capture kind, remove/revoke affordance, and blocked/expired state; they
  serialize only on send through structured attachment paths.
gui_related: true
gui_classification_reason: >-
  This unit defines visible browser-derived capture chips in Chat.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_derived_chat_capture_chips
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0180"
preserved_exact_tokens:
- "Browser-derived capture chips"
- "composer chip strip"
- "bounded preview"
- "page/source label"
- "capture kind"
- "remove/revoke affordance"
- "blocked/expired state"
- "structured attachment path"
negative_constraints:
- "Capture chips must not serialize before the user sends the message."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-299 - Browser Debug UX Contract Boundary

```yaml
plan_unit_id: F3-299
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser and agent-debugging UX follows the Section15 built-in browser contract instead of
  `web_search`, `web_fetch`, Site Reader, or raw CDP. Ordinary PM-native Browser Program and
  automation sessions may present DevTools, generic test evidence, browser selection/element context,
  explicit ordinary-session storage confirmations, and named takeover controls. Protected
  AuthBrowserSession is human-only and accepts none of those inspection, capture, persistence,
  navigation, takeover, agent, tool, BSD, or artifact paths.
gui_related: true
gui_classification_reason: >-
  This unit constrains browser and agent-debugging UX ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_debug_ux_contract_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0181"
preserved_exact_tokens:
- "Section15 built-in browser contract"
- "web_search"
- "web_fetch"
- "Site Reader"
- "raw CDP"
- "PM-managed CEF runtime"
- "DevTools"
- "automation_session"
- "auth_session"
- "/video"
- "browser_selection_context"
- "browser_element_context"
- "/cookie"
- "pause"
- "/continue/stop"
- "resume"
- "ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
- "Capture chips must not auto-send."
- "Advanced storage or `/cookie` changes require explicit confirmation."
- "The preserved auth_session and video tokens are source-lineage only and do not grant protected AuthBrowserSession capture, recording, or inspection authority."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-300 - Debug Browser Automation Safety Defaults

```yaml
plan_unit_id: F3-300
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug browser-automation defaults favor redacted summary packs, bounded evidence windows,
  isolated session handoff, audit trails, and least-privilege browser takeover rather than
  broad shared-session control.
gui_related: true
gui_classification_reason: >-
  This unit defines safe user-facing browser automation defaults.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_browser_automation_safety_defaults
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0181"
preserved_exact_tokens:
- "redacted summary packs"
- "bounded evidence windows"
- "isolated session handoff"
- "/audit"
- "least-privilege browser takeover"
- "broad shared-session control"
negative_constraints:
- "Broad shared-session control must not be the default user-facing browser automation model."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-301 - Debug Attention And URL Binding Rules

```yaml
plan_unit_id: F3-301
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug attention banners display reason codes for auth handoff, manual reproduction, manual
  verification, and target selection; unsupported debugger attach/steering degrades to
  attention_required, and arbitrary URLs remain diagnose/verify-only investigations until PM
  binds them to workspace-backed targets.
gui_related: true
gui_classification_reason: >-
  This unit defines visible debug attention and URL-binding rules.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_attention_and_url_binding_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0181"
preserved_exact_tokens:
- "attention_required_reason_code"
- "auth_handoff_required"
- "manual_repro_required"
- "manual_verification_required"
- "target_selection_required"
- "attention_required"
- "diagnose/verify-only"
- "workspace-backed target"
- "durable-fix actions"
negative_constraints:
- "Arbitrary URLs must not offer durable-fix actions until bound to a workspace-backed target."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-302 - Browser Host Placement DevTools And Native Images

```yaml
plan_unit_id: F3-302
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Detached preview/browser windows are first-class surfaces, the editor/workspace tab is the
  canonical in-shell host for normal browsing and HTML preview, the bottom panel is not
  primary browser host, HTML/browser mode reads as real browser capability, DevTools docks in
  the focused browser session by default, and native image viewing avoids browser chrome.
gui_related: true
gui_classification_reason: >-
  This unit defines browser host placement, DevTools placement, and native image handling.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_host_placement_devtools_and_native_images
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0181"
preserved_exact_tokens:
- "detached preview/browser windows"
- "editor/workspace tab surface"
- "canonical in-shell host"
- "bottom panel"
- "primary browser host"
- "HTML/browser mode"
- "real browser-capable surface"
- "docked DevTools"
- "currently focused browser session"
- "detached DevTools"
- "image viewing remains native"
negative_constraints:
- "The bottom panel must not be described as the primary browser host."
- "Image viewing must not inherit unnecessary browser chrome."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-303 - Browser Capability And Session Class UX

```yaml
plan_unit_id: F3-303
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser/rendered mode opens browser-handled content, supports highlight/select and
  screenshot capture into chat chips, allows named agent-control actions for user-locked
  web-app flows, preserves DevTools/screenshot/console/network inspection on
  Linux/macOS/Windows, and distinguishes watched user browser sessions, separate visible
  automation windows/tabs, and hidden/ephemeral automation sessions.
gui_related: true
gui_classification_reason: >-
  This unit defines browser capability set and session class UX.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_capability_and_session_class_ux
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0181"
preserved_exact_tokens:
- "required/desired browser capability set"
- "highlight/select browser content"
- "screenshot capture into chat"
- "visible chips"
- "user-locked web-app"
- "DevTools"
- "console"
- "network inspection"
- "Linux, macOS, and Windows"
- "Session-class UX"
- "hidden/ephemeral automation sessions"
- "Open in Detached Browser"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-304 - Chat Markdown Mermaid Rendering

```yaml
plan_unit_id: F3-304
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat messages containing renderable Markdown or Mermaid support readable Markdown
  formatting, native Mermaid diagram cards, copy source/open editor/open detached
  preview/export actions, and visible malformed-Mermaid error states.
gui_related: true
gui_classification_reason: >-
  This unit defines Chat renderable Markdown and Mermaid behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_markdown_mermaid_rendering
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0182"
preserved_exact_tokens:
- "readable Markdown formatting"
- "native Mermaid diagram cards"
- "copy source"
- "open in editor"
- "open detached preview"
- "export diagram"
- "malformed Mermaid"
- "silent raw-block disappearance"
negative_constraints:
- "Malformed Mermaid must not silently disappear."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-305 - Chat HTML Execution Prohibition

```yaml
plan_unit_id: F3-305
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat must not execute arbitrary HTML from message content.
gui_related: false
gui_classification_reason: >-
  This unit defines a security/content execution prohibition rather than visible rendering
  behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_html_execution_prohibition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0182"
preserved_exact_tokens:
- "Chat must not execute arbitrary HTML from message content."
negative_constraints:
- "Chat must not execute arbitrary HTML from message content."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-306 - Context Lens Chat Placement And Modes

```yaml
plan_unit_id: F3-306
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Context Lens placement is fixed in the top-right of Chat immediately to the right of search,
  renders as icon plus dropdown arrow, supports multi-select in all modes, and exposes Mute,
  Focus, Subcompact, and Turn Off.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Context Lens placement and modes.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: context_lens_chat_placement_and_modes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0182"
preserved_exact_tokens:
- "Context Lens"
- "top-right of the chat window"
- "search bar"
- "icon plus dropdown arrow"
- "multi-select"
- "Mute"
- "Focus"
- "Subcompact"
- "Turn Off"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-307 - File Editor Render Mode Controls

```yaml
plan_unit_id: F3-307
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  File Editor exposes Source, Preview, Split, Detached preview, and Browser/rendered mode for
  HTML, with Split preserving shared-buffer editing semantics.
gui_related: true
gui_classification_reason: >-
  This unit defines File Editor render-capable mode controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: file_editor_render_mode_controls
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0183"
preserved_exact_tokens:
- "Source"
- "Preview"
- "Split"
- "Detached preview"
- "Browser/rendered mode for HTML"
- "shared-buffer editing semantics"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-308 - File Editor Buffer Authority

```yaml
plan_unit_id: F3-308
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Preview, browser, and rendered experiences are derivative of source and `/buffer` state, may
  cache view mode/scroll/export preferences, and never become separate canonical content
  authorities or peers.
gui_related: false
gui_classification_reason: >-
  This unit defines canonical buffer authority rather than a visual control.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: file_editor_buffer_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0183"
preserved_exact_tokens:
- "canonical buffer model"
- "/rendered"
- "source"
- "/buffer"
- "view mode"
- "scroll"
- "export preferences"
- "separate canonical content authority"
negative_constraints:
- "The mode switch must not change the canonical buffer model."
- "Rendered experiences must not become peers with separate canonical content authority."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The existing document/editor contract owns shared-buffer authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-309 - Local HTML Open Command Routing

```yaml
plan_unit_id: F3-309
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  For local HTML, default Open remains source editor; explicit Open in Browser targets the
  editor/workspace tabs browser surface, Open in Detached Browser opens a secondary detached
  browser window, and toolbar/action plus agent file-target flows invoke the same canonical
  open command.
gui_related: true
gui_classification_reason: >-
  This unit defines visible local HTML open routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: local_html_open_command_routing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0183"
preserved_exact_tokens:
- "default `Open` = source editor"
- "Open in Browser"
- "editor/workspace tabs browser surface"
- "Open in Detached Browser"
- "secondary detached browser window"
- "agent file-target flow"
- "canonical open command"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-310 - Embedded Document Pane Rendering And Actions

```yaml
plan_unit_id: F3-310
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Embedded Document Pane reuses the same rendering pipeline and PreviewSession abstraction as
  File Editor and Chat, acts as review/inspection rather than a separate rendering system, and
  offers open source, detached preview, re-render/reload, and allowed structured edit actions.
gui_related: true
gui_classification_reason: >-
  This unit defines Embedded Document Pane rendering behavior despite the source inference
  being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: embedded_document_pane_rendering_and_actions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0184"
preserved_exact_tokens:
- "Embedded Document Pane"
- "rendering pipeline"
- "PreviewSession abstraction"
- "review/inspection surface"
- "separate rendering system"
- "open source"
- "open detached preview"
- "request re-render/reload"
- "structured edits"
negative_constraints:
- "Embedded Document Pane must not become a separate rendering system."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-311 - Bottom Panel Browser Adjacent Roles

```yaml
plan_unit_id: F3-311
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Bottom panel is not canonical host for normal browsing, HTML preview, or click-to-context,
  but may show console/network summaries, downloads, trace/video progress, evidence activity,
  automation activity/status/capture, and DevTools-adjacent panes tied to the focused browser
  session.
gui_related: true
gui_classification_reason: >-
  This unit defines allowed bottom-panel browser-adjacent roles.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: bottom_panel_browser_adjacent_roles
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0185"
preserved_exact_tokens:
- "bottom panel"
- "canonical host"
- "normal browsing"
- "HTML preview"
- "click-to-context workflows"
- "console/network summaries"
- "downloads"
- "trace/video progress"
- "evidence activity"
- "automation activity"
- "DevTools-adjacent panes"
- "focused browser session"
- "ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
- "ContractName:Plans/Runtime_Artifacts_Panel.md"
- "ContractName:Plans/Wiring_Matrix.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-312 - Bottom Panel Browser Action Ownership

```yaml
plan_unit_id: F3-312
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Bottom-panel browser-adjacent actions focus or act on the owning browser session, browser
  open/detached-open/takeover/promotion/recovery actions target the canonical browser session
  model, and DevTools/evidence bridge actions act on owning `browser_session_id` without
  making the bottom panel primary browsing session.
gui_related: true
gui_classification_reason: >-
  This unit constrains bottom-panel browser action ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: bottom_panel_browser_action_ownership
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0185"
preserved_exact_tokens:
- "owning browser session"
- "browser open"
- "detached-open"
- "takeover"
- "promotion"
- "recovery actions"
- "canonical browser session model"
- "Open DevTools"
- "Toggle DevTools Dock"
- "Focus Browser"
- "browser_session_id"
- "ContractName:Plans/storage-plan.md"
- "ContractName:Plans/FileManager.md"
negative_constraints:
- "Bottom panel actions must not invent a separate browser identity."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-313 - Browser Windowing Runtime Baseline

```yaml
plan_unit_id: F3-313
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Browser runtime expectation is a PM-managed pinned bundled CEF-class Chromium runtime on
  Windows, macOS, and Linux, with native child-window embedding as baseline host strategy and
  detached browser/DevTools as first-class surfaces.
gui_related: true
gui_classification_reason: >-
  This unit defines browser runtime and windowing baseline.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_windowing_runtime_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0186"
preserved_exact_tokens:
- "PM-managed pinned bundled CEF-class Chromium runtime"
- "Windows, macOS, and Linux"
- "native child-window embedding"
- "offscreen rendering"
- "CEF wrapper such as `wef`"
- "PM-managed browser capability"
- "detached browser"
- "detached DevTools windows"
- "owning browser session"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-314 - Browser Runtime Disclosure And Recovery

```yaml
plan_unit_id: F3-314
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Setup, Doctor, update, and installer surfaces disclose selected CEF path app-size impact and
  remediation; offscreen rendering remains secondary and cannot replace native child-window
  baseline; GUI copy avoids detached fallback/system-webview implications, surfaces
  `runtime_unavailable` when needed, and does not rely on hidden pre-created browser panes.
gui_related: true
gui_classification_reason: >-
  This unit defines browser runtime disclosure and recovery behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: browser_runtime_disclosure_and_recovery
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0186"
preserved_exact_tokens:
- "setup, Doctor, update, and installer surfaces"
- "~1 GB app-size impact"
- "runtime install/update verification"
- "offscreen rendering"
- "degraded rendering workflows"
- "runtime_unavailable"
- "hidden pre-created browser panes"
- "ContractName:Plans/rewrite-tie-in-memo.md"
- "ContractName:Plans/Permissions_System.md"
negative_constraints:
- "Offscreen rendering must not replace the native child-window baseline for the canonical visible browser host."
- "GUI copy must not imply browser availability only through detached fallback windows or system-webview assumptions."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-315 - Rendered Surface Performance

```yaml
plan_unit_id: F3-315
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Rendered surfaces use lazy rendering and virtualization for long message streams and large
  documents, and preserve scroll positions where feasible when re-rendering preview content.
gui_related: false
gui_classification_reason: >-
  This unit defines rendering performance mechanics rather than visible control placement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: rendered_surface_performance
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0187"
preserved_exact_tokens:
- "lazy rendering"
- "virtualization"
- "long message streams"
- "large documents"
- "Preserve scroll positions"
- "re-rendering preview content"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-316 - Preview Control Accessibility

```yaml
plan_unit_id: F3-316
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Preview controls are keyboard reachable, and diagram export/open/source actions carry
  explicit labels and accessible tooltips/text.
gui_related: true
gui_classification_reason: >-
  This unit defines accessible preview controls despite the source inference being false.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: preview_control_accessibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0187"
preserved_exact_tokens:
- "Preview controls"
- "keyboard reachable"
- "Diagram export/open/source actions"
- "explicit labels"
- "accessible tooltips/text"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-317 - Assistant Chat Plan And Deep Plan Choices

```yaml
plan_unit_id: F3-317
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Assistant Chat planning controls expose both Plan and Deep Plan as chat workflow choices.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Assistant Chat planning choices.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: assistant_chat_plan_and_deep_plan_choices
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0190"
preserved_exact_tokens:
- "Assistant Chat planning controls"
- "Plan"
- "Deep Plan"
- "chat workflow choices"
- "planning-mode selector entry"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-318 - Plan Thoroughness Control Presentation

```yaml
plan_unit_id: F3-318
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Plan Thoroughness (PT) appears when either planning overlay is active as a compact selector
  presented as a mode-dropdown flyout (superseding the standalone segmented control
  presentation), with canonical labels Light, Balanced, and Comprehensive, default Balanced,
  shared across Plan and Deep Plan, and tooltip/help copy explaining Deep Plan intensity.
gui_related: true
gui_classification_reason: >-
  This unit defines visible Plan Thoroughness controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: plan_thoroughness_control_presentation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0190"
preserved_exact_tokens:
- "Plan Thoroughness (PT)"
- "segmented control"
- "dropdown"
- "compact selector"
- "Light"
- "Balanced"
- "Comprehensive"
- "default selection: `Balanced`"
- "Deep Plan and Plan share the same PT labels"
- "tooltip/help copy"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-319 - Plan Lightweight Thread Artifact Flow

```yaml
plan_unit_id: F3-319
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Plan mode produces a lightweight plan artifact in the thread, keeps the sticky plan panel
  visible, shows the normalized TODO list before approval, allows TODO structure revision
  before approval, and begins execution only after explicit approval.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: plan_lightweight_thread_artifact_flow
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0191"
preserved_exact_tokens:
- "Plan"
- "lightweight plan artifact in thread"
- "sticky plan panel"
- "normalized TODO list"
- "explicit approval"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-320 - Deep Plan Artifact Review Surface

```yaml
plan_unit_id: F3-320
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Deep Plan opens a richer planning artifact in a preview-capable document/editor surface,
  keeps the same normalized TODO contract visible in the thread plan panel, supports document
  review, annotations, and targeted revision, and remains more intensive than Plan at the same
  PT.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: deep_plan_artifact_review_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0191"
preserved_exact_tokens:
- "Deep Plan"
- "preview-capable document/editor surface"
- "normalized TODO contract"
- "targeted revision"
- "PT"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-321 - Shared Planning TODO Tracker State

```yaml
plan_unit_id: F3-321
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The sticky plan panel is the authoritative TODO tracker; inline chat updates are
  milestone-style rather than a competing tracker; TODO statuses include pending, in_progress,
  completed, blocked, and skipped; TODO identity survives single-agent, subagent, and crew
  execution; and plan states draft, approved, executing, completed, blocked, and superseded
  remain visible and restorable.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shared_planning_todo_tracker_state
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0191"
preserved_exact_tokens:
- "sticky plan panel"
- "authoritative TODO tracker"
- "pending"
- "in_progress"
- "completed"
- "blocked"
- "skipped"
- "single-agent"
- "subagent"
- "crew"
- "draft"
- "approved"
- "executing"
- "superseded"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Assistant/chat planning semantics remain owned with Plans/assistant-chat-design.md, Plans/Tools.md, Plans/Permissions_System.md, and Plans/storage-plan.md; FinalGUISpec owns visible consumer presentation."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-322 - Deep Plan Annotation And Revision Surface

```yaml
plan_unit_id: F3-322
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Deep Plan documents reuse the Embedded Document Pane annotation and revision contract:
  highlighted text opens an annotation action palette, margin markers and an annotation
  drawer/list show annotations, Resubmit with Annotations launches targeted revision,
  annotation anchors re-anchor deterministically after edits, annotation loss is never silent,
  and Multi-Pass Review is not automatically required before approval or execution.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: deep_plan_annotation_and_revision_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0192"
preserved_exact_tokens:
- "Embedded Document Pane"
- "highlight text -> annotation action palette"
- "annotation markers in margin"
- "annotation list/drawer"
- "Resubmit with Annotations"
- "deterministic annotation re-anchoring"
- "no silent annotation loss"
- "no automatic Multi-Pass Review requirement"
negative_constraints:
- "No silent annotation loss is allowed."
- "No automatic Multi-Pass Review requirement is created before plan approval or execution."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-323 - Deep Plan Document Rendering Scope

```yaml
plan_unit_id: F3-323
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Deep Plan documents may contain headings, lists, tables, fenced code blocks, Mermaid
  diagrams, file paths, references, validation notes, and rollout notes while staying inside
  the preview-capable editor/document rendering contract.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: deep_plan_document_rendering_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0192"
preserved_exact_tokens:
- "headings"
- "lists / tables"
- "fenced code blocks"
- "Mermaid diagrams"
- "file paths / references"
- "validation and rollout notes"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-324 - Assistant Planning Wizard Recommendation Card

```yaml
plan_unit_id: F3-324
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When Assistant Chat or Deep Plan recommends the Planning Wizard, the GUI shows a visible
  recommendation card with reason summary, primary CTA Add a new Feature or Enhancement,
  secondary action Stay in Chat or Not now, and optional supporting copy about phase pruning
  and imported context carry-through.
gui_related: true
gui_classification_reason: >-
  This unit defines a visible recommendation card; the source span inference is corrected from
  false to GUI-related true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: assistant_planning_wizard_recommendation_card
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0193"
preserved_exact_tokens:
- "Assistant recommendation card for Planning Wizard"
- "This looks like a substantial feature/enhancement that would benefit from the interview + orchestrator flow."
- "Add a new Feature or Enhancement"
- "Stay in Chat"
- "Not now"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-325 - Imported Context Planning Wizard Handoff Surface

```yaml
plan_unit_id: F3-325
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Accepting the wizard recommendation switches to the Planning Wizard intake/interview flow, shows an
  Imported from Assistant Chat or Imported from Deep Plan banner, shows whether a plan
  artifact was included, shows imported goal and scope summary, and opens an existing project
  on the preloaded feature/enhancement path instead of a blank intent picker.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: imported_context_wizard_handoff_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0194"
preserved_exact_tokens:
- "Imported from Assistant Chat"
- "Imported from Deep Plan"
- "included plan yes/no"
- "open questions count"
- "has_gui"
- "preloaded feature/enhancement path"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-326 - Planning Recommendation Non-Goals

```yaml
plan_unit_id: F3-326
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Planning recommendation UI must not copy external GUI layout from OpenCode, Cursor, VSCode,
  or other tools; must not auto-create repo files for planning artifacts without explicit user
  action; and must not silently redirect the user from chat into the wizard.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: planning_recommendation_non_goals
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0195"
preserved_exact_tokens:
- "Do not copy external GUI layout from OpenCode, Cursor, VSCode, or other tools."
- "Do not auto-create repo files for planning artifacts without explicit user action."
- "Do not silently redirect the user from chat into the wizard."
negative_constraints:
- "Do not copy external GUI layout from OpenCode, Cursor, VSCode, or other tools."
- "Do not auto-create repo files for planning artifacts without explicit user action."
- "Do not silently redirect the user from chat into the wizard."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-327 - Wizard Blocked Dashboard Card

```yaml
plan_unit_id: F3-327
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Dashboard distinguishes wizard_attention_required, wizard_blocked, HITL blocked actions,
  and remote-side-effect blocked actions. The wizard_blocked card is first-class, more severe
  than wizard_attention_required, carries card_type, wizard_id, wizard_step,
  blocked_reason_code, report_ref, resume_url, and optional thread_id, exposes Resume Wizard
  and View report actions, auto-dismisses only when the wizard leaves blocked, and
  participates in the priority order wizard_blocked > HITL approval >
  wizard_attention_required > interrupted > rate limit > warnings.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: wizard_blocked_dashboard_card
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0198"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0210"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0217"
preserved_exact_tokens:
- "wizard_attention_required"
- "wizard_blocked"
- "HITL blocked actions"
- "remote-side-effect blocked actions"
- "card_type = wizard_blocked"
- "wizard_id"
- "wizard_step"
- "blocked_reason_code"
- "report_ref"
- "resume_url"
- "thread_id?"
- "Resume Wizard"
- "View report"
- "wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-328 - Thread Worktree Icon Presence And Placement

```yaml
plan_unit_id: F3-328
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Each thread row displays a worktree icon only when a thread has an active worktree binding;
  the icon sits in the left gutter below the status badge, uses a theme-consistent branch/tree
  glyph, matches status icon size, omits placeholders for unbound threads, and uses theme
  token colors for clean, dirty, and conflict states.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: thread_worktree_icon_presence_and_placement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0200"
preserved_exact_tokens:
- "worktree icon"
- "active worktree binding"
- "Left gutter"
- "branch/tree glyph"
- "Clean: `icon-secondary`"
- "Dirty: `accent-warning`"
- "Conflict: `accent-error`"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-329 - Thread Worktree Tooltip Stale And Accessibility Behavior

```yaml
plan_unit_id: F3-329
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Thread-selector worktree icons show tooltip lines for branch name, status pill text, and
  worktree path; stale projections desaturate the icon and append (status may be outdated);
  the accessible label is Has worktree: {branch_name}, {status}; aria-live polite
  announcements cover create, unbind, remove, dirty, conflict, and creation-failed
  transitions; and dirty completed or failed worktrees remain visible without auto-cleanup.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: thread_worktree_tooltip_stale_and_accessibility_behavior
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0200"
preserved_exact_tokens:
- "branch name"
- "clean"
- "dirty"
- "conflict"
- ".puppet-master/worktrees/wt-abc123"
- "(status may be outdated)"
- "aria-label=\"Has worktree: {branch_name}, {status}\""
- "aria-live=\"polite\""
- "dirty · completed"
- "dirty · failed"
- "no auto-cleanup"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale projection icons show last-known state with desaturation and tooltip freshness copy."
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-330 - Persistent Thread Selector Badge And Branch Navigation

```yaml
plan_unit_id: F3-330
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Thread and session navigation uses a persistent sidebar or equivalent persistent region
  rather than only a floating overlay; the active-thread list exposes running, queued,
  blocked, and attention-required badges; branch lineage is visible through stable branch
  labels and source-origin metadata; badge aggregation preserves highest severity while
  showing blocked counts; and the project/session browser complements rather than replaces
  active-thread navigation.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persistent_thread_selector_badge_and_branch_navigation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0200"
preserved_exact_tokens:
- "persistent sidebar"
- "running, queued, blocked, and attention-required badges"
- "branch lineage"
- "stable branch labels"
- "highest-severity state"
- "blocked counts"
- "The floating thread-list overlay pattern is not canonical after this section."
negative_constraints:
- "The floating thread-list overlay pattern is not canonical after this section."
compatibility_only_notes: []
stale_retired_dispositions:
- "Floating thread-list overlay navigation is not canonical after this section."
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-331 - Scheduler Remediation Runtime Data Visibility

```yaml
plan_unit_id: F3-331
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Run Graph and Orchestrator surfaces expose wake reason, ready/blocked/backoff/remediation
  counts, selected-node score breakdown, ready-but-unselected reasons, safe-point ID, and
  remediation lineage identifiers.
gui_related: true
gui_classification_reason: >-
  This unit defines visible scheduler and remediation data in run surfaces; the source span
  inference is corrected from false to GUI-related true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: scheduler_remediation_runtime_data_visibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0201"
preserved_exact_tokens:
- "wake reason"
- "ready/blocked/backoff/remediation counts"
- "selected-node score breakdown"
- "ready-but-unselected reasons"
- "safe-point ID"
- "remediation lineage identifiers"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-332 - Blocked Outcome Copy

```yaml
plan_unit_id: F3-332
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When a remote side effect or guard prevents execution, the GUI presents the outcome as
  blocked, not failed, and preserves completed local work.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_outcome_copy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0202"
preserved_exact_tokens:
- "blocked"
- "failed"
- "completed local work"
negative_constraints:
- "Remote side-effect or guard blocks must not be mislabeled as failed outcomes."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-333 - Event-Driven Blocked Scheduler UI Correctness

```yaml
plan_unit_id: F3-333
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Scheduler, blocked, remediation, and all-nodes-blocked UI updates follow runtime events or
  projections through the event-driven rule and must not rely on timer polling for
  correctness; when all runnable nodes are blocked, runtime blocked/recovery events drive the
  corresponding persistent GUI banner or card immediately.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: event_driven_blocked_scheduler_ui_correctness
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0203"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0207"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0228"
preserved_exact_tokens:
- "invoke_from_event_loop"
- "event-driven rule"
- "MUST update from runtime events/projections"
- "No timer polling for correctness"
- "all runnable nodes are blocked"
- "persistent blocked-state banner or card"
negative_constraints:
- "Timer polling must not become the correctness model for scheduler, blocked, remediation, or all-nodes-blocked GUI updates."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-334 - Runtime State Visible Elements

```yaml
plan_unit_id: F3-334
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Runtime-state GUI surfaces expose queue-analysis summary with last wake reason,
  blocked-state badges and grouped blocked lists, safe-point state and restore status,
  remediation lineage navigation, disabled-action explanations tied to canonical reason codes,
  and clear distinction between attention_required, blocked, retrying, and terminal failure.
gui_related: true
gui_classification_reason: >-
  This unit defines required visible runtime-state elements; the source span inference is
  corrected from false to GUI-related true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: runtime_state_visible_elements
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0206"
preserved_exact_tokens:
- "queue-analysis summary"
- "last wake reason"
- "blocked-state badges"
- "grouped blocked lists"
- "safe-point state"
- "restore status"
- "remediation lineage navigation"
- "disabled-action explanations tied to canonical reason codes"
- "attention_required"
- "retrying"
- "terminal failure"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-335 - UX Safety And Disabled Action Explanations

```yaml
plan_unit_id: F3-335
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  If the GUI cannot perform a required action in the current mode, it states why, points to
  the canonical recovery path, and does not present controls that imply hidden fallback,
  hidden retry, or hidden re-auth behavior.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: ux_safety_and_disabled_action_explanations
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0208"
preserved_exact_tokens:
- "current mode"
- "canonical recovery path"
- "hidden fallback"
- "hidden retry"
- "hidden re-auth behavior"
negative_constraints:
- "The GUI must not present controls that imply hidden fallback, hidden retry, or hidden re-auth behavior."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-336 - Thread Run Status And Scheduler State Taxonomy

```yaml
plan_unit_id: F3-336
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Thread and run status surfaces include distinct presentations for attention_required,
  blocked, retrying/backoff, and remediation; waiting_approval and other blocked reasons
  remain runtime overlays rather than replacement lifecycle states; graph-progress lifecycle
  remains canonical; blocked/backoff/retry/remediation/approval-pending render from runtime
  projections; and requested versus effective persona/platform/model remains visible where
  substitution occurred.
gui_related: true
gui_classification_reason: >-
  This unit defines visible status taxonomy and scheduler state presentation; false-inferred
  source spans are GUI-related here.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: thread_run_status_and_scheduler_state_taxonomy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0211"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0218"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0221"
preserved_exact_tokens:
- "attention_required"
- "blocked"
- "retrying/backoff"
- "remediation"
- "waiting_approval"
- "graph-progress contract"
- "requested vs effective persona/platform/model"
- "terminal failure"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-337 - FileSafe Persistent Blocked Episode Rendering

```yaml
plan_unit_id: F3-337
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A FileSafe block renders as a persistent blocked episode until the underlying runtime block
  resolves and must not auto-dismiss while still active.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FileSafe blocked-episode rendering; the source span inference is
  corrected from false to GUI-related true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: filesafe_persistent_blocked_episode_rendering
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0213"
preserved_exact_tokens:
- "FileSafe block"
- "persistent blocked episode"
- "MUST NOT auto-dismiss while still active"
negative_constraints:
- "A FileSafe block must not auto-dismiss while still active."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-338 - Degraded Draft Warning Guardrail

```yaml
plan_unit_id: F3-338
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Decomposition degradation is a pre-lock planning state only; GUI copy must not imply silent
  degraded canonical execution after graph lock; when draft decomposition degrades from graph
  to flat sequencing before canonical graph lock, the UI shows the amber warning text Plan
  simplified to sequential steps due to structural issues in the decomposition. Performance
  may be reduced., includes a View details link for graph_integrity issues, and requires no
  user action while flat sequencing continues automatically.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: degraded_draft_warning_guardrail
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0214"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0227"
preserved_exact_tokens:
- "Decomposition degradation"
- "pre-lock planning state only"
- "MUST NOT imply silent degraded canonical execution after graph lock"
- "Plan simplified to sequential steps due to structural issues in the decomposition. Performance may be reduced."
- "View details"
- "graph_integrity"
- "flat sequencing"
negative_constraints:
- "GUI copy must not imply silent degraded canonical execution after graph lock."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-339 - All-Nodes-Blocked Boundary And Banner

```yaml
plan_unit_id: F3-339
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Before owner runtime contracts define dedicated all-blocked events, GUI surfaces may derive
  all-blocked banners from current projections but must not treat undeclared runtime events as
  canonical; once all runnable nodes are blocked, runtime blocked/recovery events and
  projections drive the persistent blocked-state banner or card, and the user can resume after
  resolving blocks.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: all_nodes_blocked_boundary_and_banner
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0215"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0228"
preserved_exact_tokens:
- "All-nodes-blocked gating"
- "MAY derive all-blocked banners from current projections"
- "MUST NOT treat undeclared runtime events as canonical"
- "all runnable nodes are blocked"
- "persistent blocked-state banner or card"
negative_constraints:
- "GUI surfaces must not treat undeclared all-blocked runtime events as canonical."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-340 - Canonical Blocked Recovery GUI Summary Boundary

```yaml
plan_unit_id: F3-340
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Canonical Blocked/Recovery Behavior section is the canonical GUI summary for blocked and
  recovery surfaces, and superseded scheduler or blocked addenda remain subordinate to that
  summary.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: canonical_blocked_recovery_gui_summary_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0216"
preserved_exact_tokens:
- "Canonical Blocked/Recovery Behavior"
- "canonical GUI summary for blocked and recovery surfaces"
- "Superseded"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-341 - Blocked Payload Actions Distinct Episodes And Command Binding

```yaml
plan_unit_id: F3-341
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Blocked and recovery UI binds to canonical blocked projections and HITL records; blocked
  payloads use ordered allowed_action_ids[]; blocked episodes remain distinct when more than
  one is active; labels may vary by surface but command binding resolves through the shared
  runtime command catalog; blocked cards preserve highest severity and blocked counts.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_payload_actions_distinct_episodes_and_command_binding
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0217"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0225"
preserved_exact_tokens:
- "canonical blocked projections"
- "HITL records"
- "allowed_action_ids[]"
- "blocked episodes remain distinct"
- "shared runtime command catalog"
- "highest severity"
- "blocked counts"
- "Multiple concurrent blocked episodes MUST NOT be collapsed into a single notification"
negative_constraints:
- "Multiple concurrent blocked episodes must not be collapsed into a single notification."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-342 - No Surface-Specific Blocked Schema Synthesis

```yaml
plan_unit_id: F3-342
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI does not synthesize alternate blocked schemas, alternate action arrays, or alternate
  retry classes for specific surfaces, and shared blocked/remediation taxonomy preserves
  actor-specific state machines and object identities without collapsing assistant,
  interview/builder, runtime, and Orchestrator lifecycles.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: no_surface_specific_blocked_schema_synthesis
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0219"
preserved_exact_tokens:
- "alternate blocked schemas"
- "alternate action arrays"
- "alternate retry classes"
- "actor-specific state machines"
- "assistant, interview/builder, runtime, and Orchestrator actors"
negative_constraints:
- "The GUI must not synthesize alternate blocked schemas, alternate action arrays, or alternate retry classes for specific surfaces."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-343 - Blocked Visual Distinction And Per-Episode Controls

```yaml
plan_unit_id: F3-343
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Blocked episodes are visually distinct from ordinary paused or idle states; multiple
  simultaneous blocked episodes show per-episode controls and a count summary where
  appropriate; and remediation-ceiling-exceeded and validation-blocked use the shared
  blocked-payload contract rather than bespoke one-off UI treatment.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_visual_distinction_and_per_episode_controls
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0220"
preserved_exact_tokens:
- "visually distinct"
- "paused/idle states"
- "per-episode controls"
- "count summary"
- "remediation-ceiling-exceeded"
- "validation-blocked"
- "blocked-payload contract"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-344 - Safe-Point Recovery Control Language

```yaml
plan_unit_id: F3-344
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Safe points are runtime recovery anchors under the canonical sp identity and must not be
  presented as Assistant Chat restore points under the separate rp identity; retry controls
  distinguish Retry from safe point from Start fresh attempt; unavailable recovery disables
  retry with an explanation; and exact-replace receipts preserve the closed Case L outcomes
  without conflict-success or partial-success invention.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: [SP-242, CV-320]
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: safe_point_recovery_control_language
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0222"
preserved_exact_tokens:
- "safe points"
- "runtime recovery anchors"
- "MUST NOT be presented as user-facing restore points"
- "Retry from safe point"
- "Start fresh attempt"
- "disabled with an explanation"
- "sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}"
- "rp:{project_id}:{restore_point_id}"
- "restored_clean"
- "restore_recovery_required"
negative_constraints:
- "Safe points must not be presented as user-facing restore points."
- "restored_with_conflicts and partial success are invalid for safe-point restore and whole-turn Chat revert."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-345 - Seam Review Output Presentation

```yaml
plan_unit_id: F3-345
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Seam review outputs show a review verdict, failure classes with severity, evidence bundle or
  rationale, remediation-node or graph-patch recommendations, and corroboration
  requirement/outcome when invoked.
gui_related: true
gui_classification_reason: >-
  This unit defines visible seam-review output presentation; the source span inference is
  corrected from false to GUI-related true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: seam_review_output_presentation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0222"
preserved_exact_tokens:
- "Seam review outputs"
- "review verdict"
- "failure classes with severity"
- "evidence bundle/rationale"
- "remediation-node or graph-patch recommendations"
- "corroboration requirement/outcome"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-346 - Blocked Badge Visual Mapping

```yaml
plan_unit_id: F3-346
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Dashboard cards, thread badges, and Run Graph View node badges use the canonical visual
  mapping for attention_required, blocked, and waiting_approval, preserving badge color, icon,
  label text, tooltip meaning, and the escalation distinction between attention_required and
  blocked.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_badge_visual_mapping
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0224"
preserved_exact_tokens:
- "attention_required"
- "blocked"
- "waiting_approval"
- "Amber"
- "Red"
- "Blue"
- "Needs input"
- "Blocked"
- "Awaiting approval"
- "Dashboard cards, thread badges, and Run Graph View node badges"
negative_constraints:
- "attention_required and blocked must remain visually distinct."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-347 - Concurrent Blocked Episodes List UX

```yaml
plan_unit_id: F3-347
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When multiple nodes are blocked simultaneously, the dashboard shows a blocked count badge,
  opens a filtered blocked-node list sorted by blocked_sequence descending, displays node
  name, blocked_reason_code label, time since blocked, and primary allowed_action_ids[]
  actions for each item, allows expansion into full blocked detail including detail_ref and
  remediation lineage, and keeps each blocked node as a distinct actionable item.
gui_related: true
gui_classification_reason: >-
  This unit defines visible concurrent blocked episode list behavior; the source span
  inference is corrected from false to GUI-related true.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: concurrent_blocked_episodes_list_ux
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0225"
preserved_exact_tokens:
- "3 blocked"
- "blocked_sequence"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "detail_ref"
- "remediation lineage"
- "distinct actionable item"
negative_constraints:
- "Multiple concurrent blocked episodes must not be collapsed into a single notification."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-348 - Remediation Ceiling Exceeded UX

```yaml
plan_unit_id: F3-348
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When remediation generation reaches the ceiling, the node transitions to blocked with
  blocked_reason_code remediation_ceiling_exceeded; Run Graph View shows a Remediation limit
  reached banner; actions include Replan, Manual fix, and Abort node with their command IDs;
  remediation lineage remains visible; and no automatic retry is permitted after the ceiling
  is reached.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: remediation_ceiling_exceeded_ux
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0226"
preserved_exact_tokens:
- "remediation_ceiling_exceeded"
- "Remediation limit reached"
- "Replan"
- "cmd.orchestrator.replan_node"
- "Manual fix"
- "cmd.orchestrator.open_for_edit"
- "Abort node"
- "cmd.orchestrator.abort_node"
- "No automatic retry is permitted"
negative_constraints:
- "No automatic retry is permitted after the remediation ceiling is reached."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-349 - External Polling Freshness Aid Boundary

```yaml
plan_unit_id: F3-349
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Polling intervals are acceptable only for external systems without push delivery, such as
  GitHub Actions status refresh every 30s, and must be documented as freshness aids rather
  than canonical correctness logic.
gui_related: false
gui_classification_reason: >-
  This unit defines a runtime freshness/correctness boundary rather than a visible GUI layout
  or presentation requirement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: external_polling_freshness_aid_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0228"
preserved_exact_tokens:
- "Polling intervals"
- "external systems without push delivery"
- "GitHub Actions status refresh every 30s"
- "freshness aids"
- "canonical correctness logic"
negative_constraints:
- "Polling intervals must not become canonical correctness logic."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-350 - Promoted Widget Catalog Boundary

```yaml
plan_unit_id: F3-350
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The promoted widget catalog mirrors shared runtime contracts, replaces older mixed status
  taxonomy and Mermaid-only collapse, preserves listed consumer/owner obligations, and keeps
  provider routing/configuration internals out of FinalGUISpec while FinalGUISpec owns visible
  widget and card behavior.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: promoted_widget_catalog_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "Promoted widget catalog"
- "web tools, planning, question, operation cards"
- "shared runtime contracts"
- "older mixed status taxonomy"
- "Mermaid-only collapse"
- "obl-008"
- "obl-064"
- "provider routing/configuration internals stay out of this GUI consumer surface"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-351 - Packet Alignment And Widget Currentness Guardrails

```yaml
plan_unit_id: F3-351
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The 2026-04-06 packet-alignment register is historical context only; live widget text
  consumes repaired owner docs; and any remaining packet-shape defect inside Plans/Tools.md#10
  must not create duplicate or generalized Final GUI canon.
gui_related: false
gui_classification_reason: >-
  This unit preserves a non-GUI ownership, currentness, or runtime boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: packet_alignment_and_widget_currentness_guardrails
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "2026-04-06 packet-alignment register"
- "historical context only"
- "repaired owner docs"
- "Plans/Tools.md#10"
- "duplicate or generalized Final GUI canon"
negative_constraints:
- "Remaining packet-shape defects inside Plans/Tools.md#10 must not create duplicate or generalized Final GUI canon."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-352 - Web Diff Site And Search Fidelity Widgets

```yaml
plan_unit_id: F3-352
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web and diff cards consume changeTracking or its explicit retirement from the Tools owner,
  never regress to stale change_status or change_summary as the visible contract, preserve
  Site Reader browser-capability disclosure and no-reuse routing identity, and preserve
  search-then-read citation locality so final citations come from the actual read path.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_diff_site_and_search_fidelity_widgets
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "FID-013"
- "changeTracking"
- "change_status"
- "change_summary"
- "FID-008"
- "Site Reader"
- "Reading Site"
- "FID-009"
- "Search-then-read citation locality"
- "actual read path"
negative_constraints:
- "GUI text must not regress to stale change_status or change_summary as the visible contract."
- "Provider fetch cannot reuse the PM-native Reading Site identity."
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale change_status and change_summary wording is retired for web/diff card visible contracts."
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-353 - Web Progress Event Widget Carry-Through

```yaml
plan_unit_id: F3-353
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web progress widgets carry progress_event fields tool_use_id, operation, phase, detail,
  pages_completed, pages_total, elapsed_ms, estimated_remaining_ms, and cancelled: true when
  applicable.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_progress_event_widget_carry_through
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "FID-021"
- "progress_event"
- "tool_use_id"
- "operation"
- "phase"
- "detail"
- "pages_completed"
- "pages_total"
- "elapsed_ms"
- "estimated_remaining_ms"
- "cancelled: true"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-354 - Planning TODO Widget Ownership

```yaml
plan_unit_id: F3-354
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Planning widgets consume todowrite statuses and notes plus todoread active thread/run scope,
  and chat.plan_todo_updated remains the owner-contract definition for durable normalized TODO
  mutation.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: planning_todo_widget_ownership
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "FID-041"
- "todowrite"
- "todoread"
- "active thread/run scope"
- "FID-040"
- "chat.plan_todo_updated"
- "durable normalized TODO mutation"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-355 - Question Card Compatibility Normalization

```yaml
plan_unit_id: F3-355
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Question cards preserve response_kind and validation_state, and the compatibility rule that
  allow_other is a deprecated alias; allow_other normalizes to allow_freeform and must not
  become a new canonical field.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: question_card_compatibility_normalization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "FID-043"
- "FID-043B"
- "Question cards"
- "response_kind"
- "validation_state"
- "allow_other is a deprecated alias"
- "allow_freeform"
negative_constraints:
- "allow_other must not become a new canonical field."
compatibility_only_notes:
- "allow_other is a deprecated alias that normalizes to allow_freeform."
stale_retired_dispositions:
- "allow_other is compatibility vocabulary, not a new canonical field."
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-356 - Queue And Runtime Identity Widget Carry-Through

```yaml
plan_unit_id: F3-356
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Queue semantics stay transient, stale chat_state:v1 restore residue must not rehydrate
  queued work across reload or restart, and runtime identity carry-through includes
  requested_account_binding, operational_identity, effective_account_label,
  effective_provider_identity, and effective_project_id without reviving requested_persona_id
  as GUI identity canon.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: queue_and_runtime_identity_widget_carry_through
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "FID-038"
- "Queue semantics stay transient"
- "chat_state:v1"
- "reload or restart"
- "FID-061"
- "requested_account_binding"
- "operational_identity"
- "effective_account_label"
- "effective_provider_identity"
- "effective_project_id"
- "requested_persona_id"
negative_constraints:
- "Stale chat_state:v1 restore residue must not rehydrate queued work across reload or restart."
- "requested_persona_id must not be revived as GUI identity canon."
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale chat_state:v1 restore residue must not rehydrate queued work."
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-357 - Chat Panel Widget Ownership Scope

```yaml
plan_unit_id: F3-357
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat-panel carry-through into promoted widgets includes activity-card rendering,
  jump-to-latest badge behavior that re-enables auto-follow, auto-follow scroll state,
  search/diff card anatomy, live TODO tracker ownership, question forms, Agent Config IA,
  terminal open-in-terminal behavior, and provider settings layout exclusion from
  FinalGUISpec.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chat_panel_widget_ownership_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0229"
preserved_exact_tokens:
- "activity-card"
- "jump-to-latest"
- "/auto-follow"
- "/search/diff"
- "live TODO tracker"
- "question forms"
- "Agent Config IA"
- "/open-in-terminal"
- "provider settings layout constraint"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible GUI consumer behavior; runtime event/state ownership remains with the referenced owner docs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-358 - Operation Card Rendering And Status Boundary

```yaml
plan_unit_id: F3-358
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Operation cards preserve the three-way rendering distinction across terminal, search, and
  diff/web cards; card-level status badges use idle, running, success, error, and timeout
  while owner runtimes keep richer internal taxonomies; inline mini-terminal and operation
  cards stay bounded previews with persistent per-command cards, narrative-order placement,
  and shared card anatomy.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: operation_card_rendering_and_status_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0230"
preserved_exact_tokens:
- "Operation cards"
- "terminal, search, and diff/web cards"
- "idle→running→success|error|timeout"
- "bounded inline previews"
- "persistent per-command cards"
- "header, status badge, body, and action row"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card anatomy and status presentation; owner runtimes retain richer internal taxonomies."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-359 - Terminal Handoff And Stable Session Identity

```yaml
plan_unit_id: F3-359
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Interactive or long-running terminal work binds to a stable terminal session; chat retains
  bounded preview and audit ownership; one-shot bash invocations and search tools render
  inline; shell-owned live terminal/output surfaces own longer sessions and full output;
  pop-out, detach, and re-dock preserve session identity.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_handoff_and_stable_session_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0230"
preserved_exact_tokens:
- "terminal_session_id"
- "stable terminal session"
- "bounded preview and audit ownership"
- "one-shot `bash`"
- "shell-owned live terminal/output surfaces"
- "detach or re-dock"
- "session identity"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Terminal PTY/session runtime remains shell-owned; FinalGUISpec owns the visible handoff and preview behavior."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-360 - Terminal Actions And Reveal Semantics

```yaml
plan_unit_id: F3-360
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal cards expose distinct Open in Terminal, Show Terminal, Rerun in Terminal, and
  Detach/Pop-Out actions; Open in Terminal and Show Terminal focus the same live session;
  Rerun in Terminal creates a new card rather than mutating the completed card; commands
  requiring stdin or TTY start Terminal immediately; background, watch, and server actions
  create terminal-owned sessions.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_actions_and_reveal_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0230"
preserved_exact_tokens:
- "Open in Terminal"
- "Show Terminal"
- "Rerun in Terminal"
- "Detach/Pop-Out"
- "same live session"
- "new card rather than mutating the completed card"
- "stdin/TTY"
- "Background/watch/server actions"
negative_constraints:
- "Terminal action canon must not collapse distinct terminal actions into one normalized target."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-361 - Terminal Preview Payload Recovery And No Pseudo-Terminal Boundary

```yaml
plan_unit_id: F3-361
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Terminal preview cards use collapsed 5-line and expanded 15-line previews, persist after
  completion, show status, cwd, command summary, elapsed time, exit code or truncation
  indicator, stay read-only and non-interactive, store large payloads behind refs or blobs,
  stop owning full transcript after promotion, and distinguish attach failure recovery for
  live process, ended process, and inline-only completed command. Inline previews and
  linkbacks add views into the shell-owned model rather than minting pseudo-terminals.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: terminal_preview_payload_recovery_and_no_pseudo_terminal_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0230"
preserved_exact_tokens:
- "Collapsed preview: 5 lines"
- "Expanded preview: 15 lines"
- "READ-ONLY and non-interactive"
- "Large payloads store full data behind refs/blobs"
- "after promotion, chat stops owning the full transcript"
- "attach failure recovery"
- "/inline"
- "/command-card"
- "mini-terminal previews"
- "pseudo-terminals"
negative_constraints:
- "Chat and terminal must not collapse into one undifferentiated transcript."
- "Inline previews must not mint brand-new pseudo-terminals with separate runtime ownership."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-362 - Search Then Read Citation Provenance

```yaml
plan_unit_id: F3-362
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Search result cards preserve search-then-read answer construction: final citations come from
  the actual read path, raw search snippets alone are not enough final-answer provenance, chat
  may shortlist with search, and chosen pages must be read before citation as final evidence.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: search_then_read_citation_provenance
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0231"
preserved_exact_tokens:
- "search-then-read behavior"
- "final citations come from the actual read path"
- "raw search snippets alone are not enough provenance"
- "chat may shortlist with search"
- "read chosen pages before citing them as final evidence"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Storage, contracts, and browser ContractRefs own provenance payloads; FinalGUISpec owns visible search-result card behavior."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-363 - Provider-Specific Websearch Option Surface Boundary

```yaml
plan_unit_id: F3-363
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Firecrawl websearch mapping preserves provider-specific search behavior and option
  surface, including Serper-backed Google-result behavior, sources, categories, and optional
  result scraping behavior, without FinalGUISpec becoming the provider option owner.
gui_related: false
gui_classification_reason: >-
  This unit preserves a non-GUI owner-boundary or provider semantics constraint.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: provider_specific_websearch_option_surface_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0231"
preserved_exact_tokens:
- "Firecrawl `websearch`"
- "provider-specific search behavior"
- "Serper-backed Google-result behavior"
- "sources"
- "categories"
- "optional result scraping behavior"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Provider/tool owner docs own websearch option semantics; FinalGUISpec records the consumer boundary only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-364 - Web Capability Unavailable And Site Reader Identity

```yaml
plan_unit_id: F3-364
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web operation cards include a capability-unavailable terminal branch with clear setup
  guidance when no provider supports the requested operation; Site Reader v1 requires real
  browser interaction capability; Reading Site is reserved exclusively for the PM-native Site
  Reader path; provider-routed fetch uses Fetching Site: <url> (via <provider>) and must not
  reuse the reserved native identity.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_capability_unavailable_and_site_reader_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "capability-unavailable terminal branch"
- "clear setup guidance"
- "Site Reader v1"
- "real browser-interaction capability"
- "Reading Site"
- "Fetching Site: <url> (via <provider>)"
- "provider-routed fetch must not reuse the reserved native Site Reader identity"
negative_constraints:
- "Provider-routed fetch must not reuse the reserved native Site Reader identity."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Tools and browser/Site Reader owners retain routing authority; FinalGUISpec owns visible labels and recovery copy."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-365 - Firecrawl Research And Batch Semantics

```yaml
plan_unit_id: F3-365
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Firecrawl webresearch preserves provider-native no-URL natural-language research behavior,
  navigation/forms/pagination capability, structured extraction during agent-led research,
  continue_on_error: false, stop on first failure, and return of completed results plus
  failure detail.
gui_related: false
gui_classification_reason: >-
  This unit preserves a non-GUI owner-boundary or provider semantics constraint.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: firecrawl_research_and_batch_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "webresearch"
- "no-URL natural-language research"
- "navigation/forms/pagination capability"
- "structured extraction behavior"
- "continue_on_error: false"
- "stop on the first failure"
- "return completed results plus failure detail"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Tools/provider docs own Firecrawl routing and batch semantics; FinalGUISpec preserves the consumer boundary."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-366 - Web Progress And Cancellation Payload Carry-Through

```yaml
plan_unit_id: F3-366
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Long-running web operation cards preserve structured progress_event payloads and
  cancellation with partial results, including tool_use_id, operation, phase, detail,
  pages_completed, pages_total, elapsed_ms, estimated_remaining_ms, and cancelled: true where
  applicable.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_progress_and_cancellation_payload_carry_through
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "progress_event"
- "tool_use_id"
- "operation"
- "phase"
- "detail"
- "pages_completed"
- "pages_total"
- "elapsed_ms"
- "estimated_remaining_ms"
- "cancelled: true"
- "partial results"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-367 - Shared Operation Card Lifecycle State Machine

```yaml
plan_unit_id: F3-367
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Operation cards are restricted to stateful, time-bounded lifecycle-bearing operations,
  exclude other widget families, and use a locked card-level state machine reconciled against
  the 8-state agent/process taxonomy; card states include pending, running, completed, failed,
  cancelled, blocked, starting, exited, background, backgrounded, disconnected, restoring,
  terminated, and attention_required according to owner mappings.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: shared_operation_card_lifecycle_state_machine
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "stateful, time-bounded lifecycle-bearing operations"
- "8-state agent/process taxonomy"
- "pending"
- "running"
- "completed"
- "failed"
- "cancelled"
- "blocked"
- "starting"
- "exited"
- "background"
- "backgrounded"
- "disconnected"
- "restoring"
- "terminated"
- "attention_required"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "assistant-chat-design.md owns terminal command-card state mappings; FinalGUISpec owns visible card-state presentation."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-368 - Message Controls Queue And Scroll Behavior

```yaml
plan_unit_id: F3-368
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Message controls attach Stop, Edit, and Resend only to the most recent user-sent message,
  use FIFO queued-message semantics with max two queued messages, discard later history or
  work for rewind/resend/edit behavior, keep queue state transient across reload/restart, keep
  Stop from clearing the queue, keep code-block copy always visible, disclose subagents, and
  expose jump-to-latest or jump-to-bottom with unseen-count and auto-follow resume only when
  the user returns to the bottom.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: message_controls_queue_and_scroll_behavior
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "Stop/Edit/Resend"
- "most recent user-sent message"
- "FIFO, max 2 queued messages"
- "queue is transient and not restart-persisted"
- "Stop does NOT clear the queue"
- "always-visible copy affordance"
- "mandatory subagent disclosure"
- "jump-to-latest"
- "jump-to-bottom"
- "unseen-count"
- "/auto-follow"
negative_constraints:
- "Queue state is transient and is not restored across reload or restart."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-369 - Web Activity Payload Display Schema

```yaml
plan_unit_id: F3-369
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web activity details display provider identity, routing reason, timing, cache status,
  adapter-selection, projection, audit disclosure, and warning/error fields using the visible
  schema: tool_use_id, adapter_id, adapter_selection_reason, timestamp, error_code,
  error_message, provenance_badge, execution_path, duration_ms, cached, warnings,
  requested_adapter_id, effective_adapter_id, provider_fallback_summary, warnings_count,
  projection_freshness, and projection_health.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_activity_payload_display_schema
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "tool_use_id"
- "adapter_id"
- "adapter_selection_reason"
- "timestamp"
- "error_code"
- "error_message"
- "provenance_badge"
- "execution_path"
- "duration_ms"
- "cached"
- "warnings"
- "requested_adapter_id"
- "effective_adapter_id"
- "provider_fallback_summary"
- "projection_freshness"
- "projection_health"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0.md and storage-plan.md own payload schemas; FinalGUISpec owns displayed field presentation."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-370 - Web Labels Narrative Order And Completion Rendering

```yaml
plan_unit_id: F3-370
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web/search/diff cards preserve distinct card anatomy, narrative order, completed-content
  rendering only on completion, streamed running labels, and concrete collapsed labels such as
  Searching Web: <query>, Fetching Site: <url> (via <provider>), Reading Site: <url>,
  Extracting Site: <url>, Researching Web: <task>, Crawling Site: <url>, and Mapping Site:
  <url>.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_labels_narrative_order_and_completion_rendering
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "Searching Web: <query>"
- "Fetching Site: <url> (via <provider>)"
- "Reading Site: <url>"
- "Extracting Site: <url>"
- "Researching Web: <task>"
- "Crawling Site: <url>"
- "Mapping Site: <url>"
- "/completion"
- "Narrative order"
negative_constraints:
- "Cards do not float out of narrative position."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-371 - Provider Runtime Identity Disclosure Widgets

```yaml
plan_unit_id: F3-371
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web/provider GUI cards expose structured operation_input as canonical operation input while
  normalizing legacy web_input before rendering, TODO progress statuses,
  requested/effective runtime identity fields, exact provider class split
  account-backed|API-backed|no-key, QuestionItem-aligned question widgets, support tier,
  fallback disclosure, source count or scope summary, and warning or error text.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: provider_runtime_identity_disclosure_widgets
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "operation_input"
- "legacy web_input"
- "pending | in_progress | completed | blocked | skipped"
- "requested_account_binding"
- "operational_identity"
- "effective_account_label"
- "effective_provider_identity"
- "effective_project_id"
- "account-backed|API-backed|no-key"
- "QuestionItem"
- "support tier"
- "fallback disclosure"
negative_constraints: []
compatibility_only_notes:
- "Legacy web_input normalizes to operation_input before GUI web cards render."
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-372 - Operation Card Compatibility And Terminal Action Exclusion

```yaml
plan_unit_id: F3-372
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Legacy /operation-card references normalize to the operation-card widget family while
  individual web, terminal, search, and diff card types keep owner-specific payload contracts;
  search and diff/web cards do not expose terminal Show Terminal or Detach/Pop-Out
  affordances, and only terminal cards expose those terminal actions while long-running web
  operations may use background state.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: operation_card_compatibility_and_terminal_action_exclusion
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "Legacy `/operation-card`"
- "operation-card widget family"
- "owner-specific payload contracts"
- "Show Terminal"
- "Detach/Pop-Out"
- "only terminal cards expose those actions"
- "background state"
negative_constraints:
- "Search and diff/web cards must not expose terminal Show Terminal or Detach/Pop-Out affordances."
compatibility_only_notes:
- "Legacy /operation-card references normalize to the operation-card widget family."
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-373 - Blocked Unavailable And Fallback Recovery Cards

```yaml
plan_unit_id: F3-373
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Blocked or unavailable web/provider cards surface machine-actionable blocked responses
  through allowed_action_ids[], show exact reason labels such as permission_denied,
  network_error, provider_unavailable, headless_unavailable, and timeout, carry status:
  unavailable, blocked_reason_code, denial and recovery fields, and show failed and next
  same-operation providers in visible fallback activity labels while audit logs record
  provider_fallback_summary.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: blocked_unavailable_and_fallback_recovery_cards
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0232"
preserved_exact_tokens:
- "blocked_reason_code"
- "allowed_action_ids[]"
- "denial_reason_code"
- "denial_source"
- "suggested_recovery_action"
- "permission_denied"
- "network_error"
- "provider_unavailable"
- "headless_unavailable"
- "timeout"
- "status: \"unavailable\""
- "provider_fallback_summary"
negative_constraints:
- "Blocked or unavailable card responses must remain machine-actionable through allowed_action_ids[]."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-374 - Sticky Plan Panel TODO Tracker

```yaml
plan_unit_id: F3-374
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Plan and Deep Plan both project to a normalized TODO list; the sticky Plan panel is per
  thread and authoritative, showing plan title or summary, TODOs in canonical order, status
  badge per TODO, dependency hints, owner or delegated-executor badge, verification hint, and
  the locked status set pending, in_progress, completed, blocked, and skipped.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: sticky_plan_panel_todo_tracker
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0233"
preserved_exact_tokens:
- "Plan"
- "Deep Plan"
- "normalized TODO list"
- "sticky Plan panel"
- "authoritative TODO tracker"
- "todo_id"
- "dependencies[]"
- "owner_hint"
- "verification_hint"
- "pending | in_progress | completed | blocked | skipped"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-375 - Plan Approval Editing Execution Milestones And History

```yaml
plan_unit_id: F3-375
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Before approval, the Plan panel exposes structural editing controls for TODO items; after
  approval, the approved or executing plan becomes a read-mostly live execution tracker;
  inline chat progress is limited to compact milestones that focus or open the sticky Plan
  panel; completed or blocked plan execution leaves final TODO states visible in thread and
  panel history; and returning to Ask mode must not erase the thread plan/TODO state.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: plan_approval_editing_execution_milestones_and_history
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0233"
preserved_exact_tokens:
- "Before approval"
- "structural editing controls"
- "approved/executing plan"
- "read-mostly structure"
- "Started TODO 2/5: add parser tests"
- "Completed TODO 2/5"
- "Blocked TODO 3/5: waiting on permission"
- "returning to Ask mode must not erase the plan/TODO state"
negative_constraints:
- "Returning to Ask mode must not erase the plan/TODO state for that thread."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-376 - Planning Notes Order Index And Superseded Boundary

```yaml
plan_unit_id: F3-376
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Legacy optional spellings notes? and order_index? normalize to canonical notes and
  order_index; superseded is plan-level only and not a queue item state; and UI copy must not
  say superseded by newer run unless explicit run-relationship metadata proves derivation,
  continuation, replacement, or validity lineage.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: planning_notes_order_index_and_superseded_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0233"
preserved_exact_tokens:
- "notes?"
- "order_index?"
- "notes"
- "order_index"
- "superseded"
- "superseded by newer run"
- "derivation, continuation, replacement, or validity lineage"
negative_constraints:
- "UI copy must not say superseded by newer run unless explicit run-relationship metadata proves derivation, continuation, replacement, or validity lineage."
compatibility_only_notes:
- "Legacy optional spellings notes? and order_index? normalize to canonical notes and order_index."
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-377 - Question Flow Draft Lifecycle

```yaml
plan_unit_id: F3-377
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Question cards are reusable Assistant/Interviewer/requirements-builder components that
  support single_question and multi-question questionnaire flows, draft navigation,
  out-of-order completion, edits before final submission, PM-managed draft state, continuous
  auto-save, final submit only when required answers are complete, and thread-scoped restore
  on navigation return or close.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: question_flow_draft_lifecycle
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0234"
preserved_exact_tokens:
- "questionnaire"
- "single_question"
- "question-flow"
- "draft navigation"
- "out-of-order answering"
- "draft state that auto-saves"
- "final submit"
- "required questions block final submit"
- "Thread-scoped draft state"
- "navigation-return"
- "close"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-378 - Question Options Freeform Multi-Select And Visual Draft Bridge

```yaml
plan_unit_id: F3-378
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Question cards show required visible options plus a freeform path, represent Single-choice +
  Other through single_question plus allow_freeform, use the shared multi-select questionnaire
  contract when multi_select is set, may include helpful visuals, and ensure visuals write to
  PM question-flow draft state rather than using sendPrompt.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: question_options_freeform_multi_select_and_visual_draft_bridge
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0234"
preserved_exact_tokens:
- "Always-visible options"
- "Something else"
- "single_question"
- "allow_freeform"
- "multi_select"
- "question cards may include a visual"
- "question visuals write to PM draft state, not `sendPrompt`"
- "NOT via `sendPrompt`"
negative_constraints:
- "Question visuals must write to PM draft state, not sendPrompt."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-379 - Question Unavailable Dismissed And Subagent Consolidation

```yaml
plan_unit_id: F3-379
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Headless or HITL-unavailable question paths return status unavailable rather than fabricated
  answers; dismissed or paused questions preserve explicit behavior and do not auto-submit;
  dismissing pauses conversation until resume; and subagent brainstorming consolidates through
  the top-level question flow instead of spawning independent user prompts.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: question_unavailable_dismissed_and_subagent_consolidation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0234"
preserved_exact_tokens:
- "unavailable"
- "dismissed"
- "status: 'dismissed'"
- "Exiting/dismissing does NOT auto-submit"
- "dismissing pauses conversation until resume"
- "subagent `/brainstorming`"
- "top-level question flow"
- "fabricated answers"
negative_constraints:
- "Unavailable question paths must not fabricate answers."
- "Exiting or dismissing must not auto-submit."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-380 - Mermaid Visual Module Rendering Sandbox And Sanitizer

```yaml
plan_unit_id: F3-380
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Mermaid and inline visualizer behavior uses native card rendering, explicit error and
  fallback disclosure, source-text-first Mermaid, sandboxed visual-module cards for richer
  HTML/JS visuals, auto-height design-token sizing, sandbox="allow-scripts" only, denied
  allow-same-origin, allow-forms, allow-popups, and allow-top-navigation tokens,
  postMessage-only communication, sanitizer baseline for non-iframe rendering, and no
  arbitrary HTML execution.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: mermaid_visual_module_rendering_sandbox_and_sanitizer
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0236"
preserved_exact_tokens:
- "Mermaid"
- "inline visualizer"
- "native card rendering"
- "visual-module"
- "sandbox=\"allow-scripts\""
- "sandbox='allow-scripts'"
- "allow-same-origin"
- "allow-forms"
- "allow-popups"
- "allow-top-navigation"
- "postMessage"
- "DOMPurify `DEFAULT_ALLOWED_TAGS`"
- "must NOT execute arbitrary HTML"
negative_constraints:
- "Inline visualizer iframe embeds must not include allow-same-origin, allow-forms, allow-popups, or allow-top-navigation."
- "Visualizer widgets must not execute arbitrary HTML."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-381 - Visualizer Host Bridge And Question Flow Narrowing

```yaml
plan_unit_id: F3-381
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The visualizer host bridge uses the typed CV-300 registry for async-safe sendPrompt, openLink, copyToClipboard,
  requestResize, toast, saveState, and loadState, with copyText retained only as a compatibility alias for
  copyToClipboard. _blank opens a new tab, _self navigation is blocked in sandboxed cards, resize is host-constrained,
  question-flow embedded visual modules omit sendPrompt and expose only the narrowed PM-managed question-draft bridge,
  and bridge calls preserve exact host semantics for composer queueing, detached previews, theme injection, height
  reporting, typed return/error states, and native Rust + Slint webview adapter message mapping.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: [CV-300]
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: visualizer_host_bridge_and_question_flow_narrowing
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0236"
preserved_exact_tokens:
- "sendPrompt(text: string): void"
- "openLink(url: string, target?: \"_blank\" | \"_self\"): void"
- "copyToClipboard(text: string): Promise<boolean>"
- "requestResize(width?: number, height?: number): void"
- "copyText"
- "toast"
- "saveState"
- "loadState"
- "Rust + Slint"
- "webview"
- "_blank"
- "_self"
- "question-flow embedded visuals do not receive `sendPrompt`"
- "cmd.browser.open_detached_preview"
- "{ height: px }"
negative_constraints:
- "Question-flow embedded visual modules must not bypass PM draft state by queueing chat messages."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-382 - Visualizer Theme Tokens Script Loading And Library Allowlist

```yaml
plan_unit_id: F3-382
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Visualizer theme-token injection is locked for MVP as CSS custom properties on the inline
  style attribute of the visualizer container with --pm-viz-bg, --pm-viz-fg, --pm-viz-accent,
  --pm-viz-border, --pm-viz-font-family, and --pm-viz-font-size; visual fragments must use
  those tokens; hardcoded replacement colors are prohibited; visual-runtime script loading is
  closed by default; allowed libraries must be bundled, version-pinned, integrity-recorded,
  declared in artifact metadata, and loaded inside the sandbox; remote CDN scripts, dynamic
  network import, same-origin escalation, popup/form/top-navigation permissions, undeclared
  runtime script injection, and unvetted network requests are not valid MVP paths.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: visualizer_theme_tokens_script_loading_and_library_allowlist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0236"
preserved_exact_tokens:
- "--pm-viz-bg"
- "--pm-viz-fg"
- "--pm-viz-accent"
- "--pm-viz-border"
- "--pm-viz-font-family"
- "--pm-viz-font-size"
- "hardcoded replacement colors are prohibited"
- "third-party-library"
- "bundled"
- "version-pinned"
- "integrity-recorded"
- "Remote CDN scripts"
- "dynamic network import"
- "same-origin escalation"
- "no external libraries"
negative_constraints:
- "Remote CDN scripts, dynamic network import, same-origin escalation, popup/form/top-navigation permissions, undeclared runtime script injection, and unvetted network requests are not valid MVP paths."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-383 - Visualizer Logging Persistence Export And Stale Widget Retirement

```yaml
plan_unit_id: F3-383
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Inline visualizer logging is audit-oriented and bounded; PM records render errors, sandbox
  violations, bridge messages, export actions, and detached-preview opens as structured
  activity metadata or refs; logging must not capture arbitrary DOM contents, user secrets, or
  full visual payloads unless the selected export/evidence profile permits it; persistence
  keeps rendered output references, source data, and metadata but not transient rendering
  state; controls include status unavailable, proxy_mode, basic, enhanced, auto, Fire Engine
  limitation copy, Copy source, Open in editor, Open detached preview, and Export diagram;
  stale widget wording retires in place rather than downgrading unresolved owner propagation
  to verify-only guidance.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: visualizer_logging_persistence_export_and_stale_widget_retirement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0236"
preserved_exact_tokens:
- "render errors"
- "sandbox violations"
- "bridge messages"
- "export actions"
- "detached-preview opens"
- "must not log arbitrary DOM contents, user secrets, or full visual payloads"
- "transient rendering state"
- "status: \"unavailable\""
- "proxy_mode"
- "basic"
- "enhanced"
- "auto"
- "Fire Engine limitation copy"
- "Copy source"
- "Open in editor"
- "Open detached preview"
- "Export diagram"
negative_constraints:
- "Visualizer logging must not log arbitrary DOM contents, user secrets, or full visual payloads unless the selected export/evidence profile explicitly permits them."
- "Visualizer persistence must not persist transient rendering state, animation positions, scroll offsets, or ephemeral JS variables."
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale widget wording retires in place rather than downgrading unresolved owner propagation to verify-only guidance."
owner_boundary_notes:
- "FinalGUISpec owns visible card/widget behavior; owner docs retain runtime, tool, permission, schema, and storage authority."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-384 - Permission Owner Boundary And Four-Tier Ladder

```yaml
plan_unit_id: F3-384
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Permission approval cards consume Permissions_System as canonical for web tool permission
  keys, approval-card summary templates, session-approval semantics, and approval-card
  cross-reference targets; preserve the four-tier approval ladder deny, once, for session, and
  always; preserve question default allow only when HITL is available; keep six web tools
  independently visible and ask-gated in plan presets; allow strict read_only or no-network
  presets to deny them; and carry blocked/unavailable payload fields through to
  permission-card consumers.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: permission_owner_boundary_and_four_tier_ladder
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0237"
preserved_exact_tokens:
- "Permissions_System"
- "deny"
- "once"
- "for session"
- "always"
- "question default `allow` only when HITL is available"
- "read_only"
- "websearch"
- "webfetch"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "status: \"unavailable\""
negative_constraints:
- "Web tool permission keys, approval-card summary templates, session-approval semantics, and approval-card cross-reference target must not be re-invented from thin tool descriptions or stale Ask UI links."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Permissions_System owns permission policy; FinalGUISpec owns visible approval-card consumer behavior."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-385 - Web Approval Summaries And Session Scope

```yaml
plan_unit_id: F3-385
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Web approval card summaries show tool-specific previews for websearch, webfetch, webextract,
  webresearch, webcrawl, and webmap; Once approves only the invocation; For Session scopes
  search/research to the current web tool/session with wildcard MVP behavior;
  fetch/extract/crawl/map scope to host/site patterns such as https://host.example/*; Deny
  rejects this invocation and other pending asks in the same session sharing the same approval
  ask; approving webcrawl For Session may auto-approve crawl/map/extract/fetch for the same
  host and tool-key semantics, while webresearch For Session does not broadly allow unrelated
  tools.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: web_approval_summaries_and_session_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0237"
preserved_exact_tokens:
- "websearch summary shows tool name + query preview"
- "webfetch/webextract summary shows tool name + target host/URL"
- "webresearch summary shows tool name + task summary + estimated source count"
- "webcrawl/webmap summary shows tool name + root URL + page/depth caps"
- "Once"
- "For Session"
- "https://host.example/*"
- "Deny"
- "Approving webcrawl For Session auto-approves crawl/map/extract/fetch"
- "Approving webresearch For Session does NOT create broad allow"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Permissions_System owns session approval policy; FinalGUISpec owns visible approval summary and scope copy."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-386 - Persona Boundary And Todowrite Approval Prompt

```yaml
plan_unit_id: F3-386
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In-chat approval cards must not mutate Persona profiles; approval outcomes write only to the
  session approval cache or canonical permissions project/global rule storage; Persona profile
  edits remain owned by the Personas management surface; a todowrite auto-use approval prompt
  in ask-mode lists proposed TODO items before creation; and auto-approved todowrite creates
  items silently while surfacing the resulting plan-panel update.
gui_related: true
gui_classification_reason: >-
  This unit defines visible FinalGUISpec widget or card behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: persona_boundary_and_todowrite_approval_prompt
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0237"
preserved_exact_tokens:
- "In-chat approval cards MUST NOT mutate Persona profiles"
- "session approval cache"
- "canonical permissions project/global rule storage"
- "Persona profile edits"
- "todowrite"
- "ask-mode"
- "proposed TODO items"
- "auto-approved `todowrite`"
negative_constraints:
- "In-chat approval cards must not mutate Persona profiles."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Personas management owns Persona profile edits; FinalGUISpec owns visible approval-card behavior."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-001 - FinalGUISpec Retired Source-Preserving Bridge

```yaml
plan_unit_id: F3-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Phase 2B batches 065 through 073 atomized or structurally dispositioned FinalGUISpec-S0001
  through FinalGUISpec-S0239 into F3-002 through F3-386 or explicit structural dispositions.
  F3-001 no longer carries product source-preserving coverage; it remains only as migration
  lineage for the retired broad bridge. FinalGUISpec-S0240 and FinalGUISpec-S0241 are the
  historical broad bridge and migration-coverage spans reserved for the final bounded
  FinalGUISpec window.
gui_related: false
gui_classification_reason: >-
  This retired bridge is migration lineage only, not live GUI product coverage.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "FinalGUISpec-S0001 through FinalGUISpec-S0239 are carried by F3-002 through F3-386 or explicit structural dispositions and must not be remapped back to F3-001."
- "F3-001 no longer carries source_preserving_planunit compile mode."
- "FinalGUISpec-S0240 and FinalGUISpec-S0241 remain pending for the final bounded FinalGUISpec window."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: source_preservation
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0240"
preserved_exact_tokens:
- "F3-001"
- "source-preserving bridge"
- "FinalGUISpec-S0001"
- "FinalGUISpec-S0239"
- "FinalGUISpec-S0240"
- "FinalGUISpec-S0241"
negative_constraints:
- "Do not remap FinalGUISpec-S0001 through FinalGUISpec-S0239 back to F3-001."
- "Do not treat F3-001 as final implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge."
compatibility_only_notes:
- "F3-001 remains migration lineage only after Phase 2B batch 073."
stale_retired_dispositions:
- "The broad source-preserving bridge is retired after product spans through FinalGUISpec-S0239 were atomized or dispositioned."
owner_boundary_notes:
- "F3-002 through F3-386 own product coverage for FinalGUISpec-S0001 through FinalGUISpec-S0239."
- "FinalGUISpec-S0240 and FinalGUISpec-S0241 are structural/bridge/migration spans reserved for the final FinalGUISpec window."
owner_hints:
- "Plans/FinalGUISpec.md"
```
