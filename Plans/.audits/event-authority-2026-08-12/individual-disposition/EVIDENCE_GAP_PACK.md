# Evidence gap pack — 27 NEEDS_MORE_EVIDENCE rows

**Generated:** 2026-08-12T08:52:00Z  
**Source ledger:** `individual-disposition/LEDGER.jsonl`  
**Classification:** 0/27 closable by citation deepening against already-checked sources. 26/27 are repairable only by adding new authoritative persistence evidence. 1/27 remains an irreducible owner decision because the cited Plans sources conflict.

Do not convert any disposition to `KEEP_REGISTERED`, invent owner/producer IDs, bulk-register, or treat future `event_test_requirements` as executed oracle evidence. These citations prove command-path emission/requirements, not persisted Event Authority registration.

## Evidence profiles

**Profile A (26 EMIT-PERSIST rows) — named 12-field matrix:**  
`membership_version=FAIL`; `owner_doc=OWNER_REQUIRED`; `producer=PASS`; `closed_payload_schema=FAIL`; `scope_identity=FAIL`; `replay_idempotency=FAIL`; `retention=FAIL`; `redaction_custody=FAIL`; `transitions=FAIL`; `consumers_checkpoints=FAIL`; `compatibility_withdrawal=FAIL`; `positive_negative_oracles=FAIL`.

**Profile B (`context.compaction.completed`) — named 12-field matrix:**  
`membership_version=FAIL`; `owner_doc=OWNER_REQUIRED`; `producer=FAIL`; `closed_payload_schema=FAIL`; `scope_identity=FAIL`; `replay_idempotency=FAIL`; `retention=FAIL`; `redaction_custody=FAIL`; `transitions=FAIL`; `consumers_checkpoints=FAIL`; `compatibility_withdrawal=FAIL`; `positive_negative_oracles=PASS`.

## 27-row table

| # | event_type | profile | strongest existing Plans source | gap | next action |
|---:|---|---|---|---|---|
| 1 | `context.compaction.completed` | B | `Plans/Wiring_Matrix.production.json:2807-2860`; `Plans/UI_Command_Catalog.md:776`; `Plans/Automated_Testing_System.md:1371-1398` | Wiring requires no persisted event; catalog/ATS name a persisted lifecycle token. Citation cannot choose the authority. | KEEP_ON_OWNER_SHEET (`COMPACT-001`, **not** EMIT-PERSIST-026) |
| 2 | `testing.capability_policy.updated` | A | `Plans/Wiring_Matrix.production.json:25645-25706` | Triple-bound emit/handler only; no EventRecord/seglog append proof. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 3 | `testing.visibility_policy.updated` | A | `Plans/Wiring_Matrix.production.json:25955-26017` | Exact command-path emit; no persisted-record proof. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 4 | `docker.host.access_open_requested` | A | `Plans/Wiring_Matrix.production.json:10039-10099` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 5 | `docker.host.instance_lifecycle_requested` | A | `Plans/Wiring_Matrix.production.json:10100-10160` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 6 | `docker.host.instance_retention_recorded` | A | `Plans/Wiring_Matrix.production.json:10161-10221` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 7 | `docker.host.preflight_requested` | A | `Plans/Wiring_Matrix.production.json:10344-10404` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 8 | `docker.host.profile_saved` | A | `Plans/Wiring_Matrix.production.json:10405-10465` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 9 | `docker.host.receipt_opened` | A | `Plans/Wiring_Matrix.production.json:10466-10526` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 10 | `docker.host.refresh_requested` | A | `Plans/Wiring_Matrix.production.json:10527-10587` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 11 | `docker.host.session_launch_requested` | A | `Plans/Wiring_Matrix.production.json:10588-10648` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 12 | `docker.hosts_route_opened` | A | `Plans/Wiring_Matrix.production.json:10649-10709` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 13 | `github.actions.dispatch_readiness_validated` | A | `Plans/Wiring_Matrix.production.json:15635-15695` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 14 | `github.actions.readiness_compared` | A | `Plans/Wiring_Matrix.production.json:14531-14591` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 15 | `github.repo.create_requested` | A | `Plans/Wiring_Matrix.production.json:21656-21720` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 16 | `health.route_opened` | A | `Plans/Wiring_Matrix.production.json:15916-15977` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 17 | `plan_compile.run_created_or_bound` | A | `Plans/Wiring_Matrix.production.json:20532-20600` | Planning tables repeat wiring payloads; no exact append proof. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 18 | `planning.approval_cas_receipt.written` | A | `Plans/Wiring_Matrix.production.json:20532-20600` | Same. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 19 | `planning.plan_approved` | A | `Plans/Wiring_Matrix.production.json:20532-20600` | Same. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 20 | `prd_builder.approval_snapshot.created` | A | `Plans/Wiring_Matrix.production.json:21316-21380` | Same. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 21 | `prd_builder.prd_pack_approved` | A | `Plans/Wiring_Matrix.production.json:21316-21380` | Same. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 22 | `project.github_repo_bound` | A | `Plans/Wiring_Matrix.production.json:21656-21720` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 23 | `remote.reconnect.requested` | A | `Plans/Wiring_Matrix.production.json:21831-21892` | Reconciliation refs remain wiring evidence. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 24 | `testing.session.backgrounded` | A | `Plans/Wiring_Matrix.production.json:25708-25770` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 25 | `testing.session.opened` | A | `Plans/Wiring_Matrix.production.json:25771-25833` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 26 | `testing.session.redaction_inspected` | A | `Plans/Wiring_Matrix.production.json:25834-25896` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |
| 27 | `testing.session.watch_started` | A | `Plans/Wiring_Matrix.production.json:25897-25959` | Emit obligation only. | KEEP_ON_OWNER_SHEET (`EMIT-PERSIST-026`) |

## Separation

- **DEEPEN_CITATION:** none (0/27). Exact-token deepening already ran (`DeepenEmit24`, `DeepenTestingEmit`, `PlanIndivU10`).
- **ADD_AUTHORITATIVE_EVIDENCE:** 26/27.
  - Rows 2–27: `EMIT-PERSIST-026`
  - Required repair shape: add exact persisted-event authority, not more census/wiring-only citations.
- **PRODUCT_DECISION_REQUIRED:** 1/27.
  - Row 1: `COMPACT-001` (authority conflict; do not infer from `EMIT-PERSIST-026`)
- **KEEP_ON_OWNER_SHEET:** 27/27 until either the new evidence lands (rows 2–27) or the owner resolves the compaction authority conflict (row 1).

Corroborating campaign sources for rows 2–27: `closed-world-census/admission/TRIPLE_BOUND_EMIT_MERGE.json`, `MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` (`persistence_adjudication: still_open_no_admit`).

## Execution-ready repair breakdown

### Group 1: direct authority conflict

- **Count:** 1 row
- **Row:** `context.compaction.completed`
- **Current source set:** `Plans/Wiring_Matrix.production.json:2807-2860`; `Plans/UI_Command_Catalog.md:776`; `Plans/Automated_Testing_System.md:1371-1398`; deepened row receipt `individual-disposition/deepen/PlanIndivU10/rows/ROW_context.compaction.completed.json`
- **Why evidence addition alone is insufficient:** the cited Plans sources disagree about whether this token is a persisted lifecycle event or a no-persist receipt path.
- **File targets:** `Plans/Wiring_Matrix.production.json`, `Plans/UI_Command_Catalog.md`, `Plans/Automated_Testing_System.md`, and `OWNER_DECISION_SHEET.json` (`COMPACT-001`)
- **Action:** owner must choose one authority path, then make the losing source consistent. Do not register or admit this token until the conflict is explicitly resolved.

### Group 2: machine-contract emit candidates needing new persistence authority

- **Count:** 26 rows
- **Rows:** `testing.capability_policy.updated`, `testing.visibility_policy.updated`, `docker.host.access_open_requested`, `docker.host.instance_lifecycle_requested`, `docker.host.instance_retention_recorded`, `docker.host.preflight_requested`, `docker.host.profile_saved`, `docker.host.receipt_opened`, `docker.host.refresh_requested`, `docker.host.session_launch_requested`, `docker.hosts_route_opened`, `github.actions.dispatch_readiness_validated`, `github.actions.readiness_compared`, `github.repo.create_requested`, `health.route_opened`, `plan_compile.run_created_or_bound`, `planning.approval_cas_receipt.written`, `planning.plan_approved`, `prd_builder.approval_snapshot.created`, `prd_builder.prd_pack_approved`, `project.github_repo_bound`, `remote.reconnect.requested`, `testing.session.backgrounded`, `testing.session.opened`, `testing.session.redaction_inspected`, `testing.session.watch_started`
- **Current source set:** exact-token deepening receipts in `DeepenEmit24` (24 rows) and `DeepenTestingEmit` (2 rows); cited machine-contract evidence in `Plans/Wiring_Matrix.production.json`; corroborating census artifacts `closed-world-census/admission/TRIPLE_BOUND_EMIT_MERGE.json` and `closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json`
- **Why they remain blocked:** current sources prove emit obligation only. They do not prove persisted EventRecord/seglog authority for the exact token.
- **File targets:**
  - `Plans/event_family_registry.json` for exact membership/version and consumer-checkpoint admission
  - `Plans/Wiring_Matrix.production.json` for an explicit persisted-event authority handoff instead of emit-only evidence
  - the owning surface spec already adjacent to the cited command path (for these rows, the currently cited sources are in `Plans/Wiring_Matrix.production.json`, with testing-policy corroboration in `Plans/UI_Command_Catalog.md` and `Plans/Automated_Testing_System.md`)
  - `OWNER_DECISION_SHEET.json` (`EMIT-PERSIST-026`) only if the owner declines to add persistence authority and instead chooses quarantine/non-event handling
- **Action:** for each row, add a source-backed persisted-event contract that closes the missing fields (`membership_version`, `closed_payload_schema`, `scope_identity`, `replay_idempotency`, `retention`, `redaction_custody`, `transitions`, `consumers_checkpoints`, `compatibility_withdrawal`, and, where still failing, `positive_negative_oracles`). The 24 `DeepenEmit24` rows already have `producer=PASS`; only `context.compaction.completed` and the two testing-policy rows need no further producer inference from the current pack.
