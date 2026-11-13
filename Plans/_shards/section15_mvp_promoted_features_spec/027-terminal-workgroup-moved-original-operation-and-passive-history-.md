# Shard 027: Terminal workgroup moved — original operation and passive history contract

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L12411-L12451

Source SHA256: `26306a6a0c508c36f54e34011367abd87e36779f3961dcb821f6633042fff5ba`

---

## Terminal workgroup moved — original operation and passive history contract

Superseded 2026-10-09 (DL-181), clarified 2026-11-05 (DL-449, deck 2 item 8.a): terminal workgroups are retired and `terminal.workgroup_moved` admits no new producer or new reader disclosure. The producer `terminal.workgroup_move_commit.v1` never activated; no operation was ever admitted. Any saved event retains its exact 1.0.0 meaning, original bytes and identities and `RP-AUTHORITY-INDEFINITE@1.0.0` lifetime. Its unchanged payload schema is selected by its own `payload_schema_id`; no event is rewritten, aliased to a layout event or fabricated again. The original semantics retain distinct source/target sections, complete distinct pane/session membership and preserved session identity, the actual original target-creation fact, and DL-070's empty reusable vacated source without any replacement or reseed. Pending old moves are never reminted by upgrade, retry, recovery or SP-330 conversion. Current terminal-tab moves use CV-361's `workspace.layout_changed` / `tab_moved` and preserve the existing session.

DL-449 explicitly removes from this owner and SP-319 the obligation to build a new terminal-history view, saved viewing results, saved original-move/results records and obsolete original-move tests. The former `terminal.workgroup_move_history_read.v1@1.0.0` and `storage.terminal_workgroup_move.inspect_current.v1@1.0.0` are retired lineage. There is no operating family consumer, projector, checkpoint, view-result schema or original pending/result/custody companion to implement. Prior original-move, section-cap, rollback, sibling-settlement and lost-acknowledgement designs are source lineage only, not current acceptance requirements. Removing these obligations changes neither the interpretation nor lifetime of saved events and does not authorize deleting their evidence.

SP-319 now owns only retained-data interpretation/protection and withdrawal/no-remint checks. Existing generic SP-278 source/index/checkpoint validation, DL-076 token rules, access/deletion/secrets fences and original Storage backup/retention custody remain; compatibility interpretation creates no new disclosure permission or terminal effect. SMPFS-180 remains the current terminal owner.

### SMPFS-170 - Terminal workgroup moved retired compatibility lineage

```yaml
plan_unit_id: SMPFS-170
unit_type: schema_contract
status: superseded
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
superseded_by: SMPFS-180
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY. DL-181 withdrew terminal.workgroup_moved; its producer never activated and no operation was admitted. DL-449 explicitly removes the new terminal-history view, saved viewing results, saved original-move/results companion and obsolete move-test obligations from this owner and SP-319. No dedicated consumer or reader disclosure operates. Any saved event keeps its exact 1.0.0 interpretation, original bytes and identities and RP-AUTHORITY-INDEFINITE@1.0.0 lifetime. New writes and reminting on retry, pending recovery or conversion remain refused. SP-319 preserves only old-data interpretation/protection and withdrawal/no-remint checks, with existing generic SP-278 custody and access fences. SMPFS-180 governs current terminal tabs; CV-361 uses workspace.layout_changed / tab_moved for a terminal-tab move.
gui_related: false
gui_classification_reason: Retired event compatibility and removal of unbuilt obligations; no view is implemented.
depends_on: [CV-323, CV-361, SP-278, DL-076, DL-181, DL-449]
unblocks: []
acceptance_criteria:
  - Preserve saved-event meaning, bytes, identity and lifetime; never write or remint a withdrawn event.
  - Remove the new view, saved viewing results, original-move/results companion and obsolete move-test obligations in both owners.
  - Keep only retained-data interpretation/protection and withdrawal/no-remint checks under SP-319.
validation_surfaces: [Plans/event_payloads/terminal_workgroup_moved.schema.json, Plans/terminal_workgroup_compatibility_fixtures.json, scripts/pm_terminal_workgroup_compatibility.py, Plans/storage-plan.md#SP-319]
risk_class: terminal_retained_data_reinterpretation_or_remint
reasoning_tier: high
context_scope: terminal_workgroup_moved_only
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/storage-plan.md]
node_compile_hint: {mode: compatibility_only, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false}
source_lineage: [Plans/Decision_Log.md#DL-039, Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-070, Plans/Decision_Log.md#DL-076, Plans/Decision_Log.md#DL-181, Plans/Decision_Log.md#DL-449]
negative_constraints:
  - No payload, registry, retention, public command, PTY, session-lifetime or saved-data deletion change.
  - No new disclosure, reconstructed original custody, native proof or complete event-depth claim.
stale_retired_dispositions:
  - DL-181 retires the workgroup operation; DL-449 retires its unbuilt view, both companions and obsolete move tests. Earlier designs remain in prior source revisions only.
```

ContractRef: ContractName:Plans/storage-plan.md#SP-319, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-449
