# DG6A — GUI alerts, concerns and annotation event authority

Branch: `plans/ea-w2-gui-concerns-20261104`. Base: `be4766513ff71776346fc73b84f2542990f955af`. Head: see pushed branch; report commit is self-inclusive.

Four register (prepared) outcomes; twelve blocked on Jared. No exclusions. Membership is ABSENT for every row. No registry append/admission/decision/landing/governance edits. Native execution NOT_RUN.

| Row | Outcome | Self-grade |
|---|---|---|
| `alert.acknowledged` | register (prepared) | 10 PASS; retention PARTIAL; membership ABSENT |
| `alert.dismissed` | register (prepared) | 10 PASS; retention PARTIAL; membership ABSENT |
| `alert.rule_muted` | register (prepared) | 10 PASS; retention PARTIAL; membership ABSENT |
| `alert.snoozed` | register (prepared) | 10 PASS; retention PARTIAL; membership ABSENT |
| `bundle.annotation_state_changed` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `bundle.note_created` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `bundle.note_status_changed` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.assigned` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.created` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.evidence_linked` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.promoted` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.reopened` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.resolved` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `concern.updated` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `panel.redocked` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |
| `panel.undocked` | blocked on Jared | Blocked; membership ABSENT; unresolved owner cells PARTIAL (panel conflict CONFLICT); per-cell grades in JSON |

## Newly authored bindings and source search

Each alert family has its own complete Storage contract and explicit semantic/payload/test routes. These are new DL-045 technical contracts, not definitions found on a sibling. Existing exact command, handler and closed payload schemas are reused. All four are individually in DL-045’s FinalGUISpec T column; that premise still holds. F3-453’s shared alert store survives the retired Notifications panel and is explicitly reused; no retired side-panel owner is revived.

- **alert.acknowledged:** `SP-660`, `F3-700`, `CV-680`, `ATS-330`. New `evt_alert_acknowledged_SHA256` identity recipe (canonical MessagePack array), `alert_acknowledged_operation.v1:{project_id}:{operation_digest}`, `projector.alert_acknowledged.history@1.0.0`, `reader.alert_acknowledged.history@1.0.0`, `alert_acknowledged_checkpoint.v1:{project_id}:{storage_instance_id}`. Original state snapshots, atomic owner/CAS boundary, first/full-value receipt recovery, nine-field SP-278 token, rebuild and withdrawal are authored independently in that unit. Schemas/fixtures under `Plans/alert_event_contracts/`.
- **alert.dismissed:** `SP-661`, `F3-701`, `CV-681`, `ATS-331`. New `evt_alert_dismissed_SHA256` identity recipe (canonical MessagePack array), `alert_dismissed_operation.v1:{project_id}:{operation_digest}`, `projector.alert_dismissed.history@1.0.0`, `reader.alert_dismissed.history@1.0.0`, `alert_dismissed_checkpoint.v1:{project_id}:{storage_instance_id}`. Original state snapshots, atomic owner/CAS boundary, first/full-value receipt recovery, nine-field SP-278 token, rebuild and withdrawal are authored independently in that unit. Schemas/fixtures under `Plans/alert_event_contracts/`.
- **alert.rule_muted:** `SP-662`, `F3-702`, `CV-682`, `ATS-332`. New `evt_alert_rule_muted_SHA256` identity recipe (canonical MessagePack array), `alert_rule_muted_operation.v1:{project_id}:{operation_digest}`, `projector.alert_rule_muted.history@1.0.0`, `reader.alert_rule_muted.history@1.0.0`, `alert_rule_muted_checkpoint.v1:{project_id}:{storage_instance_id}`. Original state snapshots, atomic owner/CAS boundary, first/full-value receipt recovery, nine-field SP-278 token, rebuild and withdrawal are authored independently in that unit. Schemas/fixtures under `Plans/alert_event_contracts/`.
- **alert.snoozed:** `SP-663`, `F3-703`, `CV-683`, `ATS-333`. New `evt_alert_snoozed_SHA256` identity recipe (canonical MessagePack array), `alert_snoozed_operation.v1:{project_id}:{operation_digest}`, `projector.alert_snoozed.history@1.0.0`, `reader.alert_snoozed.history@1.0.0`, `alert_snoozed_checkpoint.v1:{project_id}:{storage_instance_id}`. Original state snapshots, atomic owner/CAS boundary, first/full-value receipt recovery, nine-field SP-278 token, rebuild and withdrawal are authored independently in that unit. Schemas/fixtures under `Plans/alert_event_contracts/`.

New shared value representations `shared_alert_state` and `shared_alert_rule_state` materialize F3-453’s existing one-store behavior, with exact per-family adoption and frozen prior/candidate snapshots. Operation and shared owner state are canonical, mandatory-backup original custody; checkpoints are derived. No schema/store version is guessed for the global migration graph. All ten new value rows remain retention-pending.

Search scope per family: current tracked owner Markdown/JSON, payload schemas and scripts, excluding derived shards/index/migration/evidence/ledger copies; exact event-name hits plus shared SP-278/SP-286, F3-453, command handlers, registry and value definitions were inspected. `per-family-search.json` records base-HEAD hits and individual negative evidence; no exact operation/history/checkpoint contract was found. Earlier schema shapes and command targets were reused rather than renamed.

- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/per-family-search.json`, SHA-256 `edcabceb1ac1281fdc0a4d0e857fa93576ecb5ab3dcee5b3253e058360a78de2`.
- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/canon-search.json`, SHA-256 `982a3cd8265536c920c85157f74b51112a8f444ad91675a7300c32e1c7f93da0`.
- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/currentness-sha256.txt`, SHA-256 `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`.

## Retention

`retention_policy_ref: PENDING_RETENTION_DECISION` remains on four event manifests and ten new value rows: four operations, four History checkpoints, shared alert and shared alert-rule state. Candidates: Storage Case L-3 audit/receipt versus ordinary telemetry for action history, and RP-PROJECTION-3GEN for derived History; candidate is not assignment. Stopped rows receive no retention assignment. RT must settle every applicable cell before admission.

## Questions and premise checks

DL-188/CV-361 does not alias panel events into workspace.layout_changed: current CV-361 and SP-330 explicitly keep them chat-only and restart-unsaved. The old F3-527 generic durable-panel/monotonic-revision premise no longer holds. Do not apply that premise to a new chat-only contract or exclude either event as a layout alias. No August/September product answer is extended. DL-045 grants technical work only; explicit concern authority openings and annotation name overlap are not decided by it.

- **bundle.annotation_state_changed:** Is this a distinct persisted transition in addition to bundle.note_created/note_status_changed, or an alias? Which exact single-event or co-emission boundary governs creation/status changes? Evidence: `Plans/Contracts_V0.md:907` (CV-049), `Plans/Contracts_V0.md:951` (payload minima), `Plans/storage-plan.md:1170` (SP-095).
- **bundle.note_created:** Does annotation creation emit bundle.note_created alone or also annotation_state_changed? Preserve note_record.v1 compatibility without guessing an event alias. Evidence: `Plans/Contracts_V0.md:907` (CV-049), `Plans/Contracts_V0.md:951` (payload minima), `Plans/storage-plan.md:1170` (SP-095).
- **bundle.note_status_changed:** Does annotation status mutation emit bundle.note_status_changed alone or also annotation_state_changed? Which name is canonical and which, if any, is compatibility-only? Evidence: `Plans/Contracts_V0.md:907` (CV-049), `Plans/Contracts_V0.md:951` (payload minima), `Plans/storage-plan.md:1170` (SP-095).
- **concern.assigned:** Which actor roles may reassign the durable concern owner, with which confirmation authority? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8573` (UCC-147).
- **concern.created:** Which of the listed Runtime/overseer/User/External Resource roles may accept cmd.concern.create into canonical concern state, versus nominate a concern only? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8571` (UCC-147).
- **concern.evidence_linked:** Which actor roles may commit evidence links to a concern (separate from proposing evidence), and with which confirmation? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8576` (UCC-147).
- **concern.promoted:** Which actor roles may commit concern promotion, and which owner has final promotion authority versus a user request? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8577` (UCC-147).
- **concern.reopened:** Which actor roles may commit resolved/dismissed -> active based on new evidence, and which only request reopening? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8575` (UCC-147).
- **concern.resolved:** Who may resolve, especially accepted_risk/dismissed/acknowledged versus runtime true resolution, and what confirmation authority is required? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8574` (UCC-147).
- **concern.updated:** Which actor roles may commit severity/category and other concern patches, and which require overseer authority or confirmation? Evidence: `Plans/Orchestrator_Page.md:176` (OP-002), `Plans/UI_Command_Catalog.md:8572` (UCC-147).
- **panel.redocked:** Confirm the current chat-only, restart-unsaved Dock back event contract replaces F3-527 monotonic layout-revision/durable host-state requirements; what remains of those fields without a Home revision change? Evidence: `Plans/FinalGUISpec.md:37621` (F3-527), `Plans/FinalGUISpec.md:37644` (F3-527), `Plans/Contracts_V0.md:23714` (CV-361), `Plans/storage-plan.md:27532` (SP-330).
- **panel.undocked:** Confirm the current chat-only, restart-unsaved Pop out event contract replaces F3-527 monotonic layout-revision/durable host-state requirements; what remains of those fields without a Home revision change? Evidence: `Plans/FinalGUISpec.md:37621` (F3-527), `Plans/FinalGUISpec.md:37644` (F3-527), `Plans/Contracts_V0.md:23714` (CV-361), `Plans/storage-plan.md:27532` (SP-330).

## Shared-file hunks and IDs

- `Plans/storage-plan.md`: append SP-660..663, one complete alert family per unit.
- `Plans/Contracts_V0.md`: append CV-680..683, one exact payload route per family.
- `Plans/Automated_Testing_System.md`: append ATS-330..333, individual oracle/native obligations.
- `Plans/FinalGUISpec.md`: append F3-700..703, current semantic action boundary per family.
- `Plans/storage_value_registry.json`: append ten value rows only; no existing rows reordered or changed.
- Derived shards for exactly those five owners, plus generated plan index. No unrelated owner changed.

IDs used: SP-660..663, CV-680..683, ATS-330..333, F3-700..703. All checked unused across 475 origin refs before minting; no additional prefixes minted.

## Checks

See `DG6A.checks.json` for exit codes and exact scope. Targeted checker passes 71 payload/custody/checkpoint cases. Registry JSON Schema passes. Assistant-contract checker has `status=gaps_found`, `errors=[]`, with existing Browser admission gaps outside this lane; it is not an alert-native proof. Index validation status is parsed at top level. No reseal, full-governance landing check or native runtime run.

Lead retains the pushed worktree for integration. Independent grading/review and each later admission remain outstanding.

The named test companion `tests/test_pm_assistant_contract_closure.py` updates only the physical registry count pin to 354 (base registry 344 + ten new value rows; old pin was already stale at 342). Explicit `.gitignore:92` `!` rule confirmed. The 41-test suite now has two failures, both reproduced against the original base registry with unchanged schema inputs: `test_definitionless_records_stay_blocked` and `test_live_equivalent_negatives_fail_for_intended_reason`. Neither is an alert contract failure; their source schemas are unchanged.
