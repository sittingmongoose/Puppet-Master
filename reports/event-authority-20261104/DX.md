# DX-P2 — Event Authority technical closure

Branch: `plans/ea-w2-executor-20261104`. First-pass/restart head: `d1c0c8616b194db30dc470e775fc2e230b9856b7`; fetched remote had not advanced, so no failed-attempt pushed work existed to continue. Worktree: `/home/sittingmongoose/pm-worktrees/DX-p2`, detached and sparse (`Plans scripts reports tests`). Final head: the commit containing this report; external receipt `drafts/DX/head.txt`.

**Outcome:** 48 technical cells upgraded across 16 independent prepared contracts. Fourteen families have 11 PASS / 0 PARTIAL / 1 ABSENT. Two have 10 PASS / 1 PARTIAL / 1 ABSENT, stopped on Jared's classification/retention decision. All 16 membership_version cells remain ABSENT. No family was admitted or excluded. PASS means authored normative depth and passing static oracles; native execution remains NOT_RUN. Independent grading/review remains the lead's next step.

| Family | EP / CV / SP | Before PASS / PARTIAL / ABSENT | After PASS / PARTIAL / ABSENT |
|---|---|---|---|
| `attempt.completed` | EP-210 / CV-500 / SP-500 | 8 / 3 / 1 | 11 / 0 / 1 |
| `attempt.started` | EP-211 / CV-501 / SP-501 | 8 / 3 / 1 | 11 / 0 / 1 |
| `node.blocked` | EP-212 / CV-502 / SP-502 | 8 / 3 / 1 | 11 / 0 / 1 |
| `node.completed` | EP-213 / CV-503 / SP-503 | 8 / 3 / 1 | 11 / 0 / 1 |
| `node.started` | EP-214 / CV-504 / SP-504 | 8 / 3 / 1 | 11 / 0 / 1 |
| `node.unblocked` | EP-215 / CV-505 / SP-505 | 8 / 3 / 1 | 11 / 0 / 1 |
| `plan.decomposition_degraded` | EP-216 / CV-506 / SP-506 | 7 / 4 / 1 | 10 / 1 / 1 |
| `remediation.resolved` | EP-217 / CV-507 / SP-507 | 8 / 3 / 1 | 11 / 0 / 1 |
| `remediation.spawned` | EP-218 / CV-508 / SP-508 | 8 / 3 / 1 | 11 / 0 / 1 |
| `run.completed` | EP-219 / CV-509 / SP-509 | 8 / 3 / 1 | 11 / 0 / 1 |
| `run.graph_integrity_failed` | EP-220 / CV-510 / SP-510 | 8 / 3 / 1 | 11 / 0 / 1 |
| `run.node_backoff_expired` | EP-221 / CV-511 / SP-511 | 8 / 3 / 1 | 11 / 0 / 1 |
| `run.node_backoff_started` | EP-222 / CV-512 / SP-512 | 8 / 3 / 1 | 11 / 0 / 1 |
| `run.node_ready` | EP-223 / CV-513 / SP-513 | 8 / 3 / 1 | 11 / 0 / 1 |
| `run.node_retry_scheduled` | EP-224 / CV-514 / SP-514 | 8 / 3 / 1 | 11 / 0 / 1 |
| `scheduler.pass` | EP-225 / CV-515 / SP-515 | 7 / 4 / 1 | 10 / 1 / 1 |

## Cells still not PASS and exact questions

- **All 16 — membership_version ABSENT:** no registry append or admission record is authorized. Separate family-by-family integration/admission is required.
- **scheduler.pass — retention PARTIAL / PENDING_RETENTION_DECISION:** Should `scheduler.pass` be classified as runtime history kept for one year after the run finishes, or ordinary telemetry kept for 90 days?
- **plan.decomposition_degraded — retention PARTIAL / PENDING_RETENTION_DECISION:** Should the pre-lock `plan.decomposition_degraded` record be kept for seven years as an operational record, or indefinitely as authority/source lineage; if a run-based policy is chosen, what existing lifecycle anchor applies when its payload has no run_id?

Those questions are stopped in SP-515 and SP-506 respectively. DL-045 reserves classification/retention/deletion choices to Jared. `surveys/RT/TABLE.md#G28` recommends Run year and seven years respectively; these are proposals, not answers. No policy, lifecycle anchor, count bucket or expiry grant was selected. Generic SP-278 index/checkpoint retention keeps its existing assignments. No other technical cell remains PARTIAL.

## Pass-two newly authored bindings and source evidence

Every family independently re-searched live top-level `Plans/*.md` and `Plans/*.json` at the fetched first-pass head. Shards, ledger source memory and audits were excluded as authority. Existing exact EP/CV/SP emitter, reader, identity, SP-278 generic projector/checkpoint, SP-286/CV-339 full-value-v2 custody and current SP-336/SP-347 durability are reused. DL-045's exact Executor scope table still lists all 16 names; no DL-046/DL-090 expansion is needed. Search evidence captures all hits and per-family negative evidence: the first-pass source_facts/source_bindings shape fixtures did not define concrete owner-read roles/parents/revisions, conditional presence, complete transition/post-state tables or recovery/withdrawal trace cases. Each missing adapter is expressly labelled newly authored in its own EP unit.

| Family | Newly authored unpersisted source adapter | Relational cases / traces |
|---|---|---|
| `attempt.completed` | `executor.attempt_completed.source_adapter.v1@1.0.0` | 111 / 6 |
| `attempt.started` | `executor.attempt_started.source_adapter.v1@1.0.0` | 135 / 6 |
| `node.blocked` | `executor.node_blocked.source_adapter.v1@1.0.0` | 112 / 6 |
| `node.completed` | `executor.node_completed.source_adapter.v1@1.0.0` | 93 / 6 |
| `node.started` | `executor.node_started.source_adapter.v1@1.0.0` | 108 / 6 |
| `node.unblocked` | `executor.node_unblocked.source_adapter.v1@1.0.0` | 81 / 6 |
| `plan.decomposition_degraded` | `executor.plan_decomposition_degraded.source_adapter.v1@1.0.0` | 49 / 6 |
| `remediation.resolved` | `executor.remediation_resolved.source_adapter.v1@1.0.0` | 97 / 6 |
| `remediation.spawned` | `executor.remediation_spawned.source_adapter.v1@1.0.0` | 93 / 6 |
| `run.completed` | `executor.run_completed.source_adapter.v1@1.0.0` | 59 / 6 |
| `run.graph_integrity_failed` | `executor.run_graph_integrity_failed.source_adapter.v1@1.0.0` | 50 / 6 |
| `run.node_backoff_expired` | `executor.run_node_backoff_expired.source_adapter.v1@1.0.0` | 75 / 6 |
| `run.node_backoff_started` | `executor.run_node_backoff_started.source_adapter.v1@1.0.0` | 76 / 6 |
| `run.node_ready` | `executor.run_node_ready.source_adapter.v1@1.0.0` | 59 / 6 |
| `run.node_retry_scheduled` | `executor.run_node_retry_scheduled.source_adapter.v1@1.0.0` | 83 / 6 |
| `scheduler.pass` | `executor.scheduler_pass.source_adapter.v1@1.0.0` | 65 / 6 |

The adapter objects independently enumerate source owner slots, payload/source joins, required parent refs, current revision predicates, lifecycle tables, before/after CAS, effect accounting and optional evidence-list resolution. Pre-attempt block/unblock cases omit an invented attempt. Materialized node_id joins to EP-105 WorkNodeRecord.worknode_id with original request and installed graph revision. Runtime joins preserve package/seam/lane/worktree, requested/effective account, role/permission scope and whole immutable runtime/context owner precedence. These are test capture views, never new persisted records or replacement runtime schemas. Source facts are obtained through actual owners under their fences, not caller flags. No new physical family, consumer, projector, checkpoint, command or retention policy was created in pass two.

## Premise checks

- **DL-045:** its 285-family permission still includes these exact 16 names and permits only technical bindings for already specified behavior. Product decisions remain stopped.
- **Current semantic owners:** Contracts current exact payload minima, canonical remediation resolution values, first-pass separate schemas and EP-105 WorkNode materialization remain the source. No legacy project_plan_node/WorkNodeRequest is promoted to canonical runtime identity.
- **Sequence and receipt:** current Executor Event Dedup Key Sequence Fallback still supersedes the old timestamp tuple. The unchanged per-family recipe reserves event_sequence once and preserves first bytes. SP-286/CV-339 v2 and SP-336/SP-347 govern original receipt/flush custody.
- **Storage scope:** Case L-5 requires project~base64url_no_pad(UTF8(project_id)); the new static oracle uses that actual encoding, with foreign-partition cases.
- **Retention:** Case L-3 still directly names Runtime/run/node/attempt for the 14 bound rows. No old answer is applied to scheduler.pass or pre-lock decomposition. RT G28 proposals remain undecided. Failed historical-answer premises: none applied; no old decision is extended.

## Shared-file hunks and IDs

- **Executor_Protocol.md:** only EP-210..225, each now contains its own source-read/identity table, lifecycle table, conditions and ordering barrier.
- **Contracts_V0.md:** only CV-500..515, each adds its exact adapter route and unchanged schema/import authority boundary.
- **storage-plan.md:** only SP-500..515, each adds its own recovery/withdrawal trace obligations; SP-506/SP-515 retain the decision stop and exact question.
- **Automated_Testing_System.md:** only ATS-250..257, 16 independently named semantic acceptance paragraphs.
- **Companions:** `Plans/executor_event_contracts.json` adds 16 independent semantic_adapter objects; `Plans/executor_event_semantic_fixtures.json` and `scripts/pm_executor_event_semantics.py` supply static source/transition and receipt traces. Existing 552 shape/identity fixtures and checker remain unchanged. No storage_value_registry.json edit, new stored value or test-file edit.
- **IDs used:** existing EP-210..225, CV-500..515, SP-500..515, ATS-250..257. No new PlanUnit/DL IDs. The 16 new source-adapter identifiers were checked against all fetched origin contract blobs (494 remote refs, no collision). Original block collision proof remains first-pass lineage below.

## Validation and limits

Final commands, exit codes, parsed top-level JSON statuses, raw output paths and SHA-256 values are in `DX.checks.json`. The new source/transition suite passes 1346 cases and 96 receipt/replay/withdrawal traces; the unchanged checker passes 552 fixture cases and 80 identity/replay checks. Generic event-index tests pass (14 tests). The runtime-vocabulary suite retains its one pre-existing FinalGUISpec renderer-phrase failure; both that owner file and the test are byte-identical to origin/main, recorded in pass2-runtime-baseline.json. No unrelated repair was made.

The 15-file ignored currentness edition was copied from the shared checkout before index generation and every source/destination SHA-256 matched, with explicit sha256sum confirmation. Derived shards/indexes are regenerated by repo scripts only; only the four edited owners may change shards. Index generate/validate statuses must be read at the top level. No test file is added because .gitignore has no named ! exception for a new DX test.

Native complete owner reads/schema validation, actual source adapters, SeglogFrameV2/receipt codec/flush/crash recovery, SP-278 transaction CAS/source translation, coherent backup/restore and permission/deletion/withdrawal concurrency remain authored NOT_RUN obligations. The finite model's generation/frontier token is not a persisted SP-278 token. No native PASS, registration, readiness or governance clearance follows. Initial resources were 21 GB available RAM / 42 GB free disk; disk was checked again before generation. No pm-mail, subagents, landing lock, main push, reseal, frozen validator, event registry, admission/Decision Log record or forbidden-file edits.

## Newly authored bindings and per-family search

Each row below independently searched all live top-level Plans markdown/JSON before writing. Generated shards, ledger source memory and historical audits were excluded as authority. The search captured every exact-name hit with its source line/text. Existing EventRecord, runtime snapshot/execution context, Case L-5 dedupe, SP-278 generic index and SP-286/CV-339 full-value receipt contracts are reused. No family borrows a sibling identity. New emitter/reader/version and hash recipe are labeled newly authored owner contracts. No new projector/checkpoint ID, physical family or retention policy was created.

Raw per-family search: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/binding-search.json`, SHA-256 `5c17e252b884e1f4ac1d574f73f06a9648d49ba78901729586091c2a4ee91578`.

### `attempt.completed`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2753, Plans/Contracts_V0.md:15232, Plans/Contracts_V0.md:15241, Plans/Contracts_V0.md:15259, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_completed.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-500. Transition: active_attempt -> terminal_attempt; terminal outcome must have success=true or failure_class, never both; retry/backoff evidence is not a second dispatch.

### `attempt.started`

Search: 16 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:508, Plans/Contracts_V0.md:522, Plans/Contracts_V0.md:2741, Plans/Contracts_V0.md:15181, Plans/Contracts_V0.md:15191, Plans/Contracts_V0.md:15209, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_started.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-501. Transition: admitted candidate -> started attempt; frozen permission/model/runtime snapshots and exact worktree baseline are durable before the barrier; increment policy counters once before worker spawn.

### `node.blocked`

Search: 39 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2453, Plans/Contracts_V0.md:2455, Plans/Contracts_V0.md:2459, Plans/Contracts_V0.md:2762, Plans/Contracts_V0.md:2814. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_blocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_blocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-502. Transition: eligible node -> blocked episode; mint blocked_sequence once per actual episode under node CAS. Before an attempt exists omit attempt_id. Required restore anchors and snapshot refs publish atomically with the block, never fabricate a prior attempt.

### `node.completed`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:940, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7104, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_completed.emitter.v1@1.0.0`. New operating consumer: `executor.node_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-503. Transition: verified -> done or verify_pending -> failed; preserve verifier and packaging evidence. Removing a node from the ready set cannot complete it.

### `node.started`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:939, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7103, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_started.emitter.v1@1.0.0`. New operating consumer: `executor.node_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-504. Transition: queued -> in_progress after admitted readiness and frozen actual attempt; a ready event alone cannot start a node.

### `node.unblocked`

Search: 55 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:921, Plans/Contracts_V0.md:2478, Plans/Contracts_V0.md:2480, Plans/Contracts_V0.md:2491, Plans/Contracts_V0.md:2815, Plans/Contracts_V0.md:14271. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_unblocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_unblocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-505. Transition: matching unresolved blocked episode -> resolved; require the exact ordered action/current prerequisite and durable recovery result. No stale approval and no safe-point anchor release before its owner terminal result.

### `plan.decomposition_degraded`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2665, Plans/Contracts_V0.md:2709, Plans/Contracts_V0.md:14819, Plans/Contracts_V0.md:14828, Plans/Contracts_V0.md:14843, Plans/Contracts_V0.md:15040, Plans/Contracts_V0.md:15049. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.plan_decomposition_degraded.emitter.v1@1.0.0`. New operating consumer: `executor.plan_decomposition_degraded.history_reader.v1@1.0.0`. New identity input order: `["project_id", "source_stage", "event_sequence"]`; exact RFC8785/hash recipe in SP-506. Transition: pre-lock decomposition -> degraded pre-lock shape; graph_locked=true rejects. Shapes are redacted bounded shape descriptors, not plan bodies; evidence_ref resolves the original evidence.

### `remediation.resolved`

Search: 45 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:417, Plans/Contracts_V0.md:500, Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:778, Plans/Contracts_V0.md:2643, Plans/Contracts_V0.md:2646, Plans/Contracts_V0.md:2657. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_resolved.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_resolved.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-507. Transition: active remediation child -> fixed, superseded, abandoned or replan_required with exact original parent/root/child joins; ceiling_exceeded is blocked-state evidence, not a current resolution.

### `remediation.spawned`

Search: 33 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2626, Plans/Contracts_V0.md:2628, Plans/Contracts_V0.md:2630, Plans/Contracts_V0.md:2784, Plans/Contracts_V0.md:2816, Plans/Contracts_V0.md:14697, Plans/Contracts_V0.md:14706. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_spawned.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_spawned.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-508. Transition: classified failed parent -> admitted remediation child, within existing generation/ceiling policy; append lineage before child dispatch; child_attempt_id is the child attempt identity, never the parent.

### `run.completed`

Search: 47 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:938, Plans/Contracts_V0.md:2366, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7102, Plans/Contracts_V0.md:13479, Plans/Contracts_V0.md:13489, Plans/Contracts_V0.md:13507. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_completed.emitter.v1@1.0.0`. New operating consumer: `executor.run_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-509. Transition: active run -> owner-declared terminal result only after all required Document Set packaging audits pass and in-flight work is reconciled. Canonical usage remains usage.event; optional usage_ref resolves the UF-085 snapshot; no legacy inline token tuple.

### `run.graph_integrity_failed`

Search: 8 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2675, Plans/Contracts_V0.md:14863, Plans/Contracts_V0.md:14871, Plans/Contracts_V0.md:14886, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_graph_integrity_failed.emitter.v1@1.0.0`. New operating consumer: `executor.run_graph_integrity_failed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-510. Transition: active graph validation -> integrity failure and replan path; never convert locked graph corruption into pre-lock decomposition degradation or blind retry.

### `run.node_backoff_expired`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2507, Plans/Contracts_V0.md:14363, Plans/Contracts_V0.md:14371, Plans/Contracts_V0.md:14387, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_expired.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_expired.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-511. Transition: matching active backoff -> elapsed wake only at or after durable backoff_until_utc; no attempt dispatch or success inferred from timer expiry.

### `run.node_backoff_started`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2497, Plans/Contracts_V0.md:14320, Plans/Contracts_V0.md:14328, Plans/Contracts_V0.md:14344, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_started.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-512. Transition: classified retryable failure -> scheduled backoff with existing per-error budgets; no retry of graph_integrity, verification_failed or reviewer_findings; timer never converts to terminal success.

### `run.node_ready`

Search: 5 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2444, Plans/Contracts_V0.md:14127, Plans/Contracts_V0.md:14135, Plans/Contracts_V0.md:14151, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_ready.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_ready.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-513. Transition: not ready -> dependency-satisfying ready; all blockers resolve and current graph/Spec Lock/capacity requirements pass. Preserve ready_since_utc while continuously ready, do not dispatch from this event.

### `run.node_retry_scheduled`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2515, Plans/Contracts_V0.md:14406, Plans/Contracts_V0.md:14415, Plans/Contracts_V0.md:14431, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_retry_scheduled.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_retry_scheduled.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "prior_attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-514. Transition: classified prior attempt -> scheduled successor admission under the existing retry budget; preserve prior identity, verify safe-point/worktree and refresh permission before any distinct successor attempt.

### `scheduler.pass`

Search: 71 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2418, Plans/Contracts_V0.md:2423, Plans/Contracts_V0.md:2425, Plans/Contracts_V0.md:2732, Plans/Contracts_V0.md:2740. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.scheduler_pass.emitter.v1@1.0.0`. New operating consumer: `executor.scheduler_pass.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "scheduler_pass_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-515. Transition: one pending wake set -> one scored pass, before dispatch; first recovery wake is startup_recovered. Select at most available_slots using the canonical score order, retain every nonselected ready node and its exclusion reason. Legacy non_selected is import-only.


## Pass-two evidence receipts

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-binding-search.json` — SHA-256 `bf22655fd256e6ec4e3cfbfde40da9b90cc84f4b487573365a8d41184a9b7600`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-id-search.json` — SHA-256 `c329cfa01802d3529a337baac0205a34824ec84317f0fe899a70af7b6c096400`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-currentness-sha256.log` — SHA-256 `7861f231de81ca0ce756a9b27d297e2c5f2700a7f7a000697492191912f685e1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-runtime-baseline.json` — SHA-256 `abac3b4abdee0293aebdb2863521002a67ce5f5eaf1a7694e90518f8df898e1b`.
