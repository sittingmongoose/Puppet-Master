# Shard 039: Original Goal objective update acceptance and settlement

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6290-L6751

Source SHA256: `51a12e64668bec85a61dd810af0ca8919c1d8bfc2a40c010ae261448603b9baa`

---

## Original Goal objective update acceptance and settlement

GRS-068 adopts active `goal.updated` v3 for the existing complete objective replacement command. It supersedes current-write interpretation of D-R14, the old delta/child/budget minima and their common-v2 envelope assumptions only for this exact family. Whole-v2 remains an exact historical reader resource under `legacy_v2_reader`; historical validation confers no current retired field or state. Other Goal/GoalRun families require their own adjudication.

### Existing acceptance and independent authorities

GRS-064, SP-287 and DL-047 remain controlling. Update replaces the complete exact objective string, including empty text and original whitespace, with at most 4,000 Unicode scalars and no surrogate code points. Direct Save is actual original user acceptance (`user_direct`, null source_message_id and approval_id), without another confirmation. Agent mutation requires the actual explicit user instruction plus the existing approval host's still-valid resolution bound to this Goal, expected ordinary revision/currentness and whole replacement text; its source_message_id and approval_id are genuine nonnull originals. Mere route/source_surface strings, caller refs or a matching text digest are never authority. Active/paused/blocked permit edit; completed rejects. The accepted active replacement affects the next continuation boundary; it neither changes a running turn nor resumes a paused/blocked Goal or defeats host Stop.

The existing `owner.goal.body.mutation@1.0.0` remains the only body writer. SIR remains the original command identity/outcome owner. Goal Runtime authenticates original accepted-change/origin predicates. Storage authenticates original installed physical custody, CAS, retained origin, transaction and first publication evidence. No update-specific body issuer, cloned approval host, peer outcome producer or start source grant exists under this contract.

`cmd.chat.goal.propose_update` is separately read-only and must use its existing approval route. Its already-referenced GoalUpdateProposalRequest / ApprovalRequest definitions, provider-specific actual instruction/approval-resolution capture and admission remain a distinct technical prerequisite. This contract deliberately does not define those missing contracts or fabricate their provider. It defines the mutation-side required acceptance facts and predicates. A direct Save adapter can be reviewed independently; the agent route stays handler_unavailable until the existing approval owner closes and authenticates its exact provider binding. No product question is needed to invent new approval behavior.


SP-299 defines the complete original source → reservation → body commit → frozen event input → shared first publication → SIR terminal sequence. Only the body owner accepts revision n+1 and one matching accepted objective revision/origin, preserving exact identity and created_at. The previous accepted objective hash can predate ordinary metadata revisions; do not substitute the immediately preceding ordinary revision. Empty and unchanged text remain full accepted updates under existing revision rules. A complete body transaction can succeed before event/result settlement becomes unknown; this preserves the accepted body rather than rolling it back or representing a partial body write.

The resulting `goal.updated` observation records only the actual original accepted change, before/after body facts, predecessor and original body/source evidence. It never grants continuation, edits a bound Plan, repairs approval, resumes a paused/blocked Goal or overrides Stop. Existing GoalPlanBinding epoch fencing and material-conflict safe-stop behavior remain independently required. A later current Goal edit cannot rewrite this operation's original event input. Final body admission rechecks actual current source/approval/owner/Stop/access/deletion/origin; later factual event/result settlement has no further body-write authority.

The actual approval-owner provider and the already-referenced `GoalUpdateProposalRequest`/`ApprovalRequest` remain separately unmaterialized technical dependencies. The agent-proposed mutation route stays unavailable until that original provider supplies its exact capture and still-valid resolution. Direct user Save keeps its existing acceptance without another confirmation. No fallback provider or new approval policy is invented here.

The two update-only retained audit/input readers have SP-299's distinct precise selectors and final visibility predicates. GRS-064/SP-299 independently adopt the named current Activity/body/control/history consumers and selected active-v3 event inspection; audit/input declarations and Goal-created profiles do not supply that authority. These actual consumers have no additional event-derived Goal state or durable checkpoint. The remaining Goal families, actual agent approval provider and native dispatcher/source/transaction/read-release/runtime evidence remain independent obligations.

### GRS-068 - Original Objective Update Acceptance And Effect Settlement
```yaml
plan_unit_id: GRS-068
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: The existing complete Goal objective replacement accepts authentic direct Save or the
  existing original approved agent source, uses only the shared Goal body writer and preserves each original
  accepted effect through later event/result settlement without granting continuation or changing approved
  Plan behavior. Current updated-v3 consumer composition follows the separately adopted canonical body/control/history,
  selected-event/audit/input and immutable original replay owners without deriving state from an event.
gui_related: false
gui_classification_reason: Defines existing-command source, event, storage and result publication without
  a new visual surface.
depends_on:
- GRS-064
- GRS-066
- SP-299
- SIR-049
- CV-342
- DL-047
unblocks: []
acceptance_criteria:
- Direct Save is acceptance without reconfirmation; agent replacement requires actual explicit instruction
  and current original approval bound to exact Goal/revision/currentness/text.
- The complete exact objective including empty/unchanged text uses the existing 4000-scalar rule; no trim,
  partial patch, hidden rewrite or no-op shortcut is allowed.
- Active/paused/blocked permit existing edit semantics and completed rejects; next-continuation, Stop
  and bound-Plan conflict/epoch rules stay independently controlling.
- Original source and independent producer preparedness precede pending reservation; future body/event
  receipts cannot bootstrap source acceptance.
- The sole shared body transaction writes n+1 and one accepted revision/origin with the actual latest
  objective predecessor, preserving immutable identity and history.
- A genuine body commit survives later refusal or unknown publication; event/result recovery cannot create
  another revision, rerun acceptance or override immutable terminal history.
- Active-v3 interpretation replaces only this family's retired delta/child/budget write assumptions while
  preserving the entire historical v2 resource.
- Audit/input readers remain distinct from current canonical body/control/history, selected active-v3 event inspection
  and original immutable command replay; all use their own complete source and after-helper final release.
- Actual approval provider and native installation/implementation/evidence remain separate prerequisites; this composition
  creates no additional durable projector/checkpoint.
validation_surfaces:
- Plans/goal_update_command_custody.schema.json
- Plans/goal_update_schema_resources.json
- reports/event-authority-20260911/step-08-goal-update-validation.md
- reports/event-authority-20260911/step-08-goal-update-checks.json
risk_class: false_original_update_or_lost_accepted_effect
reasoning_tier: high
context_scope: original_goal_objective_update_acceptance
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/goal_update_command_custody.schema.json
node_compile_hint:
  mode: original_goal_update_prerequisite_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/Goal_Runtime_System.md#GRS-064
negative_constraints:
- Do not infer accepted source or native atomicity from a schema, copied owner map, result-shaped value
  or fixture.
- Do not reconstruct disposed input, change original terminal outcomes, borrow creation authority or claim
  current event-consumer depth.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Shared_Integration_Runtime.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-068, ContractName:Plans/storage-plan.md#SP-299, ContractName:Plans/Shared_Integration_Runtime.md#SIR-049, ContractName:Plans/Contracts_V0.md#CV-342

### GRS-069 - Exact historical goal.progressed contract

```yaml
plan_unit_id: GRS-069
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: For exactly goal.progressed, Every D-R08 allowed state pair requires scheduled/running/repairing/verifying,
  absent from the exclusive current Goal lifecycle. Its mandatory TaskDelta is Goal-owned task progress, while the
  current Goal Activity owner explicitly assigns progress to To-Dos and transcript and forbids a Goal task tracker.
  This individual semantic conflict establishes this exact-family current-writer prohibition; omission from the
  required-name list is not the reason. The unchanged registered v2 resource is historical validation only, and
  every current writer is refused before dedupe/CAS/outbox/append. SP-300 owns the sole newly specified ephemeral
  historical reader with complete SP-278 source authority and independently preserved original semantics; no current
  Goal state or durable effect is derived.
gui_related: true
gui_classification_reason: This exact historical event cannot populate current Goal lifecycle or task/child controls.
split_recommended: false
depends_on:
- GRS-048
- GRS-055
- DL-039
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.progressed` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. A current blocked/active/paused Goal, a To-Do transition, an unchanged
  fingerprint, or a schema-valid old running pair cannot authorize a current append. Historical task IDs do not
  become active To-Dos, Goal children or percentages.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_progressed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_progressed_historical_authority_confusion
reasoning_tier: high
context_scope: goal_progressed_historical_contract
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.progressed
- pm.goal_runtime_event.goal_progressed.schema.v2
- storage.goal_progressed_history_read.v1@1.0.0
- D-R08
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

Every D-R08 allowed state pair requires scheduled/running/repairing/verifying, absent from the exclusive current Goal lifecycle. Its mandatory TaskDelta is Goal-owned task progress, while the current Goal Activity owner explicitly assigns progress to To-Dos and transcript and forbids a Goal task tracker. This individual semantic conflict establishes this exact-family current-writer prohibition; omission from the required-name list is not the reason.

For exactly `goal.progressed`, retain the registered `event-family-goal-progressed@2.0.0` and whole unchanged `Plans/event_payloads/goal_runtime/goal_progressed.schema.json#` (`pm.goal_runtime_event.goal_progressed.schema.v2`) for exact historical interpretation only. The current Goal owner admits no producer, command, host callback, retry, recovery callback, upgrader or timer that appends this exact event. Reject before dedupe success, CAS, outbox or append even when the historical schema validates, an original idempotency key matches or a current workflow has superficially similar behavior. A retained historical lookup is a separate read path and cannot become current-write replay.

Current work status remains with ToDoController and ordinary transcript; loop/no-progress taxonomy remains Run_Modes. No payload or alias is translated to todo.updated, todo.status_changed or any workflow event by this exact owner contract.

Preserve exact progress_fingerprint, disjoint nonempty TaskDelta union, status_before/status_after, complete artifact_hashes, optional repeat_count and no_progress_marker. Preserve the four old pairs; repeated count >=2 requires matching continuation count and unchanged-artifact evidence. A repeated fingerprint never disguises no progress. Original current-state and source/CAS proof may be unresolved; do not manufacture it.

This ruling does not widen the four-state Goal, reintroduce Goal title/task/phase/tranche/child/budget/role structure, add a workflow obligation, or alter any other exact event's disposition. It grants no current body/revision/receipt/GoalRun effect. Historical bytes are never rewritten, stripped, rehashed as a new payload, promoted to active state or used to infer new original admission. A future semantic successor requires a separate explicit owner contract and central admission; none is supplied here.

The exact reader is `storage.goal_progressed_history_read.v1@1.0.0` under SP-300. CV-343 applies this qualification to the schema roster and original minima. Existing original acceptance examples are historical conditional oracles only. No historical positive instance, native producer/reader or event-depth verdict is claimed.

ContractRef: ContractName:Plans/storage-plan.md#SP-300, ContractName:Plans/Contracts_V0.md#CV-343, ContractName:Plans/Decision_Log.md#DL-039

### GRS-070 - Exact historical goal.replanned contract

```yaml
plan_unit_id: GRS-070
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: For exactly goal.replanned, D-R10 requires affected_child_goal_ids and child_decisions and commits
  through replanning. Current Goal prohibits child topology and stages; its approved text replacement is the separate
  goal.updated owner path. Workflow workgraph/replanning stays with the workflow, not Goal. Each prohibition directly
  addresses this row rather than relying on another retired event. The unchanged registered v2 resource is historical
  validation only, and every current writer is refused before dedupe/CAS/outbox/append. SP-301 owns the sole newly
  specified ephemeral historical reader with complete SP-278 source authority and independently preserved original
  semantics; no current Goal state or durable effect is derived.
gui_related: true
gui_classification_reason: This exact historical event cannot populate current Goal lifecycle or task/child controls.
split_recommended: false
depends_on:
- GRS-048
- GRS-052
- GRS-068
- DL-039
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.replanned` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. Current material objective change or workflow replan cannot append
  this exact old Goal event, and missing original child/evidence/currentness facts cannot be backfilled with present
  workflow state.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_replanned.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_replanned_historical_authority_confusion
reasoning_tier: high
context_scope: goal_replanned_historical_contract
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.replanned
- pm.goal_runtime_event.goal_replanned.schema.v2
- storage.goal_replanned_history_read.v1@1.0.0
- D-R10
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

D-R10 requires affected_child_goal_ids and child_decisions and commits through replanning. Current Goal prohibits child topology and stages; its approved text replacement is the separate goal.updated owner path. Workflow workgraph/replanning stays with the workflow, not Goal. Each prohibition directly addresses this row rather than relying on another retired event.

For exactly `goal.replanned`, retain the registered `event-family-goal-replanned@2.0.0` and whole unchanged `Plans/event_payloads/goal_runtime/goal_replanned.schema.json#` (`pm.goal_runtime_event.goal_replanned.schema.v2`) for exact historical interpretation only. The current Goal owner admits no producer, command, host callback, retry, recovery callback, upgrader or timer that appends this exact event. Reject before dedupe success, CAS, outbox or append even when the historical schema validates, an original idempotency key matches or a current workflow has superficially similar behavior. A retained historical lookup is a separate read path and cannot become current-write replay.

Current objective replacement remains GRS-068/CV-342/SP-299; workflow WorkGraph generation and affected WorkNode disposition remain with the actual workflow and separately governed goal_run.replanned. This exact owner contract creates no alias, conversion or requirement to emit that sibling.

Preserve all original interruption classes, impact_summary, exact affected-child/decision correspondence, affected_worknode_refs, remaining-evidence currentness, new_revision equality and seven admitted next_action branches. Original transient replanning and committed successor are historical interpretation only. Preserve historical child scope/decision objects without rebuilding topology or commandeering real WorkNodes.

This ruling does not widen the four-state Goal, reintroduce Goal title/task/phase/tranche/child/budget/role structure, add a workflow obligation, or alter any other exact event's disposition. It grants no current body/revision/receipt/GoalRun effect. Historical bytes are never rewritten, stripped, rehashed as a new payload, promoted to active state or used to infer new original admission. A future semantic successor requires a separate explicit owner contract and central admission; none is supplied here.

The exact reader is `storage.goal_replanned_history_read.v1@1.0.0` under SP-301. CV-344 applies this qualification to the schema roster and original minima. Existing original acceptance examples are historical conditional oracles only. No historical positive instance, native producer/reader or event-depth verdict is claimed.

ContractRef: ContractName:Plans/storage-plan.md#SP-301, ContractName:Plans/Contracts_V0.md#CV-344, ContractName:Plans/Decision_Log.md#DL-039

### GRS-071 - Exact historical goal.stopped contract

```yaml
plan_unit_id: GRS-071
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: For exactly goal.stopped, D-R12 necessarily commits stopped Goal state, and may carry child settlements.
  Current Goal state has no stopped; manual Stop/Pause latches the host stop epoch and pauses continuation while
  workflow-owned records retain their own owners. The state contradiction alone is sufficient even in the before_mutation
  branch with empty settlement arrays. The unchanged registered v2 resource is historical validation only, and every
  current writer is refused before dedupe/CAS/outbox/append. SP-302 owns the sole newly specified ephemeral historical
  reader with complete SP-278 source authority and independently preserved original semantics; no current Goal state
  or durable effect is derived.
gui_related: true
gui_classification_reason: This exact historical event cannot populate current Goal lifecycle or task/child controls.
split_recommended: false
depends_on:
- GRS-048
- GRS-051
- DL-039
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.stopped` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. A user Stop, cleared dependency, quota reset, execution window, recovery
  receipt or retained resumable=true never authorizes current stopped Goal state, resume/stop-epoch clearing or
  a new settlement/receipt.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_stopped.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_stopped_historical_authority_confusion
reasoning_tier: high
context_scope: goal_stopped_historical_contract
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.stopped
- pm.goal_runtime_event.goal_stopped.schema.v2
- storage.goal_stopped_history_read.v1@1.0.0
- D-R12
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

D-R12 necessarily commits stopped Goal state, and may carry child settlements. Current Goal state has no stopped; manual Stop/Pause latches the host stop epoch and pauses continuation while workflow-owned records retain their own owners. The state contradiction alone is sufficient even in the before_mutation branch with empty settlement arrays.

For exactly `goal.stopped`, retain the registered `event-family-goal-stopped@2.0.0` and whole unchanged `Plans/event_payloads/goal_runtime/goal_stopped.schema.json#` (`pm.goal_runtime_event.goal_stopped.schema.v2`) for exact historical interpretation only. The current Goal owner admits no producer, command, host callback, retry, recovery callback, upgrader or timer that appends this exact event. Reject before dedupe success, CAS, outbox or append even when the historical schema validates, an original idempotency key matches or a current workflow has superficially similar behavior. A retained historical lookup is a separate read path and cannot become current-write replay.

Current Goal Stop/Pause follows GRS-051 and cmd.chat.goal.pause; required goal.paused remains under its own central registration/admission. Actual Workflow stopping, safe points, tool settlement and goal_run.stopped remain separately owned. No automatic alias from goal.stopped to goal.paused or goal.cancelled.

Preserve original stop_reason_code, four interruption_boundary values, child_settlement_refs, tool_settlement_refs, resumable and conditional safe_point_ref. before_mutation has empty settlement arrays and no safe point; after_mutation_before_settlement has nonempty incomplete-settlement evidence and resumable=false; true resume requires actual original safe-point/recovery/authority evidence. Preserve materially-new repeated-stop boundary.

This ruling does not widen the four-state Goal, reintroduce Goal title/task/phase/tranche/child/budget/role structure, add a workflow obligation, or alter any other exact event's disposition. It grants no current body/revision/receipt/GoalRun effect. Historical bytes are never rewritten, stripped, rehashed as a new payload, promoted to active state or used to infer new original admission. A future semantic successor requires a separate explicit owner contract and central admission; none is supplied here.

The exact reader is `storage.goal_stopped_history_read.v1@1.0.0` under SP-302. CV-345 applies this qualification to the schema roster and original minima. Existing original acceptance examples are historical conditional oracles only. No historical positive instance, native producer/reader or event-depth verdict is claimed.

ContractRef: ContractName:Plans/storage-plan.md#SP-302, ContractName:Plans/Contracts_V0.md#CV-345, ContractName:Plans/Decision_Log.md#DL-039

### GRS-072 - Exact historical goal.verification_decided contract

```yaml
plan_unit_id: GRS-072
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: For exactly goal.verification_decided, All D-R15 source edges require running/verifying/repairing
  Goal states and prescribe Goal verifier/cycle authority. Current Goal has none of those states or mandatory role
  cast; Review and workflow certification own their actual reviewer/evidence/decision. Even the blocked destination
  branch has an illegal current source, so no valid four-state v2 subset is available. The unchanged registered
  v2 resource is historical validation only, and every current writer is refused before dedupe/CAS/outbox/append.
  SP-303 owns the sole newly specified ephemeral historical reader with complete SP-278 source authority and independently
  preserved original semantics; no current Goal state or durable effect is derived.
gui_related: true
gui_classification_reason: This exact historical event cannot populate current Goal lifecycle or task/child controls.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-050
- DL-039
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.verification_decided` append is refused before dedupe/CAS/append with no state, receipt,
  provider, Usage, scheduling, Goal or workflow effect. A current reviewer result, VerificationCycle.status, valid
  Workflow receipt, or old passed payload cannot append this Goal event, mutate Goal state, create a required Goal
  verifier/adjudicator role, or claim completion.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
- A same-generation nonmatching append, changed root/anchor/frontier/source, access/deletion/hold/maintenance change
  or post-helper candidate alteration invalidates the read before disclosure. No helper runs after the final actual-owner
  guard.
- Repeated lookup changes no durable state; reader withdrawal returns unavailable while preserving exact original
  custody. Lawfully removed required source yields unavailable, not payload reconstruction.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_verification_decided_historical_authority_confusion
reasoning_tier: high
context_scope: goal_verification_decided_historical_contract
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.verification_decided
- pm.goal_runtime_event.goal_verification_decided.schema.v2
- storage.goal_verification_decided_history_read.v1@1.0.0
- D-R15
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

All D-R15 source edges require running/verifying/repairing Goal states and prescribe Goal verifier/cycle authority. Current Goal has none of those states or mandatory role cast; Review and workflow certification own their actual reviewer/evidence/decision. Even the blocked destination branch has an illegal current source, so no valid four-state v2 subset is available.

For exactly `goal.verification_decided`, retain the registered `event-family-goal-verification-decided@2.0.0` and whole unchanged `Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json#` (`pm.goal_runtime_event.goal_verification_decided.schema.v2`) for exact historical interpretation only. The current Goal owner admits no producer, command, host callback, retry, recovery callback, upgrader or timer that appends this exact event. Reject before dedupe success, CAS, outbox or append even when the historical schema validates, an original idempotency key matches or a current workflow has superficially similar behavior. A retained historical lookup is a separate read path and cannot become current-write replay.

Reviews use their own frozen ReviewTargetPack/Review records; workflow VerificationCycle/certification keep their original owners. No conversion to a collaborative event, goal_run.certified or generic VerificationCycle status is granted.

Preserve decision, verifier_ref, finding_refs, closure_refs, unresolved_risk_refs and optional audit_cycle_id/verification_cycle_id/adjudicator_ref. At least one cycle ID remains required; passed requires empty findings/risks and closure/evidence proof, failed requires findings, blocked requires risk/block refs. Original Strong third-repeat adjudicator rule and original source edges remain historical diagnostics. Passed never establishes completion.

This ruling does not widen the four-state Goal, reintroduce Goal title/task/phase/tranche/child/budget/role structure, add a workflow obligation, or alter any other exact event's disposition. It grants no current body/revision/receipt/GoalRun effect. Historical bytes are never rewritten, stripped, rehashed as a new payload, promoted to active state or used to infer new original admission. A future semantic successor requires a separate explicit owner contract and central admission; none is supplied here.

The exact reader is `storage.goal_verification_decided_history_read.v1@1.0.0` under SP-303. CV-346 applies this qualification to the schema roster and original minima. Existing original acceptance examples are historical conditional oracles only. No historical positive instance, native producer/reader or event-depth verdict is claimed.

ContractRef: ContractName:Plans/storage-plan.md#SP-303, ContractName:Plans/Contracts_V0.md#CV-346, ContractName:Plans/Decision_Log.md#DL-039
