# Shard 018: Shared Runtime GUI Projection Verification Addendum - 2026-08-13

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L2029-L2098

Source SHA256: `6dea8884b18183c84a5e54bdbf2fab67d36b3dd3daeadfdccfb04bf0a2b71f08`

---

## Shared Runtime GUI Projection Verification Addendum - 2026-08-13

These rows verify that the rebuilt GUI consumes canonical shared-runtime and
domain-owner projections. They do not authorize a GUI-local state machine,
command, event family, receipt, schema, or persistence record. `NOT_RUN` remains
failure to prove the row; a plan validator or screenshot alone cannot turn it
into `PASS`.

| Test ID | Required GUI behavior | Canonical owners | Validator or harness | Evidence ref | Status |
|---|---|---|---|---|---|
| `GUI-SRT-001` | Thread rail uses `ThreadShell`, bounded pinned `PinnedSummary`, and focused-only `ThreadDetail`; a many-thread fixture proves no full-detail fanout. | `Plans/assistant-chat-design.md` ACD-445; `Plans/FinalGUISpec.md` F3-506 | future GUI thread shell/detail subscription census | pending | `NOT_RUN` |
| `GUI-SRT-002` | Offline outbox and reconnect show queued/waiting/cancelled/rejected-stale/accepted truth, server continuation, epoch-fenced replay or snapshot plus buffered live convergence, and no duplicate effect or idempotency-bypassing resend. | `Plans/Shared_Integration_Runtime.md` §§6-7; `Plans/FinalGUISpec.md` F3-506 | future GUI offline/restart/reconnect race matrix | pending | `NOT_RUN` |
| `GUI-SRT-003` | Coalescing preserves order and immediately presents approval, tool transition, failure, cancellation, completion, security, and lease-loss changes while freshness remains visible. | `Plans/Shared_Integration_Runtime.md` §7.2; `Plans/FinalGUISpec.md` F3-506 | future GUI stream pressure and immediate-transition matrix | pending | `NOT_RUN` |
| `GUI-SRT-004` | `ObservableWork` phase, wait reason, reevaluation, cancellation, and outcome are distinct from spinner/dispatch state; exact Host/Environment/Source and requested/effective capacity remain visible. | `Plans/Shared_Integration_Runtime.md` §§3 and 8; `Plans/FinalGUISpec.md` F3-507 | future GUI work/resource/old-hardware matrix | pending | `NOT_RUN` |
| `GUI-SRT-005` | Discovery, installation, provider first-acquisition consent and official source, authentication, route/account readiness, and Usage are separate axes; unknown or partial proof never renders ready. | `Plans/Shared_Integration_Runtime.md` §4; provider owners; `Plans/FinalGUISpec.md` F3-507 | future GUI installation/auth/readiness/update/rollback matrix | pending | `NOT_RUN` |
| `GUI-SRT-006` | Lease collision, stale generation/holder, cleanup pending, resource pressure, and awareness `current`/`partial`/`stale`/`unavailable`/`conflicted` show owner reasons and canonical receipt/log/artifact routes without granting action authority. | `Plans/Shared_Integration_Runtime.md` §9; `Plans/FinalGUISpec.md` F3-507 | future GUI lease/awareness race and drill-through matrix | pending | `NOT_RUN` |
| `GUI-SRT-007` | BSD renders `Off`/`Auto`/`On` with effective default and recommended value `Auto`; explicit stored `Off` remains Off, silent/duplicate outcomes add no transcript note, material advice is attributable, and failures never block primary work or resemble mutation/safety authority. | `Plans/Run_Modes.md` RM-050; `Plans/assistant-chat-design.md` ACD-446; `Plans/FinalGUISpec.md` F3-508 | future GUI BSD mode/silence/failure/authority matrix | pending | `NOT_RUN` |
| `GUI-SRT-008` | DebugSession and EvalSession retain distinct target, lease, generation, wait, output, artifact, restart, and cleanup projections; persistent Eval never appears as DAP frame state or a hidden global kernel. | `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-139/140; `Plans/FinalGUISpec.md` F3-509 | future GUI DAP immediate-event and Eval persistence/cleanup matrix | pending | `NOT_RUN` |
| `GUI-SRT-009` | MCP exposes requested/effective availability and independent transport/init/capability/auth/epoch/retry/subscription/rollback state without fabricating readiness. | `Plans/MCP_Integration.md`; `Plans/FinalGUISpec.md` F3-509 | future GUI MCP reconnect/retry/subscription rollback matrix | pending | `NOT_RUN` |
| `GUI-SRT-010` | Ordinary browser views are PM-native and show controller lease, observer state, and `PageGeneration`; protected `AuthBrowserSession` content and controls exist only in the human-only foreground surface, with every agent/tool/BSD/awareness/capture consumer denied visibility. | `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-142 through SMPFS-145; `Plans/FinalGUISpec.md` F3-509 | future GUI Browser controller-race and protected-session negative matrix | pending | `NOT_RUN` |
| `GUI-SRT-011` | Every runtime mutation control has canonical Commands and production Wiring coverage or is disabled/omitted with owner reason; the GUI invents no look-alike command, event, receipt, or state. | `Plans/Commands_System.md`; `Plans/UI_Command_Catalog.md`; `Plans/UI_Wiring_Rules.md`; `Plans/Wiring_Matrix.production.json` | future GUI command/wiring fail-closure census | pending | `NOT_RUN` |
| `GUI-SRT-012` | Storage health shows, for each owner-named group, usage against disk budget, reclaimable bytes and the last compaction; the reclaim row dispatches only `cmd.storage.compaction.request`, shows the owner lifecycle, reports bytes returned only from the owner's before-and-after measurement, and is disabled with the Case L reason in viewer mode. | `Plans/storage-plan.md` SP-340, SP-344; `Plans/FinalGUISpec.md` F3-457 | future GUI storage-health and verified-reclaim matrix | pending | `NOT_RUN` |
| `GUI-SRT-013` | The last verified backup, with its time and last event, and what a restore from it would lose appear on Data Backup and Retention, the restore preview, the recovery shell and Storage & Retention from one Backup-owned projection, in the existing `data_loss_risk.class` words; derived families are stated as not backed up. | `Plans/Backup_Restore_System.md` BRS-031; `Plans/FinalGUISpec.md` F3-528, F3-457 | future GUI backup-status and restore-loss matrix | pending | `NOT_RUN` |
| `GUI-SRT-014` | A 100k-event chat opens on its first page within 150 ms p95 warm and 500 ms p95 cold, reading at most 2 MiB and replaying no event; scrolling near the top loads the next older page by itself with the reading position held, and the Load 50 older row stays as the fallback; a jump to an unloaded message pages it in; the row is keyboard reachable. | `Plans/storage-plan.md` SP-338, SP-344; `Plans/assistant-chat-design.md` ACD-242; `Plans/FinalGUISpec.md` F3-667, F3-506 | future GUI 100k-event open, paging and jump matrix | pending | `NOT_RUN` |
| `GUI-SRT-015` | The record inspector opens a record from the Ledger, the log and audit inspector, Raw views and Show raw data through `cmd.storage.open_value`, shows decoded fields, resolves payload references on demand under redaction, reads the same record as `pm inspect`, opens in viewer mode, and reads no JSON or JSONL mirror file. | `Plans/storage-plan.md` SP-339, SP-337; `Plans/FinalGUISpec.md` F3-666 | future GUI record-inspector parity matrix | pending | `NOT_RUN` |
| `GUI-SRT-016` | The Usage page, its Ledger room and every Usage widget read redb rollups and scan no raw usage event; usage totals, windows and charts come from rollups while the Keep usage history for setting governs only detailed records; a per-event drill-through is a keyed lookup. | `Plans/usage-feature.md` UF-108; `Plans/storage-plan.md` SP-341; `Plans/FinalGUISpec.md` F3-418; `Plans/Widget_System.md` WS-015 | future GUI usage rollup-only read census | pending | `NOT_RUN` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/usage-feature.md

### GRRC-032 - Shared Runtime GUI Projection Checklist Gate

```yaml
plan_unit_id: GRRC-032
unit_type: validation_criterion
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  The GUI rebuild is not shared-runtime complete until GUI-SRT-001 through GUI-SRT-016 prove bounded thread
  shell/detail projection, durable offline/reconnect/coalescing truth, ObservableWork, separate installation/auth/readiness,
  lease and awareness conflicts, evidence drill-through, BSD, typed Debug/Eval/MCP/Browser state, protected
  AuthBrowserSession isolation, command/wiring fail closure, storage health with verified reclaim, the last verified
  backup with restore loss, the chat first-page open with load-older paging, the record inspector, and rollup-only
  Usage reads (DL-270, amended 2026-10-31). The checklist consumes owner truth and does not
  create lifecycle, command, event, receipt, schema, or persistence authority.
gui_related: true
gui_classification_reason: This unit gates user-visible runtime projections, storage, backup and chat-open projections, and protected-session presentation in the rebuilt GUI.
depends_on: [F3-418, F3-457, F3-528, F3-666, F3-667, ACD-242, SP-338, SP-339, SP-340, BRS-031, UF-108, F3-506, F3-507, F3-508, F3-509, ACD-445, ACD-446, ATS-030, ATS-031, ATS-032, ATS-033, ATS-034, ATS-035]
unblocks: []
acceptance_criteria:
  - GUI-SRT-001 through GUI-SRT-016 each carry a harness, durable evidence ref, owner ref, and PASS before shared-runtime GUI completion is claimed.
  - Plan validation or screenshot-only evidence cannot satisfy functional, restart, race, poor-network, pressure, or protected-boundary rows.
  - No row treats stale projection, awareness, lease possession, authentication, process exit, or a dispatch receipt as mutation or success authority.
  - Protected AuthBrowserSession content and controls remain human-only and absent from every prohibited consumer.
  - Missing command or production-wiring closure leaves the related control disabled or omitted.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future GUI-SRT executable matrix]
risk_class: gui_shared_runtime_false_completion_or_authority_drift
reasoning_tier: high
context_scope: shared_runtime_gui_checklist_gate
implementation_surfaces: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: shared_runtime_gui_verification_gate, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - Plans/Decision_Log.md#DL-270
preserved_exact_tokens: [ThreadShell, ThreadDetail, ObservableWork, Off, Auto, On, DebugSession, EvalSession, AuthBrowserSession, human-only]
negative_constraints: [Do not let the checklist become implementation authority., Do not claim PASS from plan or screenshot evidence., Do not expose protected authentication content., Do not invent commands, events, receipts, or state.]
owner_hints: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/FinalGUISpec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
```
