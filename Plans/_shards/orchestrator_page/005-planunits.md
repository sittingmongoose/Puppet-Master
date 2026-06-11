# Shard 005: PlanUnits

Source: `Plans/Orchestrator_Page.md`

Source lines: L398-L593

Source SHA256: `9434ef508c05118c4df03efc97b20f2bd12841ea6906af99a6f9c6283280c6f8`

---

## PlanUnits

### OP-001 - Orchestrator Page -- Single-Page 6-Tab Specification Source-Preserving PlanUnit

```yaml
plan_unit_id: OP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: Plans/Orchestrator_Page.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Orchestrator_Page.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Orchestrator_Page-S0074
preserved_exact_tokens:
- Orchestrator Page -- Single-Page 6-Tab Specification
- Canonical owner-section requirements
- Owner-first canonicalization order
- Shared governance/runtime record envelope
- Concern record family definition
- Concern lifecycle and resolution kinds
- Concern routing and object-first search behavior
- Concern action policy and authority model
- Concern linkage to adjacent families
- Promotion classes and gate evidence
- Focused run and historical routing contract
- Source Control and worktree handshake
- Projection trust and action gating
- Progress-only widget hostability
- Shared escalation ladder
- Action-surface policy
- Glossary and help governance
- Notification routing policy
- Project summary projection
- Project attention projection
- Account switch and pressure history
- Coverage blocker concern lifecycle owner section
- Concern owner vs creator vs resolver separation
- Concern source-event vs record vs projection split
negative_constraints:
- Authority presentation must not collapse back to one monolithic Puppet Master center. Seam/package overseer scopes, `/package` authority, blocked-owner attribution, and `/system/user` separation stay visible, and GitHub auth `/scope/rate-limit` failures raise concern-aware hooks without turning bloc
- '- Tiers-first compatibility must not govern Progress widgets: phase-grouped run-graph presets, single-current-task widgets, tier-shaped correlation, and active-tier terminal selection are compatibility views only. The base-struct and prose-table layers must catch up to node/package/seam/lane runtime'
- '- Feature-complete blocked-state wiring uses domain payload schemas. SCM blocked payloads include `dirty_worktree` and `worktree_conflict`; Actions payloads include auth expired, missing scope, no GitHub remote, rate-limited, and environment waiting for review; Docker/Kubernetes payloads include run'
- Orchestrator UICommand exposure for recovery and navigation is delegated to `Plans/UI_Command_Catalog.md`. Orchestrator may surface `cmd.orchestrator.open_in_source_control`, `cmd.orchestrator.open_in_github_actions`, `cmd.orchestrator.open_in_docker_manager`, `cmd.orchestrator.open_kubernetes`, and
- '- Before Orchestrator resumes a Debug investigation, it revalidates the linked `dev_session_id`, `browser_session_id`, DAP session identity, and remote authority against the stored route and runtime identity. If any linked identity is stale but recoverable, the run stays in `attention_required` with'
compatibility_only_notes:
- The /page-shell is a six-tab single-page surface. Node Graph Display remains a native Orchestrator view over `Plans/Orchestrator_Page.md`, `Plans/orchestrator-subagent-integration.md`, `/Orchestrator_Page.md`, and `/orchestrator-subagent-integration.md`; the tab set includes Tiers, History, Progress
- 'Stale widget compatibility is explicit: stale-spec, widget-card, widget.tier_tree, Orchestrator single-page with 6 tabs, tier/session, `Plans/feature-list.md`, `/feature-list.md`, tier_id, `/session`, `/orchestrator`, `/task/subtask`, widget.current_task, widget.progress_bars, and Tiers are legacy c'
- Prompt and defaulting references preserve `Plans/Prompt_Pipeline.md`, Prompt_Pipeline, tier_id, plan_or_tier_default, and `/package/node/lane` compatibility while the active Orchestrator authority model remains package, node, and lane scoped.
- Executor compatibility references preserve `Plans/Executor_Protocol.md`, Executor_Protocol, `/seam`, `/lane`, top-level, and first-class package/seam governance vocabulary so legacy scheduler addenda do not keep singular-overseer semantics alive.
- 'Worktree legacy compatibility is explicit: `WorktreeGitImprovement.md`, `/tier`, `/node`, tier_id, `/storage`, `/package`, `/worktree`, get_tier_worktree, get_tier_worktree(tier_id), owner run/tier, tier-keyed, tier-based branch/worktree naming, and `Progress, Tiers, History, and Node Graph` labels '
- 'Tier authority is compatibility state only: tiers may remain first-class in widgets, breadcrumbs, HITL boundaries, and state displays, but `/package/seam`, node, package, seam, and lane authority determine canonical execution input.'
- 'Native surface ownership preserves `Widget_System.md`, Widget_System, `Orchestrator_Page.md`, Orchestrator_Page, widget-composed, widget-heavy, and Progress compatibility: only Progress remains widget-heavy, while Graph, Seams, Evidence, History, and Ledger are native Orchestrator surfaces.'
- 'Open owner-decision guardrails remain explicit rather than hidden: requested concrete account, operational identity / actor role, switch-history and pressure timeline, projection-freshness naming/ownership, and concern-transition authority splits retain design-open status until their owning docs clo'
- '- Tiers-first compatibility must not govern Progress widgets: phase-grouped run-graph presets, single-current-task widgets, tier-shaped correlation, and active-tier terminal selection are compatibility views only. The base-struct and prose-table layers must catch up to node/package/seam/lane runtime'
- '- The concern lifecycle transition matrix is owner prose here: `active -> acknowledged` records operator awareness without changing truth, `active | acknowledged -> resolved` requires evidence that the underlying issue changed, `active | acknowledged -> dismissed` requires a rationale that the conce'
- '- Legacy import and search aliases `/concern`, `/dismissed`, `/guard/persistence`, and `trust-state` resolve to this concern record/projection lifecycle owner; they are compatibility aliases only and do not create separate route, status, or storage families.'
- '- Legacy import and search labels `Concern model — formal lifecycle section`, `Seam weak-integration concern taxonomy`, `Inspector / full-record behavior split`, and `Trust/concern projection handoffs` map to the lifecycle, taxonomy, inspector, and projection rules above; they are compatibility labe'
stale_retired_dispositions:
- 'Stale widget compatibility is explicit: stale-spec, widget-card, widget.tier_tree, Orchestrator single-page with 6 tabs, tier/session, `Plans/feature-list.md`, `/feature-list.md`, tier_id, `/session`, `/orchestrator`, `/task/subtask`, widget.current_task, widget.progress_bars, and Tiers are legacy c'
- Interaction policy binds concern state to escalation, blocked-owner to message routing, and stale or `/degraded` trust to notification suppression or qualification so stale/degraded trust never emits unqualified action messages.
- Stale projection fallback degrades from summary `/projection` surfaces to direct record-backed inspection; Ledger and direct record views are the trust anchor under degraded projection health, and only current `/generation-matched` direct records may support action.
- 'Reconciliation readiness is classified instead of treated as one undifferentiated blocker: still-structural gaps, spec-integrity failures, and plain reconciliation cleanup are separate `/owner` buckets for retargeting owner docs, stale consumers, and mirror/checklist followers.'
- '- Orchestrator surfaces use the projection states `current`, `refreshing`, `stale`, `degraded`, and `unavailable`.'
- '- `/weak-integration/freshness` is a concern-backed projection guard: `category = weak_integration` applies when an owner record, consumer projection, or corroborating source for a seam is missing, stale, degraded, or mutually inconsistent.'
- '- Freshness is buildable state: mutation-capable projections carry `projection_state`, `last_observed_at`, `source_event_ref`, and `revalidation_route`; `stale`, `degraded`, and `unavailable` disable mutation unless the owner surface performs current direct revalidation first.'
- '#### Temporal wait and stale-observation presentation'
- '- A scheduled workflow with no fresh observation displays a stale-observation or refresh-needed state, not `skipped/failed`, until the owner source reports a missed run or a configured overdue threshold is reached.'
- '- Run history and blocked cards expose publish-capable chains directly: build result, Docker publish result, `publish_result_id`, template repo status/id, follow-on event refs, deployment refs, and workload refs. Missing downstream links are shown as `missing-link` explanations with `not-attempted`,'
- '- Feature-complete blocked-state wiring uses domain payload schemas. SCM blocked payloads include `dirty_worktree` and `worktree_conflict`; Actions payloads include auth expired, missing scope, no GitHub remote, rate-limited, and environment waiting for review; Docker/Kubernetes payloads include run'
- '- Before Orchestrator resumes a Debug investigation, it revalidates the linked `dev_session_id`, `browser_session_id`, DAP session identity, and remote authority against the stored route and runtime identity. If any linked identity is stale but recoverable, the run stays in `attention_required` with'
- '- `weak_integration` is the concern category for owner/consumer seams whose live owner record, consumer projection, or corroborating evidence is absent, stale, degraded, or inconsistent; it does not create a separate warning family outside the concern lifecycle.'
- '- Weak-integration concern taxonomy uses the canonical enum `wiring | workflow | state | gui | design`. `wiring` covers missing command, route, event, or handler joins; `workflow` covers broken or under-specified multi-step execution paths; `state` covers stale, degraded, or contradictory owner/proj'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Owner-first canonicalization order'
- '### Coverage blocker concern lifecycle owner section'
- '### Concern owner vs creator vs resolver separation'
- '### Blocked-owner eight-kind taxonomy and escalation ladder surfaces'
- '## 1. Scope and canonical model'
- The /page-shell is a six-tab single-page surface. Node Graph Display remains a native Orchestrator view over `Plans/Orchestrator_Page.md`, `Plans/orchestrator-subagent-integration.md`, `/Orchestrator_Page.md`, and `/orchestrator-subagent-integration.md`; the tab set includes Tiers, History, Progress
- Concern state rows preserve `/user`, `/governance`, active, resolved, dismissed, and acknowledged as canonical state and ownership context.
- 'Promotion-gate visibility is canonical Orchestrator data: lane_to_package, package_to_seam_available, seam_complete, package-level, package-overseer, `/review`, `/runtime`, `/remediation`, `/critical`, seam-consumable, and GUI readiness must be visible as separate gate facts rather than collapsed in'
- Live page field naming may expose live-status labels, but live-status remains bound to canonical `/storage` and runtime contracts instead of page-local authority.
- Orchestrator ownership is limited to page layout and controls, view-model/projections, and run control intents; canonical runtime enums, event semantics, and scheduler truth remain owned by runtime, storage, and scheduler contracts instead of page-local prose.
- Dense blocked-owner views preserve `Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `/aging`, blocked-owner, `/switch`, dense-tab, saved-view, sort-default, and historical-mode behavior as explicit display and filtering rules.
- 'Worktree/source-control authority is rewrite-native: `/source-control`, `/worktree`, under-owned emitters, blocked worktree reasons, lane/worktree binding, Source Control state, and Orchestrator receipt lineage must identify one canonical owner for current state while preserving historical lineage.'
- 'Search results carry canonical route targets rather than highlight-only matches: focused_run_id, destination tab, selected object id, optional filter payload, optional inspector `/detail`, and detail target must be reconstructable from the result.'
- Concern is a high-level first-class Orchestrator object. The lifecycle includes active, acknowledged, resolved, and dismissed; runtime, package overseer, seam overseer, corroboration outcome, and graph patch logic may create canonical concerns, while workers nominate concerns rather than minting can
- Interaction policy binds concern state to escalation, blocked-owner to message routing, and stale or `/degraded` trust to notification suppression or qualification so stale/degraded trust never emits unqualified action messages.
- Blocked-owner summaries identify the primary blocked owner or attention owner instead of only saying blocked; canonical examples include Run, Concern, Source Control, GitHub, Auth, Usage pressure, Wizard, and Recovery.
- 'Trust-qualified routing distinguishes strong canonical inputs from projection-derived warnings: canonical blocked episodes, approval waits, persisted thread states, and `/wizard` states may drive strong routing, while projection-derived rows must carry trust qualification.'
- 'Worktree legacy compatibility is explicit: `WorktreeGitImprovement.md`, `/tier`, `/node`, tier_id, `/storage`, `/package`, `/worktree`, get_tier_worktree, get_tier_worktree(tier_id), owner run/tier, tier-keyed, tier-based branch/worktree naming, and `Progress, Tiers, History, and Node Graph` labels '
- 'The concern action-model keeps user-facing GUI actions narrow: open, focus, open evidence, open history, open ledger, acknowledge, dismiss where allowed, open resolution thread, and approve/reject only for true `/HITL` boundaries; runtime `/overseer` actions remain non-generic and cover request corr'
- 'Tier authority is compatibility state only: tiers may remain first-class in widgets, breadcrumbs, HITL boundaries, and state displays, but `/package/seam`, node, package, seam, and lane authority determine canonical execution input.'
- 'Escalation examples preserve owner-specific routing: User may receive `/chat`, `/Progress` CtA, Dashboard CtA, or system notification; Package Overseer, Seam Overseer, and Corroboration use operational surfaces first; Runtime, Recovery, and Graph Patch often route to `/History/Node` and Progress/His'
- Concern notification alignment preserves acknowledged as reminder-noise reduction, active plus execution impact as escalation input, and dismissed as presentation suppression without clearing canonical blocked episodes that remain active.
owner_hints:
- Plans/Orchestrator_Page.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

