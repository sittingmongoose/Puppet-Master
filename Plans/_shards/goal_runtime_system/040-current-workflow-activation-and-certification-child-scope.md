# Shard 040: Current Workflow activation and certification child scope

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6951-L7493

Source SHA256: `4499bc48c8d3946ff0c74b8c37ce5401f34c08db73384c0224ff98446224b85a`

---

## Current Workflow activation and certification child scope

GRS-052 retires child Goals and parent completion authority, and GRS-053 gives internal callers the same Goal engine. Neither the older GRS-026/GRS-027 Workflow envelope nor GRS-065's retained complete receipt grammar supplies an exception. Their child-Goal wording is compatibility/source lineage in the current runtime. Workflow stages, WorkGraph dependencies, bounded To-Dos and collaborative participants remain with their existing owners; none is renamed to a child Goal.

Every current original activation, required-set publication, verification/completion decision, certification source issuer and Standard capture must independently read the complete original owner graph and requirements and prove that child Goal/GoalRun parent edges and required-child sets are empty. A supplied empty list, omitted field, absent index or missing source does not prove that fact. Nonempty or unknown original child requirements refuse before new publication, current-writer replay or dependent activation/completion; they are preserved for original history or owner correction, never silently dropped, coerced or converted to another work kind. Every directly callable participant repeats its complete source/owner/currentness predicate after all returning helpers and before its own release/commit; outer publication rechecks the complete joint result. Earlier genuine effects remain preserved on later refusal.

The current Standard writer selects CV-340's `current_standard_certification_custody_v2` refinement, requiring empty `original_certification.child_receipt_refs` and `legacy_goal_receipt.child_receipt_refs` in addition to the independently authenticated empty original requirement set. The stored v2 identity, complete original generic v1 and Standard v2 grammars, source hash recipe, immutable bytes, and retained read routes remain unchanged. Historical reads may return genuine original child refs under their original interpretation and current disclosure permission; they cannot authorize current Goal creation, activation, completion or a new receipt/event. A schema-valid historical row is not an exception to retirement. No new event or registry membership follows.

### GRS-075 - Current Workflow Child-Goal Retirement Admission

```yaml
plan_unit_id: GRS-075
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Current Workflow activation, completion and certification apply GRS-052's retirement of child
  Goals and parent completion authority. Complete original child-Goal requirements and receipt
  arrays must authenticate as empty before new publication or current-writer replay; nonempty
  or unknown sources refuse without coercion. Exact generic and historical receipt grammars and
  original retained disclosure remain separate and confer no current action authority.
gui_related: false
gui_classification_reason: Defines internal current source admission and retained interpretation, with no new visual surface.
depends_on: [GRS-052, GRS-053, GRS-065, CV-340, SP-289]
unblocks: []
acceptance_criteria:
  - Complete original owner graph and required-child sets prove current emptiness; supplied empty arrays or missing sources do not.
  - Nonempty, unknown, omitted or incoherent current child requirements refuse before new publication or writer replay without modifying source history.
  - Each original issuer and final joint publisher repeats complete current source and candidate checks after returning helpers.
  - Current Standard schema and role routing require both child-receipt arrays empty while retained v1/v2 grammar and original bytes remain unchanged.
  - Workflow participants, To-Dos and WorkGraph dependencies are never relabeled child Goals.
validation_surfaces:
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_receipt_version_routes.json
  - Plans/goal_certification_current_scope_fixtures.json
  - reports/event-authority-20260911/step-08-current-child-scope-validation.md
risk_class: retired_child_goal_authority_reintroduced
reasoning_tier: high
context_scope: current_workflow_activation_and_certification_child_scope
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Goal_Runtime_System.md#GRS-052
  - Plans/Goal_Runtime_System.md#GRS-053
  - reports/event-authority-20260911/step-08-current-child-scope-validation.md
negative_constraints:
  - No child Goal, parent-completion authority, new lifecycle, event, runtime instance, or historical conversion.
  - No native/depth/readiness claim, validator modification, frozen audit rewrite or governance seal.
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-052, ContractName:Plans/Goal_Runtime_System.md#GRS-053, ContractName:Plans/Goal_Runtime_System.md#GRS-065, ContractName:Plans/Contracts_V0.md#CV-340, ContractName:Plans/storage-plan.md#SP-289

### GRS-076 - Bound Plan source and original cancellation publication integration

GRS-076 explicitly adopts the original bound-positive cancellation profile supplied by APR-017/SQR-011, CV-348 and SP-306. The existing no_bound_plan arm, full Goal/host/shared-body control semantics, existing public commands and EventRecord/result/outcome/response types are unchanged. Workflow disposition remains independently owned and is not inferred from Plan absence. This source adoption does not prove an actually installed native route.

The closed transient entry contracts are `Plans/assistant_plan_cancel_bound_entry.schema.json`; their methods and oracles are `Plans/assistant_plan_cancel_contracts/bound-method-adoptions.json` and `Plans/assistant_plan_cancel_contracts/bound-semantic-obligations.json`. `BoundSourceCaptureEntry`, `BoundAssignmentEntry`, `BoundBeforeStopEntry` and `BoundOwnersEntry` are original-owner protocol inputs, not durable families, caller-issued grants or public commands.

#### Original source, acknowledgement, assignment and Plan preparation

1. The actual Goal, SIR, host and binding owners independently capture the complete original request, dispatch, acceptance, body/control/Stop, binding control/revision/origin and complete writer domain before helpers. BoundSourceCaptureEntry.original_binding_selection must genuinely report bound_plan_requires_owner_settlement, its authentic single association and active run. The actual original association resolves the same complete GoalPlanBinding, Plan/run/version/hash, execution owner and source origin as original_plan. Missing, stale, pending-partial, Workflow or multiple/mismatched association truth is not a no-bound source. OriginalGoalCaptureSources contains the complete original Goal/binding carriers without the not-yet-issued source audit; BeforeStopSources is consumed only later after C-source. Current Goal sources and actual registrations/permissions remain independent original predicates; selecting an entry shape is not authentication.
2. C-source issues unchanged SourceAudit with original_execution_binding.kind=bound_plan and every original identity field preserved. Its normalized operation_id is the cancellation_id. Its producer occurred_at bytes are already the receipt accepted_at and event cancelled_at_utc. All scope, request, operation, command-instance, dispatch/frame/target-generation and original acceptance joins must agree. The source may contain accepted; it must not invent acknowledgement.
3. The actual original SIR owner performs and durably reads back its original acknowledgement (or authentic executing successor preserving that acknowledgement) BEFORE the append owner acquires the cancellation reservation. AssignmentInput.original_acknowledged_outcome and its physical source are this complete actual outcome, preserving original acknowledgement receipt/offset, normalized identity, original dispatch and generations. No assumed zero or fabricated SIR record is allowed.
4. The original append owner acquires the real exclusive native fence and actual never-reused sequence/sink reservation. BoundAssignmentEntry consumes original source, binding selection and the unchanged complete AssignmentInput. It does not consume BeforeStopPrepared, its future effects, its assignment digest or its later current_cancel_assignment field. The full source and binding physical selections resolve the exact original outer values. Original owner-selected native roots/participants and full pending members remain independently captured, not inferred from the supplied input.
5. The original assignment owner issues the existing AssignmentAudit/AssignmentAdmission from the entire complete numeric/primitive domain under the actual original codecs. This is representational preparation only. The result's eventual Plan effect/reference/hash fields use their exact original schema languages for domain admission; they are not preissued effect values. No new field is inserted into AssignmentInput and no Plan preparation digest participates in either existing assignment commitment preimage.
6. The actual Plan/Scheduler owners then produce BeforeStopPrepared, with current_cancel_assignment exactly equal to that genuine current original AssignmentAdmission. Full identity, Goal, bound Plan/run and C-source joins are required. The preparation must independently cover every Plan/Scheduler target, future slot, integer/primitive domain, current original policy admission and actual source guard. Its complete current assignment commitment may depend on C's earlier admission; C's admission never depends on it. A returning Plan helper must not require an append through the already held cancellation fence. Any such requirement releases/abandons the reservation and restarts genuine preparation before C-stop; no deadlock or invented append is admitted.
7. BoundBeforeStopEntry joins complete source, binding, AssignmentInput, issued audit, admission and prepared Plan. Recompute both existing assignment commitments using the exact SP-305 domain prefixes, LF and exact local Goal JSON; audit.input commitment excludes only original issuer and commitment itself; domain commitment includes exact physical assignment selector, full path inventory, codecs and event tree. Before C-stop the actual owner independently rechecks the entire original state, live fence and source/Plan preparation guards after all returning helpers. Unavailable Plan preparation cannot enter C-stop by weakening the assignment. Earlier genuine acknowledgement/sequence allocation remains truthful prior work.

The canonical method adoption map binds these stages to the actual original operations. reserve_append_assignment retains AppendSourceRead and independently authenticates the bound SourceAudit, BindingSelection and genuine acknowledged/executing SIR outcome before reservation; it cannot require the not-yet-created AssignmentInput or Plan preparation. issue_assignment_audit and admit_codec_domain consume the completed BoundAssignmentEntry under their existing whole inputs and predicates. terminal and publish_cancel_terminal each select either the succeeded BoundTerminalEntry or original no_effect/unknown BoundUnsettledTerminalEntry. The existing original SIR passive reader independently selects BoundRetainedReplayEntry or BoundUnsettledReplayEntry; these entries add no command, dispatcher or publication effect.

#### Complete bound domains and original effect gates

All current root_branches and their nested integer paths remain present, including all terminal outcomes and responses, nested original publication first receipts and append results, control epochs, producer sequence nullable arm, and recovery progress 0..7. Each bound Plan-version occurrence is the exact original SourceAudit binding singleton, joined to actual GoalPlanBinding and original Plan/run identity. It has no new maximum and is never substituted with null, coerced through binary64 or sampled from a small example. The two branches preserve their existing schema types. The whole CV-333 GoalCancelResultV2, including nonnull bound OwnerSettlement, uses its original RFC8785 result contract. Unsupported exact JCS spelling/representation is unsupported_existing_codec_route before C-stop, not invalid Goal input. Native Goal JSON remains arbitrary precision. Producer semantic JCS and complete EventRecord MessagePack retain their original preimages/codecs. Original SIR outcome/response types and transport remain unchanged; retained cancellation carriers use exact Goal JSON without inventing an extra JCS projection.

Integer coverage is not whole-field coverage. Independently admit every complete field, key, recursive array/map and exact string/null/boolean language in producer, result, outcome and response branches. Preserve fixed source literals and key/schema/version/scope fields; maintain original ordering/escaping/hash preimages and original physical cap intervals. The event term tree contains only the existing three future terms: actual cancellation-receipt hash, actual Storage observed time and persisted time. No future Plan effect, plan_version, cancellation id or accepted time is an event slot. The Plan preparation's separately typed future slots are restricted to their declared target/path/primitive/owner/codec domains and independently checked on actual substitution; they cannot widen the C event tree or predict a successful settlement. All original whole-frame cap and checked uint64 interval rules remain exact.

After real C-stop and minimal receipt, BoundOwnersEntry requires genuine current-effect read, including actual current complete Plan/run/schedule/consent source values, safe-stop result and callback domain. Its actual SettledResult.owner_settlement must equal the unchanged bound OwnerSettlement delivered to C-owners: exact original binding, scope proof, original Plan effect selector/hash and run-specific schedule/quota effect selector/hash. Read and independently authenticate full original effect/result/origin wrappers. The Plan/Scheduler owner alone makes those effects and late-callback fences. Missing or not-settled leaves truthful pending; no none_required fallback exists. These entry values are not assertions that preparation already effected settlement.

C-freeze/append/control keep their original full source/phase/candidate checks and current owner obligations. Before append consumption the actual live native reservation is mandatory. After consumption, original genuine publication and first-receipt custody replace the unconsumed reservation condition; copied audit is neither live lock nor actual publication. The original real receipt/result must lie inside the prior admitted complete domain. Every final comparison occurs after all returning helpers and before effect or passive release with no helper gap, including unrelated preserved members; readback precedes dependent publication. No later refusal rolls back genuine Stop, receipt, Plan/Scheduler work, event or control.

The success-only BoundTerminalEntry preserves the original terminal input's complete original SIR outcome, chosen immutable progress snapshot/selector/hash and complete owner result. SucceededResult can only carry the original successful C-control publication and corresponding Plan settlement. Unknown stays immutable with original pending custody; retries do not invent progress increments. no_effect still requires the authentic original zero-effect epoch1 proof and preserves independent prior Stop/work.

BoundRetainedReplayEntry is only passive replay of the same original succeeded immutable terminal/result/outcome/response. It uses authentic original retained Plan effects through RetainedEffectReadSuccess and authentic original compact effect/result/origin custody, including the genuine original Run first-settlement SourceOrigin and immutable anchor, with all original scope/request/idempotency/operation/result/progress joins and current read permissions. This passive result read asserts neither current full-Run presence nor retirement. Current full-Run and retirement-disposition reads retain their separate SP-307 predicates. It cannot turn a historical effect into a new current settlement, advance C-owners/C-publish, reacquire a consumed reservation, emit another event or rewrite unknown to success. First C-publication continues to require actual current original settlement, even when historical effects remain auditable.

#### Terminal branch preservation

BoundTerminalEntry is solely the succeeded route after authentic assignment and current settlement; BoundRetainedReplayEntry is solely passive replay of a succeeded original terminal with authentic original retained Plan effects. They are not prerequisites for no_effect or unknown. BoundUnsettledTerminalEntry preserves the original TerminalInput NoEffectResult/RecoveryRequiredResult branches without requiring AssignmentAudit or any Plan effect. Authentic representational refusal before assignment issuance can still terminalize under the original zero-effect proof; truthful unknown preserves its original phase/effect evidence. BoundUnsettledReplayEntry preserves the original immutable no_effect/unknown terminal replay without requiring nonexistent Plan effects or a later successful settlement. All original source, snapshot, proof, SIR outcome/response custody and permissions remain mandatory. Existing unknown remains unknown even if genuine owner recovery later settles work. These entries never manufacture missing custody or weaken original no_effect predicates.

Every independently callable original participant captures complete authentic inputs, native participant/root/registration/operation/currentness/permission/deletion/hold sources, all beforeimages and the independently derived full permissible output before any returning helper. After all returning parsers, builders, codecs, resolvers, copies and comparators, it repeats one pure full-native and whole-candidate predicate with no helper, callback, logger or async gap to its own commit or passive disclosure. The outer publisher also checks the complete joined result. Original readback precedes dependent publication. Shape, detached hashes, matching names and serialized leases do not authenticate authority. Refusal preserves every genuine prior effect and unrelated original member.

This is a source-contract integration. Native installation, original issuer authentication, all-writer enrollment, safe-stop/callback exclusion, exact codec execution, redb atomicity/fsync/crash behavior, source/result replay, backup/restore and Janitor execution remain NOT_RUN. No new public command, event, Goal state, WorkNode, NodeSeed, readiness admission, event-depth pass or governance seal follows.

```yaml
plan_unit_id: GRS-076
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Bound Plan source and original cancellation publication integration. The bound source
  authenticates the exact original Goal/Plan/run/binding and preserves the genuine original normalized
  operation, cancellation identity and accepted time.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- GRS-074
- GRS-075
- APR-017
- SQR-011
unblocks: []
acceptance_criteria:
- The bound source authenticates the exact original Goal/Plan/run/binding and preserves the genuine original
  normalized operation, cancellation identity and accepted time.
- Original SIR acknowledgement/readback precedes append reservation; C assignment precedes Plan preparation
  without any reverse hash or source dependency.
- Exact nonnull bound Plan version and full owner-result/SIR domains use unchanged original codecs; no-bound
  null semantics remain.
- Only authentic current original Plan settlement feeds C-owners and first control publication; retained
  reads never grant current publication authority.
- Original no_effect and unknown terminal/replay routes do not require a nonexistent assignment or Plan
  settlement, and immutable unknown remains unchanged.
validation_surfaces:
- Plans/assistant_plan_cancel_bound_entry.schema.json
- Plans/assistant_plan_cancel_contracts/bound-method-adoptions.json
- Plans/goal_cancel_contracts/numeric-paths.json
- Plans/goal_cancel_contracts/methods.json
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: grs_076_bound_plan_custody
implementation_surfaces:
- Plans/Goal_Runtime_System.md
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

### GRS-077 - Original Workflow source, association and current activation custody

GRS-077 defines the original pre-start Workflow activation source route through CV-349, SP-308, PNC-025, EP-117 and MS-139. The complete A4 source records and original methods are canonical owner definitions selected by `Plans/workflow_activation_schema_resources.json`, even where their preserved literal resource identifiers contain `proposals`. Those identifiers are exact schema identity; neither that spelling nor a schema-valid object grants native capability. The current owner graph, genuine original operations and every lower/final boundary below remain mandatory.

The source sequence begins with the genuinely accepted native compiler source, accepted request/graph certification, original aggregate/per-request intake and provisioning, and actual `owner.executor.activation.decide.v1` disposition. `goal_runtime.executor.decide_activation_request_set.v1` issues the complete original nine-field WorkNodeRequests decision through SP-308. It binds the actual graph, request membership, accepted exclusions, intake and provisioning. Required/optional dispositions, readiness_snapshot, activation_transaction_ref, every reason and mixed_result_reason remain whole; a mixed required result refuses materialization. A genuinely blocked decision can retain its true original result without a WorkNode. Replay returns that original result and cannot re-decide its request set to make an earlier activation succeed.

`owner.workflow.compile.issue_native.v1`, `owner.workflow.compile.issue_request.v1` and `owner.workflow.compile.issue_graph.v1` issue their complete original physical values and separate original origins only after PNC-025’s actual source checks. `owner.executor.intake.issue.v1`, `owner.executor.provision.issue.v1` and `owner.executor.activation.decide.v1` likewise retain EP-117’s full upstream source and current admission obligations. NativeSourceControl selects the current immutable native compile/request revisions by exact logical key and whole original-owner CAS; the control is not a maximum-revision scan. A reserved run identity in the accepted native source is a genuine original identity reservation, not a born Workflow body, execution effect, fabricated Goal or Attempt.

Current issue, certification, materialization and current-writer replay must independently authenticate the entire original required-child owner graph as empty under GRS-075. Nonempty, unknown, omitted, stale or inconsistent original sources refuse even if a caller supplies empty arrays. WorkGraph edges, Workflow participants and To-Dos are not child Goals. `CurrentCompletionRequirementSource` and `CurrentRequiredSet` preserve whole A4 values with only their current empty-child refinements. Their full values are required at the actual lifecycle point when they have genuinely issued; an unissued RequiredSet is never a compiler-birth prerequisite. Genuine pre-Goal source work uses the full OriginalPreGoalGuard and actual original host Stop; after association materialization requires the full actual_bound_goal branch.

The current seven-role durable bindings preserve original capture provenance and actual complete durable source/origin/read, through the exact methods in `Plans/workflow_activation_contracts/methods.json`. The old original_live/native-live lease predicate is unchanged. Current durable source admission selects `original_durable_custody` explicitly, so a retained original capture neither grants a live lease nor substitutes for full input. SP-308 defines complete returns and current reads; EP-117 defines exact role collections and materialization joins.

#### Distinct original transactions and available values

A pre-existing original Goal is required by A4 `owner.workflow.activation.begin.v1`. Its genuine Goal/body/Stop/zero-association birth or explicit original migration has already occurred under GRS-074; this activation does not create a Goal from Plan Build, rerun birth_none for an existing Goal or manufacture a missing binding origin.

Call its accepted launch-time Goal body **B0**. This is the complete actual `storage_body` outer value read from its real native owner. The native compile source's `launch_identity_reservation.original_goal_body` selects B0's exact physical key/schema/version/full outer digest. The source was genuinely issued before the association. Original accepted graph/request/permission/currentness and GRS-075 complete original child-source checks must still pass. T1 receives the whole genuinely issued native compile, certified graph and accepted decision sources. It authenticates the actual underlying graph/requirement authority; it does not require a future CompletionRequirementSource or RequiredSet to have been issued before its genuine lifecycle point. The later T2 argument contains the whole actual CompletionRequirementSource and staged original RequiredSet through its existing full materialization input contract.

**T1** is the original Workflow birth plus association joint publication. The original methods are `owner.workflow.activation.begin.v1`, `owner.workflow.goal_binding.commit.v1` and `owner.goal.body.mutation@1.0.0`. They atomically commit the actual InitialGoalRunBody/control/origins and reserved start outbox/origin, the shared Goal metadata afterimage B1 and its original narrow body receipt/control, and actual Workflow binding revision/origin/control. Native capabilities and the whole common Storage/current-owner fence make this one transaction; the schema objects do not.

**T2** occurs later. The actual current Workflow body is still the initial W0 body at fresh materialization admission, and the actual shared Goal is the particular B1 metadata successor from T1. `owner.executor.activation.materialize.v1` and `owner.workflow.activation.commit_materialized.v1` commit the complete native WorkNode/control/result/origins, the one native run control/origin, A4 immutable born/materialization records, installed graph/required set, Workflow body/control afterimages/origins and original transition receipt/origin together. T2 does not mutate the shared Goal B1 or issue another binding revision. No Attempt exists merely because the WorkNode is born.

Fresh T2 is distinct from retry. A completed original T2 retries through actual original result/transition custody and current reads; it cannot rerun fresh absent-key birth after W0 has been overwritten. Later staging/preparation similarly starts with its actual current full body and its original predecessor commitments. No prior mutable body is required to be reread after replacement.

#### Exact Goal before/after fields and digests at T1

Let `n = B0.record.revision`, `c0 = B0.record.currentness_hash`, and let `r` be the actual already-reserved Workflow run identity from the original native launch source. B0 must still be current at the true T1 source boundary. A changed objective, changed source, foreign association or arbitrary newer Goal is not rebased into this original activation.

| Field | Exact T1 relation |
|---|---|
| B1.goal_id / project_id / thread_id | Equal the complete original B0 identities. |
| B1.objective_text | Exact B0 text, preserving all scalars and whitespace. |
| B1.revision | `n + 1`; metadata updates are ordinary body mutations under GRS-064. |
| B1.state / blocked_reason_ref | Exact B0 values; association adds no lifecycle transition. |
| B1.active_run_ref | Actual `r`, matching the single original Workflow association and A4 run identity. |
| B1.created_at | Exact B0 value. |
| B1.updated_at | Actual Goal-owner admitted update timestamp, not earlier than B0.updated_at or created_at; no invented equality to a different owner's timestamp. |
| B1.currentness_hash | Recomputed by the exact GRS-064 recipe over all other ten B1 fields. |
| Goal control body_key | Same actual body key. |
| Goal control current_revision / currentness_hash / body_sha256 | `n+1`, B1 currentness and SHA-256 of the complete semantic B1 body respectively. |
| Goal control latest_objective_revision / latest_revision_hash / origin_key | Exact prior accepted objective head/origin; the full original accepted revision and origin stay byte-identical. |
| Goal control pending / cancellation_pending / cancellation_receipt_ref | This bounded direct atomic route requires actual before pending, cancellation_pending and cancellation_receipt_ref all null, while the actual final binding-control preimage contains this operation’s genuine nonnull reserved workflow_attach pending. Only this owning binding pending clears; foreign pending, cancellation or Stop refuses. |
| Goal control control_epoch | Advances through the original owner's exact real transition from its actual terminal preimage; never reset or inferred from an earlier empty control. |

`pm.goal.canonical_json.v1` remains unchanged. `currentness_hash = SHA256(UTF8("pm.goal.currentness.v1") + LF + canonical JSON of the other ten semantic body fields)`. Goal control `body_sha256` hashes the entire semantic body including currentness, with no domain prefix. A4 `SourceSelector.physical_value_sha256`, Binding `PhysicalSelection.complete_value_sha256` and BindingOrigin Goal/control/Stop hash fields refer to complete actual outer values under their actual owner codecs, not those semantic-only digests. The Goal outer wrapper has its exact existing fields; a key is not inserted into a wrapper that does not contain one.

The original narrow Goal body receipt has `before_revision=n`, `before_currentness_hash=c0`, `after_revision=n+1`, and `after_currentness_hash=B1.record.currentness_hash`. Its `accepted_objective_revision` and `accepted_revision_hash` are both null for this metadata-only operation. They are not copied from the unchanged accepted-history head. `operation_id`, `intent_sha256`, `owner_ref`, `authority_ref` and commit time are the actual Goal owner's original values. It is a body mutation receipt, not a binding receipt, event receipt, first AppendReceipt or UI result.

The complete original metadata intent uses the existing closed `pending` grammar with `operation_kind=metadata_update`, expected ordinary revision/currentness/Stop from actual B0 admission, complete B1 after-record, and null accepted_revision/origin/original_change_authority_ref/external_authority_ref. This bounded owner contract selects the direct atomic owner route: the intent is the original owner's complete transient admission argument, not a previously persisted pending row. `FreshAssociationBefore` requires actual Goal pending/cancellation fields null, actual Goal/binding active_run_ref null, no existing binding associations, and the complete actual nonnull owning reserved BindingControl pending/current epoch. Empty binding pending is solely the earlier T0 pre-reservation condition. For this direct atomic Goal metadata route, the literal pending-grammar field `external_authority_ref` is null under GRS-064. The already genuine pre-T1 Workflow/activation admission remains independently authenticated native authorization of the joint operation; it is not a nonnull staged-producer field, future binding origin or returned receipt. The Goal body metadata route is direct atomic; the separate mandatory BindingControl reservation below is preserved. Other Goal-body staged reservation routes remain governed by their original contract outside this bounded argument.

##### Original authority and timestamp boundary

| Value | Original authority and publication boundary |
|---|---|
| Metadata intent `external_authority_ref` | Null for this direct atomic Goal body mutation. The whole genuinely accepted pre-T1 Workflow/activation admission and its original native owner authority are independently authenticated outside this field. No candidate BindingOrigin, body receipt, W0 origin or after-binding-control supplies prior authorization. |
| B1 `updated_at` | Actual Goal owner admitted update time under its existing monotonic constraints; fixed in B1 before hashing and final validation. |
| Narrow Goal body receipt `committed_at` | Actual Goal mutation owner's T1 commit attribution, fixed in its complete receipt candidate before dependent binding commitments. It is not an already issued receipt until T1 succeeds. |
| Binding origin `issuer.committed_at` | Actual binding issuer's original commit attribution for the same T1 publication, under its exact schema and timestamp rules. |
| Workflow origins `issued_at_utc` | Actual original Workflow issuers' literal issue times for co-published W0/control/outbox, under their exact original schema rules. |

These times retain their own literal canonical field names, types and authority. No universal equality between update, commit and issue timestamps is invented. Actual owners must reserve/admit any publication attribution needed for candidate hashing before the terminal pure predicate. They may not resample a hashed timestamp or reserialize a candidate after that predicate. If their native transaction cannot supply an authentic fixed attribution, this joint route refuses; callers cannot fabricate a timestamp or treat an unissued candidate as proof. All co-published records are issued only by successful T1. T2 uses its own authentic original owner attributions under the same fixed-candidate rule; it cannot backdate or reissue T1.

#### A4 launch selectors remain historical commitments

`NativeCompileSource.launch_identity_reservation.original_goal_body` and the new W0 `GoalRunBody.original_goal_body` both retain the exact original B0 selector. W0 `original_goal_lineage` is the genuine pre-existing accepted Goal lineage; association writes no new accepted objective revision/origin and never changes origin_kind to internal_workflow merely because a Workflow is now associated.

After T1, B0's mutable physical key contains B1. Therefore the B0 selector is not a current-read selector and must not be compared to B1 as if the hashes should remain equal. It is the immutable original launch commitment. The actual association's narrow body receipt and binding origin provide the explicit owner-authenticated B0-to-B1 bridge below. No source selector is rewritten to B1, and no missing B0 bytes are reconstructed from B1, hashes or history.

Fresh T2 admits only this specific original B1 metadata transition: actual current Goal ordinary revision, currentness, complete physical/body hashes and whole body/control must match T1's afterimage commitments, with the exact current matching Workflow binding and original body receipt. The original Goal accepted objective head/origin is unchanged. Generic valid history or a later objective/currentness update does not satisfy this join. A genuine intervening edit/association/source change refuses original activation unless an independently canonical owner rule explicitly admits it. Passive retained audit may observe a later changed current body, but grants no materialization, dispatch or source-currentness authority.

#### Existing binding records carry the original bridge

At T1 the original binding revision advances from its genuine prior revision to the next original association revision, preserving complete previous_revision, scope, host owner/epoch and actual writer-domain selection. The new associations array contains exactly one genuine WorkflowAssociation whose `active_run_ref=r`, `original_run_source` selects the complete prepared W0 physical body, execution owner/epoch match the actual Workflow owner, and original_binding_transaction_id is this actual T1. The new revision's active_run_ref equals both that association and B1's field. A prior active Plan or another Workflow is not overwritten to force this branch.

BindingOrigin's `before_control_sha256` is the full actual binding-control terminal preimage. `original_goal_body_sha256`, `original_goal_control_sha256` and `original_stop_control_sha256` commit the genuine B0/Goal-control/Stop outer preimages. `issued_revision_sha256` commits the complete newly assembled binding revision wrapper. Its issuer is the genuine original `owner.workflow.goal_binding.commit.v1` OriginalTransaction. Different participants retain their real operation IDs and owners; the native transaction establishes their actual same-transaction relationship. No string-equality shortcut turns the Goal receipt into the Workflow binding issuer.

For this bounded composition, the existing `BindingOrigin.original_source_members` also carries exact original physical selections for: B0; B1; after-Goal control; narrow Goal body receipt; W0 birth body/control and both original Workflow origins; reserved start outbox and its origin; original native compile source, certified graph and original accepted activation decision; original accepted Goal objective revision and origin. `BindingOriginalMemberRoles` makes those full role selections explicit in the transient native argument. The original publisher independently derives and verifies every selection from the full actual source or complete co-issued candidate. Additional genuine source members remain only if the actual original owner requires them and independently proves their complete provenance and acyclic dependency closure; no unknown member or source omission is accepted.

These members are original commitment metadata under the existing binding-origin contract, not an archive of old Goal/Workflow bodies. Before/after selectors at the same mutable key are deliberately distinct full commitments. On replay, their role comes from this original native contract and the retained original records, not a caller's tag. The B0 member equals the unchanged A4 launch selector after the explicit field mapping: native Storage instance comes from binding Scope, family/key/schema/version match, A4 physical_value_sha256 equals complete_value_sha256, and codec_id is the actual owner codec. No codec is guessed from a filename.

Binding control then selects the exact new revision/origin and authentic current writer domain with its original epoch/pending rules. The complete writer domain/head and all seven affecting writer categories are checked at entry and at the final predicate; a hidden writer or stale generation makes the association unavailable. Neither null active_run_ref nor an absent cache establishes the prior no-association precondition.

#### Mandatory original T0 binding reservation

GRS-074 requires association mutation to first reserve `BindingControl.pending`. T0 is that genuine original reservation by `owner.workflow.goal_binding.commit.v1`, not a new method, receipt or body mutation. `BindingReservationLowerArgument.before` is the whole actual pre-reservation Goal/history/control/Stop/binding/domain state, with empty binding pending and no associations. Its complete `prepared_revision` and `prepared_reserved_control` are independently derived by the original owner. The separate whole Workflow birth argument provides the fixed complete W0 candidate used by `WorkflowAssociation.original_run_source`; W0 is still unpublished. Preparing an exact admitted W0 candidate does not issue a birth receipt or grant authority.

The original owner reserves under exact whole BindingControl CAS and the actual Goal/Stop/registration fence. `pending.operation=workflow_attach`; operation ID, owner and epoch are the genuine original operation. `pending.candidate` equals the entire prepared new BindingRevision semantic record, including W0's exact full physical selector. `pending.expected_control_sha256` is the full pre-T0 binding-control outer digest; expected Goal body/control/Stop digests and writer-domain selection equal the full actual T0 originals. The reserved control preserves all other current revision/origin/domain/scope fields and advances control_epoch exactly once. T0 writes only this actual BindingControl reservation. B0 and Goal control remain current and unchanged; W0, B1, body receipt, binding revision/origin and outbox remain unissued.

At T1 the whole current reserved BindingControl is the terminal preimage in `FreshAssociationBefore`, never the older empty control. Its complete pending must be the same authentic original reservation, including immutable candidate and all original beforeimage commitments; the original owner retains and authenticates its reservation operation under the same native fences. A serialized pending-shaped object does not prove reservation. T1 does not reacquire a vanished pre-T0 mutable control: its original pending expected digest remains a commitment authenticated by the actual original reservation owner, not a replacement current read. Goal/control/Stop/domain commitments are checked against their actual current full values. A changed source, W0 candidate, owner, pending or control epoch refuses; there is no rebase or silent rewrite of the admitted candidate.

T1 publishes exactly the complete binding revision already present in its owning pending, clears only that pending and advances the actual reserved control epoch once again. `BindingOrigin.before_control_sha256` hashes this complete final reserved control, whereas `pending.expected_control_sha256` hashes the earlier pre-reservation control. They are intentionally different. All lower entries and the final pure joint predicate compare the actual reserved control and its complete immutable candidate after helpers. Interrupted reservation never becomes an absent-association success by clearing/relabeling pending; original pending disposition and fences remain required.

#### Acyclic complete T1 hash order

`Plans/workflow_activation_contracts/association-hash-dependencies.json` lists the exact dependency roles and is topologically checked. The following are complete prepared values, not previously issued receipts used as admission credentials:

1. Authenticate all actual prior Goal/history/control/Stop/binding/domain and accepted Workflow/compile/decision sources, including the complete actual T0 reserved binding control and immutable admitted revision/W0 candidate. Allocate only genuine original operation/run identities already owned by that admission. No future result identity is borrowed as a receipt.
2. Independently derive B1, its Goal currentness/semantic/outer hashes, complete original metadata intent, after-Goal control and narrow Goal body receipt. The intent has external_authority_ref=null; its independently authenticated native authorization contains no new BindingOrigin, after-binding-control or Workflow-origin hash. The narrow receipt is merely a candidate until T1 commits.
3. Independently derive complete W0 InitialGoalRunBody (`ready`, `activation_pending`, revision 1, no installed graph/required set/certification), its GoalRunControl, reserved start outbox, and their original A4 issuer origins. Their source bindings use already genuine upstream sources and previously assembled values. No W0/control/outbox origin, actual_permission_source, Stop/cancellation source or transitively referenced authority depends on the new BindingOrigin or after-binding-control. W0 retains B0's launch selector, not B1's future binding-origin hash.
4. Independently rederive the complete new BindingRevision from W0's complete physical selector, original prior revision/domain and actual association identity, and compare it exactly to T0’s complete immutable pending candidate. Build BindingOrigin from that complete revision wrapper plus the complete original preimages and the role members already assembled above. It may reference the prepared narrow Goal receipt and W0/control/outbox origins because none depends on BindingOrigin. This is co-issued candidate composition, not a claim that their future returned values already exist.
5. Build after-binding-control from the complete new revision and origin selections, advancing the actual reserved control epoch and clearing only the authentic owning pending. The actual lower Goal, Workflow and binding publishers independently compare the entire intended union after every returning helper and commit it together under one final pure native predicate, with no later helper/mutable gap. Independently authenticated whole readback precedes dependent release.

An original helper response is never the sole source of its own expected hash. Each participating owner independently derives its own complete candidate from its genuine originals before helpers and checks the entire candidate again after them. A source member that recursively references BindingOrigin or after-binding-control breaks the ordering and refuses; it is not omitted to make the graph acyclic. No new body's metadata contains a later source-origin hash to patch over the cycle.

##### Whole original global RunOperationResult participant

The original native method map includes `executor_run_operation_result` in `owner.executor.activation.materialize.v1`'s joint families. The complete `MaterializeCurrentCandidates.result` is per-WorkNode NativeOperationResult and does not supply that separate global result. `PreparedWorkflowMaterialization.native_run_result` therefore contains the entire unchanged native `StorageRunOperationResult`, and `native_run_result_origin` its entire unchanged `StoragePublicationOrigin`.

The actual original materialization owner independently derives this run-level result with operation=materialize, exact original run scope/operation and publication attribution, and after_control selecting the complete prepared native_run_control outer value. The RunExecutionControl.last_operation_id equals this actual operation. Fresh first materialization proves real absence of every selected native run-control/result/origin key under original Storage/activation exclusion; only that genuine birth permits before_revision=0 and before_control_physical_sha256=null. A restored missing row is unavailable, not this absence proof. The original graph-lock observation remains the actual original value, null only for genuine no-lock birth; no future observation is invented.

Compute the complete run-control wrapper before the full run result and then its original publication origin. The origin binds the actual result key, whole semantic result bytes, original materialization owner/operation/transaction and complete original source provenance under the unchanged native codec. T2's complete union includes this global result and origin with the full run control/origin, all per-WorkNode rows/controls/results/origins and A4 participants. Every lower and outer final predicate checks the complete values and authentic readback before dependent release; neither presence of an unused schema definition nor the per-WorkNode result replaces this participant. No run result is issued by a later repair after partial materialization.

#### T2 complete materialization union and exact preimages

Fresh T2 reads the actual complete W0 body/control/origins and reserved outbox currently stored after T1; it also reads `CurrentAssociatedGoalRead`, which contains full CURRENT B1/control/Stop/domain/binding values plus the original immutable association body receipt and member roles. It does not receive full B0. All original graph/request/intake/provisioning/requirements/seven durable inputs remain authenticated exactly as in EP-117 and the complete current materialization contract in Plans/workflow_activation_contracts/methods.json, including every actual preflight/test/Models collection member and GRS-075 underlying original graph/required-child emptiness.

For each native `MaterializeCurrentCandidates.inputs`, original_goal_run_body and original_goal_run_control equal the complete current Workflow preimages W0/control read at this actual materialization boundary. original_installed_graph and original_required_set are the complete staged original Workflow candidates for this same T2, not falsely described previously stored objects. Their genuine original publisher participates in the same final union. Whole native_worknode/control/result wrappers/origins and one native_run_control/origin are explicit in `PreparedWorkflowMaterialization`. Every member's corresponding semantic native candidate equals its full wrapper record, and every repeated run-control view equals the one actual global candidate. No native field is trimmed.

Born records and native WorkNodes begin queued with actual original accepted content; attempts/retries stay empty only under the genuine original absent-key birth predicate. Original materialization receipts bind their full born records. Installed graph and required set join all actual required members with exact source/graph/request/WorkNode bijections. New Workflow W1 preserves W0 identity, original B0 launch selector, original Goal lineage, execution owner and accepted decision, advances its own ordinary revision once, records the original records_materialized activation transition and installs the original graph/required-set bindings. GoalRunControl matches the complete W1 semantic hash/revision. GoalRun remains ready; certification remains absent. The shared Goal remains B1, and no new Goal body receipt or binding revision is issued in T2.

Build born member sources/origins and materialization receipts/origins, then installed graph/origin and required set/origin from complete genuine sources and earlier prepared values. Build full native WorkNode wrappers, controls selecting their complete outer hashes and native results selecting those complete wrappers; the global native run control uses the already assembled full installed_workgraph binding. Then derive all corresponding native origins. Build the original activation transition receipt/origin using actual prior W0/control, original causation and outbox, and the already assembled graph/required-set/member sources. Build W1 and its original issuer origin with source bindings to the actual previous body/origin and that transition/graph/required-set provenance. Finally build W1 control/origin, binding the complete W1 physical body/origin, previous control/origin and transition. No member/transition/graph/required-set origin depends on later W1/control origin. No transient candidate is treated as earlier issued evidence; the actual joint publisher commits the whole union or none.

If a genuine source or guard changes after helpers, original T2 publication refuses without changing B1/binding or overwriting earlier genuine T1 effects. Recovery does not erase a completed association merely because later materialization failed. Stop and original cancellation remain authoritative; neither T1 nor T2 releases a start event, first AppendReceipt, provider call or dispatch.

#### Current Workflow reads after mutable body replacement

`CurrentWorkflowLaunchChainRead` is the explicit successor current-read argument. The transient native inspection contains the complete CURRENT Workflow body/control/outbox and their original origins, original launch sources, retained birth body/control/outbox selectors with their actual immutable origins, and the complete retained activation transition/origin links. It deliberately has no field demanding full historical W0 or full old reserved-outbox bytes after those mutable rows advance. `RetainedWorkflowTransitionLink` contains full original compact transition receipt/origin plus original before/after physical selectors and after-body/control origins, not reconstructed old bodies.

Each original pre-start body transition must publish its after-body origin with exact actual prior body/origin and original transition receipt/origin bindings. The after-control origin must bind the exact prior control/origin, complete new body/origin and the same transition. Those metadata source bindings are part of the genuine original transaction, authored before publication from actual full available preimages. No new persistent source is introduced and no old origin is backfilled. For intermediate transitions, the next genuine origin's prior selector identifies the prior afterimage; the current full body/control verify the chain endpoint. The native reader derives and authenticates all link roles from the original stored origin/transition records and actual owner protocol. Caller-supplied link arrays are not proof.

The first birth commitment equals the original WorkflowAssociation.original_run_source and the birth members in the genuine T1 BindingOrigin. Link scope/keys/original issuer/causation/transition states and original activation revisions must be contiguous and match the actual registered key codec. Each after-body/control origin selects its actual emitted semantic record commitment and genuine prior bindings. The current full body/control matches the last complete physical selectors, semantic hash and owner/revision. Current GoalRun.original_goal_body remains the original B0 selector. Original accepted graph/decision/Goal lineage and exact preserved fields are checked under the actual original transition contract, without rereading disappeared previous body bytes.

This bounded chain covers the original A4 pre-start birth/materialize/stage/prepare transitions. Any subsequent start, cancellation, execution or certification writer requires its own already authorized complete original transition/source contract; this owner contract does not invent a generic transition or claim those separate event protocols are closed. An older current reader that requires full original activation_body must explicitly select this new current-read contract for the covered chain. Its old grammar stays exact for genuine retained historical availability; current body bytes are never returned mislabeled as the old initial body. Missing origin/transition custody, an unexplained intervening mutation or an unsupported later writer returns unavailable for dependent current action. It cannot be repaired by replaying the operation, creating a full-body archive or treating a receipt as the missing body's content.

Original passive receipt/origin audit may disclose surviving genuine metadata under current permission without reacquiring disposed B0/W0 content, and has action_authority=none. The current action path still needs the actual current full body/control and authentic exact transition chain; historical readability alone does not authorize source-currentness, materialization or dispatch.

The reserved-to-prepared start-outbox mutation obeys the same retained-source rule: its genuine new outbox origin binds the prior outbox selector/origin and its actual original staging/activation-receipt provenance. A current prepared outbox is read as prepared, with the original reserved selector retained only as a commitment. No current reader requires old reserved payload bytes or returns prepared bytes labeled reserved. Future event/first-receipt output remains absent under the unchanged pre-start outbox schema; its separate publication owner is not bypassed.


#### Explicit current reader and later lifecycle boundary

The original physical reader `owner.storage.activation_source.read_current.v1` explicitly composes `CurrentWorkflowLaunchChainRead` from `Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json` with `CurrentAssociatedGoalRead` from `Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json` when serving this admitted pre-start association source route. The native method map’s `association_current_join` selects these complete internal arguments in their separate current_materialization_source and current_goal_control realms. This is a real original entry requirement, not a stored unused schema. The native owner derives the internal inspection from actual current values and genuine retained original metadata; caller tags do not select a past body or authority.

The method’s physical return remains its exact complete current value plus genuine original origin, or its exact unavailable arm under the adopted A4 current-read contract. It does not add a Goal/Workflow inspection envelope, return current bytes labeled as old activation_body, expose a new public request discriminator, or write the inspection as a new durable family. Passive retained source/audit reads disclose only genuine surviving content permitted by its owner and carry no materialization or dispatch authority. Historical source grammar stays exact for historical interpretation; its requirement for full old B0/W0 content cannot silently be applied to the current successor.

This bounded transition chain covers original association, birth, materialization and the existing pre-start staging/preparation continuity only. `owner.workflow.activation.stage_entrypoints.v1` retains genuine required-entrypoint readiness and dispatch_released=false. `owner.workflow.activation.prepare_start.v1` prepares the actual ActivationReceipt and outbox with ready/start_event_pending; it does not issue a start EventRecord, first append receipt or dispatch. `owner.workflow.activation.cancel_before_mutation.v1` records only its original pre-start abort where that original no-mutation branch is admissible; it supplies no after-mutation settlement or new cancelled GoalRun event. Later start, execution, certification, cancellation settlement and their current readers require their separately explicit owner transition contracts; this pre-start join grants none of those writers.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: GRS-077
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Original Workflow source, association and current activation custody. The actual T0 binding reservation,
  T1 original joint birth/metadata/association publication and later T2 materialization preserve exact whole sources
  and original owner identity.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- GRS-064
- GRS-074
- GRS-075
- CV-349
- SP-308
unblocks: []
acceptance_criteria:
- The actual T0 binding reservation, T1 original joint birth/metadata/association publication and later T2 materialization
  preserve exact whole sources and original owner identity.
- Goal metadata advances ordinary revision/currentness exactly once while preserving accepted objective lineage;
  the final binding commit consumes its genuine reserved pending/current epoch.
- Current reads join authentic surviving B1 and compact Workflow transition provenance without reacquiring overwritten
  B0/W0 bodies or substituting historical bytes.
- All seven whole durable original inputs and actual empty child-source authority precede materialization; unavailable
  or changed sources refuse.
validation_surfaces:
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json
- Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json
- Plans/workflow_activation_contracts/association-hash-dependencies.json
- Plans/workflow_activation_schema_resources.json
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: grs_077_activation_original_custody
implementation_surfaces:
- Plans/Goal_Runtime_System.md
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

ContractRef: ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json, ContractName:Plans/workflow_activation_contracts/association-hash-dependencies.json, ContractName:Plans/workflow_activation_schema_resources.json


### GRS-078 - Original Workflow Goal cancellation with late event assignment

GRS-078 defines one original `cmd.chat.goal.cancel` profile, `goal_workflow_cancel_late_assignment.v1`, for the existing Workflow association. SP-304, SP-305, GRS-073..076 and SIR-050/051 source/currentness/final-release obligations remain, with the explicitly versioned Workflow settlement arm, original V3 result selection, physical carriers and late Storage assignment order below. The source prerequisites are EP-118/119 and SP-309. The original no-association and bound Plan V2 profiles remain active on their existing complete routes. `none_required` cannot represent this profile's actual nonnull Workflow association: the new disjoint arm is `workflow_settled`.

The complete central descriptor is `Plans/goal_runtime_workflow_cancel_contracts.schema.json#/$defs/GoalCancelResultV3`, schema ID `pm.goal.cancel.result.v3`. All six complete source schemas and their separately resolved Goal/native resource realms are selected by `Plans/goal_workflow_cancel_contracts/entry-boundaries.json` and `Plans/goal_workflow_cancel_schema_resources.json`. Schema registration defines a source contract; actual native installation and original admission remain independently required. SP-310 owns exact codecs, numeric commitments, physical profile composition, retention and Storage participation; SIR-052 owns original acceptance/terminal/replay; BRS-026 owns coherent backup and restore.

#### Whole installed profile and original admission

The public command and handler, actual owner.goal.cancel@1.0.0, owner.goal.host_stop@1.0.0, owner.goal.body.mutation@1.0.0 and owner.sir.goal_cancel@1.0.0 remain. Private method names in Plans/goal_workflow_cancel_contracts/methods.json identify new adapters of those actual native owners; a name, hash or schema does not install one. The complete schema/resource/codec/dispatch/read/write/backup graph is registered by the real original owners before a new operation can be admitted. The genuine original SIR acceptance selects `pm.goal.cancel.result.v3` and the complete new central GoalCancelResultV3 descriptor. The retained original V2 selection is never upgraded, reinterpreted or sent through this profile after acceptance. Ordinary no-association and bound Plan operations retain their original entire V2 schema, method, physical-key and SIR routes. The new complete schema preserves their arms for source accounting; the new live Workflow route admits only exact `workflow_requires_owner_disposition`, association_count=1 and actual nonnull Workflow owner/run association.

The Goal registry and native registry are separately resolved. Conflicting same-ID historic resources are not merged, silently substituted or fetched from network. Whole shared Goal arguments pass separately into the native boundary; each authentic owner reads the original corresponding complete values. A recursive schema-equivalence proof is type compatibility only, not common issuance or a permission transfer. The complete EP-119 D05 and EP-118 positive D06 profiles remain one-way prerequisites. They do not import this coordinator.

The entire native writer/reservation/dispatch graph must already have enrolled the original Workflow terminal publisher, original Goal terminal publisher and their actual registered scopes before actual Workflow run allocation/domain birth. Existing uncovered runs are unavailable; no post-Stop role enrollment, re-created birth, fabricated writer registration or empty-domain inference is permitted. This source adds no public writer role or work capability. The actual original cancellation control-plane participants are existing independently registered terminal services outside the work queues cut by Stop. Both original terminal publishers still execute their own actual first durable event barrier, source/currentness checks and original permissions after their required Stop. No user-effect queue is reopened, and no late callback or reclaimed work reservation may publish. A serialization claiming a registered role is not evidence of installation.

After C-source, BeforeStopEntry and CurrentStoppedGoalEntry carry the complete current StorageProgressHead and its complete selected immutable StorageProgress epoch as CurrentProgressPair. All inheriting owners/event/append/control entries re-fetch that pair under the actual original Storage owner for their own current phase. The exact versioned head key, epoch key, scope, operation, progress_epoch and whole outer snapshot hash must agree, and the actual phase must be the proper original predecessor for that method. A serialized pair does not establish native currentness. A later phase never reuses an earlier held head. Original selected terminal progress is a separate complete epoch wrapper supplied explicitly to terminal publication and both retained readers; authenticate its exact original selected key/codec/epoch/full outer hash against the immutable terminal or terminal staging input. It is never replaced by the current head or a later epoch. SourceCapture has only its original genuine creation/absence admission and does not require a future head.

At every private method entry, the actual original owners independently obtain the complete typed inputs, complete native current controls/origins, original source and output candidates applicable to that phase. All identity, source, operation, scope, owner epoch, permission, deletion, backup/root and codec participants agree. Each returning helper is followed by the full pure final predicate against those actual current participants. No helper or unguarded interleaving occurs between that predicate and a write or passive release. Native capabilities cannot be reconstructed from the arguments. BeforeStopNativeEntry's registrations are checked against the actual original exhaustive writer inventory and native boot/owner/domain/lineage sources; the exact original current-start admission must be covered by its proper pre-Stop phase. No future DomainCut or successful D05/D06 is required before Stop.

#### Exact ordered original effects

1. C-source uses full SourceCaptureEntry and the actual pre-Stop native admission. Original Goal body, accepted revision/history/origins, BodyControlV2, current host Stop and complete execution-binding domain/control/revision/origin/selection agree. Actual original accepted SIR identity/nonterminal outcome and producer identity/time are preserved. SourceAudit and new v2 progress/head source_admitted epoch 0 issue together. BindingSelection is genuinely coissued under the same original binding exclusion; it is not a prerequisite fabricated before the source transaction. Existing active/paused/blocked source statuses and complete existing Stop epochs retain their canonical meanings; no absent or old Stop is converted to zero.
2. The real original SIR acknowledgment barrier and authentic acknowledged outcome are read back. Preparation validates whole BeforeStopEntry and BeforeStopNativeEntry, actual installed codecs, complete accepted input graph, exact event template and complete numeric path inventory. It qualifies known values and all permitted genuinely runtime-derived domains without a future next-sequence value. Storage issues immutable BeforeStopReadiness. No exclusive append/rotation/selection fence or sequence reservation crosses C-stop, D05 drains or D06 publication. Readiness gives no first receipt, current source, settlement or success authority.
3. C-stop consumes StopPublicationEntry plus pre-Stop native source at the actual shared host/Goal/Storage fence. It performs exactly original durable StopControl succession, immutable StopReceipt, BodyControlV2 cancellation_pending and stop_reserved progress/head epoch 1. The progress field reservation_sha256 retains its original shared-body cancellation reservation meaning; it is not the late append reservation or readiness hash. Genuine existing ordinary body pending can settle once as the original owner permits before C-receipt, but cancellation does not rewrite the body or target a new revision. Readiness is authenticated original custody and cannot be regenerated after a refused source.
4. C-receipt requires current authentic stopped Goal/host/body custody, no uncleared ordinary pending, and the original control-plane admission. It issues the original minimal CancellationReceipt and receipt_committed epoch 2 atomically. cancellation_id remains the originally accepted operation_id, physical receipt key remains `goal_cancel_receipt:O`, and accepted_at remains the exact original producer occurred_at_utc. The receipt proves acceptance and Stop only.
5. The real D05 owners complete current safe-stop aggregation with the complete EP-118/119 current-start and separate current-Goal argument, closing all existing required work admission/drain/absence obligations. Actual original positive D06 then uses its unchanged methods/protocol and full successful D05 input. If Workflow was nonterminal, D06 performs its original cancelled run transition and its own original `goal_run.cancelled` event plus first receipt; if originally terminal, it preserves the authentic certified/failed/cancelled result without inventing that event. Both branches still require the full current D05/current-start proof stipulated by positive D06. This is not a boolean D05 success substitution.
6. C-owners receives full OriginalOwnersEntry and full OriginalOwnersNativeEntry, including complete current positive D06 SuccessfulReadback and original start/Goal/control-plane companions. Goal scope, original binding run and owner/epoch, original Goal Stop/receipt, D05 result/origin, D06 operation/result/origin/run branch and current full bodies agree under the actual joint native boundary. ScopeProof selects the complete actual D06 result wrapper and original origin and complete D05 result/origin with actual outer hashes. WorkflowOwnerSettlement has kind=workflow_settled; its owner result ref/hash is that exact D06 result wrapper, scope ref/hash is this actual ScopeProof wrapper, schedule/quota refs are null, and the exact original nonnull no_bound_plan execution association remains. ScopeProof and owners_settled progress epoch 3 publish atomically. Reusing none_required is forbidden.
7. C-event freezes the unchanged original producer input in event_ready progress epoch 4. The original accepted event ID, idempotency key, payload, producer sequence, owner/version and timestamp spelling remain. It is still one Goal cancellation event. Workflow settlement does not replace the Goal event or emit it from the Workflow event producer.
8. Only now does the real Storage append owner enter LatePrepareEntry with complete current append sink/manifest/sequence allocator and positive native/Goal companions. It obtains one genuine exclusive append/rotation/selection fence and actual next-sequence/segment/manifest/offset reservation for this original Goal event. Whole LateAssignmentEntry contains the actual complete typed Storage-assigned EventRecord, full original producer, exact current sources, actual reservation and all complete numeric domains/codecs. The local source is rechecked after every helper before the reservation/effect. No actual event or first receipt is required before this reservation. Its actual sequence is not borrowed from D06's earlier event or predicted before Stop.
9. Storage checks every actual late integer and complete actual encoded value against the exact original route codecs and bounds, then issues LateAssignmentAudit. Complete EventRecord equality and producer semantic digest checks use all fields. The audit is compact original assignment custody, not a stored EventRecord or an authorization. It is tied to the exact same still-held actual reservation and native boot/owner/fence/transaction. The original append method consumes that full input, audit and actual native current companions and performs the real SP-278/SP-286 append and first barrier. It releases its append reservation only after actual append completion or authenticated abandonment under the existing owner. No D05 or D06 append is nested inside this exclusive fence.
10. Authentic original append success yields full original EventRecord, source frame, current append sources, index checkpoint/generation/frontier/read-token/row, full-value result, original custody and first receipt. Every source frame byte/locator/index selection is authenticated by the real current source owner and joined to the exact original event and actual assigned sequence/reservation. The original index token is actual owner issued and held, not reconstructed from checkpoint fields; an optional index miss proves no absence. The full result alone proves no current event. event_issued progress advances from event_ready, or authentic event_unknown may precede event_issued under the canonical resolution rule.
11. C-publish uses full PostOwnersEntry, current native successful disposition and full OriginalGoalAppendReadback. Under the sole shared body owner, verify unchanged original body, revision, complete history and origin, exact cancellation_pending, no ordinary pending and current original permissions/root/Stop. An authentic complete monotonic still-latched Stop successor is allowed exactly as original SP-304; a changed target or resumed Goal is not. Atomically set the actual receipt marker, clear only cancellation_pending, increment control_epoch, and issue immutable v2 ControlPublication and control_published progress. Body text, revision, timestamps, history and current Stop are preserved.
12. Original SIR successful terminal publication receives SucceededTerminalEntry plus complete append and native current companions. The V3 result, original terminal CommandOutcome/CommandResponse and immutable v2 terminal join the exact actual original source and selected immutable progress snapshot. They publish together at the original SIR boundary. terminal_progress_selector names the original versioned epoch key/full outer hash; it is never rebound to a later head. No schema/hash is evidence of actual native terminal publication.

#### Failure, resolution and passive audit

A known refusal before any original Stop can yield no_effect only with the original complete no-effect proof. A post-Stop refusal, unsupported actual late numeric value, lost native reservation, unavailable current source or lost current permission preserves genuine Stop/receipt/D05/D06/append/control effects and classifies the actual original state under the existing unknown/recovery-required rules. It cannot manufacture no_effect, success, an earlier timestamp, rounded integer or refreshed command acceptance. The unsettled terminal adapter does not require a nonexistent D06 result, late assignment, receipt or successful publication; its full original TerminalInput phase/proof remains mandatory. An earlier final unknown is immutable even if original effects are subsequently resolved; replay returns that original unknown.

Late reservation release/loss does not grant reacquisition, rotation refresh or a second original assignment in this profile. If no authenticated append occurred and the one original reservation is no longer valid, the operation remains bounded pending/unavailable with genuine original effects preserved. If original effects actually occurred, their real original owners may classify/read them through their existing authenticated original custody. Same-owner in-place restart may dispatch only an already admitted original stage whose complete native source/fence prerequisites still hold; no new source IDs, role, producer, acceptance or reservation is invented. A live revoked source cannot silently switch into recovery within that call. This conservative source contract claims no eventual-success guarantee for lost reservations.

Retained succeeded replay consumes the complete original SourceAudit/terminal, compact original ScopeProof/Assignment and D06 retained result/origin through its exact retained reader. It reports original facts only and requires no fresh Goal body, Workflow runtime, current-start or current D05 success. Retained no_effect/unknown replay requires no nonexistent success metadata. Actual retained owner issuance, whole selected progress/terminal/result joins and current passive read permission/deletion/hold/backup rules still apply. Neither creates action authority. Current event inspection independently requires genuine current SP-278 full value/source/index evidence and the original first receipt/custody. Disposed original event bytes cannot be reconstructed from full-value hashes, receipts, terminal copies or a stored producer. Historical terminal replay does not assert current event availability.

#### Explicit unproved installation prerequisites

The source does not assert installed end-to-end cancellation. The separate canonical v3 goal_run.started/goal_run.cancelled event-family producer, consumer, schema registry, source query and backup adoption must be complete before this original profile is installed. All genuine native original owner/writer/codec/root/backup proofs must then qualify independently. Complete source schemas and this source-contract adoption do not discharge those installation predicates.

Inherited historical completion aliases in the native prerequisite map remain explicitly noncallable. Their inherited unresolved sites remain outside the fixed Plans/goal_workflow_cancel_contracts/entry-boundaries.json route boundary; no historical URI is rebound to a different current same-ID resource, even if selected definitions compare equal. Only exact method-map roots can enter this coordinator. The complete live roots must resolve in their own original realms and must not reach the unresolved historical target. A future required target needs a distinct reviewed full successor or separate historical realm.

```yaml
plan_unit_id: GRS-078
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Original Workflow Goal cancellation with late event assignment. Genuine original SIR V3 acceptance
  precedes source capture; old V2 profiles remain active and immutable.
gui_related: false
gui_classification_reason: Defines native owner, typed source, physical custody and verification semantics without
  a visual surface.
split_recommended: false
depends_on:
- GRS-076
- GRS-077
- EP-118
- EP-119
- SP-309
- SIR-051
unblocks: []
acceptance_criteria:
- Genuine original SIR V3 acceptance precedes source capture; old V2 profiles remain active and immutable.
- BeforeStopReadiness qualifies whole source and numeric domains without an exclusive append reservation; Stop,
  receipt and complete D05/D06 effects precede actual late Goal assignment.
- All fifteen explicit methods consume complete original typed source roots in their fixed isolated resource realms
  and repeat full entry and final predicates.
- Terminal and retained routes use the authentic original selected immutable progress epoch and distinguish actual
  current source from historical issuance.
- Lost reservation, unknown terminal, revoked source and earlier real effects remain truthful; installation and
  native proof remain required.
validation_surfaces:
- Plans/goal_runtime_workflow_cancel_contracts.schema.json
- Plans/goal_workflow_cancel_schema_resources.json
- Plans/goal_workflow_cancel_contracts/entry-boundaries.json
- Plans/goal_workflow_cancel_contracts/methods.json
- Plans/goal_workflow_cancel_contracts/numeric-paths.json
- Plans/goal_workflow_cancel_contracts/physical-profiles.json
- Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json
- Plans/storage_value_registry.json
risk_class: original_goal_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: grs_078_original_source_contract
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/goal_runtime_workflow_cancel_contracts.schema.json
- Plans/goal_workflow_cancel_schema_resources.json
- Plans/goal_workflow_cancel_contracts/entry-boundaries.json
- Plans/goal_workflow_cancel_contracts/methods.json
- Plans/goal_workflow_cancel_contracts/numeric-paths.json
- Plans/goal_workflow_cancel_contracts/physical-profiles.json
- Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, original acceptance, native authority, receipt, reservation or retrospective
  enrollment.
- No numeric coercion, lossy codec, stored header relabelling, dropped diagnostic branch or rewritten immutable
  terminal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/goal_runtime_workflow_cancel_contracts.schema.json, ContractName:Plans/goal_workflow_cancel_schema_resources.json, ContractName:Plans/goal_workflow_cancel_contracts/entry-boundaries.json, ContractName:Plans/goal_workflow_cancel_contracts/methods.json, ContractName:Plans/goal_workflow_cancel_contracts/numeric-paths.json, ContractName:Plans/goal_workflow_cancel_contracts/physical-profiles.json, ContractName:Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json


### GRS-079 - Exact original Workflow started-v3 semantics and read roles

This unit adopts exactly the existing `event-family-goal-run-started` row at family revision 3.0.0. Registry membership remains 42; the other 41 complete rows, including goal_run.cancelled, are unchanged. The selected payload is the complete existing `Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json` resource, schema ID `pm.goal_runtime_event.goal_run_started.schema.v3`, under outer EventRecord 2.0.0. The former v2 payload resource and all 22 original definitions remain byte-exact historical interpretation. The v2 EA-UND-0020-GOAL registration/expected-Goal-revision clauses remain applicable only to the original v2 profile; this exact active source route uses the split clocks below. No sibling Goal/GoalRun event, Executor attempt run.started, or old accepted profile is upgraded by name or alias.

The whole common v3 payload retains event name/version, exact occurred time, project/Goal identity, authentic unchanged Goal revision, actor/execution role, requested/effective provider/model/account, correlation and all required evidence/artifact and optional approved source fields. `expected_goal_revision` and retired `parent_goal_id` are absent from this route. `expected_goal_run_revision`, `goal_run_revision` and inner idempotency_key are required; the two Workflow revisions are the actual original before revision and before-plus-one. The six event-specific fields remain goal_run_id, workgraph_ref, activation_receipt_ref, active_worknode_request_refs, write_mode and certification_tier. Active request membership is the nonempty exact accepted required set, not one representative node. Outer run identity equals the original Workflow GoalRun; all optional thread, actor/provider/model/account and correlation/causation joins use the authentic original producer source. Focus, Settings and later reconstruction cannot supply them.

Original `owner.workflow.activation.commit_start.v2` with `owner.storage.workflow_start.commit_original.v2` retains the complete EP-118/SP-309 start coordinator and separate whole Goal argument. Original activation/readiness proves materialization, staged entrypoints, exact accepted requests, current permission/write authority, provider/model/account resolution, budget, parallelism, writer-capable Storage and no effective Stop. The actual coordinated publication commits ready-to-running and start_event_pending-to-active once, advances native body/activation revisions once, preserves Goal body/control, and publishes the one complete original Event/first receipt/custody plus full native/Start/D01 union. No actual pre-append dispatch, provider call or Usage charge follows from this event or a candidate. Original prestart abort requires genuine proof of no original append/effect and cannot reinterpret a committed start.

The idempotency key remains `pm.goal-runtime-event.v3:` plus lowercase SHA-256 of RFC8785 JCS of `["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.started", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, workgraph_ref, activation_receipt_ref]`. Storage owns exact scope_partition and inner/outer keys byte-equal. Only GoalRunStarted normalizes to goal_run.started with original alias evidence. BuildStarted and other aliases are rejected. Original same-identity/same-digest custody admits no new append/CAS/effect; conflicting digest is idempotency_conflict, stale original Workflow revision is revision_conflict, and unprovable dedupe is dedupe_unavailable. A missing acknowledgement, expired event or newly generated key/timestamp cannot restart the original run. The full original PublicationResult exists only at the held original invocation; later source inspection never reconstructs historical native bodies or a complete original input argument.

SP-214 and D-R20 require the durable GoalRun projection role. This route materializes that role with exactly one versioned derived row per original Workflow run and its own complete generation checkpoint under SP-311. It does not replace the role with a native-body pointer or passive none_required. The five exact source methods are read_retained_native, inspect_original, project_prefix, read_historical and read_current under `owner.goal_run.started.<method>.v1`. The first two and the two final readers have no durable effects/cursor/checkpoint; that zero-effect disposition is specific to those passive methods. project_prefix alone owns its complete projection/checkpoint transaction and is never exempt.

Projection means running/active at the original authenticated started event. Every field derives from the full original typed Event and entire authentic retained Start/D01 causal custody. Known outside-run records are verified no-ops in the global prefix; this same run's replanned, blocked, certified, cancelled or stopped event is unsupported by this bounded reducer and stops before its row. Unknown/malformed rows likewise prevent claimed full coverage. A second original start or conflicting native causal record is refused. No terminal or later-running state is guessed from an event name or silence.

Historical read explicitly asserts original facts only and requires the full original retained Event and causal custody. Current read additionally requires full fresh D01/native Start and separate current Goal controls under the original native boundary, the whole processed global prefix at the actual generic frontier and equality of current native issuance commitment to the original projected running issuance. Native D06 advancement, pending/Stopped authority, changed controls, unprocessed relevant event or unavailable source makes this current view unavailable. `Unavailable` describes source quality, not a fifth Goal state or fabricated Workflow state. Actual later native state keeps its own owner and is never overwritten by the projection. Orchestrator, Goal Runtime views and certification readers consume these exact views; no projection or receipt becomes certification, dispatch, resume, cancellation, Goal mutation or provider/tool/Usage authority.

All actual original owners apply complete independent entry and final guards before write or passive release, including the lower Storage/native custody participants. Complete current/as-of-source behavior, generation/prefix algorithms, retention and loss rules are the full SP-311 contract; original native causal joins are EP-120 and coherent recovery/disclosure is BRS-027. Source admission does not itself prove installed v3 producer/consumer/codec/root/backup services, Event depth or native runtime execution. Those gates remain unavailable until independently qualified. Goal retains exactly its existing four states; no WorkNodes, executable task, checkpoint compiler success, global safe-stop result or governance seal is created.

```yaml
plan_unit_id: GRS-079
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Complete original started-v3 source and bounded consumer ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Defines original runtime source, custody, replay and retention contracts without a visual surface.
split_recommended: false
depends_on:
- GRS-026
- GRS-031
- SP-214
- EP-118
unblocks: []
acceptance_criteria:
- Exact original whole source and retained/current boundary is preserved.
- Only the existing started Event family changes; all other Event rows and all 278 Storage rows and 27 policies remain exact.
- The mandatory durable projection has complete atomic generation/checkpoint ownership.
- Source definitions do not claim installed native authority, Event depth or runtime execution.
validation_surfaces:
- Plans/goal_run_started_consumer_contracts/consumer.schema.json
- Plans/goal_run_started_consumer_contracts/methods.json
- Plans/goal_run_started_consumer_contracts/physical-families.json
- Plans/goal_run_started_consumer_schema_resources.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: original_started_source_or_projection_currentness_drift
reasoning_tier: high
context_scope: original_started_v3_consumer_adoption
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```
