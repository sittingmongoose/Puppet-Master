# Shard 033: Current creation consumers and canonical Goal state

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5941-L6020

Source SHA256: `3b61601a5bf53e8d3632816beb7ceafcf608e18b66148ca6f6a9ed1e5adf1797`

---

## Current creation consumers and canonical Goal state

For exactly active `goal.created` v3, the current read-only Goal projection consumed by Activity is a view of already committed canonical Goal custody, not a second event-built Goal record. GRS-064's `reader.goal.body@1.0.0` supplies current state/objective/currentness and `reader.goal.objective_history@1.0.0` supplies accepted revision history through SP-287's actual selected physical families and final current visibility/origin guards. GRS-055 and Assistant Chat still own the Activity item, preview and detail placement. A view may refresh from those original readers after an admitted owner change, but a creation observation alone never creates a body, selects a thread, changes Goal state, reconstructs text or supplies action availability. The complete shared canonical body transaction precedes SP-294's event/result settlement and can remain true while the command is pending. A current-body view must preserve that distinction.

The five exact SP-287 body/history/origin/control/receipt families and SP-294's original command family are written by their actual original owners, not by a `goal.created` consumer. Body/history/current-control persistence and restart come from those canonical values and coherent mandatory backup. Current body/history use their existing Project/thread/Goal visibility and deletion/hold/owner/Stop predicates; receipt-only audit and original command-result audit keep their separate current audit permissions. Missing or lawfully deleted body content is unavailable, not rebuilt from an event, receipt, old `goal_state.v1` row or `goal_runtime_lineage_record`. The existing latter family and Workflow/GoalRun certification records keep their independent owners and schemas; no creation consumer writes them or obtains continuation/certification authority from them.

SP-298/GRS-067 remains the exact event-inspection route and retains its whole SP-278 source, resource, payload-version, original body/shared witness, cursor and final atomic-release checks. It can report an authentic creation while the original command is pending, with `action_authority=none`. Its independent explicit command-member route resolves original result/creation-receipt semantics without a reverse event lookup. Current mutation and first continuation still pass GRS-066's actual original successful creation settlement and all current owner/Stop/source checks. No Activity refresh or event cursor is a durable execution checkpoint.

For this active creation route, no additional event-derived Goal-state, child, certification or evidence projector is assigned: the original durable body/command publications already own the state, and the current semantic views use the existing canonical readers. Accordingly these particular view/inspection consumers have no family checkpoint or durable replay effect. This is an explicit owner mapping from GRS-064/SP-287/SP-294, not a family-wide inference from SP-298's passive exemption. The deferred `goal_projection_families` inventory and SP-214's older `goal_state.v1` / child / evidence / GoalRun projection list do not materialize an active-v3 creation projector or revive retired Goal fields. Whole-v2 stays exact historical interpretation; any separately adopted historical projector or another Goal/GoalRun event requires its own owner/version/currentness and effect/checkpoint contract. This mapping grants neither those routes nor current family-wide event-depth/native readiness.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-055, ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/Goal_Runtime_System.md#GRS-066, ContractName:Plans/Goal_Runtime_System.md#GRS-067, ContractName:Plans/storage-plan.md#SP-214, ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/storage-plan.md#SP-294, ContractName:Plans/storage-plan.md#SP-298

### Lifetime, recovery and activation

DL-047 retains current body, all accepted objective revisions, minimal origin and control/pending text while their exact bound thread remains retained, including archived threads. Compaction, restart and model changes do not purge them. Deleting the thread immediately hides body content and purges active and backup copies under SP-287's exact 24-hour/30-day limits and valid-hold exceptions. A hold delays physical purge without restoring ordinary visibility. Cancellation alone does not delete the thread. Source-message/context/attachment/Plan/To-Do/workflow refs retain their independent lifetimes and cannot reconstruct purged content.

Body/control/history/origin are canonical non-rebuildable custody with coherent mandatory backup. Missing/corrupt members, broken chain, lost pending custody or origin mismatch fences dependent mutation and discloses owner recovery failure. Authorized coherent restore preserves the actual original instance's surviving complete current/history/origin/pending unit, replays current deletion tombstones before visibility and rechecks owner/stop predicates before continuation. Neither transcript summaries, old runtime lineage, EventRecords nor content-free receipts can recreate a missing objective. Proved lawful thread purge means terminal content-unavailable, not permission to restore deleted text.

Activation requires all exact physical family/schema/codec graph edges, protected backup, migration exclusion, verify-before-stamp and terminal MigrationReceipt round trip. Existing labels or absent rows do not prove installation. Read pre-existing semantic V2 through its actual admitted original codec/owner and preserve it losslessly before installing new keys/hashes; retain old hashes as migration evidence instead of reinterpreting them. Unsupported formats stay fenced. Every writer route is adopted or disabled before use of the shared API.

V1 migration retains existing GRS-056 rules: objective unchanged, dropped structure accounted for, in-flight paused/manual-stop posture preserved, cancellation receipt distinct, invalid Project/thread edge quarantined. Only the already authorized single revision 1 may be synthesized where no history exists; no intermediate revisions, approvals or lineage may be invented. If historical acceptance/source lineage cannot be proved, preserve original evidence and disclose unresolved migration. Body migration adds no third change source and does not widen certification.

### GRS-064 - Shared Goal Body Currentness And Accepted History

```yaml
plan_unit_id: GRS-064
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Preserve the exact eleven-field GoalRecordV2, nine-field objective revision and seven-field
  accepted origin. The Goal body currentness and history contract defines the exact local
  canonical JSON semantic hashes, concrete scalar limit, single ordinary revision/history
  chain and owner.goal.body.mutation@1.0.0 shared body/control transaction. Original accepted
  source authority, current approval/owner/stop/access facts and whole reserved control gate
  terminal writes. Independent current body/history and content-free receipt readers use
  actual canonical origin; original receipt audit survives lawful body purge without
  recreating text. SP-287 supplies separate physical wrappers/custody and DL-047 lifetime.
  No sibling Goal event or Workflow certification closure follows from this prerequisite.
gui_related: true
gui_classification_reason: Preserves exact accepted Goal text, direct Save/approval behavior and authorized history visibility through deletion and recovery.
depends_on: [GRS-048, GRS-050, GRS-051, GRS-054, GRS-056, DL-045, DL-047]
unblocks: []
acceptance_criteria:
  - Semantic 11/9/7 records and four-state Goal remain exact; hidden control and physical wrappers add no Goal fields.
  - Every body writer uses shared ordinary revision/currentness and whole-control CAS; metadata creates no fake objective revision.
  - Direct Save has null message/approval IDs, completed rejects editing, and approved proposals require exact current owner/approval/lineage.
  - Pending recovery preserves original accepted intent without raw-source reconstruction and never waives current approval/stop/external/access fences.
  - Stop defeats continuation immediately despite reservation; pure body receipt grants no event, SIR or completion success.
  - Current and audit readers authenticate canonical origin and final current facts; deleted text is never recreated from receipt/reference evidence.
  - Active goal.created Activity/body/history consumption uses the existing canonical readers and original durable body/command custody, not a deferred event-built Goal projection or invented checkpoint; passive creation inspection retains its separate complete source checks.
validation_surfaces:
  - Plans/goal_body_custody.schema.json
  - Plans/goal_body_custody_fixtures.json
  - reports/event-authority-20260911/step-08-goal-body-validation.md
risk_class: goal_body_currentness_accepted_history_or_receipt_authority_escape
reasoning_tier: high
context_scope: shared_goal_body_history_custody_only
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/goal_body_custody.schema.json
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Goal_Runtime_System.md#GRS-048
  - Plans/Goal_Runtime_System.md#GRS-054
  - Plans/Goal_Runtime_System.md#GRS-056
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-047
negative_constraints:
  - No Goal title/phase/child/budget/role fields, fifth state, inferred Goal, fabricated accepted lineage or certification exception.
  - No automatic Goal event adoption/depth, native proof, WorkNode, NodeSeed, readiness or governance seal.
```

The exact schema/static transaction evidence and native obligations are recorded in `reports/event-authority-20260911/step-08-goal-body-validation.md`. Supplied model origin seals, owner/approval observations, rollback sets and transaction captures are test adapters, not new durable authority services. Actual global writer adoption, native canonical origin/authentication, shared CAS/stop priority, coherent restore/tombstone replay and 24-hour/30-day purge enforcement remain `NOT_RUN`; no runtime/depth/readiness/seal claim follows.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/goal_body_custody.schema.json, ContractName:Plans/Decision_Log.md#DL-047, ContractName:Plans/Decision_Log.md#DL-045
