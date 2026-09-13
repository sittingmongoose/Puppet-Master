# Shard 033: ATS-049 — Existing Session Event Obligations and Non-Admission

Source: `Plans/Automated_Testing_System.md`

Source lines: L4407-L4622

Source SHA256: `d72fd8e4dd162d58eb70b1d3879851d474243f33d51f899c06b686f9626ef3e9`

---

## ATS-049 — Existing Session Event Obligations and Non-Admission

DL-039's genuine `EMIT-PERSIST-026 = ACCEPT_EMIT_OBLIGATION_ONLY` decision governs
these exact four events. They remain `quarantined_not_admitted`, outside the live
Event Authority registry. Their closed payload schemas and owner-binding checks
are useful candidate contracts, not permission to persist EventRecords, run an
admitted-event projector, consume dedupe identities or advance replay checkpoints.
This disposition corrects the earlier static-admission claim without changing the
upstream fixed54 holding receipt, historical evidence or independent validator.

The sole semantic producer for the four already-required session events is the
planned `AutomatedTestingService.visible_session` owner. Handler routes in ATS-048
request its transitions; UI clicks, generic dispatch acceptance, Client caches,
artifact viewers and TestCaptureService are not authorized producers.

| Existing command | Existing event | Required committed owner transition |
|---|---|---|
| `cmd.testing.session.open` | `testing.session.opened` | Exact ordinary-session visible route and its settled receipt/projection. |
| `cmd.testing.session.watch` | `testing.session.watch_started` | Authorized redacted live projection bound to the exact session and stream generation. |
| `cmd.testing.session.background` | `testing.session.backgrounded` | Foreground/background disposition committed under the exact continuation policy. |
| `cmd.testing.session.redaction.inspect` | `testing.session.redaction_inspected` | Authorized redaction/evidence inspection route for the exact frozen selection. |

`Plans/testing_session_event_admission.json` records the explicit non-admission
disposition; its retained filename and proposed family metadata grant no authority.
`Plans/testing_session_event_payloads.schema.json`
owns their closed payloads by reference to the existing ATS-048 session subject
and complete typed result, plus the owner-resolved settled session revision and
projection generation. Only `completed` and non-replayed results qualify. Pending,
no-change, rejected, failed, cancelled, unknown-effect or replayed command results
emit none of these events. A repeated command returns/joins its original result;
it does not emit another transition. Export and recording playback acquire no
event obligation through this contract. These are send-only command obligations;
the transition rules do not authorize persisted EventRecord emission.

The producer resolves the authenticated retained committed transition, original
typed request, exact result, effective permission/redaction/capability admission,
receipt, projection, session revision and generations. A caller-supplied producer
label, snapshot or hash never supplies authority. Subject, request digest, entire
result and operation must match that record; settled session revision cannot
regress and the newly committed projection generation must exceed its predecessor.
These are visibility/inspection facts, not test verdict, capture-start/stop,
protected-auth disclosure, UsageRecord or Prompt Pipeline attachment authority.

The existing EventRecord 2.0 envelope remains sole envelope authority for any
separately authorized future storage contract. Each candidate is Project-scoped
with exact Project/thread/run/attempt/actor parity to its typed
result context. Node and account identities are null because this command family
does not own them. Correlation is the settled operation ID. The transition
idempotency key is the canonical-JSON SHA-256 of the request's command ID plus its
idempotency key and scope ref; the exact request-binding digest remains in the
typed result. Payload-schema IDs are unique, but these event families are not
registered. Candidate payloads are inline,
limited to 65,536 UTF-8 bytes, ordinary metadata only, and `no_secrets`; raw frames,
DOM, credentials and unadmitted migration/legacy extensions fail closed.

Every attempted EventRecord append or replay is quarantined without consuming an
event ID, dedupe identity or generation, projecting facts, or advancing a checkpoint.
This includes otherwise valid candidates, duplicates, new transport IDs and old
retained records. Existing checkpoint/identity state is left unchanged. Candidate
shape and owner-binding validation runs separately, so quarantine cannot hide a
malformed payload, substituted owner record or missing authorization. Command
retry still returns its original owner result under ATS-048; it is not event replay.

`RP-AUTHORITY-INDEFINITE` version `1.0.0` and Case L are proposals for a separately
authorized future storage decision, not an operative retention assignment here.
There is no new physical family. A retained reference never re-authorizes content
access. All pre-existing 92 Event Authority rows remain unchanged and these four
are absent; the global denominator remains open. No historical holding evidence,
freeze, validator or governance seal is changed. Native handlers/producers remain
unimplemented and unavailable.

```yaml
plan_unit_id: ATS-049
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: The four existing Testing session events retain send-only obligations and closed candidate payload/ATS-048 owner-binding contracts, but remain quarantined_not_admitted under DL-039; no EventRecord append or replay may consume identity, project facts or advance checkpoints.
gui_related: false
gui_classification_reason: This unit defines candidate event identity and explicit non-admission, not session presentation.
depends_on: [ATS-048]
unblocks: []
acceptance_criteria:
  - Each candidate binds its sole owner, exact typed request/result, Project scope, operation, receipt, session revision and generation without gaining event admission.
  - Pending, no-change, failed, cancelled, rejected, unknown-effect and replayed command results emit none of these events.
  - Candidate negatives independently reject unknown events, foreign subjects, uncommitted transitions, unauthorized producers and protected content; valid candidates still fail admission.
  - Append/replay attempts, including duplicates and restart inputs, quarantine without consuming identity or changing existing checkpoint/projection state.
  - All eight existing command placements retain their exact send-only event obligations and reference this non-admission disposition; no command, handler or placement is added.
validation_surfaces: [python3 scripts/pm-testing-session-event-admission.py, tests/test_pm_testing_session_events.py]
risk_class: event_authority_and_false_completion
reasoning_tier: high
context_scope: existing_testing_session_events
implementation_surfaces: [Plans/testing_session_event_payloads.schema.json, Plans/event_family_registry.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: contract_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: ["Plans/Decision_Log.md#DL-039", "Plans/Automated_Testing_System.md#ATS-048", "Plans/UI_Command_Catalog.md#UCC-134", "user instruction 2026-09-11 non-design integration"]
negative_constraints:
  - No native producer, authenticated lookup, persistence/recovery/security proof, protected-auth access, new physical family, WorkNode, global closure or governance seal.
  - No event registration, persisted append, admitted-event replay/projection, dedupe identity consumption or checkpoint advance is authorized by these candidate contracts.
  - Static denial fixtures do not execute commands or prove native currentness, durability or visual acceptance.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Automated_Testing_System.md#ATS-048, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe, ContractName:Plans/testing_session_event_admission.json, ContractName:Plans/testing_session_event_payloads.schema.json

### ATS-050 - Current cancellation original-operation verification obligations

```yaml
plan_unit_id: ATS-050
unit_type: schema_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Verify the exact current Cancel operation and execution-source contracts using independent
  actual-owner observations at every entry/final boundary. Preserve historical-v2 acceptance pairs as source-dated
  historical oracles. Static schema/source checks do not execute native original custody, cancellation, codecs,
  crash recovery, Plan/Workflow settlement, replay or passive source reads.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- GRS-073
- GRS-074
- SP-304
- SP-305
- SIR-050
- CV-347
unblocks: []
acceptance_criteria:
- Structural checks validate all complete documents, every registered wrapper and all transitive refs through
  standard offline explicit-resource resolution.
- Independent original-source and whole post-state observations distinguish valid permitted effect, pre-effect
  refusal, genuine partial effects and immutable replay.
- Every mutation/read helper boundary is checked through final original-owner release with no replaceable helper
  gap.
- Both current-v3 and whole historical-v2 readers preserve original authority and produce no checkpoint or
  new receipt.
- Native missing source/installation/codec/Plan/Workflow dependencies and unexecuted obligations remain explicitly
  unproved.
validation_surfaces:
- Plans/goal_cancel_command_custody.schema.json
- Plans/goal_execution_binding_custody.schema.json
- Plans/goal_cancel_schema_resources.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: ats-050_original_cancel_contract
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No fifth Goal state, objective/body revision mutation, child/tool settlement list, new command or peer handler.
- No raw Goal content in indefinite audit, new retention limit, silent codec substitution or fabricated original
  receipt.
- No native execution proof, full event-depth verdict, WorkNode/readiness admission or governance seal.
```

The complete normative obligations are `Plans/goal_cancel_contracts/semantic-obligations.json`, the two method maps and the source numeric inventory. Every obligation retains NOT_RUN until its own actual execution evidence exists. Pair each permitted source/effect/disclosure with malformed or shape-valid wrong-source/currentness/key/epoch/codec/candidate alternatives; check complete post-state and independently issued original receipts, not only a helper return or selected-field assertion. Original helper replacement must not alter actual private preimages or issuer state.

Required cases include genuine fresh birth/all-writer enrollment and hidden-writer rejection; null-active-run versus genuine association absence; prior Stop preservation; body-pending cancellation priority; receipt timestamp/identity fixed before Stop; complete optional event_unknown progress and retry; genuine acknowledged source before reservation; consumed reservation versus original append proof; loss after each genuine partial effect; exact immutable terminal replay; body-control v1/v2 migration and final read fences; standard local whole-resource resolution; bounded versus unsupported valid integer/codec domains; full backup/restore/tombstone/deletion guards; and passive SP-278 current/v2 historical source read with no durable effect. Bound Plan and Workflow variants must remain unavailable until their exact original effect sources are integrated.

These are verification requirements for Plans. This change supplies no native execution, model run, fault fixture observation, PNC-019/readiness result or global event-depth completion. Historical D-R02/EA-UND-0002 status remains unchanged.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305


### ATS-051 - Current Workflow Child-Scope Admission Verification

```yaml
plan_unit_id: ATS-051
unit_type: validation_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Current Workflow activation and Standard certification verify GRS-075's authentic empty
  child-Goal requirement set before publication or current-writer replay. Schema tests distinguish
  current empty-child refinements from complete historical v1/v2 readers; native source checks
  must reject caller-empty, missing, stale or nonempty original requirements without coercion.
gui_related: false
gui_classification_reason: Defines source/schema/native verification obligations without GUI behavior.
depends_on: [GRS-075, CV-340, SP-289]
unblocks: []
acceptance_criteria:
  - Empty-child current Standard values validate, while nonempty original or generic-component child refs fail current capture and remain representable by exact retained grammar.
  - Current original source verification rejects unknown, omitted, stale and nonempty complete child requirements even when returned arrays are empty.
  - Direct issuer and outer publication repeat actual current source/owner/full-candidate checks after every returning helper; a late child-edge change cannot publish.
  - Historical read/replay preserves original bytes and source identity with no current activation/completion or new capture authority.
  - Tests distinguish schema structure from native source authenticity and report native execution separately.
validation_surfaces:
  - Plans/goal_certification_current_scope_fixtures.json
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_receipt_version_routes.json
  - reports/event-authority-20260911/step-08-current-child-scope-validation.md
risk_class: historical_child_receipt_reinterpreted_as_current_authority
reasoning_tier: high
context_scope: current_workflow_child_scope_verification
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Goal_Runtime_System.md#GRS-075
negative_constraints:
  - No native runtime instance, event admission, validator change, frozen evidence restamp or governance seal.
```

The structural cases below do not create a GoalRun or WorkNode and do not prove original source ownership. The native source, concurrency and replay obligations remain NOT_RUN until the actual original owner and Storage participants execute them.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-075, ContractName:Plans/Contracts_V0.md#CV-340, ContractName:Plans/storage-plan.md#SP-289
