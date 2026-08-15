# Shard 018: Shared Runtime GUI Projection Verification Addendum - 2026-08-13

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L2009-L2070

Source SHA256: `fcc18e1b56d09fb73d8a582cc332eeb8a36c7423ad59f62fa160390b9e5d1f91`

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

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Automated_Testing_System.md

### GRRC-032 - Shared Runtime GUI Projection Checklist Gate

```yaml
plan_unit_id: GRRC-032
unit_type: validation_criterion
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  The GUI rebuild is not shared-runtime complete until GUI-SRT-001 through GUI-SRT-011 prove bounded thread
  shell/detail projection, durable offline/reconnect/coalescing truth, ObservableWork, separate installation/auth/readiness,
  lease and awareness conflicts, evidence drill-through, BSD, typed Debug/Eval/MCP/Browser state, protected
  AuthBrowserSession isolation, and command/wiring fail closure. The checklist consumes owner truth and does not
  create lifecycle, command, event, receipt, schema, or persistence authority.
gui_related: true
gui_classification_reason: This unit gates user-visible runtime projections and protected-session presentation in the rebuilt GUI.
depends_on: [F3-506, F3-507, F3-508, F3-509, ACD-445, ACD-446, ATS-030, ATS-031, ATS-032, ATS-033, ATS-034, ATS-035]
unblocks: []
acceptance_criteria:
  - GUI-SRT-001 through GUI-SRT-011 each carry a harness, durable evidence ref, owner ref, and PASS before shared-runtime GUI completion is claimed.
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
preserved_exact_tokens: [ThreadShell, ThreadDetail, ObservableWork, Off, Auto, On, DebugSession, EvalSession, AuthBrowserSession, human-only]
negative_constraints: [Do not let the checklist become implementation authority., Do not claim PASS from plan or screenshot evidence., Do not expose protected authentication content., Do not invent commands, events, receipts, or state.]
owner_hints: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/FinalGUISpec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
```
