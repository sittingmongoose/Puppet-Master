# Shard 072: Deleted restore-point passive history admission

Source: `Plans/assistant-chat-design.md`

Source lines: L25564-L25630

Source SHA256: `a5abf9d987b6a14ad276b58cedc88a0aa0690eda4a905c527fc55c59dce5a9d5`

---

## Deleted restore-point passive history admission

Adopt `consumer.chat.restore_point_deleted@1.0.0`, `projector.chat.restore_point_deleted@1.0.0` and the deletion-family route of `reader.chat.restore_point_history@2.0.0`. Deletion follows the complete SP-268/SP-272 predicates at each actual boundary, including SP-285 retained-created B1 admission, SP-274 result, current SP-278 source and explicitly installed pending recovery with SP-286 receipt. Separate supported historical inspection requires actual introduction/disposition proof; independently canonical SP-269 summary inspection keeps its own terminal predicate and cannot replace native initial admission. Later native inspection explicitly adopts SP-285 reader.storage.restore_point_retained_custody@1.0.0, validating actual admitted immutable point/companions/SP-274 result, original stored receipts and full current source without disposed original transaction/group/raw SIR controls. Present native, historical or terminal-summary classification only after the applicable phase joins; missing proof preserves affected unavailability and the prior checkpoint. Visible deleted history is passive and cannot dispatch delete, replay command success, branch, clear holds or infer available state. B3 changes no point/hold field; independently admitted later holds preserve terminal inspection and block retirement.

### Chat summary codec routes

Chat explicitly adopts the SP-269 codec2 typed-result boundary for `consumer.chat.restore_point_created@2.0.0`, `consumer.chat.restore_point_deleted@1.0.0`, `consumer.chat.restore_point_expired@1.0.0`, `projector.chat.restore_point_created@2.0.0`, `projector.chat.restore_point_deleted@1.0.0`, `projector.chat.restore_point_expired@1.0.0` and `reader.chat.restore_point_history@2.0.0`. Resolve each exact owner route in `Plans/restore_point_summary_reader_routes.json` and its actual coordinator receipt/journal adoption before use. Existing raw schemas/checkpoints remain v1-only and unchanged. `projector.chat.restore_point_created@1.0.0` and `reader.chat.restore_point_history@1.0.0` are compatibility-only fences rejecting raw v2 and codec2. Branch-from-restore is excluded at every version. SP-269 owns the complete codec, input/output binding, installation and writer gates; route membership alone supplies none of them. Deleted/expired consumers reject the other terminal event family.

New deletion B1 uses SP-285 retained-created original_create_result_custody with all fresh SP-268/SP-272 gates. After actual B1, its installed pending route uses authentic pending custody and SP-286 first receipt without disposed B1/creation/raw SIR controls; final receipt resolution precedes the final owner-local guard and atomic B3. Passive readers cannot execute recovery.

### ACD-464 — Deleted restore-point passive history admission

```yaml
plan_unit_id: ACD-464
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Chat admits deleted restore-point consumer/projector and history2 routes through full
  original SP-268/SP-272 admission followed by explicitly adopted SP-285 authenticated retained_custody/current-source
  inspection, or independent supported historical/summary proof. Visible terminal history remains passive.
  Exact current Chat routes adopt the SP-269 codec2 typed boundary while compatibility routes fence raw
  v2 and codec2.
  Creation, fresh lifecycle admission, admitted pending recovery and passive retained inspection follow their distinct SP-285 routes.
gui_related: true
gui_classification_reason: Defines visible passive restore-point history, evidence and unavailable states.
split_recommended: false
depends_on:
- SP-268
- SP-272
- SP-269
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Full original B1/B2/B3 semantics apply at their respective boundaries through SP-285 lifecycle/pending routes; later visible native
  classification requires SP-285 authenticated retained rows/current source, while supported history/canonical
  summary keep separate predicates.
- Intervening holds do not cancel original deletion or permit retirement; missing proof preserves affected
  unavailability.
- Current codec routes require exact original coordinator adoption; raw-v1 schemas/checkpoints and compatibility
  fences stay unchanged.
- Terminal history cannot dispatch delete, replay success, branch, restore source content or clear holds.
- The explicitly installed SP-285 retained-present route rejects unknown native origin, missing required
  rows and any late registration/install/migration/backup/permission/quarantine/row/source change; an
  unchanged generic token alone cannot authorize disclosure.
- New deletion B1 uses SP-285 retained-created original_create_result_custody with all fresh SP-268/SP-272 gates. After actual B1, its installed pending route uses authentic pending custody and SP-286 first receipt without disposed B1/creation/raw SIR controls; final receipt resolution precedes the final owner-local guard and atomic B3. Passive readers cannot execute recovery.
validation_surfaces:
- Plans/restore_point_deleted_contracts.schema.json
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
```
