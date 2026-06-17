# Shard 008: PlanUnits

Source: `Plans/Run_Graph_View.md`

Source lines: L141-L746

Source SHA256: `b1c012e0885c019fe65ed653e539975cfe03806a897747e4f40643ef1ab4bbdb`

---

## PlanUnits

### RGV-001 - Run Graph Canonical Scope

```yaml
plan_unit_id: RGV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph is the canonical graph and lineage inspection surface for orchestrated execution. Graph nodes are runtime nodes rather than tiers; lineage spans graph generations; blocked, recovery, promotion, and corroboration state appears in graph detail when it belongs to the selected node or related lineage object.
gui_related: true
gui_classification_reason: The unit defines the user-visible Run Graph inspection surface.
depends_on: []
unblocks: [RGV-002, RGV-003, RGV-004, RGV-005, RGV-006]
acceptance_criteria:
- Graph nodes are modeled as runtime nodes, not tiers.
- Graph lineage remains generation-aware when graph patching occurs.
- Node detail can expose blocked, recovery, promotion, and corroboration state for selected or related lineage objects.
validation_surfaces:
- Manual review of Plans/Run_Graph_View.md section 1.
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: route_owner_drift
reasoning_tier: standard
context_scope: run_graph_owner_surface
implementation_surfaces:
- Plans/Run_Graph_View.md
- future Run Graph UI
node_compile_hint:
  mode: future_compiler_input
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0005
- Plans/Run_Graph_View.md:1-24
preserved_exact_tokens:
- Run Graph View (Node Graph Display) -- Specification
- Canonical owner-section requirements
- 1. Scope and canonical role
negative_constraints:
- Do not treat tiers as runtime graph nodes.
owner_hints:
- Plans/Run_Graph_View.md
```

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Executor_Protocol.md

### RGV-002 - Focused Run And Historical Mode

```yaml
plan_unit_id: RGV-002
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph distinguishes active run truth from focused run context. active_run_id names live runtime truth; focused_run_id and focus_mode = live | historical name the selected run, page state, and Historical Run Mode behavior across Orchestrator tabs.
gui_related: true
gui_classification_reason: This unit defines visible run focus, historical-mode indicators, tab behavior, and user-facing controls.
depends_on: [RGV-001]
unblocks: [RGV-003, RGV-005, RGV-010]
acceptance_criteria:
- active_run_id and focused_run_id are distinct concepts.
- focus_mode is live only when focused_run_id equals active_run_id; historical mode applies when the user inspects a non-active run.
- Historical mode clearly identifies the focused historical run and disables, removes, or reroutes live-only actions.
- Progress, Node Graph, Evidence, History, and Ledger remain coherent against the focused run.
validation_surfaces:
- Manual focus-mode review across Run Graph and Orchestrator docs.
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: historical_run_focus
reasoning_tier: standard
context_scope: run_focus_state
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/storage-plan.md
- future Orchestrator project state projection
node_compile_hint:
  mode: focused_run_state_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:29-31
- Plans/Run_Graph_View.md:45-46
- Plans/Run_Graph_View.md:58-61
- Plans/Run_Graph_View.md:69-71
- Plans/Run_Graph_View.md:75-76
- Plans/Run_Graph_View.md:81-84
preserved_exact_tokens:
- active_run_id?
- focused_run_id?
- focus_mode = live | historical
- Historical Run Mode
- orchestrator.project_state.{project_id}
negative_constraints:
- Tab-local filters, sorts, tables, graph node search, Evidence local search/filter, Ledger filter/sort, and History list/table controls do not rewrite focused run state except through an explicit route.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

### RGV-003 - Shared Deep-Link And Search Routing

```yaml
plan_unit_id: RGV-003
unit_type: constraint
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph uses one shared destination payload for search results, command-palette results, widget drill-downs, recovery links, resume URLs, artifact opens, subject-open semantics, and cross-surface pivots. Navigation preserves target identity and context instead of switching tabs with an approximate target.
gui_related: true
gui_classification_reason: The unit governs user-visible navigation, deep links, command-palette results, and search focus behavior.
depends_on: [RGV-001, RGV-002]
unblocks: [RGV-005, RGV-010]
acceptance_criteria:
- Page-level Orchestrator search remains separate from tab-local filtering controls.
- Search, command-palette, widget drill-down, recovery, resume URL, artifact open, and Show-in pivots reuse the same identity model.
- Graph focus-to-object can target seam, package, node, lane, and generation objects while preserving full-graph context.
- Deep links avoid preserving non-stable layout state such as transient panel widths, split ratios, and ephemeral widget state.
validation_surfaces:
- Route/open payload audit.
- Manual cross-surface deep-link review.
- python3 scripts/pm-plan-index.py validate
risk_class: route_fidelity
reasoning_tier: high
context_scope: cross_surface_navigation
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: routing_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:30-35
- Plans/Run_Graph_View.md:43-46
- Plans/Run_Graph_View.md:56-61
- Plans/Run_Graph_View.md:84
- Plans/Run_Graph_View.md:94
preserved_exact_tokens:
- /deep-link
- /search/focus-to-object
- full-graph
- local-only
- Show in ...
negative_constraints:
- Search and command-palette navigation must not restore a watered-down approximation.
- Deep links generally do not preserve non-stable UI layout state.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

### RGV-004 - Graph Layout, Scale, And Generation Visibility

```yaml
plan_unit_id: RGV-004
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: The Run Graph layout has a run/generation/trust header, a main graph canvas with minimap, search, and overlays, and a right-side inspector/table region. It keeps historical and superseded branches available through generation-aware controls, culling, caching, virtualization, level-of-detail reduction, and density-aware overlays.
gui_related: true
gui_classification_reason: This unit defines visible layout regions, graph canvas behavior, overlays, minimap, zoom, pan, and inspector placement.
depends_on: [RGV-001]
unblocks: [RGV-005]
acceptance_criteria:
- Current generation is emphasized by default without hiding historical truth.
- Superseded and historical branches remain visible and clickable.
- Large graphs use virtualization, culling, caching, throttled updates, level-of-detail reduction, and lineage-focused defaults.
- Canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization rather than phase-only grouping.
validation_surfaces:
- Manual Run Graph layout review.
- Large-graph interaction and projection review.
- python3 scripts/pm-plan-index.py validate
risk_class: large_graph_usability
reasoning_tier: high
context_scope: run_graph_layout
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/FinalGUISpec.md
- future Run Graph canvas
node_compile_hint:
  mode: gui_surface_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0007
- Plans/Run_Graph_View.md:38-39
- Plans/Run_Graph_View.md:44
- Plans/Run_Graph_View.md:79-80
- Plans/Run_Graph_View.md:97-110
preserved_exact_tokens:
- minimap
- overlays
- throttled-update
- density-aware
- package-group swimlanes
- seam boundaries
- parallel lane visualization
compatibility_only_notes:
- by-phase grouping is a compatibility layout only.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

### RGV-005 - Node Detail Inspector Content And Actions

```yaml
plan_unit_id: RGV-005
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Node detail exposes requested/effective provider, model, effort, persona, account, usage, cost, worker policy, retry/review/promotion state, lane, worktree, snapshot, linked evidence, artifacts, review refs, corroboration refs, graph patch refs, recovery refs, blocked episode refs, and promotion refs. Evidence and artifact links deep-link to Evidence with target selection or filtering applied.
gui_related: true
gui_classification_reason: This unit defines the visible right-side detail inspector, diff cards, action affordances, and Evidence pivots.
depends_on: [RGV-001, RGV-002, RGV-003, RGV-004]
unblocks: [RGV-010]
acceptance_criteria:
- Node click opens detail with runtime identity, usage/cost, worker policy, retry/review/promotion, lane/worktree/snapshot, and evidence/artifact linkage.
- Diff previews cap at 50 lines and expose a View Full Diff action targeting diff_review.
- SCM recovery and lineage actions use exact UI Command Catalog pivots and stable route context after restart.
- Missing lineage is labeled partial rather than synthesized.
validation_surfaces:
- Manual node detail and action payload review.
- UI Command Catalog cross-check.
- python3 scripts/pm-plan-index.py validate
risk_class: inspector_fidelity
reasoning_tier: standard
context_scope: node_detail_surface
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/FileManager.md
- future Run Graph inspector
node_compile_hint:
  mode: gui_surface_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0009
- Plans/Run_Graph_View.md:48-50
- Plans/Run_Graph_View.md:94
- Plans/Run_Graph_View.md:112-123
preserved_exact_tokens:
- requested/effective provider/model/effort/persona/account
- View Full Diff
- cmd.orchestrator.restore_safe_point_then_retry
- review_refs
- blocked_episode_refs
negative_constraints:
- restore_safe_point_then_retry must carry exact worktree/baseline targeting rather than implied reuse.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/FileManager.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md

### RGV-006 - Data Model Identity Modernization

```yaml
plan_unit_id: RGV-006
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph data-source joins retarget away from tier_id and toward node_id, attempt_id, blocked episode, generation, lane, artifact, and provider platform identity. Field-name modernization is insufficient unless scope is also modernized to the runtime identities that own execution truth.
gui_related: false
gui_classification_reason: This unit defines runtime/data identity and join semantics rather than visual presentation.
depends_on: [RGV-001]
unblocks: [RGV-007, RGV-010]
acceptance_criteria:
- Usage, evidence, terminal, and output routing no longer rely on tier-keyed joins once attempts, blocked episodes, and graph generations are first-class.
- provider_entry, provider_family, requested_platform, and effective_platform map back to Orchestrator vocabulary.
- provider_family_id remains additive grouping metadata and never replaces concrete platform identity.
- effective_provider_identity, provider_identity, and effective_project_id are not used to encode actor role or side-effect target identity.
validation_surfaces:
- Manual data-model identity review.
- Cross-check against Contracts, Executor Protocol, storage, and usage docs.
- python3 scripts/pm-plan-index.py validate
risk_class: identity_model_drift
reasoning_tier: high
context_scope: run_graph_data_model
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/usage-feature.md
node_compile_hint:
  mode: runtime_identity_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0010
- Plans/Run_Graph_View.md:33-34
- Plans/Run_Graph_View.md:40
- Plans/Run_Graph_View.md:78
- Plans/Run_Graph_View.md:87
- Plans/Run_Graph_View.md:125-127
preserved_exact_tokens:
- tier_id
- node_id
- attempt_id
- blocked-episode
- provider_entry
- provider_family
- requested_platform
- effective_platform
negative_constraints:
- Evidence, terminal, usage, and output routing must not remain tier-keyed once attempts, blocked episodes, and graph generations are first-class routing objects.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### RGV-007 - Tier-Era And HITL Compatibility Disposition

```yaml
plan_unit_id: RGV-007
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Tiers are demoted from primary Orchestrator tab/page authority in favor of Progress, Seams, Node Graph, Evidence, History, and Ledger. Tier labels may survive only as derived presentation context or compatibility lineage. request_id and hitl_request_id are not durable graph action identity; blocked runtime approval identity, blocked_sequence, and allowed_action_ids-backed runtime actions own that role.
gui_related: true
gui_classification_reason: This disposition retires or constrains user-visible Tiers tab/page assumptions and graph layout vocabulary.
depends_on: [RGV-001, RGV-006]
unblocks: [RGV-010]
acceptance_criteria:
- GUI navigation demotes Tiers from primary Orchestrator tab/page authority.
- Node Graph, Seams, Evidence, History, and Ledger use the rewrite tab model.
- hitl_request_id and request_id remain compatibility lineage only where they appear.
- Graph command payloads use blocked/runtime approval identity and allowed_action_ids-backed runtime command targets.
validation_surfaces:
- Manual stale tier/HITL cleanup review.
- UI Command Catalog payload review.
- python3 scripts/pm-plan-index.py validate
risk_class: stale_tier_cleanup
reasoning_tier: standard
context_scope: compatibility_and_stale_disposition
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:28
- Plans/Run_Graph_View.md:41
- Plans/Run_Graph_View.md:47
- Plans/Run_Graph_View.md:49
- Plans/Run_Graph_View.md:55
- Plans/Run_Graph_View.md:57
- Plans/Run_Graph_View.md:66-67
- Plans/Run_Graph_View.md:73
- Plans/Run_Graph_View.md:86
- Plans/Run_Graph_View.md:89-90
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:9
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:16
preserved_exact_tokens:
- Tiers
- Node Graph
- Progress/Seams/Node Graph/Evidence/History/Ledger
- hitl_request_id
- request_id
- blocked_sequence
- allowed_action_ids[]
- cmd.graph.approve_hitl/deny_hitl
- request_id vs blocked_sequence
- allowed_action_ids[] → cmd.runtime.*
negative_constraints:
- The graph view-model MUST NOT keep hitl_request_id as the durable action identity once the blocked/recovery model moves to blocked-episode identity.
- Graph and Orchestrator command payloads must not keep request_id as the primary action target.
compatibility_only_notes:
- Tier labels survive only as derived view context.
- Legacy HITL/request fields are compatibility lineage only.
stale_retired_dispositions:
- Tier-keyed usage/evidence correlation and legacy PuppetMasterEvent source tables are cleanup inputs, not active implementation targets.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

### RGV-008 - Projection Trust, Concern Identity, And Action Gating

```yaml
plan_unit_id: RGV-008
unit_type: constraint
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph discloses stale or degraded projection trust before showing live claims, treats projection-trust failures and weak-integration findings as distinct concern categories, and gates actions that depend on current promotion, blocker, graph-generation, remote-side-effect truth, or cross-surface mutation payloads.
gui_related: false
gui_classification_reason: The unit primarily defines runtime trust, concern identity, and action-gating policy.
depends_on: [RGV-001, RGV-006]
unblocks: [RGV-010]
acceptance_criteria:
- Live-status tables consume canonical runtime records and projections first.
- Stale or degraded projection trust is disclosed before live claims or live action affordances.
- Concern merge, split, and supersession remain discussion-only until concern identity/routing rules become contract-level.
- Concerns have durable identity, lineage, source links, status, resolution_kind, and rationale fields rather than only badges or notes.
- Graph patch application that changes canonical graph generation is hard-gated or runtime-controlled.
- Mutating Run Graph commands carry projection-trust payloads and route through allowed_action_ids-backed runtime actions when blocked/recovery action identity is involved.
validation_surfaces:
- Projection trust/manual action-gating review.
- Concern schema owner review.
- python3 scripts/pm-plan-index.py validate
risk_class: projection_trust
reasoning_tier: high
context_scope: projection_trust_and_concerns
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- future concern identity contract
node_compile_hint:
  mode: trust_and_gate_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0009
- Plans/Run_Graph_View.md:36-37
- Plans/Run_Graph_View.md:42
- Plans/Run_Graph_View.md:53
- Plans/Run_Graph_View.md:62-64
- Plans/Run_Graph_View.md:77
- Plans/Run_Graph_View.md:83-85
- Plans/Run_Graph_View.md:93
- Plans/Run_Graph_View.md:121-123
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:9
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:16
preserved_exact_tokens:
- projection-trust
- projection-trust payload
- weak-integration
- hard_gate
- concern_id
- resolution_kind
- blocked_episode_refs
- allowed_action_ids[] → cmd.runtime.*
negative_constraints:
- Run Graph may link candidate concern operations but must not invent canonical merge authority.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
owner_adjudication:
  candidate_owners: [Plans/Run_Graph_View.md, Plans/Contracts_V0.md, Plans/Executor_Protocol.md]
  evidence: Concern identity and graph projection trust are consumed by Run Graph, while event/runtime schema authority remains in Contracts and Executor owner docs.
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### RGV-009 - Adjacent Owner Gaps And Non-Local Decisions

```yaml
plan_unit_id: RGV-009
unit_type: constraint
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph records adjacent owner gaps without claiming non-local authority. Durable account switch history is already owned through account_switch_event and account_pressure_episode, while role enums, provider account policy references, acceptance/evidence/coverage schema extensions, and runtime scheduler ordering belong to their owner docs before Run Graph consumes them.
gui_related: false
gui_classification_reason: This unit is owner-routing and schema-boundary metadata, not GUI implementation work.
depends_on: [RGV-001, RGV-006, RGV-008]
unblocks: [RGV-010]
acceptance_criteria:
- Multi-account switch history consumes account_switch_event and account_pressure_episode rather than the stale no-durable-family claim.
- Schema contradictions are tracked as active owner-doc gaps rather than solved locally in Run Graph.
- Concern, corroboration, promotion, graph-patch, lane, package, and account object families are preserved as node-relevant hints without becoming final WorkNodes.
validation_surfaces:
- Owner adjudication review.
- DRY Rules/ContractRef review.
- python3 scripts/pm-plan-index.py validate
risk_class: owner_adjudication
reasoning_tier: high
context_scope: cross_owner_routing
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Multi-Account.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/usage-feature.md
node_compile_hint:
  mode: owner_route_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:51
- Plans/Run_Graph_View.md:68
- Plans/Run_Graph_View.md:72
- Plans/Run_Graph_View.md:78
- Plans/Run_Graph_View.md:86-87
- Plans/Run_Graph_View.md:91-92
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:9
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:15
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:16
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:20
preserved_exact_tokens:
- account.switched
- account_switch_event
- Contracts_V0 now defines account_switch_event
- policy_hash
- actor_kind
- execution_role
- Schema-level contradictions are active, not hypothetical.
- lexicographic ordering
- scored ready-set
negative_constraints:
- Run Graph must not encode actor role or side-effect target identity into effective_provider_identity, provider_identity, or effective_project_id.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Multi-Account.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/usage-feature.md
owner_adjudication:
  candidate_owners: [Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Executor_Protocol.md, Plans/usage-feature.md, Plans/Run_Graph_View.md]
  evidence: The source spans explicitly name missing account, role, schema, usage, and runtime scheduler authority that Run Graph can consume only after owner-doc repair.
```

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### RGV-010 - Run Graph Validation And Coverage

```yaml
plan_unit_id: RGV-010
unit_type: validation_rule
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph validation checks payload fidelity, owner routing, missing context, projection trust disclosure, stale tier cleanup, focused-run coherence, and command-catalog alignment. Phase 2A coverage keeps original spans mapped without creating WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
gui_related: false
gui_classification_reason: This unit defines validation and migration proof rules rather than GUI implementation work.
depends_on: [RGV-002, RGV-003, RGV-004, RGV-005, RGV-006, RGV-007, RGV-008, RGV-009]
unblocks: []
acceptance_criteria:
- Route/open checks verify payload fidelity, owner routing, and missing context.
- Focused-run, historical-mode, and cross-tab coherence are validation targets.
- Projection trust and live-action affordances disclose stale/degraded state before claiming live truth.
- Phase 2A coverage artifacts map every pre-edit Run Graph span to fine-grained PlanUnits, preserved source, or explicit disposition.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py generate
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: validation_coverage
reasoning_tier: standard
context_scope: migration_and_run_graph_validation
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/.plan_migration/pds-20260611-002-atomize-planunits
- Plans/.plan_index
node_compile_hint:
  mode: validation_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0014
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0015
- Plans/Run_Graph_View.md:43
- Plans/Run_Graph_View.md:130-139
- Plans/Run_Graph_View.md:141-253
preserved_exact_tokens:
- Route/open auditing
- Acceptance carry-through
- Owner / Consumer Map
- Migration Coverage
negative_constraints:
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this phase.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Plan_Document_System.md
- Plans/Bootstrap_Planning_Migration.md
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md
