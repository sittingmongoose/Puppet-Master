# Shard 039: Original Goal objective update acceptance and settlement

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6282-L6376

Source SHA256: `d47d2c6751e64a671b5d4d6e5545b86dfd30f91ab7159eea2d13c79e4530cdca`

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
