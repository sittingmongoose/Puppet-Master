# Shard 008: PlanUnits

Source: `Plans/Run_Graph_View.md`

Source lines: L141-L242

Source SHA256: `88b59545c38655934469f01f9488055853e22aa4a0ce623f1eac7bf2dd351790`

---

## PlanUnits

### RGV-001 - Run Graph View (Node Graph Display) -- Specification Source-Preserving PlanUnit

```yaml
plan_unit_id: RGV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Plans/Run_Graph_View.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Run_Graph_View.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0011
preserved_exact_tokens:
- Run Graph View (Node Graph Display) -- Specification
- Canonical owner-section requirements
- Concern linkage to adjacent families
- Focused run and historical routing contract
- 1. Scope and canonical role
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md'
- P5 run-graph focus and identity recovery requirements
- 2. Layout
- 'ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 3. Node detail inspector
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md'
- Acceptance carry-through
- 4. Data model and identity
negative_constraints:
- '- One shared `/deep-link` routing payload preserves target context for search results, command-palette results, widget `drill-downs`, recovery links, and cross-surface pivots; search and command-palette navigation must not restore a watered-down approximation.'
- '- Evidence, terminal, usage, and output routing must not remain `tier-keyed` once attempts, blocked episodes, and graph generations are first-class routing objects.'
- '- Concern merge, `/split/supersession`, and supersession logic remain `discussion-only` until the concern identity/routing rules become `contract-level`; Run Graph may link candidate concern operations but must not invent canonical merge authority.'
- '- The graph `view-model` MUST NOT keep `hitl_request_id` as the durable action identity once the blocked/recovery model moves to `blocked-episode` identity; any legacy HITL field is compatibility lineage only.'
compatibility_only_notes:
- '- The graph `view-model` MUST NOT keep `hitl_request_id` as the durable action identity once the blocked/recovery model moves to `blocked-episode` identity; any legacy HITL field is compatibility lineage only.'
- '- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables'
- '- Remove `request_id` as the primary action target from graph command payloads. - Replace `hitl_request_id` in graph data requirements with blocked/runtime approval identity or explicit compatibility lineage-only fields.'
- '- `Run_Graph_View` treats `by-phase` grouping as a compatibility layout only; canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization so work packages and dependencies remain visible without collapsing into phase order.'
stale_retired_dispositions:
- '- `live-status` source tables in Run Graph and Orchestrator consume canonical runtime records and `/projections` first, then disclose stale/degraded projection trust before showing live claims.'
- '- Run Graph still has concrete command/routing contract drift: - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch) - graph-local recovery IDs still conflict with the canonical `allowed_action_ids[] -> cmd.runtime.*` model - cross-surface op'
- '- Likely good surface behavior: - `Progress`: show run-level trust banner or chip when projections are stale/degraded - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth - `Node Graph`: keep historical graph and current selections visible, but flag when live no'
- '- `Node Graph` - focused inspection may survive mild staleness - live status claims, blocked action buttons, and generation overlays should disclose trust state explicitly'
- '- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables'
- '- Replace stale `Tiers` tab/page assumptions with the rewrite tab model: - `Progress` - `Seams` - `Node Graph` - `Evidence` - `History` - `Ledger`'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '## 1. Scope and canonical role'
- Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.
- '- Concern merge, `/split/supersession`, and supersession logic remain `discussion-only` until the concern identity/routing rules become `contract-level`; Run Graph may link candidate concern operations but must not invent canonical merge authority.'
- '- `field-name` modernization is insufficient without canonical scope modernization: renamed graph fields must also retarget to run, node, attempt, blocked-episode, generation, lane, and artifact identity scopes.'
- '- `live-status` source tables in Run Graph and Orchestrator consume canonical runtime records and `/projections` first, then disclose stale/degraded projection trust before showing live claims.'
- '- Route/open auditing stays focused on refinement omissions, not `re-claiming` absence of primitives that already landed; `/open` checks verify payload fidelity, owner routing, and missing context only.'
- '- Run Graph still has concrete command/routing contract drift: - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch) - graph-local recovery IDs still conflict with the canonical `allowed_action_ids[] -> cmd.runtime.*` model - cross-surface op'
- '- Multi-account history and role scoping remain structurally under-modeled: - `Multi-Account.md` still has no durable `account.switched` / switch-episode family - `provider_accounts.run_snapshot` still stores only an opaque `policy_hash` rather than a queryable policy version/ref - no canonical role'
- '- Likely good surface behavior: - `Progress`: show run-level trust banner or chip when projections are stale/degraded - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth - `Node Graph`: keep historical graph and current selections visible, but flag when live no'
- '- `hard_gate` - approve/reject HITL boundaries - graph patch application when it changes canonical graph generation - remote-side-effect actions with explicit non-bypassable policy - any approval path whose allowed actions are defined by runtime blocked/HITL contracts rather than generic UI choice'
- '- But wizard/attention flows already use exact deep links via `resume_url`, and Usage/artifact surfaces already imply identity-native jumps using `usage_event_ref` and related canonical refs.'
- '- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables'
- '- Add a canonical role enumeration and apply it consistently to role-scoped account policies, Persona resolution, permission scoping, and provider dispatch.'
- '- Add `resolution_kind` and rationale requirements for dismiss/resolve paths. - Define how nominated findings become canonical concerns.'
- '- **Tiers are still productized even where node graph is supposed to be canonical.** GPT-5.4 repeatedly found `Tiers` as a primary tab, navigation target, widget namespace, and telemetry dimension.'
- '- graph patch - request patch may be `strong` - apply accepted patch should likely be `hard_gate` or runtime-controlled strong action because it changes canonical graph generation'
- '- `Run_Graph_View` treats `by-phase` grouping as a compatibility layout only; canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization so work packages and dependencies remain visible without collapsing into phase order.'
- 'SCM recovery and lineage actions in graph/node detail use exact command-catalog pivots: `cmd.orchestrator.open_receipt`, `cmd.orchestrator.compare_run_output`, `cmd.orchestrator.open_source_control`, `cmd.orchestrator.open_github_actions`, `cmd.orchestrator.open_docker_manager`, `cmd.orchestrator.op'
- '- Source Control `Graph` integration is a consumer projection of Source Control graph state, not a separate graph authority. When a run commit belongs to a known worktree or receipt, Run Graph links to Source Control graph focus; when graph parsing fails, it degrades to branch/history pivots with an'
owner_hints:
- Plans/Run_Graph_View.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

