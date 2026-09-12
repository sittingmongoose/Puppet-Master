# Shard 039: Restore-point created passive record reader

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2880-L2976

Source SHA256: `d72d25525291a655b6bcba20605df5c11f6d31181f79e5f031d5bc0a6535e025`

---

## Restore-point created passive record reader

**Versioned restore-created reader adoption.** For `restore_point.created` only, current publication uses `reader.runtime_artifacts.restore_point_record@2.0.0` with the actual SP-281/SP-278 v2 successor and complete current source/index token. V1 bindings in the following predecessor text remain compatibility-only for this family; all existing native, supported historical and terminal-summary predicates and owner behavior remain unchanged. Original creation publication/receipt authority is independently verified and may predate the current generic generation. Other event families require their own explicit adoption. No event replay gains action authority.

This addendum defines the previously missing restore-created bindings under `DL-045` for already specified behavior. These are new owner definitions, not claims that the identifiers pre-existed. The existing `event-family-restore-point-created@2.0.0`, `restore_point.created`, project-only scope, EventRecord `pm.event.v0@2.0.0`, inline payload `https://puppetmaster.local/schemas/event_payloads/restore_point_created/1.0.0` and source policy `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` remain unchanged. This is a static contract; native runtime, crash, GUI and durable-storage behavior remain unproven. No sibling event is admitted.

Runtime Artifacts newly owns `reader.runtime_artifacts.restore_point_record@1.0.0`. It passively consumes the verified logical record/source-event view owned by Storage SP-281 and Chat ACD-465's two present-point completion predicates plus Storage SP-269's distinct typed terminal-summary result. For new native writes, require the committed matching creation companion and genuine synced created event; `rp.status=available` or a marker alone is insufficient. For supported previously completed restore points, the explicit Chat historical validating reader preserves existing history and branch preflight without fabricating a companion or today's original command fields. Missing completion/custody proof is unavailable; a native missing/pending companion cannot opt into historical mode through absence, ID spelling or timestamp. The explicitly current record@2.0.0 successor adopts SP-285 retained_creation with passive_creation for available native points and retained_custody for supported present native expired/deleted points, with complete retained immutable rows and current source. Full original controls remain initial admission requirements, not disposed inputs to ordinary current reads. The record@1.0.0 compatibility branch is not widened.

For a present-point native or historical result, the reader rechecks canonical current status, exact project/record/source-boundary/hash identity, holds, permission and source visibility in the same published source snapshot. For kind=terminal_retention_summary, it verifies the exact canonical summary and surviving-event joins under SP-269 without requiring removed rp/companion bytes; it displays only terminal/hash-summary availability and never an enabled apply/delete action. Applying remains the existing Chat branch command with its own fresh preflight; passive reads never dispatch it. Creation replay cannot overwrite a later expired/deleted/corrupt status, clear a hold, reveal a deleted source, revive purged content or mutate files/worktree/Git/queue. `safe_point_id` stays optional lineage and never becomes primary identity.

`runtime_artifact.restore_point` is a distinct event family whose producer/admission/retention requirements remain independently held. This reader emits no artifact event, recursively emits no created event, creates no artifact-owned canonical record and does not borrow the deferred runtime-artifacts checkpoint. Artifact projection expiry never deletes the canonical `rp` or required creation custody. The existing user-facing panel/branch behavior and source policy remain unchanged; no new integration or runtime proof follows.

ContractRef: ContractName:Plans/assistant-chat-design.md#restore-point-created-native-and-historical-consumers, ContractName:Plans/storage-plan.md#restore-point-created-consumer-checkpoint-contract, ContractName:Plans/Runtime_Artifacts_Panel.md#rap-046---case-l-restore-point-and-exact-restore-projection, DecisionID:DL-045

Original creation admission remains complete. SP-285 creation_pending_recovery uses authentic admitted pending custody and SP-286 first receipt, with final receipt resolution before the final owner-local runtime/domain guard and atomic companion/result publication. Passive readers cannot execute recovery or infer completion from pending status.

### RAP-059 — Restore-point created consumers

```yaml
plan_unit_id: RAP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Runtime Artifacts defines one passive restore-point record reader using Chat native or
  supported historical completion proof, or the separate typed terminal-retention-summary result, and
  Storage current snapshot authority. It preserves existing status/permission/hold/source visibility and
  branch preflight, emits no runtime_artifact.restore_point event, and never treats a projection as canonical
  point or custody authority. For restore_point.created only, current read publication explicitly adopts
  the named 2.0.0 reader successors under SP-281/SP-278; v1 bindings are compatibility-only and original
  creation controls remain required at admission; the current native branch explicitly adopts SP-285 retained_creation
  for available and retained_custody for supported expired/deleted points without disposed original controls.
  Creation, fresh lifecycle admission, admitted pending recovery and passive retained inspection follow their distinct SP-285 routes.
gui_related: true
gui_classification_reason: This unit governs existing visible restore-point history and branch availability.
split_recommended: false
depends_on:
- SP-269
- RAP-046
- ACD-465
- SP-281
- SP-278
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Lawfully retired points may display their verified SP-269 terminal/hash-summary result without present
  rp/companion bytes and with no action authority.
- Initial native creation requires full original admission; later current native reads require SP-285
  authenticated retained companion/capture plus genuine current source proof; supported legacy completion
  remains readable without guessed original fields.
- Creation replay never revives terminal/deleted state or dispatches branch/filesystem/artifact effects.
- The independent runtime_artifact.restore_point family remains separately gated.
- The explicitly installed SP-285 retained-present route rejects unknown native origin, missing required
  rows and any late registration/install/migration/backup/permission/quarantine/row/source change; an
  unchanged generic token alone cannot authorize disclosure.
- Original creation admission remains complete. SP-285 creation_pending_recovery uses authentic admitted pending custody and SP-286 first receipt, with final receipt resolution before the final owner-local runtime/domain guard and atomic companion/result publication. Passive readers cannot execute recovery or infer completion from pending status.
validation_surfaces:
- Plans/restore_point_created_contract_fixtures.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_created_completion_authority
reasoning_tier: high
context_scope: restore_point_created_event_authority
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: restore_point_created_passive_reader
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-depth-binding-work-records.md#ea-s8-restore-binding--restore-consumercheckpoint-evidence
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
preserved_exact_tokens:
- restore_point.created
- event-family-restore-point-created
- RP-RESTOREPOINT-90D-AFTER-RELEASE
- RP-PROJECTION-3GEN
- projector_replay_only
negative_constraints:
- No new event-family admission, retention policy, runtime proof, readiness clearance, WorkNodes, NodeSeeds
  or governance seal.
- No recreation of missing canonical creation custody from projections or guessed original command data.
- No passive replay side effects, hold clearing, source resurrection or filesystem restore.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FileSafe.md
```
