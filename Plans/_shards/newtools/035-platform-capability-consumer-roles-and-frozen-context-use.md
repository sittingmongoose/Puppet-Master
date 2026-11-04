# Shard 035: Platform capability consumer roles and frozen-context use

Source: `Plans/newtools.md`

Source lines: L9027-L9444

Source SHA256: `68d667b1dd489b9fbaa9329fa2199aac020fe6d11fd8b288837aeb08a96fe7b1`

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


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.


### N2-217 — doctor.custom_headless.checked 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-217",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "doctor.custom_headless.checked 1.0.0 \u2014 newly authored owner contract, prepared without admission.\nSearch: all top-level Plans/*.md, Plans/*.json and scripts/*.py at base be4766513f; exact-family matches are preserved in the DS15 external search evidence. Existing newtools section 12.6 (Doctor) or 14.1/14.3/14.4 (live) supplies behavior; no exact versioned producer/consumer/checkpoint/identity/withdrawal definition was found for doctor.custom_headless.checked. This family is explicitly inside DL-045's exact scope. No sibling definition is adopted.\nProducer: CheckRegistry Doctor custom-headless detection. Each actual Doctor invocation records exactly one detection outcome after config inspection. Valid registers CustomHeadlessTool; invalid warns and skips; absent skips cleanly. The event records the outcome, never authorizes an executable.\nScope and identity: project_only; resolve the actual Project before work, never fabricate a Run for Doctor. EventRecord.project_id equals payload.project_id; live payload.run_id equals the actual EventRecord.run_id. Stable original event_id is allocated once and retained with the frozen original payload. Idempotency key is sha256(canonical MessagePack array [\"doctor.custom_headless.checked\", \"1.0.0\", actual project_id, doctor_invocation_id]); the ordered tuple is unambiguous, never delimiter concatenation. Changed bytes at the same identity refuse. Browser optional fields are paired, require an ordinary actual BrowserSession, and never accept AuthBrowserSession.\nPayload: Plans/ds15_doctor_custom_headless_checked.schema.json is the exact closed 1.0.0 payload. Refs are opaque owner-resolved non-secret identifiers, never local absolute paths, credentials, executable arguments or raw content. For started, artifact_root/display_target name owner refs, not raw filesystem paths; session_id resolves the actual driver session (a PID alone is insufficient).\nOrdering and custody: explicitly adopt SP-286 / CV-339 and its full-value v2 successor, plus Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Validate current exact family admission, actual source/producer/codec, root/dedupe and migration custody before original work; registry absence fences it today. Freeze producer fields only after authentic outcome/body commit; append through the admitted single writer; retain the original first AppendReceipt and full frozen value under SP-286 before any success/terminal publication. Lost acknowledgement returns the original receipt, event_id and payload; recovery inspects original outcome custody and never repeats a launch, step, artifact creation or detection just to recreate history. Uncertain outcome stays fenced. SP-286 owns receipt storage; this family creates no separate canonical receipt family.\nReplay: event delivery and passive reads execute no external action; exact duplicates leave the index state unchanged. Actual original run/Doctor source custody plus canonical event/receipt is mandatory for retry, not a caller hash or present-day reconstruction.\nConsumer: reader.ds15.doctor_custom_headless_checked.v1@1.0.0, operating as Doctor detection outcome reader, reads only this exact admitted event type at 1.0.0. It adopts SP-278 by name and DL-076's nine-field durable token. Its checkpoint key is projector.checkpoint.ds15.doctor_custom_headless_checked:{project_id}, closed value Plans/ds15_doctor_custom_headless_checked_checkpoint.schema.json. It captures CURRENT-selected complete generic-index coverage, scans the entire selected sequence range with exact Project/type filter in canonical sequence order, then CASes the complete previous checkpoint and new value in one redb transaction. through_sequence_id is the last globally scanned sequence, last_event_id the last matching event. No checkpoint is created until a first matching event; gaps and filter-completeness failures refuse advance. The live redb_snapshot_id is rejoined for each read/advance/recovery and never persisted. Changed token, source, admission, access, deletion or installed reader at the final owner guard preserves the old checkpoint. Operating reads resolve original events from SP-278 rather than duplicate bodies into a new projection table. Rebuild uses a fresh complete captured source; missing retained prefix returns unavailable, never silent zero/reset or fabricated currentness.\nRedaction/custody: the actual Project original seglog/first-receipt owner holds original event bytes; source config, target, artifact and finalization bodies stay with their existing owners. Coherent backup/restore covers original log, receipts and the source closure; mandatory original custody missing or unverifiable fences retry and disclosure. The derived checkpoint is rebuildable from that authority and grants no access. Every read rechecks current Project/run/thread permissions and source deletion/tombstones before following any ref. Deleted or denied sources return unavailable without copying bodies into history. No raw probe/config, page, cookies, prompts, screenshot bytes, output or secret is stored in this payload.\nRetention: retention_policy_ref = PENDING_RETENTION_DECISION for this event AND its checkpoint. Case L-3 candidates are approval/receipt/audit authority (indefinite), Runtime/run/node/attempt (365 days after completion, only where an actual Run exists), ordinary telemetry (90 days); these are candidates, not assignments. No expiry/count eviction, source retention extension or deletion rule is authorized by this draft. Do not admit until RT resolves both assignments.\nCompatibility and withdrawal: only exact 1.0.0 readers/writers; reject unknown payload/value version before effect or checkpoint. No deployed predecessor or lazy alias migration is presumed. A version change requires independently reviewed schema/codec and owner migration. Withdrawal first fences new writer admissions at an actual committed source frontier under Storage coordinator exclusion; drain and retain already admitted original receipts, then fence reader/checkpoint advance at that frontier. In-flight old reader CAS fails after withdrawal. Preserve original records under their eventual policy; mark existing checkpoint withdrawn, never reset it as current. Reinstall requires current owner authorization and complete rebuild against a fresh SP-278 selection; old publication/permissions cannot authorize it.\nOracles: ATS-320 and scripts/pm-ds15-event-contracts.py exercise this exact closed payload and checkpoint identity. Native obligations: original-outcome/append crash boundaries, receipt loss, retry no-effect, complete filtered scan/CAS races, current authorization/deletion, backup/restore loss, forced-visible failure, and writer/reader withdrawal fences must be exercised independently before implementation claims. Native execution NOT_RUN; static fixtures prove no native behavior.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-217"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```


### N2-218 — tool.custom_headless.skipped 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-218",
  "unit_type": "contract",
  "status": "superseded",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "tool.custom_headless.skipped is STOPPED; DS15 withdraws its unsupported draft. DT owns the first-Doctor-run eligibility/reset/restore question at origin/plans/ea-w2-tools-gates-approvals-20261104:reports/event-authority-20261104/DT.md, Question for Jared. No DS15 producer, eligibility, identity, schema, checkpoint or prepared outcome is bound for this family. N2-066 remains the behavior source; no ruling is inferred. This unit id is retired from drafting and must not be reused.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "No DS15 draft remains; DT question stays unresolved."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-218"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```


### N2-219 — live.session.started 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-219",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "live.session.started 1.0.0 \u2014 newly authored owner contract, prepared without admission.\nSearch: all top-level Plans/*.md, Plans/*.json and scripts/*.py at base be4766513f; exact-family matches are preserved in the DS15 external search evidence. Existing newtools section 12.6 (Doctor) or 14.1/14.3/14.4 (live) supplies behavior; no exact versioned producer/consumer/checkpoint/identity/withdrawal definition was found for live.session.started. This family is explicitly inside DL-045's exact scope. No sibling definition is adopted.\nProducer: Unified live-visualization orchestrator launch hook. After successful target launch, record its actual target identity before reporting session start to chat. Do not emit on failed preflight or failed launch. An exact replay cannot launch a target again.\nScope and identity: project_only; resolve the actual Project before work, never fabricate a Run for Doctor. EventRecord.project_id equals payload.project_id; live payload.run_id equals the actual EventRecord.run_id. Stable original event_id is allocated once and retained with the frozen original payload. Idempotency key is sha256(canonical MessagePack array [\"live.session.started\", \"1.0.0\", actual project_id, live_session_id]); the ordered tuple is unambiguous, never delimiter concatenation. Changed bytes at the same identity refuse. Browser optional fields are paired, require an ordinary actual BrowserSession, and never accept AuthBrowserSession.\nPayload: Plans/ds15_live_session_started.schema.json is the exact closed 1.0.0 payload. Refs are opaque owner-resolved non-secret identifiers, never local absolute paths, credentials, executable arguments or raw content. For started, artifact_root/display_target name owner refs, not raw filesystem paths; session_id resolves the actual driver session (a PID alone is insufficient).\nOrdering and custody: explicitly adopt SP-286 / CV-339 and its full-value v2 successor, plus Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Validate current exact family admission, actual source/producer/codec, root/dedupe and migration custody before original work; registry absence fences it today. Freeze producer fields only after authentic outcome/body commit; append through the admitted single writer; retain the original first AppendReceipt and full frozen value under SP-286 before any success/terminal publication. Lost acknowledgement returns the original receipt, event_id and payload; recovery inspects original outcome custody and never repeats a launch, step, artifact creation or detection just to recreate history. Uncertain outcome stays fenced. SP-286 owns receipt storage; this family creates no separate canonical receipt family.\nReplay: event delivery and passive reads execute no external action; exact duplicates leave the index state unchanged. Actual original run/Doctor source custody plus canonical event/receipt is mandatory for retry, not a caller hash or present-day reconstruction.\nConsumer: reader.ds15.live_session_started.v1@1.0.0, operating as Chat live_run_card started reader, reads only this exact admitted event type at 1.0.0. It adopts SP-278 by name and DL-076's nine-field durable token. Its checkpoint key is projector.checkpoint.ds15.live_session_started:{project_id}, closed value Plans/ds15_live_session_started_checkpoint.schema.json. It captures CURRENT-selected complete generic-index coverage, scans the entire selected sequence range with exact Project/type filter in canonical sequence order, then CASes the complete previous checkpoint and new value in one redb transaction. through_sequence_id is the last globally scanned sequence, last_event_id the last matching event. No checkpoint is created until a first matching event; gaps and filter-completeness failures refuse advance. The live redb_snapshot_id is rejoined for each read/advance/recovery and never persisted. Changed token, source, admission, access, deletion or installed reader at the final owner guard preserves the old checkpoint. Operating reads resolve original events from SP-278 rather than duplicate bodies into a new projection table. Rebuild uses a fresh complete captured source; missing retained prefix returns unavailable, never silent zero/reset or fabricated currentness.\nRedaction/custody: the actual Project original seglog/first-receipt owner holds original event bytes; source config, target, artifact and finalization bodies stay with their existing owners. Coherent backup/restore covers original log, receipts and the source closure; mandatory original custody missing or unverifiable fences retry and disclosure. The derived checkpoint is rebuildable from that authority and grants no access. Every read rechecks current Project/run/thread permissions and source deletion/tombstones before following any ref. Deleted or denied sources return unavailable without copying bodies into history. No raw probe/config, page, cookies, prompts, screenshot bytes, output or secret is stored in this payload.\nRetention: retention_policy_ref = PENDING_RETENTION_DECISION for this event AND its checkpoint. Case L-3 candidates are approval/receipt/audit authority (indefinite), Runtime/run/node/attempt (365 days after completion, only where an actual Run exists), ordinary telemetry (90 days); these are candidates, not assignments. No expiry/count eviction, source retention extension or deletion rule is authorized by this draft. Do not admit until RT resolves both assignments.\nCompatibility and withdrawal: only exact 1.0.0 readers/writers; reject unknown payload/value version before effect or checkpoint. No deployed predecessor or lazy alias migration is presumed. A version change requires independently reviewed schema/codec and owner migration. Withdrawal first fences new writer admissions at an actual committed source frontier under Storage coordinator exclusion; drain and retain already admitted original receipts, then fence reader/checkpoint advance at that frontier. In-flight old reader CAS fails after withdrawal. Preserve original records under their eventual policy; mark existing checkpoint withdrawn, never reset it as current. Reinstall requires current owner authorization and complete rebuild against a fresh SP-278 selection; old publication/permissions cannot authorize it.\nOracles: ATS-322 and scripts/pm-ds15-event-contracts.py exercise this exact closed payload and checkpoint identity. Native obligations: original-outcome/append crash boundaries, receipt loss, retry no-effect, complete filtered scan/CAS races, current authorization/deletion, backup/restore loss, forced-visible failure, and writer/reader withdrawal fences must be exercised independently before implementation claims. Native execution NOT_RUN; static fixtures prove no native behavior.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-219"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```


### N2-220 — live.step.updated 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-220",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "live.step.updated 1.0.0 \u2014 newly authored owner contract, prepared without admission.\nSearch: all top-level Plans/*.md, Plans/*.json and scripts/*.py at base be4766513f; exact-family matches are preserved in the DS15 external search evidence. Existing newtools section 12.6 (Doctor) or 14.1/14.3/14.4 (live) supplies behavior; no exact versioned producer/consumer/checkpoint/identity/withdrawal definition was found for live.step.updated. This family is explicitly inside DL-045's exact scope. No sibling definition is adopted.\nProducer: Unified live-visualization orchestrator scenario progress hook. An existing launched session emits one immutable update per actual step observation. step_revision strictly increases per step_id; delivery retries keep the same revision. Completed sessions cannot publish a later update. This records observed pass/fail/progress and never executes the step.\nScope and identity: project_only; resolve the actual Project before work, never fabricate a Run for Doctor. EventRecord.project_id equals payload.project_id; live payload.run_id equals the actual EventRecord.run_id. Stable original event_id is allocated once and retained with the frozen original payload. Idempotency key is sha256(canonical MessagePack array [\"live.step.updated\", \"1.0.0\", actual project_id, live_session_id,step_id,step_revision]); the ordered tuple is unambiguous, never delimiter concatenation. Changed bytes at the same identity refuse. Browser optional fields are paired, require an ordinary actual BrowserSession, and never accept AuthBrowserSession.\nPayload: Plans/ds15_live_step_updated.schema.json is the exact closed 1.0.0 payload. Refs are opaque owner-resolved non-secret identifiers, never local absolute paths, credentials, executable arguments or raw content. For started, artifact_root/display_target name owner refs, not raw filesystem paths; session_id resolves the actual driver session (a PID alone is insufficient).\nOrdering and custody: explicitly adopt SP-286 / CV-339 and its full-value v2 successor, plus Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Validate current exact family admission, actual source/producer/codec, root/dedupe and migration custody before original work; registry absence fences it today. Freeze producer fields only after authentic outcome/body commit; append through the admitted single writer; retain the original first AppendReceipt and full frozen value under SP-286 before any success/terminal publication. Lost acknowledgement returns the original receipt, event_id and payload; recovery inspects original outcome custody and never repeats a launch, step, artifact creation or detection just to recreate history. Uncertain outcome stays fenced. SP-286 owns receipt storage; this family creates no separate canonical receipt family.\nReplay: event delivery and passive reads execute no external action; exact duplicates leave the index state unchanged. Actual original run/Doctor source custody plus canonical event/receipt is mandatory for retry, not a caller hash or present-day reconstruction.\nConsumer: reader.ds15.live_step_updated.v1@1.0.0, operating as Chat live_run_card step reader, reads only this exact admitted event type at 1.0.0. It adopts SP-278 by name and DL-076's nine-field durable token. Its checkpoint key is projector.checkpoint.ds15.live_step_updated:{project_id}, closed value Plans/ds15_live_step_updated_checkpoint.schema.json. It captures CURRENT-selected complete generic-index coverage, scans the entire selected sequence range with exact Project/type filter in canonical sequence order, then CASes the complete previous checkpoint and new value in one redb transaction. through_sequence_id is the last globally scanned sequence, last_event_id the last matching event. No checkpoint is created until a first matching event; gaps and filter-completeness failures refuse advance. The live redb_snapshot_id is rejoined for each read/advance/recovery and never persisted. Changed token, source, admission, access, deletion or installed reader at the final owner guard preserves the old checkpoint. Operating reads resolve original events from SP-278 rather than duplicate bodies into a new projection table. Rebuild uses a fresh complete captured source; missing retained prefix returns unavailable, never silent zero/reset or fabricated currentness.\nRedaction/custody: the actual Project original seglog/first-receipt owner holds original event bytes; source config, target, artifact and finalization bodies stay with their existing owners. Coherent backup/restore covers original log, receipts and the source closure; mandatory original custody missing or unverifiable fences retry and disclosure. The derived checkpoint is rebuildable from that authority and grants no access. Every read rechecks current Project/run/thread permissions and source deletion/tombstones before following any ref. Deleted or denied sources return unavailable without copying bodies into history. No raw probe/config, page, cookies, prompts, screenshot bytes, output or secret is stored in this payload.\nRetention: retention_policy_ref = PENDING_RETENTION_DECISION for this event AND its checkpoint. Case L-3 candidates are approval/receipt/audit authority (indefinite), Runtime/run/node/attempt (365 days after completion, only where an actual Run exists), ordinary telemetry (90 days); these are candidates, not assignments. No expiry/count eviction, source retention extension or deletion rule is authorized by this draft. Do not admit until RT resolves both assignments.\nCompatibility and withdrawal: only exact 1.0.0 readers/writers; reject unknown payload/value version before effect or checkpoint. No deployed predecessor or lazy alias migration is presumed. A version change requires independently reviewed schema/codec and owner migration. Withdrawal first fences new writer admissions at an actual committed source frontier under Storage coordinator exclusion; drain and retain already admitted original receipts, then fence reader/checkpoint advance at that frontier. In-flight old reader CAS fails after withdrawal. Preserve original records under their eventual policy; mark existing checkpoint withdrawn, never reset it as current. Reinstall requires current owner authorization and complete rebuild against a fresh SP-278 selection; old publication/permissions cannot authorize it.\nOracles: ATS-323 and scripts/pm-ds15-event-contracts.py exercise this exact closed payload and checkpoint identity. Native obligations: original-outcome/append crash boundaries, receipt loss, retry no-effect, complete filtered scan/CAS races, current authorization/deletion, backup/restore loss, forced-visible failure, and writer/reader withdrawal fences must be exercised independently before implementation claims. Native execution NOT_RUN; static fixtures prove no native behavior.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-220"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```


### N2-221 — live.artifact.created 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-221",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "live.artifact.created 1.0.0 \u2014 newly authored owner contract, prepared without admission.\nSearch: all top-level Plans/*.md, Plans/*.json and scripts/*.py at base be4766513f; exact-family matches are preserved in the DS15 external search evidence. Existing newtools section 12.6 (Doctor) or 14.1/14.3/14.4 (live) supplies behavior; no exact versioned producer/consumer/checkpoint/identity/withdrawal definition was found for live.artifact.created. This family is explicitly inside DL-045's exact scope. No sibling definition is adopted.\nProducer: Unified live-visualization orchestrator runtime artifact completion hook. Only after the runtime artifact pipeline has committed the actual artifact and its original receipt may this event link artifact_ref. One artifact_id identifies one immutable completion. This event neither duplicates runtime_artifact authority nor grants body access; a missing artifact admission fences publication.\nScope and identity: project_only; resolve the actual Project before work, never fabricate a Run for Doctor. EventRecord.project_id equals payload.project_id; live payload.run_id equals the actual EventRecord.run_id. Stable original event_id is allocated once and retained with the frozen original payload. Idempotency key is sha256(canonical MessagePack array [\"live.artifact.created\", \"1.0.0\", actual project_id, live_session_id,artifact_id]); the ordered tuple is unambiguous, never delimiter concatenation. Changed bytes at the same identity refuse. Browser optional fields are paired, require an ordinary actual BrowserSession, and never accept AuthBrowserSession.\nPayload: Plans/ds15_live_artifact_created.schema.json is the exact closed 1.0.0 payload. Refs are opaque owner-resolved non-secret identifiers, never local absolute paths, credentials, executable arguments or raw content. For started, artifact_root/display_target name owner refs, not raw filesystem paths; session_id resolves the actual driver session (a PID alone is insufficient).\nOrdering and custody: explicitly adopt SP-286 / CV-339 and its full-value v2 successor, plus Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Validate current exact family admission, actual source/producer/codec, root/dedupe and migration custody before original work; registry absence fences it today. Freeze producer fields only after authentic outcome/body commit; append through the admitted single writer; retain the original first AppendReceipt and full frozen value under SP-286 before any success/terminal publication. Lost acknowledgement returns the original receipt, event_id and payload; recovery inspects original outcome custody and never repeats a launch, step, artifact creation or detection just to recreate history. Uncertain outcome stays fenced. SP-286 owns receipt storage; this family creates no separate canonical receipt family.\nReplay: event delivery and passive reads execute no external action; exact duplicates leave the index state unchanged. Actual original run/Doctor source custody plus canonical event/receipt is mandatory for retry, not a caller hash or present-day reconstruction.\nConsumer: reader.ds15.live_artifact_created.v1@1.0.0, operating as Chat live_run_card artifact reader, reads only this exact admitted event type at 1.0.0. It adopts SP-278 by name and DL-076's nine-field durable token. Its checkpoint key is projector.checkpoint.ds15.live_artifact_created:{project_id}, closed value Plans/ds15_live_artifact_created_checkpoint.schema.json. It captures CURRENT-selected complete generic-index coverage, scans the entire selected sequence range with exact Project/type filter in canonical sequence order, then CASes the complete previous checkpoint and new value in one redb transaction. through_sequence_id is the last globally scanned sequence, last_event_id the last matching event. No checkpoint is created until a first matching event; gaps and filter-completeness failures refuse advance. The live redb_snapshot_id is rejoined for each read/advance/recovery and never persisted. Changed token, source, admission, access, deletion or installed reader at the final owner guard preserves the old checkpoint. Operating reads resolve original events from SP-278 rather than duplicate bodies into a new projection table. Rebuild uses a fresh complete captured source; missing retained prefix returns unavailable, never silent zero/reset or fabricated currentness.\nRedaction/custody: the actual Project original seglog/first-receipt owner holds original event bytes; source config, target, artifact and finalization bodies stay with their existing owners. Coherent backup/restore covers original log, receipts and the source closure; mandatory original custody missing or unverifiable fences retry and disclosure. The derived checkpoint is rebuildable from that authority and grants no access. Every read rechecks current Project/run/thread permissions and source deletion/tombstones before following any ref. Deleted or denied sources return unavailable without copying bodies into history. No raw probe/config, page, cookies, prompts, screenshot bytes, output or secret is stored in this payload.\nRetention: retention_policy_ref = PENDING_RETENTION_DECISION for this event AND its checkpoint. Case L-3 candidates are approval/receipt/audit authority (indefinite), Runtime/run/node/attempt (365 days after completion, only where an actual Run exists), ordinary telemetry (90 days); these are candidates, not assignments. No expiry/count eviction, source retention extension or deletion rule is authorized by this draft. Do not admit until RT resolves both assignments.\nCompatibility and withdrawal: only exact 1.0.0 readers/writers; reject unknown payload/value version before effect or checkpoint. No deployed predecessor or lazy alias migration is presumed. A version change requires independently reviewed schema/codec and owner migration. Withdrawal first fences new writer admissions at an actual committed source frontier under Storage coordinator exclusion; drain and retain already admitted original receipts, then fence reader/checkpoint advance at that frontier. In-flight old reader CAS fails after withdrawal. Preserve original records under their eventual policy; mark existing checkpoint withdrawn, never reset it as current. Reinstall requires current owner authorization and complete rebuild against a fresh SP-278 selection; old publication/permissions cannot authorize it.\nOracles: ATS-324 and scripts/pm-ds15-event-contracts.py exercise this exact closed payload and checkpoint identity. Native obligations: original-outcome/append crash boundaries, receipt loss, retry no-effect, complete filtered scan/CAS races, current authorization/deletion, backup/restore loss, forced-visible failure, and writer/reader withdrawal fences must be exercised independently before implementation claims. Native execution NOT_RUN; static fixtures prove no native behavior.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-221"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```


### N2-222 — live.session.completed 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-222",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "live.session.completed 1.0.0 \u2014 newly authored owner contract, prepared without admission.\nSearch: all top-level Plans/*.md, Plans/*.json and scripts/*.py at base be4766513f; exact-family matches are preserved in the DS15 external search evidence. Existing newtools section 12.6 (Doctor) or 14.1/14.3/14.4 (live) supplies behavior; no exact versioned producer/consumer/checkpoint/identity/withdrawal definition was found for live.session.completed. This family is explicitly inside DL-045's exact scope. No sibling definition is adopted.\nProducer: Unified live-visualization orchestrator finalization hook. Only after the actual manifest.json, summary.md and checks.json are finalized and durably committed may the session complete. Exactly one completion per live_session_id; later step/artifact observations cannot reopen it. Completion does not declare that all checks passed.\nScope and identity: project_only; resolve the actual Project before work, never fabricate a Run for Doctor. EventRecord.project_id equals payload.project_id; live payload.run_id equals the actual EventRecord.run_id. Stable original event_id is allocated once and retained with the frozen original payload. Idempotency key is sha256(canonical MessagePack array [\"live.session.completed\", \"1.0.0\", actual project_id, live_session_id]); the ordered tuple is unambiguous, never delimiter concatenation. Changed bytes at the same identity refuse. Browser optional fields are paired, require an ordinary actual BrowserSession, and never accept AuthBrowserSession.\nPayload: Plans/ds15_live_session_completed.schema.json is the exact closed 1.0.0 payload. Refs are opaque owner-resolved non-secret identifiers, never local absolute paths, credentials, executable arguments or raw content. For started, artifact_root/display_target name owner refs, not raw filesystem paths; session_id resolves the actual driver session (a PID alone is insufficient).\nOrdering and custody: explicitly adopt SP-286 / CV-339 and its full-value v2 successor, plus Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Validate current exact family admission, actual source/producer/codec, root/dedupe and migration custody before original work; registry absence fences it today. Freeze producer fields only after authentic outcome/body commit; append through the admitted single writer; retain the original first AppendReceipt and full frozen value under SP-286 before any success/terminal publication. Lost acknowledgement returns the original receipt, event_id and payload; recovery inspects original outcome custody and never repeats a launch, step, artifact creation or detection just to recreate history. Uncertain outcome stays fenced. SP-286 owns receipt storage; this family creates no separate canonical receipt family.\nReplay: event delivery and passive reads execute no external action; exact duplicates leave the index state unchanged. Actual original run/Doctor source custody plus canonical event/receipt is mandatory for retry, not a caller hash or present-day reconstruction.\nConsumer: reader.ds15.live_session_completed.v1@1.0.0, operating as Chat live_run_card completion reader, reads only this exact admitted event type at 1.0.0. It adopts SP-278 by name and DL-076's nine-field durable token. Its checkpoint key is projector.checkpoint.ds15.live_session_completed:{project_id}, closed value Plans/ds15_live_session_completed_checkpoint.schema.json. It captures CURRENT-selected complete generic-index coverage, scans the entire selected sequence range with exact Project/type filter in canonical sequence order, then CASes the complete previous checkpoint and new value in one redb transaction. through_sequence_id is the last globally scanned sequence, last_event_id the last matching event. No checkpoint is created until a first matching event; gaps and filter-completeness failures refuse advance. The live redb_snapshot_id is rejoined for each read/advance/recovery and never persisted. Changed token, source, admission, access, deletion or installed reader at the final owner guard preserves the old checkpoint. Operating reads resolve original events from SP-278 rather than duplicate bodies into a new projection table. Rebuild uses a fresh complete captured source; missing retained prefix returns unavailable, never silent zero/reset or fabricated currentness.\nRedaction/custody: the actual Project original seglog/first-receipt owner holds original event bytes; source config, target, artifact and finalization bodies stay with their existing owners. Coherent backup/restore covers original log, receipts and the source closure; mandatory original custody missing or unverifiable fences retry and disclosure. The derived checkpoint is rebuildable from that authority and grants no access. Every read rechecks current Project/run/thread permissions and source deletion/tombstones before following any ref. Deleted or denied sources return unavailable without copying bodies into history. No raw probe/config, page, cookies, prompts, screenshot bytes, output or secret is stored in this payload.\nRetention: retention_policy_ref = PENDING_RETENTION_DECISION for this event AND its checkpoint. Case L-3 candidates are approval/receipt/audit authority (indefinite), Runtime/run/node/attempt (365 days after completion, only where an actual Run exists), ordinary telemetry (90 days); these are candidates, not assignments. No expiry/count eviction, source retention extension or deletion rule is authorized by this draft. Do not admit until RT resolves both assignments.\nCompatibility and withdrawal: only exact 1.0.0 readers/writers; reject unknown payload/value version before effect or checkpoint. No deployed predecessor or lazy alias migration is presumed. A version change requires independently reviewed schema/codec and owner migration. Withdrawal first fences new writer admissions at an actual committed source frontier under Storage coordinator exclusion; drain and retain already admitted original receipts, then fence reader/checkpoint advance at that frontier. In-flight old reader CAS fails after withdrawal. Preserve original records under their eventual policy; mark existing checkpoint withdrawn, never reset it as current. Reinstall requires current owner authorization and complete rebuild against a fresh SP-278 selection; old publication/permissions cannot authorize it.\nOracles: ATS-325 and scripts/pm-ds15-event-contracts.py exercise this exact closed payload and checkpoint identity. Native obligations: original-outcome/append crash boundaries, receipt loss, retry no-effect, complete filtered scan/CAS races, current authorization/deletion, backup/restore loss, forced-visible failure, and writer/reader withdrawal fences must be exercised independently before implementation claims. Native execution NOT_RUN; static fixtures prove no native behavior.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-222"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```


### N2-223 — live.session.degraded 1.0.0 — newly authored owner contract, prepared without admission.

```yaml
{
  "plan_unit_id": "N2-223",
  "unit_type": "contract",
  "status": "accepted",
  "owner_doc": "Plans/newtools.md",
  "canonical_text": "live.session.degraded 1.0.0 \u2014 newly authored owner contract, prepared without admission.\nSearch: all top-level Plans/*.md, Plans/*.json and scripts/*.py at base be4766513f; exact-family matches are preserved in the DS15 external search evidence. Existing newtools section 12.6 (Doctor) or 14.1/14.3/14.4 (live) supplies behavior; no exact versioned producer/consumer/checkpoint/identity/withdrawal definition was found for live.session.degraded. This family is explicitly inside DL-045's exact scope. No sibling definition is adopted.\nProducer: Unified live-visualization orchestrator preflight/fallback hook. Record an actual capability loss for this live visualization occurrence, including prelaunch fallback. auto may fall back under section 14.3; forced_visible fails fast without launching a replacement. The event does not authorize fallback and must match requested/effective mode facts.\nScope and identity: project_only; resolve the actual Project before work, never fabricate a Run for Doctor. EventRecord.project_id equals payload.project_id; live payload.run_id equals the actual EventRecord.run_id. Stable original event_id is allocated once and retained with the frozen original payload. Idempotency key is sha256(canonical MessagePack array [\"live.session.degraded\", \"1.0.0\", actual project_id, live_session_id,degradation_revision]); the ordered tuple is unambiguous, never delimiter concatenation. Changed bytes at the same identity refuse. Browser optional fields are paired, require an ordinary actual BrowserSession, and never accept AuthBrowserSession.\nPayload: Plans/ds15_live_session_degraded.schema.json is the exact closed 1.0.0 payload. Refs are opaque owner-resolved non-secret identifiers, never local absolute paths, credentials, executable arguments or raw content. For started, artifact_root/display_target name owner refs, not raw filesystem paths; session_id resolves the actual driver session (a PID alone is insufficient).\nOrdering and custody: explicitly adopt SP-286 / CV-339 and its full-value v2 successor, plus Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Validate current exact family admission, actual source/producer/codec, root/dedupe and migration custody before original work; registry absence fences it today. Freeze producer fields only after authentic outcome/body commit; append through the admitted single writer; retain the original first AppendReceipt and full frozen value under SP-286 before any success/terminal publication. Lost acknowledgement returns the original receipt, event_id and payload; recovery inspects original outcome custody and never repeats a launch, step, artifact creation or detection just to recreate history. Uncertain outcome stays fenced. SP-286 owns receipt storage; this family creates no separate canonical receipt family.\nReplay: event delivery and passive reads execute no external action; exact duplicates leave the index state unchanged. Actual original run/Doctor source custody plus canonical event/receipt is mandatory for retry, not a caller hash or present-day reconstruction.\nConsumer: reader.ds15.live_session_degraded.v1@1.0.0, operating as Chat live_run_card capability reader, reads only this exact admitted event type at 1.0.0. It adopts SP-278 by name and DL-076's nine-field durable token. Its checkpoint key is projector.checkpoint.ds15.live_session_degraded:{project_id}, closed value Plans/ds15_live_session_degraded_checkpoint.schema.json. It captures CURRENT-selected complete generic-index coverage, scans the entire selected sequence range with exact Project/type filter in canonical sequence order, then CASes the complete previous checkpoint and new value in one redb transaction. through_sequence_id is the last globally scanned sequence, last_event_id the last matching event. No checkpoint is created until a first matching event; gaps and filter-completeness failures refuse advance. The live redb_snapshot_id is rejoined for each read/advance/recovery and never persisted. Changed token, source, admission, access, deletion or installed reader at the final owner guard preserves the old checkpoint. Operating reads resolve original events from SP-278 rather than duplicate bodies into a new projection table. Rebuild uses a fresh complete captured source; missing retained prefix returns unavailable, never silent zero/reset or fabricated currentness.\nRedaction/custody: the actual Project original seglog/first-receipt owner holds original event bytes; source config, target, artifact and finalization bodies stay with their existing owners. Coherent backup/restore covers original log, receipts and the source closure; mandatory original custody missing or unverifiable fences retry and disclosure. The derived checkpoint is rebuildable from that authority and grants no access. Every read rechecks current Project/run/thread permissions and source deletion/tombstones before following any ref. Deleted or denied sources return unavailable without copying bodies into history. No raw probe/config, page, cookies, prompts, screenshot bytes, output or secret is stored in this payload.\nRetention: retention_policy_ref = PENDING_RETENTION_DECISION for this event AND its checkpoint. Case L-3 candidates are approval/receipt/audit authority (indefinite), Runtime/run/node/attempt (365 days after completion, only where an actual Run exists), ordinary telemetry (90 days); these are candidates, not assignments. No expiry/count eviction, source retention extension or deletion rule is authorized by this draft. Do not admit until RT resolves both assignments.\nCompatibility and withdrawal: only exact 1.0.0 readers/writers; reject unknown payload/value version before effect or checkpoint. No deployed predecessor or lazy alias migration is presumed. A version change requires independently reviewed schema/codec and owner migration. Withdrawal first fences new writer admissions at an actual committed source frontier under Storage coordinator exclusion; drain and retain already admitted original receipts, then fence reader/checkpoint advance at that frontier. In-flight old reader CAS fails after withdrawal. Preserve original records under their eventual policy; mark existing checkpoint withdrawn, never reset it as current. Reinstall requires current owner authorization and complete rebuild against a fresh SP-278 selection; old publication/permissions cannot authorize it.\nOracles: ATS-326 and scripts/pm-ds15-event-contracts.py exercise this exact closed payload and checkpoint identity. Native obligations: original-outcome/append crash boundaries, receipt loss, retry no-effect, complete filtered scan/CAS races, current authorization/deletion, backup/restore loss, forced-visible failure, and writer/reader withdrawal fences must be exercised independently before implementation claims. Native execution NOT_RUN; static fixtures prove no native behavior.\nFallback binding (Section 14.3): on a missing required visible dependency, auto records effective_visual_mode=headless; forced_visible records null (no effective launch) and fails fast, never headless; forced_headless skips visible launch steps. A degraded preflight observation is not a successful session start. Null is an additive explicit no-launch value in this unadmitted draft, not a changed runtime policy.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/newtools.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "N2-223"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/newtools.md"
  ]
}
```
