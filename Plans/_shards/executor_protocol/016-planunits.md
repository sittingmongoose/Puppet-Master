# Shard 016: PlanUnits

Source: `Plans/Executor_Protocol.md`

Source lines: L839-L1061

Source SHA256: `dd8baa75efc6b7a6e6894113a8942868d8f390482f5f0ccef2f9e822a450806d`

---

## PlanUnits

### EP-001 - Overseer Protocol (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: EP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Plans/Executor_Protocol.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0067
preserved_exact_tokens:
- Overseer Protocol (Canonical)
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Identity and blocked-policy transfer cluster
- Coverage blocker provider/model precedence owner section
- Approval scope key and approver identity
- 0. Purpose and scope
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md'
- 1. Role definitions
- 1.1 Builder / node worker
- 1.2 Verifier / reviewer / corroborator
- 1.3 Package Overseer
- 1.4 Seam Overseer
- 1.5 Runtime scheduler
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 2. Deterministic readiness
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json'
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json'
- 'ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Executor_Protocol.md'
- 3. Canonical status lifecycle
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md'
- 4. Auto-marking rule
- 'ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json'
- 'ContractRef: ContractName:Plans/plan_graph.schema.json, ContractName:Plans/project_plan_node.schema.json'
negative_constraints:
- Overseer MUST NOT infer execution state from index metadata alone.
- '- User-project nodes MUST NOT invent ad-hoc schema-version key names.'
- 'UI/orchestrator labels such as `waiting_approval`, `needs_review`, `cancelled`, or `complete_with_warnings` are **run-local overlays / CTA states**, not canonical node `status` values in this protocol. Such overlays MUST be persisted as separate events or projections and MUST NOT replace the status '
- Manual mark-complete action MUST NOT be required for verified nodes.
- '- Worktree-aware projections must not assume one active-worktree or current-worktree scalar. File tree surfaces, artifact roots, `/worktree` displays, and safe-point payloads read active package-lane worktree sets, because rewrite-era surface ownership mixed with tier-era execution/worktree identity'
- '- `Progress` remains widget-composed, but default widget contracts must not reintroduce tier-era or `tier_id` ownership. `Plans/usage-feature.md` (`usage-feature.md`) is consumed only through run/node/attempt/package/lane usage identity when Executor receipts or progress projections need cost and us'
- '- Route payloads must not absorb filter or `/subview` noise and become surface-shaped again. Once Executor has the runtime contract, stale route examples are a consumer-doc sourcing problem, not a missing-runtime-contract problem.'
- A run MUST NOT be marked complete when any required Document Set audit (reconstruction/line accounting/idempotency, index-manifest match, clean-room determinism) fails.
- '- unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph'
- The executor's retry/classification consumer surface spans `### 7.1 Classified outcome matrix`, `### 7.2 Doom-loop guard`, `### 7.3 Signal handling and process lifecycle`, and `### Blocked and retry behavior`; together those anchors are the executor `/classification/lifecycle` projection and must no
- Safe points are runtime recovery anchors. They are not user-facing restore points and MUST NOT be conflated with thread rewind/rollback semantics.
- '- canonical graph execution MUST NOT silently flatten or otherwise degrade invalid canonical graphs'
- '- A `text-only` projection is not a fallback mode for required rich execution surfaces; the executor MUST NOT silently degrade required artifacts, tool outputs, or browser/web surfaces to text-only output.'
- The executor treats rich `/editor-agent` and `/workbench` surfaces as runtime peers of terminal, browser, document, and artifact callers. `/plugin-first` and command-first entry points, `/rules/skills` guided plans, multi-surface review loops, `/persisted` tabs and `/splits/windows`, and `/history/n
- Runtime context summarization should stay PM-native. The executor must not transplant a provider `_context_updates` protocol as-is; PM treats that protocol as a reference for incremental tool-result compression driven on every tool call, then emits its own context-detail and compaction updates so to
- '- Cursor-native managed instructions target `.cursor/rules/*.mdc` and the `.cursor/rules` tree; `.cursorrules` is legacy compatibility only and must not be the primary managed target. Compatibility outputs such as `AGENTS.md`, `CLAUDE.md`, root-level files, or provider-native projected copies are op'
- '- one decision path must not treat the same situation as both a failure class and a blocked-episode cause.'
- For MVP cleanup, the executor uses the canonical workspace or `/remote` project binding plus safe points, restore points, and explicit temporary-vs-durable mutation lineage. It must not require sandbox worktree `/jail` semantics for ordinary debug instrumentation cleanup.
- Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
- '- `startup_recovered` and startup-recovery handshakes restore the existing blocked-episode and `blocked_sequence` when one exists; recovery MUST NOT cause silent block-loss or accidental episode reminting.'
- After graph lock, execution MUST NOT fall back to a planning-artifact-centric, identity-blind, single-branch execution-model; DAE and orchestration paths preserve runtime identity plus `/corroboration/promotion/runtime` context.
- '- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.'
- '- Independent policy counters MUST NOT be inferred by subtracting from `attempt_count`.'
- '1. **Per-node sequential**: All events for a given `node_id` MUST be processed in emission order. The event bus MUST NOT reorder events within a single node''s event stream.'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '- Any surviving `tier` language is compatibility or derived-view vocabulary only. `Plans/human-in-the-loop.md` (`human-in-the-loop.md`) may remain a strong tier-era owner doc for approval UX, but `Plans/Executor_Protocol.md` (`Executor_Protocol.md`) owns this runtime seam and is already ahead of it;'
- '- Governance layering is graph-based rather than tier-based: older `Overseer` execution-role language is retained only as compatibility framing, while a `work package overseer` owns package-local delivery/readiness truth and a `same-feature-seam overseer` owns same-feature-seam integration truth acr'
- '- Runtime scheduling consumes package/seam/lane and sharded-node state from durable runtime records such as seglog/redb-backed projections; `active-agents`, `TierType`, `TierContext`, and `/seams` compatibility labels cannot define executor lane ownership or hardcoded subagent registries.'
- '- Background agent queues integrate with the Lane scheduler through package lane pools; snapshot consumers must resolve snapshot/safe-point ambiguity to `/safe-point/runtime` records, while `tier` / `subtask` queue labels remain compatibility lineage rather than package-lane ownership.'
- '- Event and widget projections translate `run.tier_`, `run.tier_*`, `tier_tree`, and `Tiers` into seam/worktree/package-native, `/worktree/package-native`, and `/package/lane-aware` runtime events; live-status consumers read canonical runtime records and projections, while `PuppetMasterEvent` and `P'
- '- Concern `/resolution` records are first-class runtime objects created by runtime, package overseer, seam overseer, corroboration outcome, graph patch, or graph `/state-transition` logic; workers may nominate findings, but `/escalate/downgrade` actions update concern state through the concern owner'
- When `verifier_result.outcome == "pass"` and the evidence bundle exists and validates, Overseer MUST first set node `status = "verified"`, then immediately transition to `status = "done"`.
- Stale local worker identity names such as `requested_persona_id`, `effective_persona_id`, `_persona_id`, and `/values` persona slots are compatibility inputs only; provider and model choices remain precedence inputs that must resolve into `execution_unit_context` identity fields before dispatch.
- '- dispatch, recovery, remediation, and inspection read one execution-unit packet rather than tier-era compatibility objects.'
- '- Runtime `/artifact` and tool drills carry attempt identity: `artifact_id`, attempt/`/receipt-based` refs, `tool_name`, invocation summary or `invocation_summary`, options, and `usage_event_ref` remain secondary detail refs under `execution_unit_context`; node-only or re-describing action contracts'
- '- Wizard, Builder, settings/GUI, and CUP pre-run handoffs carry requested/effective account identity, `/account/role` disclosure, actor/role, execution-role/`execution_role`, `/model` plus provider/model/persona policy, `/governance`, explicit `/isolation` and worktree mode, and `/package/seam` laun'
- '- Compatibility adapters may derive `decomposition_context` or `selection_context` for selector translation, but those objects are optional disclosure or planning views only; `execution_unit_context` remains the canonical object for dispatch, recovery, remediation, and runtime inspection.'
- '- The attempt-native handoff identity includes `run_id`, `node_id`, `attempt_id`, `scheduler_pass_id`, and lineage metadata before worker spawn. Those fields make resumed runtime inspection deterministic instead of reconstructing a partial handoff from tier-era compatibility objects.'
- '- Usage correlation follows `usage_event_ref` plus run/node/attempt/package/lane identity; tier-era usage correlation and `usage-event` shorthand are compatibility only.'
- '- Route pivots normalize `object_kind = worktree` plus `/seam/package/concern/promotion` subjects through `object_kind` route targets, not filter-shaped payloads; `resume_url` is transport compatibility, and blocked-thread messages resolve to shared route/runtime actions.'
- '- `Overseer` remains user-visible / doc-visible where this protocol title and legacy role framing require it, but `/runtime` worker copy prefers `overseer-spawned node worker`; `delegated worker` is a vague compatibility label, not the canonical execution actor name.'
- '- no consumer in this document may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.'
- Provider-transient retry evidence preserves the explicit `1s -> 2s -> 4s` sequence and the compatibility shorthand `/2s/4s`; retry counters are per-error after classification, not a shared global retry bucket. Doom-loop matching uses `(tool_name, args_hash, error_message)`, where `serialized_args_ha
- 'Storage and usage alignment consumes `### 2.4 Projector pipeline`, `## 3. Implementation checklist`, and `### 8.3 Startup and shutdown` from `Plans/storage-plan.md`, plus `### Canonical usage pipeline` from `Plans/usage-feature.md` (`/usage-feature.md`). Executor receipts carry `checkpoint-marker`, '
- 'Helper and background attempts remain first-class usage contributors: `/helper/background` lineage must be represented in the execution receipt and projected usage record instead of disappearing into generic background work. Prompt/context handoff preserves implementation-grade `/context` continuati'
- 'Lifecycle shutdown consumers treat shutdown as `/idempotent`: double shutdown is guarded with a Once/idempotent root and becomes a safe no-op rather than a second destructive lifecycle transition.'
- '- Cursor-native managed instructions target `.cursor/rules/*.mdc` and the `.cursor/rules` tree; `.cursorrules` is legacy compatibility only and must not be the primary managed target. Compatibility outputs such as `AGENTS.md`, `CLAUDE.md`, root-level files, or provider-native projected copies are op'
- '### Tier-era compatibility retirement'
stale_retired_dispositions:
- '- A seam is not reconciliation-ready while it lacks a canonical event/`/record` family or owner doc; when direction is already-set, `/reconciliation` work updates stale consumers to the owner contract instead of inventing replacement canon.'
- '- Cleanup `/reconciliation` moves stale `/tier` consumers to `/worktree/package/seam-aware` routing, `/effective/account/runtime` identity displays, canonical runtime actions, route payloads, and `/layout/help/glossary` terminology surfaces.'
- Stale local worker identity names such as `requested_persona_id`, `effective_persona_id`, `_persona_id`, and `/values` persona slots are compatibility inputs only; provider and model choices remain precedence inputs that must resolve into `execution_unit_context` identity fields before dispatch.
- '- Runtime safe points are recovery/audit anchors, not user-facing restore points; Assistant Chat blocked-state and `/runtime-identity` consumers must rely on `execution_unit_context`, `usage_event_ref`, and blocked records instead of stale closure verdicts.'
- '- A worktree-bound safe point is valid only while the referenced worktree identity is not contaminated and still matches the recorded fields; contamination or stale baseline must surface as a blocked/degraded recovery event.'
- '- Historical lineage must survive live worktree cleanup: run/package/node/lane references preserve `worktree_id`, worktree path, branch and HEAD snapshot, compare target or commit-range snapshot, and owning package/lane identity; when backing worktree is missing, consumers render `historical/retired'
- '- Wizard, Builder, settings/GUI, and CUP pre-run handoffs carry requested/effective account identity, `/account/role` disclosure, actor/role, execution-role/`execution_role`, `/model` plus provider/model/persona policy, `/governance`, explicit `/isolation` and worktree mode, and `/package/seam` laun'
- '- Route payloads must not absorb filter or `/subview` noise and become surface-shaped again. Once Executor has the runtime contract, stale route examples are a consumer-doc sourcing problem, not a missing-runtime-contract problem.'
- 'MCP tool inventory discovery around `listTools` is degraded, not unavailable: retry three times with 1s backoff, then use the last-known stale tool list until the five-minute periodic refresh succeeds. Failed discovery must never permanent-kill the executor, provider session, or run by itself.'
- Runtime context summarization should stay PM-native. The executor must not transplant a provider `_context_updates` protocol as-is; PM treats that protocol as a reference for incremental tool-result compression driven on every tool call, then emits its own context-detail and compaction updates so to
- '- HTE and DAE execution paths share graph-lock and write-scope safety: `/generation` staleness, under-owned `/degradation`, cleanup-remediation loops, FileSafe bypass, side-effect and remote side-effect uncertainty, safe-point/restore-point conflicts, and projection trust failures surface as blocked'
- '- The retired tier-era context object is a derived or compatibility-only selection/decomposition helper.'
- '- The retired tier-era context object and the retired tier-era identifier are not canonical runtime fields; execution_unit_context together with execution_unit_type defines authoritative runtime scope.'
- '- Worker spawn MUST mint or receive execution_unit_context before dispatch, and recovery plus remediation MUST rehydrate that same packet rather than reconstruct runtime scope from retired tier-era compatibility fields.'
- '- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.'
- '- Attempts, safe points, and blocked projections created under generation N become stale when generation increments to N+1.'
- '- Stale attempts remain queryable for audit but are never resumable.'
owner_boundary_notes:
- '# Overseer Protocol (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Coverage blocker provider/model precedence owner section'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- For user projects, canonical entrypoint and derived-export policy are defined in `Plans/Project_Output_Artifacts.md` (`.puppet-master/project/plan_graph/index.json` canonical; monolithic export is optional/non-canonical).
- The canonical owner of readiness, blocked state, transitions, retry budgets, wakeups, and dispatch.
- '- most node execution may be performed through overseer-spawned node workers, but runtime still owns canonical execution state'
- '- Executor is the runtime SSOT for attempt state across `/seam/lane/work-package` identity: no HTE-by-default mode is assumed, and HITL is represented as explicit blocked/approval boundaries rather than hidden scheduler behavior.'
- '- Any surviving `tier` language is compatibility or derived-view vocabulary only. `Plans/human-in-the-loop.md` (`human-in-the-loop.md`) may remain a strong tier-era owner doc for approval UX, but `Plans/Executor_Protocol.md` (`Executor_Protocol.md`) owns this runtime seam and is already ahead of it;'
- '- Governance layering is graph-based rather than tier-based: older `Overseer` execution-role language is retained only as compatibility framing, while a `work package overseer` owns package-local delivery/readiness truth and a `same-feature-seam overseer` owns same-feature-seam integration truth acr'
- '- The graph-canonical `/control` loop is not a single giant agent walking the whole graph; runtime-core pressure-testing preserves a dual-overseer model: package and seam overseers govern spawned workers through `/model`, `/review`, scheduler evidence, and explicit runtime control records.'
- '- Event and widget projections translate `run.tier_`, `run.tier_*`, `tier_tree`, and `Tiers` into seam/worktree/package-native, `/worktree/package-native`, and `/package/lane-aware` runtime events; live-status consumers read canonical runtime records and projections, while `PuppetMasterEvent` and `P'
- '- Concern `/resolution` records are first-class runtime objects created by runtime, package overseer, seam overseer, corroboration outcome, graph patch, or graph `/state-transition` logic; workers may nominate findings, but `/escalate/downgrade` actions update concern state through the concern owner'
- '- A seam is not reconciliation-ready while it lacks a canonical event/`/record` family or owner doc; when direction is already-set, `/reconciliation` work updates stale consumers to the owner contract instead of inventing replacement canon.'
- '- Cleanup `/reconciliation` moves stale `/tier` consumers to `/worktree/package/seam-aware` routing, `/effective/account/runtime` identity displays, canonical runtime actions, route payloads, and `/layout/help/glossary` terminology surfaces.'
- 'Overseer MUST read node execution state from the canonical node document:'
- '- Every `blockers[]` entry MUST resolve to an existing canonical node document.'
- '## 3. Canonical status lifecycle'
- 'UI/orchestrator labels such as `waiting_approval`, `needs_review`, `cancelled`, or `complete_with_warnings` are **run-local overlays / CTA states**, not canonical node `status` values in this protocol. Such overlays MUST be persisted as separate events or projections and MUST NOT replace the status '
- The canonical dispatch/runtime packet carries `execution_unit_context`.
- '| `run_id` | Canonical run identity for execution lineage. |'
- '| `node_id` | Canonical node identity for dispatch and receipts. |'
owner_hints:
- Plans/Executor_Protocol.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

