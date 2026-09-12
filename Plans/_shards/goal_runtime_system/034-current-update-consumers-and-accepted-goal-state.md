# Shard 034: Current update consumers and accepted Goal state

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5969-L6059

Source SHA256: `51a12e64668bec85a61dd810af0ca8919c1d8bfc2a40c010ae261448603b9baa`

---

## Current update consumers and accepted Goal state

For exactly active `goal.updated` v3, GRS-064/GRS-068 explicitly adopt SP-299's update-only consumer composition. GRS-055's Activity item, preview, objective detail/editor and objective History consume the already admitted SP-287 canonical body/control and accepted revision/origin chain through `reader.goal.body@1.0.0` and `reader.goal.objective_history@1.0.0`. The actual update's accepted body can be visible while its factual event or command result is unresolved. Current state, ordinary revision/currentness, accepted history head and hidden pending/cancellation posture come from current canonical custody; the latest event is neither a body nor action authority. Control remains private to its existing readers/action owners; only their existing permitted pending/unavailable/control disposition is displayed. No pending afterimage becomes current text, no different thread's selection supplies identity, and no history row is reconstructed from an update's hashes or audit.

The entire existing eleven-field body, nine-field accepted revision and seven-field origin remain unchanged. Empty and unchanged accepted replacements still advance ordinary revision and append one accepted objective revision under GRS-068. Earlier metadata revisions do not imply a corresponding accepted objective revision. A history view discloses accepted text only from its admitted retained rows under current thread-content visibility, without rerunning old approval/command/source evidence. An update event's exact earlier before/after facts remain true after subsequent edits or lifecycle changes; it does not replace the current view with that older body.

The new `storage.goal_updated.inspect_current.v1@1.0.0` exposes one exact selected current-source, content-free v3 observation under complete SP-278, original SP-299 source/frozen input, SP-287 body receipt and SP-286 full-value/first-receipt predicates. The whole imported read token/frontier is current while original publication coordinates remain historical. Original event_issued progress is not mandatory when the genuine shared first receipt proves an append whose acknowledgement remains unknown; the reader writes no acknowledgement/progress/result. An issued event proves that original accepted change and publication only. It does not prove command terminal success, current body availability, current text, completion, permission to continue, or an active handler for any sibling lifecycle event. Whole-v2 interpretation stays separately preserved; this new active-only route rejects its payload version and never fabricates current receipts for it.

SP-299's exact audit and input readers remain distinct. Content-free source/progress/terminal/body-receipt audit can remain readable under current app/Project/audit authority after lawful body/input disposal. Input disclosure requires genuine surviving original input and current bound-thread content authority. SIR-049 replay resolves the original immutable terminal's exact original progress epoch/result/outcome/response even if later owner recovery advanced the head; it is not event inspection, acceptance, command re-dispatch or recovery. A missing selected old epoch is unavailable, not a reason to replay from the current head. Audit does not grant ordinary content access, and no returned ref creates a content hold.

Activity/control/history publication and every audit/input/event disclosure apply SP-299's independently derived full output and joint semantic/physical/current-owner checks after the last nested resolver/formatter/copy/codec. There is no helper or callback gap before the same-boundary release. Current owner/Stop/cancellation, Project/thread visibility and deletion/holds, actual selected source/root/installation/codec/migration/backup facts and their covering native leases remain owner-specific. Opening the editor is navigation. Save and lifecycle controls still dispatch only their existing registered available handlers and pass their independent original command/body/approval/Stop/CAS checks; a view/receipt/event is no action grant. A changed source or permission during formatting refuses the candidate rather than releasing a stale view.

These current views use original body/control/history and SP-299 durable source/progress/terminal publications; they assign no additional event-derived Goal state, child, evidence, certification or lineage projector, and no durable checkpoint. The disposition is justified for these actual consumers and does not borrow the creation/passive profile or close other Goal/GoalRun events. DL-047 thread-lifetime content rules, original indefinite content-free update audit/event custody, mandatory coherent backup and current tombstone filtering remain unchanged. Recovery reopens only genuinely admitted surviving original canonical values; no EventRecord, old `goal_state.v1`, lineage row, audit, response or digest reconstructs missing/deleted objective or input. Native installation and complete event-depth execution remain separate evidence obligations.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-055, ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/Goal_Runtime_System.md#GRS-068, ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/storage-plan.md#SP-299, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Shared_Integration_Runtime.md#SIR-049, ContractName:Plans/Contracts_V0.md#CV-342, ContractName:Plans/goal_updated_consumer_contracts.schema.json


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
  The explicitly adopted active updated-v3 Activity/body/control/history views use those current
  canonical readers; separate SP-299 event/audit/input and original SIR replay boundaries preserve
  accepted effects and original terminal meaning without event-built Goal state.
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
  - Active goal.updated Activity/control/history uses current SP-287 custody and SP-299 complete original event/audit/input composition; no event reconstructs content, supplies action authority or substitutes for a terminal-selected original SIR replay epoch.
validation_surfaces:
  - Plans/goal_body_custody.schema.json
  - Plans/goal_body_custody_fixtures.json
  - Plans/goal_updated_consumer_contracts.schema.json
  - Plans/goal_updated_consumer_resources.json
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
