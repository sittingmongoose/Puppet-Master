# Shard 082: Terminal workgroup moved — exact passive source read

Source: `Plans/storage-plan.md`

Source lines: L27365-L27422

Source SHA256: `8735657f27c873b99ebcc7407fac98348a874078c39a3ae05d1fd1536f5c12f8`

---

## Terminal workgroup moved — exact passive source read

Amended 2026-11-05 (DL-449, deck 2 item 8.a): this section now defines compatibility interpretation and protection of old data only. It admits no new terminal-history view or disclosure route. DL-449 supersedes this section's former passive inspection binding and companion backlog. DL-181's withdrawal remains in force: the producer never activated and no operation was ever admitted.

Any saved `terminal.workgroup_moved` event retains its exact 1.0.0 meaning, original event identity, idempotency identity, array order and bytes. Validate its payload using its own `payload_schema_id`, `https://puppetmaster.local/schemas/event_payloads/terminal_workgroup_moved/1.0.0`, and the unchanged closed `Plans/event_payloads/terminal_workgroup_moved.schema.json`. Its Project, command, correlation, workgroup, source/target section, pane/session membership and creation/identity-preservation facts are historical facts only. The original move is between distinct sections with the complete distinct contained pane/session identities unchanged; section_created describes the original target creation and preserve_session_identity remains true. DL-070's vacated source stays empty and reusable, with no replacement workgroup, pane, session or reseed; these original semantics confer no new move or creation authority. Never reinterpret it as a current terminal-tab move, an alias of `workspace.layout_changed`, or proof of an operation's execution. Unsupported or invalid saved data remains unavailable under the existing source-validation fence; it is never repaired by inventing an event or missing original custody.

No producer writes `terminal.workgroup_moved`, including a retry that supplies an old event or idempotency key, recovery of a pre-upgrade pending move, or SP-330's layout conversion. A pending old move is never reminted. Current terminal-tab movement is `workspace.layout_changed` with `change=tab_moved` under CV-361; it keeps its session, transcript and process and creates nothing (SP-332). No retired workgroup, section or move command is restored.

No consumer operates on this family. Its dedicated consumer and Storage inspection names, `terminal.workgroup_move_history_read.v1@1.0.0` and `storage.terminal_workgroup_move.inspect_current.v1@1.0.0`, are retired lineage, not available readers. The family projector and checkpoint disposition is `none_required`: there is no family projection, durable cursor, saved read token or reader effect. SP-278's generic EventRecord-index source, projector and checkpoint remain independently mandatory for existing generic Storage access; the nine-field durable token excludes `redb_snapshot_id` (DL-076), and a live read uses its own snapshot fence. This adoption protects existing data and grants no new terminal disclosure permission.

The saved event retains `RP-AUTHORITY-INDEFINITE@1.0.0`. Existing source/index/ref custody, coherent backup/restore, holds, Project access/deletion/maintenance fences and `reject_unhandled_secrets` remain owned by their existing Storage contracts. Retained data grants no access to deleted terminals, transcripts, credentials, session bodies or refs. No new archive, hold, physical family/key, retention clock or original-move/result store is required or created. Removal of an unbuilt companion obligation does not delete any saved data or change its lifetime.

DL-449 explicitly removes the obligation to build the new terminal-history view, saved viewing results, saved original-move/results records and obsolete original-move tests. Neither the `verified_historical` / `unresolved_historical_validation` / `unavailable` viewing-result companion nor the unbuilt original pending/result/custody companion is an implementation prerequisite. The earlier move/reader designs and their original-move, section-cap, rollback, sibling-settlement and lost-acknowledgement test backlog survive only as source lineage in SMPFS-170's prior revisions; they impose no current work. The original meaning, lifetime, write refusals and no-remint checks remain.

### Retained compatibility checks

`Plans/terminal_workgroup_compatibility_fixtures.json` and `scripts/pm_terminal_workgroup_compatibility.py` author static controls for this reduced contract: a saved 1.0.0 payload keeps its original bytes and interpretation; unknown schema/version, malformed or changed retained data and a changed lifetime refuse; fresh/retry/recovery/conversion proposals never emit this event; and a new dedicated view, consumer, projector, checkpoint or companion obligation refuses. These are synthetic contract controls, not a terminal viewing feature, original-move simulation, native execution, admission or a seal. Complete guard isolation remains the shared-tool part-2 check.

### SP-319 - Terminal workgroup moved compatibility and withdrawal

```yaml
plan_unit_id: SP-319
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-449 removes the new terminal-history view, viewing-result, saved original-move/results and obsolete move-test obligations from SP-319 and SMPFS-170. Any saved terminal.workgroup_moved keeps its original 1.0.0 meaning, bytes, identities and RP-AUTHORITY-INDEFINITE@1.0.0 lifetime, including distinct sections, unchanged complete pane/session membership and DL-070's empty vacated source without reseed. No producer writes or remints it, including retry, pending recovery and layout conversion. No consumer operates; terminal.workgroup_move_history_read.v1@1.0.0 and storage.terminal_workgroup_move.inspect_current.v1@1.0.0 are retired lineage. The family projector/checkpoint disposition is none_required. Existing generic Storage access retains SP-278 source/index/checkpoint validation, DL-076's nine-field durable token, access/deletion/maintenance, reject_unhandled_secrets and coherent backup/restore fences. This grants no new disclosure route, durable read effect or custody companion. Only retained-data interpretation/protection and withdrawal/no-remint checks remain; complete guard isolation is a part-2 check.
gui_related: false
gui_classification_reason: Defines retained-data interpretation, custody and unconditional withdrawal, with no view implementation.
depends_on: [SMPFS-180, CV-323, CV-361, SP-278, DL-076, DL-181, DL-449]
unblocks: []
acceptance_criteria:
  - Saved 1.0.0 events retain exact payload interpretation, original bytes and identities, and RP-AUTHORITY-INDEFINITE@1.0.0.
  - New append, retry, pending recovery and layout conversion never write or remint terminal.workgroup_moved.
  - No dedicated consumer, view, projector, family checkpoint, saved read token or durable reader effect operates.
  - The new view, viewing-result, saved original-move/results companion and obsolete move-test obligations are explicitly removed in both owners.
  - Existing generic source/index/checkpoint, access/deletion, secrets, backup and retention protection remains; no data deletion follows.
  - Reduced compatibility/withdrawal fixtures pass; full shared guard isolation remains a part-2 obligation.
validation_surfaces: [Plans/event_payloads/terminal_workgroup_moved.schema.json, Plans/terminal_workgroup_compatibility_fixtures.json, scripts/pm_terminal_workgroup_compatibility.py, Plans/event_family_registry.json, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180]
risk_class: terminal_retained_data_reinterpretation_or_remint
reasoning_tier: high
context_scope: terminal_workgroup_moved_only
implementation_surfaces: [Plans/storage-plan.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
node_compile_hint: {mode: compatibility_only, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false}
source_lineage: [Plans/Decision_Log.md#DL-039, Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-070, Plans/Decision_Log.md#DL-076, Plans/Decision_Log.md#DL-181, Plans/Decision_Log.md#DL-449, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-170, reports/event-authority-20261104/ds-fix1-terminal-consumer-regrade.md]
preserved_exact_tokens: [terminal.workgroup_moved, none_required, RP-AUTHORITY-INDEFINITE]
stale_retired_dispositions:
  - Drafted as SP-314 on unlanded plans/terminal-workgroup-depth-20260923 and renumbered SP-319; SP-314 is not an alias.
  - DL-449 retires the dedicated inspection/view and both unbuilt companion obligations; prior designs and obsolete move tests are lineage only.
negative_constraints:
  - No payload, registry, retention, physical key, current terminal state, Home custody or saved-data deletion change.
  - No new disclosure, original producer success, native proof, DEPTH_PASS or governance seal.
  - No stored redb_snapshot_id or fabricated original event/custody.
```

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/Decision_Log.md#DL-076, ContractName:Plans/Decision_Log.md#DL-449

<a id="coordination-event-persistence-binding-dl-045-2026-09-25"></a>
