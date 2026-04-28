# Run Graph View (Node Graph Display) -- Specification

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-032: Concern linkage to adjacent families
- Coverage rows: cov-032
- Fidelity gap refs: cov-032
- Required fidelity items:
- Exact required item: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact required item: Allow blocked episodes to reference concerns without replacing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-032: Concern linkage to adjacent families` exists in `Plans/Run_Graph_View.md`.
- Exact acceptance check: The `cov-032` repair states the exact requirement: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact acceptance check: The `cov-032` repair states the exact requirement: Allow blocked episodes to reference concerns without replacing concern identity
- Exact acceptance check: The `cov-032` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-038: Focused run and historical routing contract
- Coverage rows: cov-038
- Fidelity gap refs: cov-038
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-038: Focused run and historical routing contract` exists in `Plans/Run_Graph_View.md`.
- Exact acceptance check: The `cov-038` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-038` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-038` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

## 1. Scope and canonical role
Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.

Rules:
- graph nodes are runtime nodes, not tiers
- graph lineage spans generations when graph patching occurs
- blocked/recovery/promotion/corroboration state belongs in graph detail when it pertains to the selected node or related lineage object

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

## 2. Layout
The graph view has three primary regions:
- top header for run scope, generation scope, and trust state
- main graph canvas with minimap/search/overlays
- right-side inspector and table region

Rules:
- current generation is emphasized by default
- superseded and historical branches remain visible and clickable
- large-graph modes use virtualization, level-of-detail reduction, and lineage-focused defaults rather than hiding historical truth

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

## 3. Node detail inspector

#### Acceptance carry-through
- Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Allow blocked episodes to reference concerns without replacing concern identity

## 4. Data model and identity

#### Acceptance carry-through
- Use active_run_id/focused_run_id with focus_mode = live | historical
- Keep cross-tab deep links and search pivots coherent on the focused run
