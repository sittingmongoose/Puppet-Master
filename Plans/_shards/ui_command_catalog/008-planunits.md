# Shard 008: PlanUnits

Source: `Plans/UI_Command_Catalog.md`

Source lines: L1213-L1424

Source SHA256: `ad58b1dca161fb370311eca7ca7375897f23379170f0dfd4884b0dd6dfe9ac0d`

---

## PlanUnits

### UCC-001 - UI Command Catalog (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: UCC-001
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Plans/UI_Command_Catalog.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:UI_Command_Catalog-S0052
preserved_exact_tokens:
- UI Command Catalog (Canonical)
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Canonical route payload
- 0. Scope
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
- 1. Naming rules
- 2. Canonical command IDs
- 2.0A Promoted Section 15 command families
- 2.0 Command entry contract (doc-level)
- 2.0B Action-surface policy
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md'
- Canonical route payload and route/open tail rules
- 'ContractRef: Primitive:RouteTarget, Primitive:OpenSubject, Primitive:ExecutionContext, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md'
- Command normalization model
- 'ContractRef: ContractName:Plans/Contracts_V0.md §route_target and OpenSubject, ContractName:Plans/FileSafe.md'
- Tier-era compatibility retirement
- Stale command-family retirement guard
- Command-entry gap and owner-coverage guard
- 2.0.1 Acceptance hooks contract (wiring verification)
- 'ContractRef: ContractName:Plans/UI_Wiring_Rules.md, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010, Invariant:INV-011, Invariant:INV-012'
- 2.1 GitHub auth (GitHub HTTPS API only)
- '`cmd.github.connect`'
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, SchemaID:Spec_Lock.json#locked_decisions.auth_model'
negative_constraints:
- 'GUI labels for command IDs may clean casing or spacing, but this is cosmetic only: internal IDs remain stable and collision-safe, and label normalization must not destructively strip hyphens or other canonical command-id tokens.'
- Wiring/gate consumers read `command_kind`, normalization kind, and canonical target contract from catalog metadata; `/gate` checks must not infer those fields from handler names or row-local prose.
- Command metadata must not inline route payload shape, object kinds, or argument mapping rules; doing so duplicates the route contract and turns the catalog into a second routing schema.
- '- Route-shaped payloads carry `route_target`, `OpenSubject`, and `panel-context` identity for cross-surface focus. Pure shell/view-state commands may carry `/view-state`, `/switch_subview`, or selected-subview hints, but those hints are not primary navigation identity and must not be used as `/runti'
- '- Object-targeting payload semantics move out of `cmd.panel.switch`: it remains a side-panel shell/view command, and any context that becomes object-targeting must become a route-consuming wrapper command or normalized `route_target` argument. Do not promote a broad public `cmd.nav` / `cmd.nav.*` fa'
- '- Compact navigation aliases, if adopted, are limited to `cmd.nav.open_subject`, `cmd.nav.open_usage_subject`, and `cmd.nav.focus_route` or an equivalent compact family that normalizes to `route_target` and `OpenSubject`; they must not expand into a second catalog language.'
- Highest-risk stale-canon exact-token families must be handled explicitly rather than left as broad themes. `cmd.chat.delete_message` is not an active catalog command. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit
- '`Wiring_Matrix.schema.json` stays intentionally lean: row-local metadata may point to catalog and route/open contracts for normalization expectations, but it must not repeat route payload or command-normalization rules in every wiring row.'
- Legacy HITL and runtime-governance carry-through stays explicit. `HITLRequest`, `allowed_actions`, `allowed_actions[]`, and `approve_continue` are compatibility-only approval vocabulary once `cmd.runtime.*` and `blocked_sequence` own runtime recovery. Runtime governance must not leave `blocked_owner
- '`Run_Graph_View.md` / `Run_Graph_View` consumes `UI_Command_Catalog.md` / `UI_Command_Catalog` HITL args and recovery command namespaces from this catalog; graph-local specs must not mint conflicting HITL payloads or recovery IDs.'
- Thread search hits use `object_kind = message`, `object_id = <message_id>`, and `thread_id`; `object_kind`, `object_id`, and `message_id` must not be replaced by page-local search result identifiers.
- Route validation normalizes legacy `/special-case` IDs before dispatch; `family-specific` IDs that are unique only within run scope must not become ad hoc `top-level` route fields.
- The catalog must not teach consumers how to persist approval state. Approval persistence belongs to blocked-state and storage owners, while old request-era sections are compatibility lineage only so they do not recreate storage and command drift.
- Operational-identity displays for GitHub, `/registry/Kubernetes`, and similar external contexts must not overload `/account` provider fields or become one-off surface widgets; they route through normalized `operational_identity` evidence.
- Orchestrator shell-view commands for top-level, full-page, run-scoped surfaces such as `/history/evidence`, Ledger, and graph views bind to upstream data-source owners and must not mint local compatibility fields.
- Run Graph and page-ownership conflicts are resolved toward runtime and route primitives. `/action-gating`, `command-arg`, graph-local, page-ownership, template-level, runtime-minimum, `/events/tool`, `/token`, runtime-native, waiting_approval, `cmd.graph`, and `cmd.graph.*` consumers must not create
- Widget and shell-navigation consumers remain route-aware. `widget.tier_tree`, `widget.progress_bars`, load-bearing widget catalog entries, `/Task/Subtask`, `/seam/lane-aware`, `cmd.panel.switch`, and `panel_id` are compatibility or shell-view selectors unless they resolve through a concrete route/op
- 'GitHub recovery binding note: `cmd.github.connect` remains arg-less only for a fresh device-code start locked by Spec Lock. Deferred reconnect and recovery wrappers must not stay `arg-less`, `under-keyed`, or `split-brain`; a blocked `/node/thread/wizard` recovery context binds `project_id`, `auth_r'
- The accepted MVP surface breadth means the command catalog must not remain publish-centric or underdefined. Source Control command coverage includes navigation/history/graph/worktrees, `/history/graph/worktrees`, conflict graph pivots, `/conflict/graph`, and Git operations `/unstage/discard/diff/com
- '- Legacy underscore commands `cmd.github_actions.show`, `cmd.github_actions.switch_subview`, `cmd.github_actions.rerun_workflow`, `cmd.github_actions.cancel_workflow`, `cmd.github_actions.pin_workflow`, `cmd.github_actions.open_run_log`, and `cmd.github_actions.open_run_diff` are compatibility-only '
- The grouped command token `cmd.docker.compose.scenario.save/run/edit/delete` denotes the scenario command family; payloads use the concrete ids above. Legacy Docker rows normalize into canonical `cmd.docker.container.*`, `cmd.docker.compose.*`, `cmd.docker.bake.*`, or registry command families and M
- '- Manual prune/remove/reuse is forbidden while the worktree is `active` or `blocked_preserved` unless explicit override policy allows it and records the override.'
- '- `show-unsafe-actions` expert mode may reveal disabled choices but must not make them executable while active run, blocked, safe-point, or lineage gates fail.'
- '`Open Files` routes through the project-scope `cmd.git.worktree.open` command. Arbitrary Bind Existing remains outside the Assistant thread-worktree MVP and must not be exposed as `cmd.chat.worktree.bind_existing`.'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- '- Object-targeting payload semantics move out of `cmd.panel.switch`: it remains a side-panel shell/view command, and any context that becomes object-targeting must become a route-consuming wrapper command or normalized `route_target` argument. Do not promote a broad public `cmd.nav` / `cmd.nav.*` fa'
- '- Navigation compatibility is not a winner/loser or `/loser` alias table: legacy names can point to wrapper commands, but wrapper classification, route payload, and owner command IDs stay visible instead of hiding route ownership behind a preferred alias.'
- '### Tier-era compatibility retirement'
- '- Legacy event examples that use `run.started` or `usage.event` with `tier_id`, `run.tier_started`, `run.tier_completed`, `run.verification_result` keyed by `tier`, `hitl.approval_requested` with `request_id`, `tier_id`, `tier_type`, or `allowed_actions`, and tier-start validation `/persona/QA` exam'
- Highest-risk stale-canon exact-token families must be handled explicitly rather than left as broad themes. `cmd.chat.delete_message` is not an active catalog command. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit
- Legacy HITL and runtime-governance carry-through stays explicit. `HITLRequest`, `allowed_actions`, `allowed_actions[]`, and `approve_continue` are compatibility-only approval vocabulary once `cmd.runtime.*` and `blocked_sequence` own runtime recovery. Runtime governance must not leave `blocked_owner
- '`UI_Command_Catalog.md` / `UI_Command_Catalog` is the sole stable action owner for command `/template/example` references: every referenced command must exist as a catalog row, compatibility alias, or explicit retirement note before wiring gates trust it.'
- 'Tiers-tab widgets are compatibility-only: `widget.tier_tree` renders a Phase/Task/Subtask tree and `widget.progress_bars` renders phase-scoped bars, but neither becomes the package `/Task/Subtask` or `/seam/lane` command model.'
- Route validation normalizes legacy `/special-case` IDs before dispatch; `family-specific` IDs that are unique only within run scope must not become ad hoc `top-level` route fields.
- Older tier `/HITL` `request-era` tables require an explicit `compatibility-label` and cannot stand as live canon beside runtime `cmd.runtime.*` sections.
- The catalog must not teach consumers how to persist approval state. Approval persistence belongs to blocked-state and storage owners, while old request-era sections are compatibility lineage only so they do not recreate storage and command drift.
- Object-first blocked and runtime routes use `run_id + node_id + attempt_id? + blocked_sequence?` as the identity tuple where needed; `tier_id` is compatibility/display grouping and not canonical route identity.
- Orchestrator shell-view commands for top-level, full-page, run-scoped surfaces such as `/history/evidence`, Ledger, and graph views bind to upstream data-source owners and must not mint local compatibility fields.
- Command-system backfill must resolve ghost IDs and stale command-state claims without creating a second command system. `/wiring`, `/superseded`, command-state, command-system, `/fix`, `/mode`, `/HITL`, `/compact`, override_builtin, `cmd.chat.run_user_command`, and `cmd.chat.branch_from_restore` mus
- Widget and shell-navigation consumers remain route-aware. `widget.tier_tree`, `widget.progress_bars`, load-bearing widget catalog entries, `/Task/Subtask`, `/seam/lane-aware`, `cmd.panel.switch`, and `panel_id` are compatibility or shell-view selectors unless they resolve through a concrete route/op
- '- The `cmd.orchestrator.open_*` pivots above are compatibility aliases for owner-surface route opens; runtime mutation recovery still maps through `allowed_action_ids[]` to `cmd.runtime.*`, including `restore_safe_point_then_retry`.'
- '- Legacy cross-surface pivot names `cmd.orchestrator.open_in_github_actions` and `cmd.orchestrator.open_in_docker_manager` are compatibility aliases for `cmd.orchestrator.open_github_actions` and `cmd.orchestrator.open_docker_manager`. They remain `navigation_wrapper` commands and normalize through '
- '- GitHub Actions uses the `cmd.github.actions` namespace family. `cmd.github.actions.*` includes rerun, cancel, pin, unpin, settings CRUD, current-branch pivots, and log drilldown; existing `cmd.actions.*` rows are compatibility aliases until migrated.'
- '- `cmd.docker.k8s` owns Kubernetes commands exposed inside Docker Manager. Existing `cmd.k8s.*` rows are compatibility aliases unless the catalog updates them to the `cmd.docker.k8s.*` namespace.'
- The accepted MVP surface breadth means the command catalog must not remain publish-centric or underdefined. Source Control command coverage includes navigation/history/graph/worktrees, `/history/graph/worktrees`, conflict graph pivots, `/conflict/graph`, and Git operations `/unstage/discard/diff/com
- '| `cmd.source_control.review.open` | Open Review Mode | Compatibility alias for `cmd.source_control.open_review` | `git_available && compare_target_resolvable` |'
- '| `cmd.source_control.graph.focus/filter/layout` | Graph Focus/Filter/Layout | Compatibility alias family for graph focus, filter, and layout commands | `source_control_graph_visible` |'
stale_retired_dispositions:
- '- Mutating `domain_action` commands MUST apply the catalog-wide projection-freshness gating clause before dispatch: the source projection freshness/health must be current for the selected project, repo, worktree, run, workflow, container, or Kubernetes scope. Stale, missing, or degraded projection h'
- '- field-placement for UI command records is frozen at the command wrapper: command routing fields stay here, while provider/runtime identity and `/runtime` resolution fields stay in the runtime/provider owner contracts instead of being reintroduced by stale planning docs.'
- '### Stale command-family retirement guard'
- Highest-risk stale-canon exact-token families must be handled explicitly rather than left as broad themes. `cmd.chat.delete_message` is not an active catalog command. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit
- 'Audit-survivor command gaps stay owner-scoped instead of becoming local proof of readiness: duplicate numbering and `ContractRef` failures remain owner-doc issues, unresolved command `IDs` and `promoted-shell` persistence contradictions remain catalog/wiring obligations, and mixed `execution-era` ca'
- 'Canon-breaking owner defects stay visible until repaired: missing anchors, stale section references, unresolved command IDs, `/packaging` authority splits, and `naming-rule` claims without backing canon are command-readiness blockers, not summary cleanup.'
- 'Uncataloged owner signals from `newtools.md`, assistant memory, and project-switch handoffs stay concrete registration obligations until resolved: `cmd.orchestrator.preview_`, `cmd.orchestrator.preview_*`, `cmd.orchestrator.push_image`, `/build/open-artifact`, `CustomHeadlessTool`, `ToolID`, `GATE`,'
- 'Wiring and index backfill must keep extraction hazards visible: `/deprecated-ID`, `owner-doc-to-catalog`, `Wiring_Matrix.schema.json`, `cmd.*.json`, `non-catalog`, `filename-shaped`, `schema.json`, `under-describes`, `plans-index`, `00-plans-index.md`, `rewrite-critical`, and `workspace-tab` are not'
- Usage and artifact summary drift is handled as a consumer/owner gap, not as a command payload shape. `gap-008`, `result_id`, `account-history`, `over-summarized`, `projection-health`, `missing_data_shape`, `restore points`, `TierContext`, `tier_id`, `detached_window`, `artifact_kind`, `task_id`, `to
- Command rows carry wrapper-vs-alias classification in metadata rather than only in prose or `/tables`, so wrappers, deprecated aliases, and canonical command IDs remain machine-verifiable.
- Source-lineage packet names and process inventory files remain noncanonical, not live command payloads. `exact_items`, `meta.json`, `pm.work_item_meta.v2`, `current_state`, `current_state.md`, `canon_inventory`, `canon_inventory.json`, `open_gaps`, `open_gaps.json`, `next_required_stage`, and `Audit
- Command-system backfill must resolve ghost IDs and stale command-state claims without creating a second command system. `/wiring`, `/superseded`, command-state, command-system, `/fix`, `/mode`, `/HITL`, `/compact`, override_builtin, `cmd.chat.run_user_command`, and `cmd.chat.branch_from_restore` mus
- '- `/disabled` states must explain missing git, missing compare target, `stale-target`, absent conflict files, unavailable merge editor, or policy-restricted mutation rather than silently hiding the command.'
- 'Docker Manager and `/Kubernetes` command availability copy uses the shared disabled-state taxonomy from the containers and worktree owner docs: `Unsupported`, `Not configured`, `Unauthorized`, `Unreachable`, `Degraded`, and `Partial capability`. UI command rows surface those canonical `/UX-state` re'
- '| `cmd.git.worktree.list` | List Worktrees | Shows all worktrees for current repo, including stale/blocked ownership projection state | `git_available` |'
- '| `cmd.git.worktree.prune` | Prune Worktree | Prunes eligible stale worktree metadata after active-run, blocked, safe-point, and lineage gates pass | `git_available && worktree_selected && prune_policy_allows && lineage_gate_passed` |'
- '- Safe worktree action commands carry enough `repo_id`, `worktree_id`, optional `safe_point_id`, lane/run/package refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session safety.'
- '- This `Plans/UI_Command_Catalog.md` browser section is canonical and packetizable only when consumers reference concrete `cmd.browser.*` command IDs, payloads, and emitted events from this catalog plus the behavior owner in `Plans/Section15_MVP_Promoted_Features_Spec.md`, rather than stale aggregat'
- '- deprecated aliases shown distinctly from active commands'
- 'Canonical recovery commands use one shared namespace: `cmd.runtime.*`. Legacy recovery command namespaces are deprecated aliases only.'
- '- normalization metadata must survive for wrappers and deprecated aliases'
owner_boundary_notes:
- '# UI Command Catalog (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Canonical route payload'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- UI COMMAND SSOT
- This file is the SSOT list of stable UI command IDs.
- 'GUI labels for command IDs may clean casing or spacing, but this is cosmetic only: internal IDs remain stable and collision-safe, and label normalization must not destructively strip hyphens or other canonical command-id tokens.'
- '## 2. Canonical command IDs'
- Wiring/gate consumers read `command_kind`, normalization kind, and canonical target contract from catalog metadata; `/gate` checks must not infer those fields from handler names or row-local prose.
- Command-definition metadata belongs in the command catalog / command contract layer, the route schema remains owner of actual route-target structure, and wiring rows reference command IDs and handlers instead of restating the normalization model in full.
- '- `route_target` owns canonical open and focus identity.'
- '### Canonical route payload and route/open tail rules'
- '- field-placement for UI command records is frozen at the command wrapper: command routing fields stay here, while provider/runtime identity and `/runtime` resolution fields stay in the runtime/provider owner contracts instead of being reintroduced by stale planning docs.'
- '- Route `tab_id` is stable page-tab focus only; the Orchestrator tab family is the first canonical enum set for tab-focused command payloads.'
- '- Object-targeting payload semantics move out of `cmd.panel.switch`: it remains a side-panel shell/view command, and any context that becomes object-targeting must become a route-consuming wrapper command or normalized `route_target` argument. Do not promote a broad public `cmd.nav` / `cmd.nav.*` fa'
- '- Navigation compatibility is not a winner/loser or `/loser` alias table: legacy names can point to wrapper commands, but wrapper classification, route payload, and owner command IDs stay visible instead of hiding route ownership behind a preferred alias.'
- Highest-risk stale-canon exact-token families must be handled explicitly rather than left as broad themes. `cmd.chat.delete_message` is not an active catalog command. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit
- '### Command-entry gap and owner-coverage guard'
- Later-model command coverage must preserve `/projection-trust`, `/gating`, `MVP`, `GUI`, `IDs`, `later-model`, `promoted-feature`, `multi-project-tab`, `attention-center`, and runtime `cmd.runtime.*` ownership when a consumer doc claims command readiness. Runtime projections, promoted-feature comman
- 'Cross-doc command ownership gaps remain concrete until resolved: `FinalGUISpec.md` `§4.1` versus `§5.1` navigation contradictions, the already-known `Orchestrator_Page.md` `TOC` promises for `UICommand IDs`, `Wiring_Matrix.md` references to `cmd.orchestrator.switch_tab`, `Commands_System.md` / `assi'
- 'Audit-survivor command gaps stay owner-scoped instead of becoming local proof of readiness: duplicate numbering and `ContractRef` failures remain owner-doc issues, unresolved command `IDs` and `promoted-shell` persistence contradictions remain catalog/wiring obligations, and mixed `execution-era` ca'
- 'Command/wiring/template drift is gate-breaking, not editorial: `/wiring/template`, internal AC contradiction, uncataloged command `IDs`, stable action IDs, and `Plans/Commands_System.md` / `/Commands_System.md` references must resolve through catalog IDs, wiring rows, and owner-documented retirement'
owner_hints:
- Plans/UI_Command_Catalog.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

