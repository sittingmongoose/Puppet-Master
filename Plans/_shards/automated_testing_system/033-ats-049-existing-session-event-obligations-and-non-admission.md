# Shard 033: ATS-049 — Existing Session Event Obligations and Non-Admission

Source: `Plans/Automated_Testing_System.md`

Source lines: L4408-L4828

Source SHA256: `8e1c5cdd55fa0efb70f1406d409cdcfcd352674c9460b17760449f33a4fa4e13`

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

Required cases include genuine fresh birth/all-writer enrollment and hidden-writer rejection; null-active-run versus genuine association absence; prior Stop preservation; body-pending cancellation priority; receipt timestamp/identity fixed before Stop; complete optional event_unknown progress and retry; genuine acknowledged source before reservation; consumed reservation versus original append proof; loss after each genuine partial effect; exact immutable terminal replay; body-control v1/v2 migration and final read fences; standard local whole-resource resolution; bounded versus unsupported valid integer/codec domains; full backup/restore/tombstone/deletion guards; and passive SP-278 current/v2 historical source read with no durable effect. APR-017/SQR-011 and GRS-076/SIR-051 integrate the bound Plan source profile; ATS-052 adds its unexecuted owner/domain/replay/retirement oracles. Actual native admission remains unproved, and Workflow variants remain unavailable until their exact original effect sources are integrated.

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

### ATS-052 - Bound Plan cancellation and runtime retirement verification obligations

ATS-052 specifies source-only verification obligations for APR-017, SQR-011, CV-348, SP-306/307, GRS-076 and SIR-051. The exact canonical oracles are `Plans/assistant_plan_cancel_contracts/semantic-obligations.json` and `Plans/assistant_plan_cancel_contracts/bound-semantic-obligations.json`; full field, numeric, slot and dependency maps supplement those oracles. Existing Goal cancellation, binding, no-effect, unknown, current-source and backup/restore cases remain mandatory. No new fixture/model/native execution is claimed by adopting the source contracts.

| Required seam | Required observation | Execution status |
|---|---|---|
| Whole native sources | All 61 logical fields and existing enums/types survive exact source capture, changed/preserved transitions and readback; full schedule reasons remain native values. Unknown/deployed variants refuse without truncation. | NOT_RUN |
| Genuine origins and all-writer scope | Actual original birth/mutation jointly creates sources/origins; wrong owner/root/key/schema/revision, copied origins, missing writers and pending partial effects reject before unauthorized publication. | NOT_RUN |
| Exact Scheduler membership | Complete actual Run-specific schedules, correlations and consents include authentic empty and terminal/disabled sets; omissions, duplicates, unrelated schedules and hidden writers reject. | NOT_RUN |
| Before-Stop domains | Whole recursive target set and every actual numeric leaf/primitive/null/array member are covered. Unrepresentable successor, including a JCS-exact current integer with inexact +1, refuses before Stop without coercion or a new cap. | NOT_RUN |
| Source/assignment/Plan order | Pre-C-source input contains no future SourceAudit; actual SIR ack/readback precedes exclusive append; C assignment has no dependency on Plan preparation; Plan preparation consumes exact current C admission. | NOT_RUN |
| Future slots and hash DAG | Only declared original times/earlier whole hashes occur; all IDs/reasons/non-time primitives are fixed before Stop. Missing/extra slot occurrence or self/future hash cycle rejects. | NOT_RUN |
| Original safe-stop and joint effect | Genuine first Stop/cancellation receipts and actual safe-stop result precede one full joint Plan/Run/Scheduler/origin/effect/result commit. Waiting/nonsettlement never returns partial success. | NOT_RUN |
| Late callbacks and To-Dos | Actual current Stop/Run epoch and original binding/revision gates fence every callback/dispatch/To-Do update after final helpers; cancellation never rewrites To-Do statuses. | NOT_RUN |
| Current versus retained reads | First C-publication requires actual current after-state custody. Retained original effects/result/origins and exact original request identity support passive replay without old full sources and never confer action authority. | NOT_RUN |
| Terminal branch custody | Succeeded route requires assignment and authentic Plan settlement; pre-assignment no_effect and truthful unknown routes remain possible through original predicates without nonexistent Plan effects. Unknown remains immutable after recovery. | NOT_RUN |
| Original Goal event | Original cancellation id, accepted/occurred time, payload, result/outcome/response types and progress 0..7 remain exact. Consumed reservation uses original append/first receipt, never a fabricated live lock. | NOT_RUN |
| First settlement anchor | Unfinished Run starts with null anchor; first actual completed/cancelled write creates original timestamp/operation/transaction/revision/epoch anchor atomically. Later writers preserve it, non-run origins use null and historic missing evidence is unavailable. | NOT_RUN |
| Runtime class protections | Actual full runtime class counts and Project terminal cohort preserve existing latest-25, every hold/live/recovery/backup/rollback/maintenance protection and unchanged policy values. Count pressure never permits this TTL-only removal of an unexpired Run. | NOT_RUN |
| Atomic retirement | Genuine original redb compaction CASes full Run and gate preimages, publishes one exact compact receipt and removes only the expired full row atomically; all authority survivors remain exact. | NOT_RUN |
| Crash, replay and restore | Before commit original Run survives; after commit genuine receipt/survivors establish original retirement. Missing/conflicting custody refuses; restore cannot resurrect old bytes or reset anchor/identity/time. | NOT_RUN |
| Every direct boundary | Each original inner/outer effect, current/retained reader, anchor reader, Janitor and backup/restore participant independently captures originals before helpers and performs final whole-native/candidate checks with no returning gap. | NOT_RUN |

Static schema/reference/path or PlanUnit validation establishes only source structure and cannot establish these observations. Actual codec implementation, dispatch/permissions, native lease/source installation, all-writer coverage, atomicity, durable readback, crash injection, real retention membership/protection, deletion/backup/restore and genuine event publication require separately authorized original execution. This source integration changes no historical audit verdict, global event-depth result, critical/MVP array, PNC-019, readiness or governance artifact.

Every independently callable original participant captures complete authentic inputs, native participant/root/registration/operation/currentness/permission/deletion/hold sources, all beforeimages and the independently derived full permissible output before any returning helper. After all returning parsers, builders, codecs, resolvers, copies and comparators, it repeats one pure full-native and whole-candidate predicate with no helper, callback, logger or async gap to its own commit or passive disclosure. The outer publisher also checks the complete joined result. Original readback precedes dependent publication. Shape, detached hashes, matching names and serialized leases do not authenticate authority. Refusal preserves every genuine prior effect and unrelated original member.

This is a source-contract integration. Native installation, original issuer authentication, all-writer enrollment, safe-stop/callback exclusion, exact codec execution, redb atomicity/fsync/crash behavior, source/result replay, backup/restore and Janitor execution remain NOT_RUN. No new public command, event, Goal state, WorkNode, NodeSeed, readiness admission, event-depth pass or governance seal follows.

```yaml
plan_unit_id: ATS-052
unit_type: schema_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Bound Plan cancellation and runtime retirement verification obligations. Every source/domain/primitive/membership/atomicity/callback/read/replay/retirement
  oracle remains explicitly NOT_RUN until genuine original-owner execution demonstrates it.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- ATS-051
- APR-017
- SQR-011
- CV-348
- SP-306
- SP-307
- GRS-076
- SIR-051
unblocks: []
acceptance_criteria:
- Every source/domain/primitive/membership/atomicity/callback/read/replay/retirement oracle remains explicitly
  NOT_RUN until genuine original-owner execution demonstrates it.
- Static source checks cannot become fixture/model/native proof or change historical event-depth/readiness/governance
  status.
- Success and unsettled terminal paths, current versus retained authority and old full native/policy invariants
  are tested independently.
validation_surfaces:
- Plans/assistant_plan_cancel_contracts/semantic-obligations.json
- Plans/assistant_plan_cancel_contracts/bound-semantic-obligations.json
- Plans/assistant_plan_cancel_contracts/owner-field-map.json
- Plans/assistant_plan_cancel_contracts/numeric-paths.json
- Plans/assistant_plan_cancel_contracts/future-slot-rules.json
- Plans/assistant_plan_cancel_contracts/publication-dependencies.json
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: ats_052_bound_plan_custody
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
- No public command, event, Goal or Plan lifecycle expansion, peer owner or fabricated original effect.
- No native field redaction, numeric coercion, new retention policy, full runtime archive or automatic
  deployed migration.
- No model/native execution, WorkNode/NodeSeed/readiness admission or governance seal.
```

### ATS-053 - Original activation source and custody verification obligations

ATS-053 defines the complete original test-capability source and unexecuted semantic verification obligations for CV-349, SP-308, PNC-025, GRS-077, EP-117, MS-139 and BRS-024. A source graph that parses or resolves is not proof that these original native owner boundaries execute correctly. Each obligation below requires its own positive and negative evidence from the actual original owner when implemented; static schema/source checks, examples, model output and a stored PASS flag cannot substitute for that execution.

#### Whole original test-capability report

`owner.ats.test_capability.output.v1` issues the complete original 22-field test_capability_report and actual ATS output identity through ats_test_capability_receipt and the original Storage participant. Preserve every required capability, installed tool/native runner, launch/browser/GUI/device/screenshot/log/headless observation, full research/probe arrays, automation surface, flags, exact verification command, expected artifacts, flake policy and complete handoff. The entire original request/digest, output identity and operation/occurrence join the exact original test-capability live stage and its capture/origin. `owner.storage.test_capability.capture_live.v1` is the capture/origin publisher, distinct from the semantic ATS output method.

`owner.ats_test_capability_receipt.read_original.v1` retains full TestReadRequest/TestReadResult and complete TestDurableInputBinding. Its original source/origin and complete returned report must equal the whole genuinely captured input, not a subset of capability booleans. A missing original report cannot be repaired by a later re-probe, current tool inventory, copied screenshot, UI summary or another accepted request’s report. A newly authorized probe is a new original operation with new provenance; it is never historical recovery.

The canonical report is distinct from raw probe stdout, logs, screenshots, traces and test-result blobs, which keep their actual ATS/Runtime Artifacts/source policies. Report readability proves neither successful probe execution nor current tool/capability availability. Current original ATS/Executor owners independently revalidate the relevant actual capability and admission before execution. No test command stored in a report is executed merely by reading or restoring it.

#### Required semantic cases and expected dispositions

| Obligation | Positive source/operation case | Required negative/refusal case |
|---|---|---|
| Whole resource identity | Every adopted resource and lexical/embedded reference resolves through its exact declared realm and unchanged complete body. | Same-ID historical control in a current realm, conflicting registration, network/basename fallback or changed nested reference cannot validate current authority. |
| Existing storage preservation | All 166 original registry rows/policies remain exact while 54 complete new source rows are declared. | A deferred generic attempt/context or bootstrap compiler row is widened/promoted, an old policy changes, or an unrelated row joins the patch. |
| Exact wrapper/key/codec | Entire required/optional/nullable/nested values and exact original key-scope/semantic/physical hashes agree under their actual codec. | An omitted nested field, rounded integer, unknown key, malformed Unicode, wrong A/R scope expansion, copied key prefix or semantic-versus-physical hash substitution refuses before effect. |
| Genuine original provenance | Original operation/owner/epoch/request/output/capture/source/origin are authenticated from actual native services. | Equal bytes from another operation, caller owner IDs, copied origin or fake lease cannot establish source originality. |
| Seven whole durable inputs | Every required source read returns its complete original input/source/origin and exact successful branch. | Unavailable source cannot be omitted, turned into empty collection, satisfied by capture metadata, re-probed, recompiled or re-resolved. |
| Direct reader shape | Each of fourteen live/audit methods returns its exact complete inner available/unavailable result. | Adding an input_kind/result envelope, using only a success definition, or changing the original request shape fails the method contract. |
| Role collection membership | Each preflight/test/Models collection exactly matches all original provisioning members and request applicability. | Duplicate, foreign or missing members, an empty failed-read collection or order changes where original order matters refuse. |
| Compiler full state | Whole run, stage/worklist/wave/repair/audit/verification/retry/cancellation/supersession and next action survive original commit/readback. | A cursor-only checkpoint, flattened audit, missing whole wave, absent original artifact or reconstructed source cannot certify restart. |
| Compiler timing | Genuine draft/ready before assignment persists only actual receipts; running required parallel work has its configured distinct non-parent assignments and authentic receipts. | Predicted completion, borrowed wave receipt, serial substitute for mandatory parallel work or validator-bypass claim refuses certification/dispatch. |
| Certificate hash order | Certificate selects its genuine earlier input checkpoint; a later checkpoint can bind the issued certificate. | Certificate hashes the future checkpoint that hashes itself, or a reserved receipt ID is treated as already issued. |
| Compiler head/recovery | Original whole-head CAS advances once and recovery preserves actual latest/terminal truth with full dependencies. | Missing restored head becomes fresh birth, an older head wins, or a stored resume string causes execution without current admission. |
| Same-original preflight | Whole original 25-field receipt/context/handoff and request digest match its actual preflight operation and existing primary/origin. | Later completion capture, fake Attempt/context, fresh probe, current repository or compact capture replaces the original output. |
| Models completeness | All eight receipt fields and entire request/model applicability remain, with original native policy/runtime sources where required. | Effective-model-only state, loss of fallback_reason, dummy pre-Goal runtime, replacing a full receipt with requested_effective_runtime, or a new resolution on replay refuses. |
| ATS report identity | Whole 22-field report and original request/operation/probe provenance agree. | Report existence is treated as current capability or proof that an unavailable probe ran; raw artifact substitutes for whole original report. |
| Child-source emptiness | Actual whole original graph/required-child authority is empty and applicable issued source arrays match. | Nonempty, omitted, unknown, stale or late-changed child authority passes because a caller supplied empty arrays. |
| T0 reserved binding | Genuine full pre-reservation CAS issues complete owning BindingControl.pending and immutable revision/W0 candidate with epoch advance. | Empty lookup, foreign pending, stale owner/domain, changed candidate or partial reservation masquerades as original absence or final admission. |
| T1 actual terminal control | Final joint commit consumes the actual reserved nonnull binding control/current epoch and clears only its own pending. | Older empty control is used as final preimage, expected_control hash is confused with reserved before_control hash, or a foreign pending is cleared. |
| Direct Goal metadata | B0→B1 increments ordinary revision once, recomputes exact currentness/body hashes, preserves objective lineage and has null external_authority_ref. | Nonnull staged-producer external_authority_ref, invented accepted objective revision, unchanged ordinary revision or copied currentness refuses. |
| T1 joint union | Actual original Workflow W0/control/outbox, Goal B1/control/narrow receipt and binding revision/origin/control publish atomically with genuine origin attribution. | A detached Goal metadata write, prematurely issued receipt, missing origin or partial association becomes success; any required output-authority back-edge refuses. |
| Actual owner time attribution | Each original owner fixes its actual update/commit/issue time under its own literal field/codec rules before candidate hashing and final validation. | Future output supplies prior authority, hashed times are resampled after validation, or unrelated owner timestamps are forced equal to fabricate attribution. |
| B0/B1 historical bridge | Actual current B1 plus original narrow receipt and binding source commitments authenticate the specific association step. | Reacquiring overwritten B0, labeling B1 as B0, rewriting original launch selector or accepting an arbitrary intervening Goal edit cannot authorize T2. |
| T2 complete original family set | Every original native joint family and A4 materialization participant is present as a full required candidate/readback. | Missing global run result/origin, only a per-WorkNode result, missing whole run control/installed graph, or unused schema definitions are treated as the missing row. |
| Global run result | Whole original operation=materialize result selects exact full run-control outer value, real operation/time and proven original birth preimage. | A result for another run/operation/control, fabricated before_revision=0 after restore loss, missing origin or after-predicate timestamp resampling refuses. |
| Helper/native fences | Each actual lower reader/writer and outer publisher independently captures full source/preimage/expected output before helpers and rechecks after all helpers. | A helper changes any source/epoch/permission/Stop/candidate/unrelated union member; an outer-only check, returning logger or async gap cannot publish/disclose. |
| Mutable Workflow successor | Current reader explicitly joins actual current body/control with authentic permitted compact transitions and current Goal association. | It requires vanished W0 payload, returns current bytes labeled activation_body, trusts a hash-only chain, or admits a later writer outside the pre-start contract. |
| Retry and partial effects | Equal genuine original retry returns original result; later refusal preserves earlier actual reservation/Stop/source/effects and truthful unavailability. | Re-running a producer, second birth/materialization, rolling back unrelated genuine effects, or changing an immutable failure into success is forbidden. |
| Retention and disclosure | Full closed canonical state/receipt custody retains its existing indefinite class; referenced raw/current-body sources keep original lifetimes and permissions. | Required fields are redacted after issuance, references extend raw-body lifetime, historical bodies are reconstructed, or disposed content is disclosed from surviving metadata. |
| Backup/restore | Original coherent full transaction/dependency closure is verified with current tombstone/hold/newer-state truth before exposure. | Partial restored union, stale root/owner/codec, missing original dependency, resurrected deleted content or restored lease/capability leaves mutation fenced. |
| Lifecycle boundary | Only original pre-start materialization is selected; later native methods remain separately admitted dependencies. | Later attempt/completion/cancellation/start action, event/dispatch/Usage, PNC-019, Step9 or global D05 clearance follows from source adoption. |

Each negative case must be evaluated at every relevant independently callable entry and at its after-all-helpers final predicate, including passive disclosure/readback. Test the whole field/collection/transaction membership, not a single sampled hash or integer. Genuine prior effects and original immutable results remain truthful after a refusal. Fault injection must distinguish failure before original reservation, after genuine T0, after T1, before/after T2 and after original readback; neither a global Boolean nor a schema tag describes those actual effects.

The known PNC-024 semantic-validator mismatch remains visible and unexecuted. Native execution, fixtures, adversarial helper probes, codec/crash/atomicity checks and backup/restore drills receive separate evidence and cannot be reported PASS from this contract. Existing event accounting, source-only depth findings, Step 9 and global D05 remain separately governed.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: ATS-053
unit_type: schema_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Original activation source and custody verification obligations. Every source/role/primitive/currentness/association/publication/read/replay/lifetime
  oracle has explicit positive and negative behavior and remains unexecuted until native evidence exists.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- ATS-051
- ATS-052
- GRS-077
- CV-349
- SP-308
- PNC-025
- EP-117
- MS-139
- BRS-024
unblocks: []
acceptance_criteria:
- Every source/role/primitive/currentness/association/publication/read/replay/lifetime oracle has explicit positive
  and negative behavior and remains unexecuted until native evidence exists.
- The full original 22-field ATS report and source identity are preserved separately from current capability and
  raw probe artifacts.
- T0/T1/T2 complete unions, global run result/origin, direct reader shapes and current mutable-body successor arguments
  are validated at every lower and outer final boundary.
- Static source checks cannot become native/fixture/model proof or alter PNC-019, Step9, global D05, readiness or
  governance status.
validation_surfaces:
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
- Plans/workflow_activation_contracts/compiler-field-map.json
- Plans/workflow_activation_contracts/activation-field-map.json
- Plans/workflow_activation_contracts/native-birth-field-map.json
- Plans/workflow_activation_contracts/source-control-field-map.json
- Plans/workflow_activation_contracts/association-hash-dependencies.json
- Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json
- Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: ats_053_activation_original_custody
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/physical-families.json, ContractName:Plans/workflow_activation_contracts/compiler-field-map.json, ContractName:Plans/workflow_activation_contracts/activation-field-map.json, ContractName:Plans/workflow_activation_contracts/native-birth-field-map.json, ContractName:Plans/workflow_activation_contracts/source-control-field-map.json, ContractName:Plans/workflow_activation_contracts/association-hash-dependencies.json, ContractName:Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json
