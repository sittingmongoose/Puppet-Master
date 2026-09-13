# Shard 039: Original Goal objective update acceptance and settlement

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6296-L6948

Source SHA256: `0f2a22408493d57bbc77c3ed6873a5b2d4de4adede558a9942d99adc5287d12d`

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

### GRS-073 - Current explicit Goal cancellation

```yaml
plan_unit_id: GRS-073
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: The original explicit Cancel operation preserves the exact four-state Goal body and revision,
  latches the actual host Stop before cancellation effects, publishes a content-free minimal receipt and current
  v3 fact, then changes only hidden control to remove active display. Whole v2 D-R02 remains historical only.
  All existing body writers and current readers use the shared v2 control; genuine partial effects and original
  SIR replay remain immutable.
gui_related: true
gui_classification_reason: Defines truthful current Goal Activity removal, pending visibility and retained
  history.
split_recommended: false
depends_on:
- GRS-064
- GRS-068
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- Cancel accepts only active/paused/blocked with actual original user/SIR acceptance; completed and previously
  cancelled refuse a new operation.
- Complete duplicate identity replays only the immutable original; altered request under that identity conflicts.
- Cancellation changes no Goal body, ordinary revision, objective history or Workflow-owned result; the control
  marker alone removes active display.
- All original body/control readers and writers use current v2 control, preserve old pending, and respect independent
  cancellation_pending/receipt and actual Stop.
- Historical D-R02 and its whole schema remain readable only with original historical evidence; no retrofit
  receipt or fifth current state.
validation_surfaces:
- Plans/goal_cancel_command_custody.schema.json
- Plans/goal_execution_binding_custody.schema.json
- Plans/goal_cancel_schema_resources.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: grs-073_original_cancel_contract
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
- No fifth Goal state, objective/body revision mutation, child/tool settlement list, new command or peer handler.
- No raw Goal content in indefinite audit, new retention limit, silent codec substitution or fabricated original
  receipt.
- No native execution proof, full event-depth verdict, WorkNode/readiness admission or governance seal.
```

##### Owner disposition and exact command

The current Goal owner is GRS-051/GRS-064 and the current opening four-state contract, not D-R02's cancelled-state transition. Current cancellation is original explicit user cancellation, its minimal receipt and goal.cancelled, followed by active-projection removal and permanent prohibition on that Goal's continuation. Preserve the entire GoalRecordV2 semantic body, ordinary revision/currentness, accepted objective revision chain/origin and independently owned Workflow records. There is no new state, synthetic paused body, objective revision, body-mutation receipt or Goal child settlement list. The operation mutates shared hidden cancellation control only, through the existing sole owner.goal.body.mutation@1.0.0. GRS-064's every-body-mutation revision rule remains unchanged because cancellation does not mutate body bytes.

The existing sole cmd.chat.goal.cancel / handlers::goal_runtime::goal_cancel gains exact GoalCancelRequestV2 and GoalCancelResultV2 definitions in the existing central goal_runtime_contracts.schema.json; do not create a peer handler or define generic GoalControlRequestV2 for pause/resume as a side effect. Preserve other commands. Request has the existing fourteen original header/identity/CAS/actor/permission/idempotency/surface/return-route fields and no objective, arbitrary reason, title or new approval flow. CancelReason is fixed user_cancelled for this original user route. Source_surface and user_cancelled are recorded facts, not grants. The actual SIR accepted dispatch and actual user-action acceptance must exist before any source capture. A caller-built request, command string, source ref, permission snapshot or valid identity envelope does not issue them. Active/paused/blocked are the current permitted body states; completed or already cancelled rejects a new operation. Duplicate identical original identity resolves its original operation without revalidating against a newer body to turn it into a new cancellation. Changed complete request or normalized identity under that original identity is conflict.

SIR independently holds its original request object, dispatch_id, CommandOutcomeRecord, full IdentityEnvelope, payload digest, idempotency, target generation, frame and operation identity. Goal independently holds the actual explicit accepted user Cancel, original target and expected revision/currentness, current user authority, complete body/control/history/origin and genuine execution binding. Request project/thread/Goal/command instance/actor/permission/return route and normalized source must agree with those originals. CommandOutcomeRecord identity equals the normalized identity; actual dispatch payload_sha256 is never replaced by the new local request/source hash. Exact request_ref and command_outcome_ref refer to those actual original SIR objects. No synthetic accepted command or generic source-shaped callback is an issuer.

Predispatch unregistered/unavailable/invalid/permission refusal stays the existing central CV-333 branch, no source carrier or Stop is claimed. Known unsupported native route is handler_unavailable; known missing exact required normative provider is separately listed in SP-305 remaining source integrations. Neither observation authorizes fallback execution.

##### Shared Stop and body-control placement

GRS-064 already requires an independently durable original host Stop epoch with priority over body reservation. SQ-001 and GREPLAY-009..010 require manual Cancel to increment/fence the actual epoch across restart and at final dispatch. They have no exact physical Goal-local epoch family in the selected source graph. This contract explicitly materializes that existing Goal host authority as goal_host_stop_control and immutable goal_cancel_stop_receipt, not a second shadow clock or a goal.cancelled body field. Goal dispatch, schedule/quota/window/provider callbacks that can continue this Goal, manual Goal Stop/Pause/Resume/Cancel and actual run-binding changes must read/update this same original host-selected row or remain disabled before this cancellation profile activates. A wrapper named StopControl cannot override an independently different actual host epoch.

The hidden SP-287 control has a NEW version-2 wrapper and BodyControlV2 semantic control. It preserves every original field and pending definition byte-semantically, adding one nullable cancellation_pending of the exact CancellationPending type. The separate slot is required because manual Stop must not be suppressed by an older objective/metadata reservation. Old exact v1 remains read-only through its original version route; no same-version widening or hand reinterpretation. The v2 selected writer/read/backup graph must admit every original body writer and reader. All body/history/origin semantic schemas and hashes remain byte-identical.

Before activation the actual StorageMigrationCoordinator and original Goal host must authenticate the complete existing per-Goal stop/continuation epoch and latch, body/control/current-history scope, pending-operation inventory and original lifecycle/cancellation custody, then atomically enroll the exact v2 control and host-stop row under the original root/namespace/maintenance/backup fence. Existing epochs are preserved, never reset to zero. A genuine fresh native Goal birth installs the actual original host-selected effective user_stop_epoch, continuation_epoch and latch only in the actual original absent-key SP-287 start transaction. Fresh Goal identity alone does not prove a virgin Stop domain: preserve every already applicable thread/run/manual Stop and its actual epoch. Zero is allowed only when the real host proves that original effective domain is virgin. Native code must prove original creator and all affecting Stop-owner participation; an unsupported broader host representation cannot be cloned into a shadow Goal clock. Missing any expected row, even body control plus host-stop both missing, is unavailable/loss rather than birth. A real original old cancellation receipt cannot be fabricated, reclassified into this profile or dropped during migration. Unsupported original epoch/cancellation history stays fenced. This exact original source-adoption contract is new technical work; it does not assert that current native host storage already implements it.

At original source capture, Goal holds the complete actual old body/control/history/origin and StopControl preimages independently before helpers. BodySelection records only content-free commitments and scope; it is not the held body, current authorization or a body reconstruction source. Its complete_history_origin_inventory_sha256 hashes the ordered list specified in SP-304 physical and digest contract, independently captured from every actual accepted member. ExecutionBinding comes from the actual current Goal/Plan/run owners; lack of a caller Plan ref does not prove no binding.



The complete original stage sequence, final boundaries and physical custody are owned by SP-304. GRS-074/SP-305 supply actual association and possible-assignment sources; unresolved Plan/Workflow effect variants remain unavailable before Stop. SIR-050 owns original terminal publication; CV-347 owns exact schema selection.

#### Current, audit, replay and event consumers

Current Activity is the existing canonical Goal/body-control view, not an event-built state. Before original control publication, it may show the unchanged current body with a separately truthful cancellation-pending/Stop disposition; no cancellation success or new cancelled/paused body card is invented. After authenticated control.cancellation_receipt_ref publication the active item is absent. Content/history remains directly readable under GRS-064/SP-287 current thread permissions and deletion/hold rules; no original command/source/event reauthorization is needed merely to read retained accepted history. After lawful content loss no event, audit receipt, control commitment or old goal_state.v1 reconstructs text. Ordinary action availability always comes from current Goal/Stop/control/permission/registration owners, never an event observation or successful cancel result.

The NEW reader.goal.cancel_command_audit@1.0.0 accepts exact original Storage/project/thread/Goal/operation and a closed member selector. It resolves only the actual source, Stop receipt, minimal receipt, immutable progress/head, control publication or terminal at the physical keys in SP-304 physical and digest contract. Explicit epoch is required only for progress_epoch; other selectors require null. Missing future member is member_pending when original progress proves pending, otherwise missing_original/unavailable; absence cannot fabricate no-effect. Receipt may exist before event/control; terminal success and minimal receipt are different members. Source audit is content-free. Terminal replay selects its original immutable epoch even if the head advanced. No current-body/thread visibility is required for audit-only disclosure, but current app/Project audit permission and original physical origin/install/codec/backup/retention guards remain mandatory; thread deletion does not waive them.

The actual original SIR replay owner returns the exact immutable original outcome/result/response from Terminal with CV-333's existing replay decoration only (original_dispatch_id, replayed). It does not call the cancellation handler, relatch Stop, issue another receipt/event/control mutation or change terminal unknown to success. Replaying cancellation success proves original cancellation, not current body visibility, an active session or completion of a Workflow. A different user action uses a new command identity but an already cancelled Goal stays permanently noncontinuable.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305

### GRS-074 - Original execution association authority

```yaml
plan_unit_id: GRS-074
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Actual Goal, Plan and Workflow association owners share an exhaustively enrolled writer domain
  and canonical immutable binding origin/revision with current control. Genuine Goal birth and association
  custody publish together. Cancellation reads complete current original association and pending state; null
  active_run_ref, cache absence or retained metadata cannot establish no execution association.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- GRS-073
- GRS-064
- DL-045
unblocks: []
acceptance_criteria:
- The actual original creator commits Goal/body/Stop and zero-association origin/revision/control in the same
  genuine birth transaction.
- All seven affecting writer categories enroll and are fenced; a hidden enabled writer makes selection unavailable.
- Current read resolves complete original binding/Goal/Stop/control and pending state under one final current
  owner predicate; retained audit grants no current absence.
- Plan binding is the exact original seven-field value from the original PGOAL joint publication; no caller
  tuple creates it.
- Every changed association advances its original immutable revision and control consistently without regressing
  Stop or cancellation.
validation_surfaces:
- Plans/goal_cancel_command_custody.schema.json
- Plans/goal_execution_binding_custody.schema.json
- Plans/goal_cancel_schema_resources.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: grs-074_original_cancel_contract
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
- No fifth Goal state, objective/body revision mutation, child/tool settlement list, new command or peer handler.
- No raw Goal content in indefinite audit, new retention limit, silent codec substitution or fabricated original
  receipt.
- No native execution proof, full event-depth verdict, WorkNode/readiness admission or governance seal.
```

##### One original association authority

`goal_execution_binding_control` selects one immutable `goal_execution_binding_revision` plus its original `goal_execution_binding_origin` for each exact storage/Project/thread/Goal identity. This is the original Goal execution-association authority, not a projection, a cached reverse index, a caller list or a scan inferred from UI state. Every original Goal creator and every Plan/Workflow writer that can associate execution with a Goal must participate in this same authority. A different independent association store cannot coexist as an unaccounted source. The new `goal_plan_binding` value preserves all seven PGOAL-003..006 fields; its physical identity and original joint birth are explicit. It does not invent a PlanRun lifecycle or cancellation receipt.

The original Storage registration owner issues `WriterDomain` and its current head only while it holds actual complete native registration, dispatch, writer authorization and root/restore fences. Its seven operation categories are exactly goal_birth, plan_goal_birth_or_attach, workflow_attach, binding_owner_transfer, binding_migration, binding_restore and binding_content_delete. There is exactly one registration per category, in that order. Multiple actual implementations within one category must be included in the actual complete dispatch registration commitment; the category owner authenticates and fences every implementation. No additional writer, bypass API, legacy binding adapter, process or alternate root is admitted. A category is either participating through the stated actual method/owner generation or disabled at its original native dispatch. A serialized disabled flag does not disable an endpoint. The coordinator independently enumerates its actual installed dispatch/Storage writer graph, verifies exact equality with the registered domain and revokes/fences old capabilities before publication. Endpoint registration, owner transfer, backup restore and namespace changes cannot occur outside that same generation fence.

A later original writer-domain generation is a real coordinated registration change. The installer enumerates every actually retained binding control in its exact native Storage scope, preserves its full pending/current association selection, and joins the new domain reference plus control-epoch advance with the new domain/head publication under the same exclusion fence. Original immutable revision/origin birth-domain refs are retained and authenticated as original lineage; they are not restamped or required to equal a later current domain. A partial upgrade cannot grant current read/write authority. Lawfully deleted controls are not recreated. Every PlanRun creator targeting an existing Goal participates in the Plan/Workflow association operation; scheduling/quota callbacks targeting that Goal also retain the inherited actual host Stop recheck and cannot create execution or coupling through a different path.

This is a new required placement for actual native owners, not a declaration that the current runtime already has those methods. The authority must be installed before this profile creates or adopts any Goal. No cancellation reader installs it or converts a missing row to empty. The physical domain head and immutable domain record do not confer native writer capability: the actual live registration and original installation transaction must agree at every original entry and final boundary. A complete schema-shaped domain copied from another root cannot establish all-writer coverage.

##### Birth, association writes and current selection

`owner.goal.execution_binding.birth_none.v1` participates in the genuine absent-key SP-287 simple Goal birth, with the original host Stop enrollment and BodyControlV2. Under the common original writer-domain fence, the real Goal creator proves absent body/control and absent binding control/revision/origin/Plan-binding keys for this exact new Goal, plus no admitted pending association operation for it. It atomically writes the real Goal and its existing source/history/control records, the actual effective host Stop row, binding revision 0 with `active_run_ref=null` and no associations, its genuine origin, and binding control epoch 0. The original host owner/epoch is retained. No PlanRun exists in this simple birth transaction. PGOAL's scheduled future build creates no Goal until admission; it therefore cannot secretly pre-bind this absent Goal identity. These are exact native creation preconditions, not an inference from an empty fixture or a caller-chosen fresh ID. Any existing member or reservation prevents this birth path. The original effective host Stop domain still includes applicable prior thread/run Stop; this contract never permits zero bootstrapping it.

`owner.plan.goal_binding.commit.v1` is the sole participating PGOAL original Plan/Goal joint issuer. It must atomically create/bind the exact original Goal, original PlanRun, seven-field GoalPlanBinding and corresponding association revision/origin/control; all commit or none do. It reads actual Plan version/hash, To-Do identity, Deep/Regular Plan bundle disposition, permissions, repository/worktree and the absence of an active run for that Plan. A Regular Plan's null `planunit_bundle_ref` is accepted only when its actual owner establishes the already-canonical no-PlanUnits branch; it is not an invented empty bundle. No Plan bytes enter Goal objective lineage here. The full original PlanRun admission/effect source remains independently owned; this binding primitive does not claim that those separate exact source schemas are materialized by this contract.

`owner.workflow.goal_binding.commit.v1` similarly joins its actual original Workflow association to this authority and the shared Goal metadata mutation interface. Workflow association makes the narrow no-execution-association cancellation route unavailable; it is never a no-bound-Plan success merely because it lacks an AssistantPlan ID. PGOAL goal-driven execution does not become an Orchestrator run. The one active-run semantic is preserved: at most one current association exists, its actual run identity equals the current Goal `active_run_ref`, and its original scope, owner and lineage match. `active_run_ref` is a required consistency operand, never the absence authority.

Association mutation first reserves `BindingControl.pending` under a complete exact control CAS and original Goal/Stop/registration fence. Pending contains the original immutable complete candidate revision and all exact original beforeimage commitments. New association revision is prior + 1 and control changes advance its actual control epoch by one. The final original joint commit validates the actual owning source operation and independently permitted whole candidate, writes the new immutable revision/origin and any new original GoalPlanBinding, advances control and clears only this pending slot. The shared Goal metadata owner performs any real body change under unchanged GRS-064 revision/hash rules; the association service never writes Goal body bytes privately. Staging alone changes no current association and cannot return a completed Plan/Workflow binding. A pending binding does not suppress Stop priority. The bounded cancellation route may capture it only when actual original joint-transaction custody proves its whole candidate remains unpublished and no associated PlanRun/Goal/Workflow effect committed. C-stop holds that original binding fence with the Goal/Stop transaction, and the resulting latch prevents its later commit. Unknown or already effective binding follows its actual bound-owner route, never an invented absence.

`owner.goal.execution_binding.transfer_owner.v1` changes only actual owner/epoch after existing owner-transfer authority, safe boundary and original disposition are established. It preserves the complete association/Plan/version/run identities. It cannot clear an association into the no-bound route. No detach, retire, automatic empty reset or Plan-to-Workflow conversion is added. A future owner-authorized release needs a separately exact original release contract before cancellation can consume its absence; it cannot be guessed from terminal status. Existing bound Plan cancellation obligations thus remain visible.

For an existing native Goal, `owner.goal.execution_binding.adopt_existing.v1` may enroll only the exact actual original binding domain under original Storage migration and all-owner exclusion. It must prove the complete original source graph and import every original association/Plan binding and pending operation with exact identity and existing owner state. There is no empty-default migration. This contract admits the fresh enrolled birth route concretely; a legacy representation for which that complete original source mapping is not supplied remains a separately identified migration dependency. That does not make the new fresh authoritative source an unavailable-provider placeholder.

##### Complete cancellation source read

`owner.goal.execution_binding.read_current_for_cancel.v1` authenticates actual current native registration/WriterDomain head, exact original binding control, selected revision and origin, actual original Goal body/control/history/Stop and all pending operations in that ownership scope. It checks complete physical keys, wrappers, codecs, root identity, original issuer methods/owner epochs and original transaction membership, including unrelated preserved control fields. It rejects missing, duplicate, foreign, stale, deleted or unadmitted sources and any pending binding whose complete original no-effect state cannot be established. Reads of the actual original authority are complete; no maximum-revision scan or omitted source can substitute for its control selection. Absence is an authenticated original revision with zero associations, grounded in its actual original birth and unchanged all-writer custody. Empty storage is unavailable, never an empty association revision.

For the selected bounded route require: association count zero; actual revision `active_run_ref=null`; current Goal `active_run_ref=null`; no effective pending binding (an original wholly unpublished candidate may remain fenced as described above); no original Plan/Workflow association or owner-required execution coupling outside this authority; and complete actual writer-domain participation. Host-owned simple Goal continuation is still covered by the actual same-host Stop. Other Plan/run-specific obligations are not declared absent by this test unless their actual original creators are covered by the source authority. A bound Plan returns the typed bound disposition before C-stop. A Workflow association returns its separately unresolved disposition before C-stop. Neither becomes `none_required`.

The original C-source capture method performs the same complete native read privately under its actual source-owner lease, before any public selection exists. Its independently derived BindingSelection is staged and unissued until the original transaction commits; it is never returned as a source credential. C-source atomically commits one immutable `BindingSelection` with the original SourceAudit and progress epoch 0. The selection binds current control/revision/origin and domain/head physical hashes, actual original Goal body/control/Stop commitments and original SIR operation/command/dispatch identity. It is built before SourceAudit and contains no future SourceAudit hash. The unchanged ExecutionBinding projection is independently computed: `kind=no_bound_plan`, `active_run_ref=null`, the five Plan/binding fields null, and the actual host execution owner. `original_binding_source_ref` is exactly the selection physical key followed by `#sha256=` and lowercase SHA-256 of its complete physical wrapper. The projection is not accepted as a caller input or permission credential. For the separate bound branch the original Plan binding ref/hash selects the newly declared exact complete `goal_plan_binding` wrapper; no inferred digest codec remains.

Immediately before C-stop, the actual same reader and original joint Stop/Goal/Storage participants recheck the whole selected source and actual registration, absence, permission, Stop and control preimages. An uncaptured binding change or newly pending association refuses this cancellation before its Stop effect. A captured wholly unpublished pending candidate instead participates in the original joint fence so Stop can take priority. C-stop's inherited cancellation_pending and actual Stop latch then fence every association writer at its own final original commit. An old captured no-binding selection cannot admit a later attach after C-stop. No new association-specific Stop clock or cancellation flag is introduced.

`owner.goal.execution_binding.resolve_stopped_pending.v1` is the actual original pending binding owner's abort operation, not a cancellation-owned cleanup. After C-stop it proves its original candidate never published any associated record, preserves the current association revision and Goal body, clears only its pending slot by exact control CAS, and atomically issues immutable BindingPendingResolution. The receipt binds complete before/after control hashes, unchanged revision and original latched Stop. A genuine earlier binding effect or unknown partial state cannot use this no-effect abort; it remains with the original owner and cancellation cannot label it absent. No PlanRun cancellation or compensating rollback is claimed.

C-owners constructs `OwnerSettlement(kind=none_required)` only from that immutable original selection plus a current full native check that association custody remained unchanged under this cancellation's actual latch. Any originally captured binding pending must now have exactly that genuine original no-effect resolution; the selected revision/origin remain unchanged, and the complete current control must equal its original resolution afterimage. This explicit original transition is the only permitted difference from the captured binding-control bytes, not a refreshed absence claim. Its `original_scope_proof_ref` is the same selected physical key and `original_scope_proof_sha256` its complete wrapper hash. Its owner-settlement and schedule/quota invalidation fields remain null: they do not claim those effects occurred. This disposition only proves the absence of a required Plan/run coupling in this bounded original scope; it is not global tool or child settlement. The original Stop receipt and current actual Stop are independently mandatory.

The public `BindingReadRequest` has only `current_for_cancel` and `retained_selection_audit`. Both public read purposes require the exact already-durable operation/selection selector. Current reads use the complete current closure above and compare it to that actual original selection; they cannot create a first selection. Initial private source capture belongs only to the original C-source transaction described above. For post-Stop current reads, the original cancellation progress/Stop receipt and any original pending-resolution receipts justify only their exact permitted control successors; the reader neither requires an unchanged pre-Stop hash forever nor accepts a caller assertion that a later epoch is safe. Goal body/history and association revision remain exact, while actual current Stop/cancellation must preserve this operation. Retained audit returns exact original immutable selection/revision/origin and labels them historical; it does not reacquire disposed Goal content or claim current absence. Both read routes have zero durable effect and no projector/checkpoint. Only original C-source publishes a durable selection. An ordinary current read cannot mint that source. Each output is independently reconstructed from original stored authority before helper use and compared in full at final disclosure.



SP-305 owns physical keys, full byte/hash preimages, codec reservation and independent final effect/disclosure predicates. APR-016 joins the original Plan build transaction. These records carry no Goal title, task graph, provider response or objective text.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305
