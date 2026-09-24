# Shard 027: Terminal workgroup moved — original operation and passive history contract

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L11753-L11972

Source SHA256: `a7d9d36b340c4292c027c2879ebe096cea6f5a2dff287fda64fc9ce27bbb8d00`

---

## Terminal workgroup moved — original operation and passive history contract

### Scope and binding search

This is a **NEW owner contract** under DL-045 for the already registered
`terminal.workgroup_moved@1.0.0`, not a new feature, payload version or admission.
The source search covered this document's SMPFS-138, including its DL-070
vacated-section rule, UCC-144's exact
`cmd.terminal.move_workgroup` row, CV-323's event and receipt boundary, Shared Integration Runtime's
CommandOutcomeRecord rules, SP-245's Home persistence, SP-273/SIR-046's expressly
Home-only custody, SP-278/SP-286, both event/storage registries, the exact
`Plans/event_payloads/terminal_workgroup_moved.schema.json`, the production wiring
rows `home.terminal_section.move_workgroup` and `home.terminal_section.new_section`
in `Plans/Wiring_Matrix.production.json` (handler `handlers::terminal::move_workgroup`,
declared events `workspace.layout_changed` and `terminal.workgroup_moved`),
FinalGUISpec's two 2026-09-23 DL-070 amendments and
`Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json`. These establish the
move, identities, shared append and receipt constraints, but no terminal-family
producer continuation, historical reader or checkpoint disposition. In particular,
SP-273 explicitly leaves this sibling's producer and durable coordination to its
own owner. The historical Step 08 August binding assessment is search lineage,
not current proof. Only this family receives the following definitions.

### Original producer and outcome

Define **new producer** `terminal.workgroup_move_commit.v1@1.0.0`, the terminal
owner's continuation of the existing admitted `cmd.terminal.move_workgroup`,
reached through its existing `handlers::terminal::move_workgroup` path.
It is not the Home producer, generic Storage projector, PTY manager or UI callback.
Authenticate the actual original SIR request, command instance, operation,
command payload/idempotency binding, full original owner identity and dispatch
frame, actual Storage instance and Project, expected terminal/layout revisions,
and current access/deletion/target-generation authority. Never fill original
identity fields from current UI topology. The terminal owner remains the sole
owner of workgroup membership; Home owns only applicable placement fields.

Under the actual terminal-owner exclusion and applicable Home exclusion, resolve
complete source/target sections, workgroup membership, pane/session bindings and
unchanged PTY ownership. The request's source must actually own the workgroup.
Use the existing four-section/four-visible-pane rules; disabled-at-limit operations
do not dispatch, create a section or emit this event. A move to the already-owned
section with no semantic change is `no_change`, never a fabricated move. An
admitted operation that ends `cancelled`, or `failed` with `rolled_back=true`,
emits no moved event (CV-323). A new
section is created only through its actual existing owner. Freeze the exact
accepted destination and membership before mutation; retries cannot choose a
new target, recreate a section or obtain fresh session identities.

When the moved workgroup is the last one in its source section, that section
stays empty and reusable with its guidance state, as SMPFS-138 states under
DL-070. The move allocates no replacement workgroup, pane or session, opens no
terminal session and records no reseed; creating another workgroup or terminal
there is a separate action. The payload has no `source_reseeded` field, and
`section_created` reports only whether the target section was created. Reset and
boot-recovery reconstitution are unchanged and gain no creation authority from a
move.

The original owner result is the exact authenticated CV-323 dispatch result for
this one admitted operation, joined to the SIR-owned CommandOutcomeRecord and
CV-333 response through their existing result ref/schema/hash rules. It records
the actual applied/no_change/cancelled/failed outcome, original command/operation
and dispatch receipt, source/target section and workgroup, complete pane/session
identity sets, actual section-created fact, accepted before/after terminal
revision and any independently applicable Home revision, and this operation's
actual event/result references. These are required semantic joins, not additional
fields in the registered event payload or permission to fabricate a typed result.
SIR alone authenticates acknowledgement and produces its outcome; an event or
owner result cannot create acknowledgement or completion. The result's exact
closed schema, original pending/result storage and SIR delegation must be
materialized and admitted by their actual owners before this producer activates.
No existing Home receipt, restore-point result, arbitrary ref or shared descriptive
role supplies that missing admission. This prose establishes those obligations;
it does not claim the companion schemas/physical custody exist. If those
companions store an SP-278 read token, they store the nine-field durable token
without `redb_snapshot_id` (DL-076), and every read joins the snapshot ID of its
own live read transaction.

Before effects, the admitted terminal operation custody must preserve the actual
original request/owner authority, exact permitted beforeimages, accepted intent,
original immutable ProducerInput and unresolved obligations. It must be sufficient
to distinguish no admitted effect from an effect whose acknowledgement was lost.
The same original pending owner alone advances it after restart. Missing or
uncertain custody is recovery-required, never absence interpreted as a fresh
operation. No new durable family, retention class or conversion is silently
allocated by this contract; until the exact closed source/result/pending companions
and supported migration are installed, producer admission is disabled.

### Commit, event applicability and uncertainty

A real changed move preserves every pane/session binding and PTY, commits the
actual accepted terminal membership through its owner, and verifies full readback
before admitting this fact event. A vacated source section's empty state, with
no replacement workgroup, pane or session (DL-070), and any created target section
must match the accepted result. A pending candidate is not published as
successful terminal state. CV-323 failure requires verified rollback and no success
event; a failed rollback remains fenced. No cross-owner atomic transaction is
assumed. The admitted operation protocol must durably coordinate terminal state,
any applicable Home operation and both event obligations before reporting success.
An independently applicable `workspace.layout_changed` has its own Home operation,
identity, payload, original receipt and completion; neither event is an alias or
substitute. A Home event is emitted only if Home's own applicability predicate is
met, and neither event is omitted merely because its sibling's binding is pending.
The wiring rows' declared event set is unchanged; each event is emitted only under
its own owner's applicability.
If either required owner protocol is unavailable, refuse before effects.

Build this family's unchanged closed payload from the actual original accepted
move: Project, exact command/origin/correlation, workgroup, distinct source and
target sections, exact distinct complete contained pane/session ID sets,
`section_created` equal to actual creation and `preserve_session_identity=true`.
Array order is the original producer's frozen order, never a new sorting or digest
recipe. EventRecord actor, causal scope and all producer-owned fields come from
the original admitted command through CV-309/CV-317 and Case L-5. This producer
supplies `event_id` and `idempotency_key`, derived once from the original admitted
operation and frozen in the immutable ProducerInput before the first append; their
exact derivation and `replay_policy` are obligations of the closed companion, as
SP-273 defines them for the Home sibling. Storage assigns only `sequence_id`,
`observed_at_utc` and `persisted_at_utc`. Never infer an event ID from a Home
event, correlation alone or current layout.

Call the actual Storage append owner with that same immutable ProducerInput,
under the existing `ordinary` durability class of Case L-2 and CV-339 (a fact
recorded after the accepted mutation, not a mutation-authorizing receipt) and the
existing append protocol. Validate original source/first AppendReceipt/full-value
custody under SP-286 and CV-339 through explicitly adopted
`storage.first_append_receipt.resolve.v2` (the original eleven-field receipt and
four-field result) and `storage.first_append_receipt.resolve_full_value.v1` (the
closed `full_value_request`/`full_value_result` of
`Plans/event_append_receipt_contracts.schema.json`); a legacy selector or semantic
reader supplies no full-value proof. Validate current source observation under
SP-278/SP-319. Do not synthesize an
AppendReceipt or remint Storage-assigned fields. An authentic issued event may
precede local recording of its result. Lost acknowledgement, uncertain append or
uncertain readback preserves the same pending operation, blocks conflicting
mutation and returns existing unresolved/recovery disclosure. It never proves
no event. Resolve only the actual original shared custody; resumption may retry
only through the unchanged shared idempotency route with the same original input.
A proved original event is finalized once, never rolled back as though it never
happened. A definitive no-event refusal permits rollback only when all applicable
owners prove their effects can be restored and all event obligations are resolved.
No contradictory failed/rolled_back result is published after an irreversible
sibling completion; preserve recovery-required custody instead.

Success follows complete original terminal state readback, both applicable owner
settlements and actual required event durability, then genuine original owner
result/SIR outcome/CV-333 response publication. Recheck complete actual source,
preimage, candidate/result and owner fences after dependent helpers and immediately
before every owner publication and disclosure. A later local refusal preserves
lawful prior independent effects and the same original pending operation. Retry
returns the authentic original result without another move, section, revision,
acknowledgement or event. Historical reads never enter this producer.

### Passive consumer and withdrawal

Define **new consumer** `terminal.workgroup_move_history_read.v1@1.0.0` for the
single-event historical inspection owned by SP-319. It serves only the already
specified resolution of the committed EventRecord that this operation's CV-323
receipt and CV-333 response reference (UCC-144: every applied/no_change/failed
result follows CV-323 and the exact canonical event family), and has no other
caller. It observes this existing
fact only; it owns no live-terminal projection, durable effect, cursor or family
checkpoint. It cannot restore a workgroup, attach a session, open a terminal,
spawn a PTY, acknowledge a command, create a section, advance a revision or select
current terminal state from history. Current terminal state always comes from its
live owner, regardless of event order. Original move validation and current
source-read authorization are separate, as defined by SP-319.
This unit owns the family's semantics and SP-319 is the Storage binding that
consumes them: SP-319 depends on this unit and binds this consumer to its
passive source read, and this unit does not list SP-319 in depends_on.

Withdrawal stops new producer admission and new reader disclosure independently.
Already admitted operations retain their original owner/custody and settle under
that exact supported route or remain explicitly fenced; do not delete evidence,
rebind them to Home or reinterpret uncertainty as cancellation. A successor needs
its own actual owner/codec/migration admission and preserved original identities.
Existing events retain their exact 1.0.0 interpretation, no aliases/extensions,
and `RP-AUTHORITY-INDEFINITE@1.0.0`. No retroactive event for an old move, new
session lifetime, hold, result archive, public command or product policy follows.

### SMPFS-170 - Terminal workgroup moved original operation and historical consumer

```yaml
plan_unit_id: SMPFS-170
unit_type: schema_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The new terminal.workgroup_move_commit.v1 producer and terminal.workgroup_move_history_read.v1
  consumer bind the existing terminal.workgroup_moved family to its original admitted identity-preserving
  move, exact original result and shared append authority. Terminal and applicable Home obligations remain
  independently owned and durably coordinated. Producer activation waits for exact original pending/result
  companions and owner admission; passive history has no terminal effects or family checkpoint. A move
  that vacates its source section leaves it empty and reusable, with no replacement workgroup, pane or
  session (DL-070).
gui_related: true
gui_classification_reason: Preserves existing workgroup placement, section limits and visible terminal identity.
depends_on: [SMPFS-138, UCC-144, CV-323, CV-333, CV-339, SP-245, SP-273, SP-278, SP-286, DL-045, DL-070]
unblocks: []
acceptance_criteria:
  - Authenticate the original request, operation, full owner identity, revisions, current authority and complete membership before effects.
  - Preserve every pane/session/PTY owner binding; disabled, no_change, cancelled and failed (rolled_back=true) operations produce no moved event.
  - Moving a source section's last workgroup leaves that section empty and reusable; the move allocates no replacement workgroup, pane or session, opens no terminal session and reports no reseed (DL-070).
  - Bind exact original owner result, real SIR acknowledgement/outcome and CV-333 response without borrowing Home custody.
  - Refuse producer admission until its closed pending/result companions, SIR delegation and migration are installed.
  - Coordinate independently applicable Home effects and events before success; uncertainty fences without reminting or false rollback.
  - Retry returns the same original result and event without repeating any terminal or Home effect.
  - Passive history grants no live-state, action, replay or checkpoint authority; withdrawal preserves unresolved original obligations.
validation_surfaces: [Plans/event_payloads/terminal_workgroup_moved.schema.json, Plans/event_family_registry.json, Plans/storage-plan.md#SP-319]
risk_class: terminal_move_original_result_or_sibling_event_authority_escape
reasoning_tier: high
context_scope: terminal_workgroup_moved_only
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/storage-plan.md]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false}
source_lineage: [Plans/Decision_Log.md#DL-039, Plans/Decision_Log.md#DL-045, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-138, Plans/Contracts_V0.md#CV-323, Plans/Decision_Log.md#DL-070, Plans/Decision_Log.md#DL-076]
negative_constraints:
  - No payload, registry, retention, public command, PTY or session-lifetime change.
  - No Home custody alias, missing-source reconstruction, native proof or complete event-depth claim.
  - No reseed of a vacated source section, no source_reseeded field and no new creation authority for reset or boot recovery (DL-070).
```

ContractRef: ContractName:Plans/storage-plan.md#SP-319, ContractName:Plans/Contracts_V0.md#CV-323, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-070, ContractName:Plans/Decision_Log.md#DL-076
