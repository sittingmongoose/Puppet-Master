# Shard 035: Platform capability consumer roles and frozen-context use

Source: `Plans/newtools.md`

Source lines: L9019-L9097

Source SHA256: `90599f6ac6bafc103f57e3f2f7b742b29d99a2bb4468b52e09f86db33cf35dad`

---

## Platform capability consumer roles and frozen-context use

The existing `config, runner, UI, diagnostics` consumers of `platform.capability_evaluated` are not four new event projectors. Their event-bearing inspection uses exactly `storage.platform_capability_decision.read.v1` and its unchanged four-field `read_request` from `Plans/platform_capability_decision_contracts.schema.json`: actual Storage instance, exact scope, evaluation ID and original event ID. It returns the existing original decision and complete current source/read-through evidence with `action_authority=none`. SP-290's current generic source, selected event, original Storage assignments, original v2 full-value/first receipt and final disclosure guards all remain mandatory. No configuration write, provider capability installation, feature enablement, reevaluation, probe, Doctor-health assertion or execution follows from that reader. Non-mutating config/runner inspection and UI/diagnostics presentation use the same role; their projection is transient and they own no family checkpoint or durable event-replay effect.

Original run-context consumption is a separate owner boundary. PlatformCapabilityManager's actual `platform.capability_evaluation.v1` supplies the immutable original evaluation; SP-290's actual capture reaches committed decision only after original event/first-receipt/full-value settlement. Executor's existing runtime identity resolver owns the immutable `pm.requested_effective_runtime@1.0.0` publication and later activation/start barrier. Orchestrator supplies its actual original execution context; preserved `run/tier` source language does not add a retired tier engine or alter `execution_unit_context` fields. The event is canonical persistence of its particular evaluated capability; a historical observation cannot create a new request, freeze a new run or mutate configuration.

The internal per-evaluation composition `platform.capability_run_context.consume.v1@1.0.0` is explicitly defined under DL-045 by `Plans/platform_capability_consumer_contracts.schema.json`. `Plans/platform_capability_consumer_resources.json` binds its exact three local schema resources; this mapping permits no remote fallback and grants no installed consumer role. It consumes the exact existing read selector, original admitted `evaluation_request` and actual original runtime-identity snapshot candidate. Platform and the existing Executor source owner authenticate these actual objects independently; serialized input equality is necessary but cannot provide original acceptance. The consumer calls the unchanged SP-290 event-bearing reader and then joins its complete original committed decision to the actual original request/context and runtime identity under one final held boundary. Its output is the exact committed decision and the unchanged selected runtime snapshot reference, with no action authority or family checkpoint. It is not a new stored family, aggregate capability catalog, source provider or event-append route.

Required joins are exact actual Storage instance, scope/project, original request/context identity, the owner-resolved `run_ref` to runtime `run_id`, thread binding, original platform/provider/execution-class subject, evaluation identity, catalog selection and frozen producer meaning. A nonnull `tier_ref` must resolve to the actual original owner's declared context member; null remains null. Do not parse a run/tier string, current UI selection, account ID or timestamp into missing identity. The runtime `effective_platform` and provider/model context must agree through their actual original semantic owners; a display label or coincidentally equal string is not that proof. The result preserves requested/effective states, degradation reason and source precedence exactly. Existing required/preferred/gated-feature policy remains with the original runtime/capability owner; this result neither grants a feature nor authorizes a provider/tool action.

Before the actual runtime snapshot publication or any owned feature-gate use that depends on this evaluation, the original Executor/context owner rechecks complete selected snapshot bytes/ref/hash and all six independent owner joins, each actually required original Platform request/decision and its admitted frozen-context association, unchanged SP-290 source/read-through and installed original roles, and its current permission/Stop/intake/source/admission predicates after all helpers. No active aggregate Platform requirement-set writer or aggregate coverage claim is admitted by this composition. OSI-373 preserves run/tier snapshot language only as compatibility/source lineage; promotion requires an explicit owner contract under canonical runtime identity. If a consumer asserts complete aggregate Platform coverage, it must already have an independently admitted original context-owner requirement-set contract defining the complete enumeration and exact frozen context/snapshot association. Without that contract, the aggregate-dependent use is unavailable; an empty current catalog, zero returned events, one decision, matching reference strings or successful decisions cannot supply an empty or complete expected set. This conditional refusal does not require creation of a durable aggregate, expand an execution-context family, add an evaluation trigger or block existing runtime behavior that does not depend on aggregate Platform coverage. Publication/retry remains the existing original runtime owner's transaction and immutable identity/CAS contract, not an event-consumer transaction or copied passive proof. A later refusal preserves actual Platform event/receipt/decision effects and any earlier independently committed runtime state.

`capability_snapshot_ref` in the existing 34-field requested/effective runtime record and CV-311 provider/model reference envelope keeps Models_System's meaning. This contract cannot replace it with a Platform decision key, add Platform payload fields to that record, copy capability tables, or treat one Platform decision as the complete provider/model snapshot. `models_resolution_ref` and the other five owner joins remain exact. Each actual run-context reference to a Platform decision remains subject to the original owner's authentic frozen-reference inventory and DL-048; no caller reference string or this transient result creates a hold. No current complete original Platform context/reference-set schema is specified or activated here. A future owner-approved aggregate use would need its own exact original requirement selection, complete enumeration, frozen reference, lifetime and provider/consumer binding before adoption; those are conditional design obligations, not a current durable-family migration or a coverage gap to fill by inventing a writer. Models-owned references keep their current independent meaning.

Passive replay remains read-only. Reusing a frozen original run-context decision preserves the original request, decision and runtime identity; it cannot reevaluate under a newer catalog, silently switch effective state or create another snapshot/run. Current live action admission remains independent. SP-290 event-bearing reads are unavailable after required event body or original-value proof is gone and must not downgrade to committed receipt-only retry. An already admitted frozen runtime snapshot retains its own original owner semantics; its existence is not permission to reconstruct a deleted Platform row or missing source. The event, original decision, frozen runtime snapshot and underlying source facts retain their independently owned lifetimes and backups. The empty active catalog permits no production Platform evaluation/event or new snapshot acceptance that depends on such an evaluation; it does not prohibit unrelated existing runtime snapshot publication. The new composition requires actual installed original consumer and dependency resource bindings; existing RSC-017 role bits and schema validity do not install it, and no sixth Storage operation is inferred.

ContractRef: ContractName:Plans/newtools.md#N2-157, ContractName:Plans/storage-plan.md#SP-290, ContractName:Plans/orchestrator-subagent-integration.md#OSI-373, ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/Contracts_V0.md#requested-effective-runtime, ContractName:Plans/Contracts_V0.md#CV-311, ContractName:Plans/Models_System.md, ContractName:Plans/Release_Supply_Chain.md#RSC-017, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-048

### N2-157 - Platform Original Evaluation Decision Authority

```yaml
plan_unit_id: N2-157
unit_type: owner_boundary
status: accepted
owner_doc: Plans/newtools.md
canonical_text: >-
  PlatformCapabilityManager captures an actual original scoped evaluation, admitted catalog
  entry and independently authenticated source-owner facts through platform.capability_evaluation.v1.
  The Platform capability original decision authority contract preserves deterministic precedence,
  frozen producer input and original retry meaning. SP-290 owns physical custody and original
  append/full-value adoption. Doctor remains a router; Models and concrete capability owners
  retain source truth. The empty active catalog admits no production evaluation or event.
  Five installed operation roles separate fresh capture from authentic retained work;
  catalog lifecycle cannot substitute for package withdrawal or Storage cleanup.
gui_related: false
gui_classification_reason: Defines original evaluation authority and immutable decision meaning without specifying visual presentation.
depends_on: [N2-151, SP-290, DL-045, DL-048]
unblocks: []
acceptance_criteria:
  - Actual original owner-held request and application or project/run/tier/thread context establish identity and scope; caller fields, hashes and account choice cannot substitute.
  - Exact active revision and selected active entry admit execution class and source routes without introducing a whole-catalog perpetual archive.
  - Each source satisfies its original owner subject, kind, type, enumeration, verification, freshness and no-secrets rules; post-occurrence observations and conflicting revisions refuse.
  - Required/preferred/not_requested meanings, ordered evidence precedence, duplicate-source rejection and exact v2 payload remain unchanged.
  - All producer-controlled EventRecord input freezes before append; sequence and both Storage timestamps remain absent until original Storage assignment.
  - Changed requests at one scoped evaluation key refuse; historical custody never reruns evaluation or claims current installation or health.
  - Lawful original source disposal leaves authentic minimal decision custody under DL-048, without retaining raw source bodies or extending their owner policies.
  - Empty active catalog keeps production admission closed; prospective-only fixture identities never enter the catalog or become new triggers.
  - Retained committed-receipt retry follows SP-290 without fresh coverage, action authority, retention extension or fallback after decision-row deletion.
  - Five installed roles use RSC-017 original package currentness and SP-290 retained obligations; declaration alone grants no source, permission or cleanup authority.
  - Config/runner inspection and UI/diagnostics use unchanged SP-290 event-bearing passive read; no read result installs capabilities, mutates config or creates a family checkpoint.
  - The explicitly versioned per-evaluation run-context consumer joins authentic committed decision, actual original request/context and unchanged runtime snapshot under final native owner guards; no provider/model ref substitution or incomplete required-set claim is permitted.
  - Catalog supersession/deprecation/retirement neither rewrites admitted decisions nor withdraws readers, starts retention or admits inactive entries.
validation_surfaces:
  - Plans/platform_package_support_map.schema.json
  - reports/event-authority-20260911/step-08-platform-withdrawal-validation.md
  - Plans/platform_capability_catalog.json
  - Plans/platform_capability_catalog.schema.json
  - Plans/event_payload_platform_capability_evaluated.schema.json
  - Plans/platform_capability_decision_contracts.schema.json
  - Plans/platform_capability_consumer_contracts.schema.json
  - Plans/platform_capability_consumer_resources.json
  - reports/event-authority-20260911/step-08-platform-custody-validation.md
risk_class: fabricated_original_platform_decision_or_scope_authority
reasoning_tier: high
context_scope: original_platform_capability_evaluation
implementation_surfaces: [Plans/newtools.md, Plans/Models_System.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: original_platform_decision_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/event-authority-20260911/step-08-platform-custody-validation.md
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-048
negative_constraints:
  - Do not populate the catalog, invent capability identity or triggers, change event scope or payload, or add Doctor source or mutation authority.
  - Do not retain raw probe/provider/account content or reevaluate a historical decision from current catalog or installation state.
  - Do not claim native execution, production positive admission, complete event depth, readiness or governance clearance from static model and schema evidence.
owner_hints: [Plans/newtools.md, Plans/Models_System.md, Plans/orchestrator-subagent-integration.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/newtools.md#N2-157, ContractName:Plans/storage-plan.md#SP-290, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Models_System.md, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-048, ContractName:Plans/platform_capability_catalog.json, ContractName:Plans/event_payload_platform_capability_evaluated.schema.json, ContractName:Plans/platform_capability_decision_contracts.schema.json
