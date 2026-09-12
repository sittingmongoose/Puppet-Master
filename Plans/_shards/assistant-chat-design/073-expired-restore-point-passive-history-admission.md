# Shard 073: Expired restore-point passive history admission

Source: `Plans/assistant-chat-design.md`

Source lines: L25633-L25702

Source SHA256: `a5abf9d987b6a14ad276b58cedc88a0aa0690eda4a905c527fc55c59dce5a9d5`

---

## Expired restore-point passive history admission

Chat retains the existing immutable `available -> expired` predicate and RSE-P01/P02/N01/N02/N03 eligibility behavior. `producer.storage.retention.restore_point_expired@1.0.0` executes it through SP-275 E1 frozen intent/status, E2 barrier append and E3 original receipt/result. This adds no timer, cadence, UICommand, release inference or hold-clear authority. `consumer.chat.restore_point_expired@1.0.0`, `projector.chat.restore_point_expired@1.0.0` and the expiry-family history@2.0.0 route validate native, supported historical or independently canonical summary truth without executing retention. Visible expired status means unavailable for apply/delete, not proof of physical purge. Every source conversation/thread/worktree/file/Git/queue/runtime-safe-point remains under its existing owner; later legitimate holds retain inspectable expired capture.

Expiry follows SP-275's full fresh E1 eligibility and SP-285 retained-created prerequisite, actual E2/E3 boundaries, current SP-278 source and explicitly installed pending recovery with SP-286 receipt. E3 writes only the companion and may read holds admitted after E1. Ordinary checkpoint refresh preserves current holds and complete lawful generation history. Native expiry-companion retirement requires SP-269 v2 writer/codec admission; retained v1 remains supported only under genuine pre-introduction custody proof. No missing native custody is fabricated. Exact Chat codec2 routes and compatibility fences are specified above; all shared writer/read authority remains in SP-269. Later passive native inspection explicitly adopts SP-285 reader.storage.restore_point_retained_custody@1.0.0 and complete authenticated retained-row/current-source joins; it does not fetch old E1/E2/E3, eligibility or nested creation controls and does not acquire an SP-274 result dependency.

New expiry E1 uses SP-285 retained-created passive_creation with all fresh SP-275 gates and no SP-274 dependency. After actual E1, its installed pending route uses authentic pending custody and SP-286 first receipt without disposed E1/eligibility/nested creation controls; final receipt resolution precedes the final owner-local guard and atomic E3. Passive readers cannot execute recovery.

### ACD-466 — Expired restore-point passive history admission

```yaml
plan_unit_id: ACD-466
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat preserves the existing expiry predicate and exposes passive expired history through
  full original SP-275 admission followed by explicitly adopted SP-285 authenticated retained_custody/current-source
  inspection, or supported canonical terminal admission. Expiry gains no SP-274 dependency. Logical expiry
  is separate from physical retirement. Current history2/consumer/projector routes adopt the shared codec2
  typed boundary with unchanged raw-v1 schemas and compatibility fences.
  Creation, fresh lifecycle admission, admitted pending recovery and passive retained inspection follow their distinct SP-285 routes.
gui_related: true
gui_classification_reason: Defines visible passive restore-point history, evidence and unavailable states.
split_recommended: false
depends_on:
- SP-275
- SP-269
- ACD-465
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Existing release age, oldest-eligible count and protecting refs gate the sole available-to-expired transition.
- Visible expired evidence never claims physical purge or authorizes apply/delete, branch, hold clear
  or source resurrection.
- Full E1/E2/E3 semantics under SP-285 lifecycle/pending routes preserve later holds and legitimately late commits; later
  native inspection uses SP-285 retained rows/current source without disposed controls or new timers.
- Native expiry retirement requires coordinated writer2 and codec2 admission; historical v1 never substitutes
  for missing native custody.
- The explicitly installed SP-285 retained-present route rejects unknown native origin, missing required
  rows and any late registration/install/migration/backup/permission/quarantine/row/source change; an
  unchanged generic token alone cannot authorize disclosure.
- New expiry E1 uses SP-285 retained-created passive_creation with all fresh SP-275 gates and no SP-274 dependency. After actual E1, its installed pending route uses authentic pending custody and SP-286 first receipt without disposed E1/eligibility/nested creation controls; final receipt resolution precedes the final owner-local guard and atomic E3. Passive readers cannot execute recovery.
validation_surfaces:
- Plans/restore_point_expired_contracts.schema.json
- Plans/restore_point_expired_owner_resolution.schema.json
- Plans/restore_point_summary_reader_routes.json
- reports/event-authority-20260911/step-08-restore-pair-validation.md
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_terminal_custody_or_false_completion
reasoning_tier: high
context_scope: event_authority_step08_restore_pair
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- EA-BINDINGS-285-RESPONSE-001
- RSE-P01
- RSE-P02
- RSE-N01
- RSE-N02
- RSE-N03
```
