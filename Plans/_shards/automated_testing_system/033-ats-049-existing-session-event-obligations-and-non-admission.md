# Shard 033: ATS-049 — Existing Session Event Obligations and Non-Admission

Source: `Plans/Automated_Testing_System.md`

Source lines: L4405-L4505

Source SHA256: `47074bed6c4d07d09a1e2ba6b65ce2ff484e8b2ac957f622778eb197a5217609`

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
