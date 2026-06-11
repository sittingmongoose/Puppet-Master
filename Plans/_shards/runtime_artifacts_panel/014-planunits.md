# Shard 014: PlanUnits

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L403-L544

Source SHA256: `61408fdc7b9377e56d2d9a36661d6e8d5650ce40e634d9c10b5c95cc85dfa094`

---

## PlanUnits

### RAP-001 - Runtime Artifacts Panel — SSOT Source-Preserving PlanUnit

```yaml
plan_unit_id: RAP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Plans/Runtime_Artifacts_Panel.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Runtime_Artifacts_Panel-S0031
preserved_exact_tokens:
- Runtime Artifacts Panel — SSOT
- Canonical owner-section requirements
- Export taxonomy and manifest contract
- Bridge-field precedence for attempt/provider/usage/receipt joins
- Artifacts index exact indexed fields
- Artifact envelope routing preference
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md'
- 1. Purpose and scope
- 'ContractRef: Plans/Project_Output_Artifacts.md#Runtime Artifacts (GUI panel) — distinct from this document, Plans/storage-plan.md#Required redb keys'
- '3. Mechanism: one event type per artifact type'
- 4. redb key and projector
- 4A Artifacts index families and projector checkpoints
- Acceptance carry-through
- 4B Runtime-artifact envelope and attribution packet
- Route-state and shell-state boundary
- P5 runtime-artifact identity recovery requirements
- 4C Runtime-artifact retention, stream-view, and audit boundaries
- 5A. Debug investigation grouping, manifests, and exports
- Debug investigation bundle manifest contract
- 5B Export taxonomy and manifests
- 5C External provider-native artifacts
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/assistant-chat-design.md'
- 6. reasoning_tokens and cost_usage
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
negative_constraints:
- workspace-tab selection, panel docking, and per-project layout restore are `shell-state` concerns layered underneath canonical routing. Shell-state may choose the destination tab, dock zone, or restored layout after route resolution, but it must not replace object identity or make the route model sw
- Receipt-like exports and manifest-backed bundles preserve canonical run/thread/attempt linkage and must not mint shadow IDs. Usage-linked artifacts continue to route through canonical usage identity rather than artifact-local usage models.
- '- Source Control artifact rows and tabs stay `information-dense` but selective: the panel MUST NOT assume package, `/lane/run/worktree`, receipt, and artifact metadata can all be shown at full fidelity at once; it shows canonical anchors, trust state, and drill targets first.'
- '- Runtime artifact `/import` and `/evidence` export language MUST NOT be UI-`view-centric`; import/export records preserve artifact identity, evidence class, source refs, route refs, and owner lineage before describing the current view filter.'
- '- Attempt `/safe-point/remediation` artifact opens remain stable across cleanup, `/archive/remove`, retention, and bundle moves; runtime artifacts must not be forced through fake repo paths to survive those flows.'
- '- `non-trivial` bundle exports require manifests that preserve canonical `IDs` and `/refs`; manifests MUST NOT mint `export-local` surrogate identities that hide the source artifact, evidence, usage, run, attempt, or receipt identity.'
- '`usage_event_ref` is a locator-grade usage bridge on runtime artifacts. It is stable for the lifetime of the referenced Usage/Ledger record, scoped to the canonical project/run or account-backed usage record, and present whenever the artifact is cost-bearing or can pivot to Usage/Ledger history. Run'
- Temporary instrumentation artifacts declare `instrumentation_id`, `collector_state` (`collector-state` in audit vocabulary), install/collect/remove lifecycle state, evidence sink, cleanup or rollback state, and owning Debug investigation refs. Debug instrumentation MUST NOT outlive its declared clea
- '- external/provider-native artifacts remain inspectable and linkable, but PM must not present them as PM-owned instruction projections or generated runtime artifacts'
- 'The common envelope pins `artifact_id`, `artifact_type`, canonical IDs, `run_id`, `thread_id?`, `node_id?`, `attempt_id`, `provider_attempt_ref?`, `usage_event_ref?`, receipt refs, producer/actor refs, content refs, projection fields, and routing refs. Per-type schemas may add required fields for a '
- Project-summary `/freshness` disclosure is separate from underlying owner state. A project-summary card may show projector trust, freshness, or degraded projection health, but it must not imply that the source artifact, receipt, or runtime event is stale unless the owner record says so.
- '- Usage-linked artifacts consume frozen `effective_*` runtime snapshot fields and `usage-source-confidence` fields; Agent-Config and Health may display live current values beside the artifact, but they must not rename or rewrite the frozen schema carried by the usage/runtime record.'
compatibility_only_notes:
- Context-changing actions such as `Show in Usage`, `Open in Source Control`, `Resume Wizard`, and `View in Usage` from Orchestrator Ledger force a destination-context change. They normalize through route/open primitives first; historical/current `/current` usage navigation and `/open` actions use run
- '- `Show in Ledger` and `Show in Usage` prefer `usage_event_ref` plus receipt/attempt/node identity over timestamp heuristics, run-only filters, or tier-only filters. `tier_id` may remain derived display/grouping compatibility only; it is not the primary cross-surface key for usage correlation.'
- Minimum identity fields are `receipt_id`, `run_id`, optional `attempt_id`, `action_family`, and `action_name`. Legacy `tier_id` may appear only as derived display/grouping compatibility metadata; it is not a receipt key, approval correlation key, or usage join. Requested and `/effective` fields incl
stale_retired_dispositions:
- '- UI / projection / command contracts are still structurally incomplete and under-owned: - `FinalGUISpec.md` still has no true Orchestrator page section, still leaves `Tiers` as a standalone run-group view, and still lacks any native concern-model, historical-run-mode, or Progress-only widget-bounda'
- '- `Plans/Runtime_Artifacts_Panel.md` - still lacks attempt-level identity, producer attribution, trustworthy `cost_usage` linkage, and degraded/stale projector behavior.'
- 'Runtime artifacts consume these cross-cutting owner contracts without re-owning them: large-dataset scaling contracts, cross-surface filter persistence, canonical time-source precedence, Debug evidence budgets and redaction defaults, debug adapter model, stale/live data signaling, chat/file-tree dee'
- Project-summary `/freshness` disclosure is separate from underlying owner state. A project-summary card may show projector trust, freshness, or degraded projection health, but it must not imply that the source artifact, receipt, or runtime event is stale unless the owner record says so.
- '- Browser evidence does not revive stale browser source anchors as owners; stale lineage such as `Plans/newfeatures.md §15.18` and `/stale` belongs only in cleanup/cross-reference evidence that points back to the current browser owner set.'
owner_boundary_notes:
- '# Runtime Artifacts Panel — SSOT'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '| Family | Scope | SSOT | Persistence |'
- 'Canonical terms and values:'
- '- Runtime artifact lookup/indexing remains a projection concern rather than canonical artifact truth.'
- '**Canonical 19 artifact types and event type names:**'
- '- Make the artifact index rebuildable from canonical runtime evidence'
- '#### Route-state and shell-state boundary'
- 'Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when they get there." Artifact, receipt, usage, and export pivots resolve canonical IDs/refs and object identity first: `artifact_id`, `run_id`, `thread_id`, `node_id?`, `attempt_id`, `receipt_'
- workspace-tab selection, panel docking, and per-project layout restore are `shell-state` concerns layered underneath canonical routing. Shell-state may choose the destination tab, dock zone, or restored layout after route resolution, but it must not replace object identity or make the route model sw
- Context-changing actions such as `Show in Usage`, `Open in Source Control`, `Resume Wizard`, and `View in Usage` from Orchestrator Ledger force a destination-context change. They normalize through route/open primitives first; historical/current `/current` usage navigation and `/open` actions use run
- Receipt-like exports and manifest-backed bundles preserve canonical run/thread/attempt linkage and must not mint shadow IDs. Usage-linked artifacts continue to route through canonical usage identity rather than artifact-local usage models.
- '- Source Control artifact rows and tabs stay `information-dense` but selective: the panel MUST NOT assume package, `/lane/run/worktree`, receipt, and artifact metadata can all be shown at full fidelity at once; it shows canonical anchors, trust state, and drill targets first.'
- '- Runtime artifact `/import` and `/evidence` export language MUST NOT be UI-`view-centric`; import/export records preserve artifact identity, evidence class, source refs, route refs, and owner lineage before describing the current view filter.'
- '- `path-based` open remains for repo and `/workspace` files, while `identity-based` open is the canonical entrypoint for runtime artifacts, generated drafts, attempt `/evidence/safe-point/remediation` reports, and preview `/document` hybrids.'
- '- User-facing `/export` behavior is `identity-preserving`: output format, `/date-range`, filter state, and download location are export parameters, not export identity, and they never replace canonical artifact/run/thread/attempt refs.'
- '- `non-trivial` bundle exports require manifests that preserve canonical `IDs` and `/refs`; manifests MUST NOT mint `export-local` surrogate identities that hide the source artifact, evidence, usage, run, attempt, or receipt identity.'
- '- UI / projection / command contracts are still structurally incomplete and under-owned: - `FinalGUISpec.md` still has no true Orchestrator page section, still leaves `Tiers` as a standalone run-group view, and still lacks any native concern-model, historical-run-mode, or Progress-only widget-bounda'
- '- exact_items: - `Plans/interview-subagent-integration.md` does contain `### Runtime identity visibility`, but its required fields still stop at `requested_account_binding` / `operational_identity` and do not carry `requested_account_policy` or `tool_use_id`. - `Plans/assistant-chat-design.md` alrea'
- '- Add the missing canonical record/projection families to `storage-plan.md` for worktree lifecycle and artifact index state before downstream docs keep inventing them implicitly.'
- '- The clearest missing family is the runtime-artifact index side: - `Runtime_Artifacts_Panel.md` declares `artifacts_index:v1:{project_id}` - declares a projector from `runtime_artifact.*` events - declares envelope and per-type schema files - `storage-plan.md` still does not clearly register that a'
- '- `Plans/Contracts_V0.md` + `Plans/storage-plan.md` - likely owners for canonical correlation blocks, switch/pressure episodes, and blocked/approval identity linkage'
- '- `Plans/usage-feature.md` is still one of the main correlation drifts: - `usage.jsonl` and canonical usage discussion still center `tier_id` - canonical `UsageRecord` still requires `tier_id` - Run Graph and Orchestrator are still said to aggregate by `tier_id` and `attempt_id?` - later navigation '
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

