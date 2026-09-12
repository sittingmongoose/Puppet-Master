# Shard 034: Platform capability original decision authority

Source: `Plans/newtools.md`

Source lines: L8998-L9075

Source SHA256: `2988c9a3676822dbf71608b17c126ec18000b21fc28cab1d41d017eedf626600`

---

## Platform capability original decision authority

Status: `STATICALLY_MATERIALIZED`; native execution and production capability admission remain unproved.

N2-157 defines the original semantic producer binding `platform.capability_evaluation.v1` under DL-045 and the approved DL-048 lifetime. SP-290 owns its physical capture, original append custody adoption, passive read, backup and reference-aware cleanup. The existing Platform capability catalog and evaluation contract remains authoritative; this extension creates no capability identity, evaluation trigger, event-family admission or visual presentation contract.

PlatformCapabilityManager owns original platform evaluation, deterministic evidence precedence and frozen decision meaning. `platform.capability_evaluation.v1` accepts only an actual owner-held original request and its independently authenticated original application or run context. Storage identity, evaluation identity, occurrence, producer, actor, correlation, exact context and request subject are retained; matching caller fields, hashes or reference strings are not authority. Project evaluations join the actual original project/run/tier/thread; application context uses the admitted application contract. Account selection cannot derive scope.

Authenticate the complete active catalog revision and exact selected active entry, its execution class and allowed source routes. Freeze the revision and selected entry; no whole-catalog perpetual archive is introduced. Models retains provider-policy truth, concrete capability owners retain discovery truth and PlatformCapabilityManager retains static baseline truth. Doctor supplies routing and presentation only. Each supplied source fact must independently satisfy the original source owner's subject, kind/type/owner, complete enumeration, verification, freshness and no-secrets contract. Its observation cannot postdate the original occurrence. An origin seal alone cannot admit a semantically invalid original source. No numerical freshness window is added. Conflicting original source revisions require refusal by the original source owner.

Preserve required/preferred/not_requested meanings and v2 payload. Required/preferred without valid evidence fails closed. Not requested carries no evidence and uses the canonical not_evaluated/null/none result. Choose live_runtime_discovery, provider_policy_snapshot, static_platform_baseline in that order; lower valid evidence remains provenance and cannot override. Reject duplicate same-source evidence. The active catalog is empty: all production admission attempts currently refuse, and no Platform event is emitted. `platform.fixture_prospective_only` exists only in isolated test inputs and must not enter the catalog or be described as a production capability or trigger.

Freeze all producer-controlled EventRecord input before append. Sequence, observed time and persisted time remain Storage-owned and are absent from that input. Use the original scoped evaluation identity for retry; a changed request at the same key refuses. Original source controls may later be lawfully disposed under their own owners once authentic minimal decision custody survives. Retained reads must not reacquire old request/probe/catalog controls, rerun evaluation or claim current installation/health.

Retained completion distinguishes an already committed original-receipt retry from pending-to-committed completion and event-bearing passive reads as specified by SP-290. Receipt-only retry has no action authority or fresh read-through coverage, never extends DL-048 retention, and cannot recover a deleted decision row from shared append custody.

PlatformCapabilityManager also owns the five independent installed operation meanings in RSC-017's exact embedded package map: new pending capture, retained pending completion, retained committed retry, retained decision/event read and backup/cleanup custody. Release supplies actual selected/running package and original currentness authority; Storage supplies SP-290's authentic retained obligations and original publication guards. A support declaration grants no evaluation, permission, healthy-installation assertion or cleanup authority. Capture closure prevents a fresh durable evaluation, including `not_requested`, while authentic exact retained retries are classified before fresh evaluation and keep their original decision. Their disposed catalog/probe/provider owners are not reacquired. Missing/deleted custody is not a retained request.

Catalog revision supersession and entry `active|deprecated|retired` state remain PlatformCapabilityManager's existing catalog lifecycle. They do not withdraw a codec, rewrite an admitted decision, start retention, authorize deletion or select a package. New capture still needs a current active revision/entry and actual original source admission. Retained work preserves its original accepted revision/entry and evidence. No deprecation schedule, replacement capability, evaluation trigger or inactive-entry exception is added. The catalog remains empty and admits no production event.


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
  - Catalog supersession/deprecation/retirement neither rewrites admitted decisions nor withdraws readers, starts retention or admits inactive entries.
validation_surfaces:
  - Plans/platform_package_support_map.schema.json
  - reports/event-authority-20260911/step-08-platform-withdrawal-validation.md
  - Plans/platform_capability_catalog.json
  - Plans/platform_capability_catalog.schema.json
  - Plans/event_payload_platform_capability_evaluated.schema.json
  - Plans/platform_capability_decision_contracts.schema.json
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
