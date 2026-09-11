# Shard 033: ATS-049 — Existing Session Event Admission

Source: `Plans/Automated_Testing_System.md`

Source lines: L4386-L4473

Source SHA256: `d0315a8fa74dc85add77991a73679eddd763692afb2e552b75fc073418f24acb`

---

## ATS-049 — Existing Session Event Admission

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

`Plans/testing_session_event_admission.json` binds those four transitions to the
central Event Authority registry. `Plans/testing_session_event_payloads.schema.json`
owns their closed payloads by reference to the existing ATS-048 session subject
and complete typed result, plus the owner-resolved settled session revision and
projection generation. Only `completed` and non-replayed results qualify. Pending,
no-change, rejected, failed, cancelled, unknown-effect or replayed command results
emit none of these events. A repeated command returns/joins its original result;
it does not emit another transition. Export and recording playback acquire no
event obligation through this admission.

The producer resolves the authenticated retained committed transition, original
typed request, exact result, effective permission/redaction/capability admission,
receipt, projection, session revision and generations. A caller-supplied producer
label, snapshot or hash never supplies authority. Subject, request digest, entire
result and operation must match that record; settled session revision cannot
regress and the newly committed projection generation must exceed its predecessor.
These are visibility/inspection facts, not test verdict, capture-start/stop,
protected-auth disclosure, UsageRecord or Prompt Pipeline attachment authority.

The existing EventRecord 2.0 envelope remains sole envelope authority. Each event
is Project-scoped with exact Project/thread/run/attempt/actor parity to its typed
result context. Node and account identities are null because this command family
does not own them. Correlation is the settled operation ID. The transition
idempotency key is the canonical-JSON SHA-256 of the request's command ID plus its
idempotency key and scope ref; the exact request-binding digest remains in the
typed result. Payload-schema IDs are unique and registered. Payloads are inline,
limited to 65,536 UTF-8 bytes, ordinary metadata only, and `no_secrets`; raw frames,
DOM, credentials and unadmitted migration/legacy extensions fail closed.

Replay validates the retained original committed transition, not a new permission
grant or redispatch. Event-ID and scope/event-type/idempotency collisions must both
agree on the existing producer semantic digest. An exact duplicate produces no
effect and does not advance the checkpoint; a conflicting or unknown record is
quarantined without checkpoint advance. Duplicate transport event IDs remain in
the dedupe index so later conflicting reuse cannot escape. Rebuild projects the
original facts without executing effects, minting receipts or emitting events;
older retained generations cannot roll the live projection backward.

Retention consumes existing `RP-AUTHORITY-INDEFINITE` version `1.0.0` and EventRecord
storage, including hold/delete integrity. This grants no separate physical family
for referenced owner records. A missing or quarantined retained owner receipt
prevents validated projection; a retained reference never re-authorizes content
access. All pre-existing 92 Event Authority rows are unchanged; this admission is
only four additions, not a global denominator, historical assignment rewrite or
governance seal. Native handlers/producers remain unimplemented and unavailable.

```yaml
plan_unit_id: ATS-049
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: The four existing Testing session events consume exact retained committed ATS-048 transitions and their separately registered closed payloads under EventRecord authority; replay projects facts without redispatch or authority changes.
gui_related: false
gui_classification_reason: This unit defines event identity, producer admission and replay, not session presentation.
depends_on: [ATS-048]
unblocks: []
acceptance_criteria:
  - Each of the four events binds its sole owner, exact typed request/result, Project scope, operation, receipt, session revision and generation before projection.
  - Pending, no-change, failed, cancelled, rejected, unknown-effect and replayed command results emit none of these events.
  - Unknown events, foreign subjects, uncommitted transitions, unauthorized producers, protected content and conflicting replay are rejected without checkpoint advance.
  - All eight existing command placements reference this exact admission; no command, handler or placement is added.
validation_surfaces: [python3 scripts/pm-testing-session-event-admission.py, tests/test_pm_testing_session_events.py]
risk_class: event_authority_and_false_completion
reasoning_tier: high
context_scope: existing_testing_session_events
implementation_surfaces: [Plans/testing_session_event_payloads.schema.json, Plans/event_family_registry.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: contract_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: ["Plans/Automated_Testing_System.md#ATS-048", "Plans/UI_Command_Catalog.md#UCC-134", "user instruction 2026-09-11 non-design integration"]
negative_constraints:
  - No native producer, authenticated lookup, persistence/recovery/security proof, protected-auth access, new physical family, WorkNode, global closure or governance seal.
  - Static replay fixtures do not execute commands or prove native currentness, durability or visual acceptance.
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-048, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe, ContractName:Plans/testing_session_event_admission.json, ContractName:Plans/testing_session_event_payloads.schema.json
