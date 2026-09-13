# Shard 040: Current Workflow activation and certification child scope

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6951-L7100

Source SHA256: `0f2a22408493d57bbc77c3ed6873a5b2d4de4adede558a9942d99adc5287d12d`

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
