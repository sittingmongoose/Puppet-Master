# DX-FIX1 — Event Authority review round 1

Branch: `plans/ea-w2-executor-20261104`. Reviewed starting head: `9906491aa0e99271ae8fc4c3139f261ee6d46f38`. Graded canonical/checker head: `4aec2b48014b9faf7c783f3142d9a811c9c0ad75`. The subsequent report-only commit has the exact same graded source bytes; `drafts/DX/head.txt` is the final pushed head receipt. Worktree: `/home/sittingmongoose/pm-worktrees/DX-fix1`, detached and sparse (`Plans scripts reports tests`), from the VM local clone. No landing is authorized.

**Outcome:** 15 of 16 families PASS AS PREPARED in this self-grade, versus 5 of 16 in the independent review. F1–F4 are fixed with source-preserving independent counterexamples. Ten oracle cells and scheduler retention upgrade from the independent review; totals are **175 PASS / 1 PARTIAL / 16 ABSENT**. All sixteen membership/version cells remain ABSENT. `plan.decomposition_degraded` retains only its genuine retention decision stop. Native execution remains **NOT_RUN** throughout; these are normative contracts and static oracles. Separate independent re-review and family-by-family admission remain required.

Counts below are PASS / PARTIAL / ABSENT. The before column uses the independent 192-cell REGRADE, not the superseded drafting overgrade.

| Family | Independent review before | Self-grade after fixes | Verdict |
|---|---|---|---|
| `attempt.completed` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `attempt.started` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `node.blocked` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `node.completed` | 11 / 0 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `node.started` | 11 / 0 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `node.unblocked` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `plan.decomposition_degraded` | 10 / 1 / 1 | 10 / 1 / 1 | HOLD — RETENTION DECISION |
| `remediation.resolved` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `remediation.spawned` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `run.completed` | 11 / 0 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `run.graph_integrity_failed` | 11 / 0 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `run.node_backoff_expired` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `run.node_backoff_started` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `run.node_ready` | 11 / 0 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `run.node_retry_scheduled` | 10 / 1 / 1 | 11 / 0 / 1 | PASS AS PREPARED |
| `scheduler.pass` | 9 / 2 / 1 | 11 / 0 / 1 | PASS AS PREPARED |

## Review round 1: findings and responses

- **F1 — fixed** (`bca9fb92c6`, envelope-omission follow-up `b139ae2b27`). Where: scripts/pm_executor_event_semantics.py:41, scripts/pm_executor_event_semantics.py:166; family-local mappings in EP-210..225 and `Plans/executor_event_contracts.json`. Cause: a coupled payload/mirror omission bypassed comparisons of present fields. Fix: derive the complete payload, including version and original first observation ts, from independently hashed owner reads. An absent fact forbids inventing its field; an existing fact requires it. Both block and unblock select required attempt slots from the original episode, including explicit no-attempt evidence; null in an envelope does not satisfy required omission. The existing whole observation and mirror checks remain. Account-bearing attempt start requires its original requested/effective snapshots. Corrected `node.blocked` pre-attempt positive removes only truly absent failed-attempt/timeout/restore facts from the original source and retains real auth evidence. Corrected completed-success positive has no stale failure/backoff facts in its original operation. Verify: full semantics checker; coupled-omission-real-source cases for all optional facts, original-clock/version counterexamples, both attempt-backed episode omission negatives, both null-envelope negatives, and true no-account/pre-attempt positives. The 72 first F1 additions and two final omission cases preserve all original case names/expected outcomes.
- **F2 — fixed** (`b5a8fefab6`). Where: scripts/pm_executor_event_semantics.py:270, EP-217/218, both remediation adapter `generation_ceiling` objects. Cause: the ceiling checked `generation`, while the payload joined `remediation_generation`. Fix: bind both normalized fields and compare the actual joined remediation generation directly with its actual ceiling, preserving the old ceiling guard. Verify: each family's independent rehashed divergent-generation counterexample (`remediation_generation=99`, normalized generation 1, ceiling 3), a second divergence, and a valid generation exactly at ceiling; full semantics checker passes.
- **F3 — fixed** (`25fde70fad`, immediate-policy follow-up `4aec2b4801`). Where: scripts/pm_executor_event_semantics.py:62; family-local closure at Plans/Executor_Protocol.md:10264, and corresponding EP-222/224 paragraphs and adapter objects. Cause: mutable limit values and observation-only deadline checks bypassed current classified owner policy. Fix: reuse EP-032 and SP-238 exactly, with independent original failure/attempt, per-error counter identity, policy provenance, response/failure/scheduling clocks, Retry-After and refresh/client-rebuild evidence. Limits are transient=3, rate_limited=3, structured-output=2, auth-refresh=1, Storage interrupted=3 and transient_busy=1 after exactly 250 ms. Actual used must be an integer in range and match the source per-error counter; the payload retry ordinal is used+1 where present. Deadlines prove 1s/2s/4s, Retry-After/30s fallback, immediate classified retry, and refresh ordering. Storage adapter retries keep the actual attempt and forbid new Executor attempts; storage scheduling has zero Executor successor admissions. Those effect counts are a static accounting view of the existing no-new-attempt rule, not new stored counters. Verify: 266 additional full checker cases cover every class limit and negative bound, widened limits (including source-consistent 99/100), independent wrong original deadlines, original clocks/counters/provenance/parents, both header forms and fallback, refresh failures, all nonretryable Storage classes, early expiry and Storage effects. The follow-up rejects timed backoff for the matrix’s none/immediate policies (including zero/expired Retry-After); sixteen newly authored timer cases are negative, while their valid immediate scheduling counterparts remain covered. Every original 1,346 case expectation is unchanged.
- **F4 — fixed** (`43e7f77452`). Where: Plans/event_payload_scheduler_pass.schema.json:73, CV-515, EP-225 and scripts/pm_executor_event_semantics.py:138. Cause: both score shapes and source oracle accepted any integer. Fix: enforce existing integer 0..100 inclusive at both schema locations and normalized original scores; default 50 is documented and explicit scores remain required-present. Verify: separate lower/upper negatives for each schema shape, source-consistent full captures, valid 0/50/100, boolean/fractional negatives and 14 isolated normalized source-score cases through the full checker.
- **Q1 — fixed; no Jared question remains** (`90f95892fd`). Where: Plans/storage-plan.md:30308, scheduler companion retention ref, EP-225. Verified current premise at Contracts_V0:712, Storage Scheduler Runtime addendum:2165–2186, SP-198, Case L-3 and the exact existing runtime catalog. These explicit classifications still match fetched main (nine quote checks in retention-premise.json). Bind `RP-RUNTIME-365D@1.0.0`: 365 days after actual run completion, 1,000,000/run and 5,000,000/project, stronger holds, latest-25 terminal-run preservation and successor compaction. Keep `RP-PROJECTION-3GEN` checkpoint and `RP-EVENT-INDEX-SOURCE` index assignments separate. The policy catalog and event registry remain unchanged.
- **Q2 — stopped for Jared; question corrected** (`90f95892fd`). Where: Plans/storage-plan.md:29811. Exact question: **Should `plan.decomposition_degraded` be kept for seven years as non-authority operational degradation history under RP-OPERATIONAL-2555D@1.0.0, with terminal_transition explicitly anchored to the original durably committed decomposition/degradation result, or indefinitely as audit authority/source lineage under RP-AUTHORITY-INDEFINITE@1.0.0?**
  **Review recommendation, not applied:** select seven-year non-authority operational degradation history and explicitly approve the original committed-result `terminal_transition` mapping. Indefinite audit/source lineage remains a real alternative. Preserve independently governed source/graph/evidence bodies and all stronger holds. `PENDING_RETENTION_DECISION` remains in SP-506 and its companion; neither candidate, proposed anchor nor expiry/count eviction is authorized. No fabricated run or extension of DL-069's SafePoint-only clock is used.
- **Review note — integration item:** the runtime-vocabulary suite still fails only `test_release_verifies_selected_renderer_order_without_reopening_choice`, for the missing FinalGUISpec phrase `Skia compiled in and selected by default`. The test and GUI owner are byte-identical to fetched main. This is the review's existing failure and remains outside DX paths; no repair is mixed into this branch. Evidence: runtime-baseline.json and runtime-vocabulary-summary.txt in the check receipt.

## Bindings, premise checks and scope

Every original emitter, family-local history reader, source adapter, identity recipe, SP-278 projector/checkpoint/token and SP-286/CV-339 full-value-v2 receipt binding is reused. No new versioned identifier, PlanUnit ID, persisted value family, consumer, projector, checkpoint, policy, command or event admission is created by this fix round.

The newly authored normalized read mappings are explicitly owner prose: schema_version and immutable first timestamp from each family's existing original reserved operation; block/unblock actual episode attempt presence; and, independently for each of the three retry families, original `failure` records and policy/timing/counter provenance (plus the actual `prior_attempt` read for retry scheduling). These are captures of already specified owner state under native fences, not new persisted records or replacement runtime schemas. The sixteen current-canon observation searches and three separate retry searches include their own scope, existing matches and negative evidence. They reuse current owner policy and original operation definitions rather than a sibling's binding. The existing first/pass-two per-family source search lineage is retained below.

DL-045 still lists these sixteen exact Executor families and reserves new product choices; DL-076/SP-278's nine-field token, SP-286/CV-339 v2 and SP-336/SP-347 durability remain adopted by name. No August/September retention answer is generalized. Current explicit runtime classification, rather than an event-name prefix or RT proposal, closes scheduler retention. The pre-lock decomposition payload still has no run identity and no current exact assignment distinguishes its two real classes; that cell remains PARTIAL.

**Changed owner hunks:** EP-210..225's complete observation mappings; EP-211 account presence; EP-212/215 episode attempts; EP-217/218 generation ceiling; EP-221/222/224 retry policy/source reads; EP-225 priority and runtime-retention routing; CV-515's score-domain shape; SP-506's two-candidate pending question and SP-515's exact runtime assignment. No ATS owner edit is needed: existing ATS-250..257 obligations remain. All generated shard changes belong only to the three edited owners; global index outputs are generated by repository tools. No unrelated owner's generated body changed.

**IDs used/reused:** EP-210..225, CV-500..515, SP-500..515, ATS-250..257 (56 existing IDs; only CV-515 and SP-506/515 have prose changes outside EP). No ID is minted. No forbidden file, test file, registry, policy catalog, admission/Decision Log entry, frozen validator, Spec Lock or evidence bundle changed. No pm-mail, subagent, landing lock, main push or reseal occurred.

## Verification and evidence

`DX.checks.json` records commands, exit codes, parsed top-level statuses, evidence paths and SHA-256 values. All F1–F4 repairs ran through the full semantic checker; all original 1,346 case names and expected outcomes are retained, with 353 added source/transition cases and 14 isolated source-score cases. The final checks are:

| Check | Exit/result |
|---|---|
| Full semantic checker | 0 / top-level pass; 1,699 source/transition + 14 source-score + 96 traces |
| Shape/identity checker | 0 / top-level pass; 563 fixtures + 80 identity/replay cases |
| Review counterprobes | 0 / top-level pass; all 13 forbidden inputs rejected, corrected source-positive accepted |
| Event-index tests | 0 / all 14 tests pass |
| Runtime-vocabulary tests | 1 / 9 tests, one pre-existing GUI phrase failure; byte-identical baseline proved |
| Shard generation/check after every markdown change | 0 / top-level pass; three edited owner directories only |
| Plan-index generate and final validate | 0 / parsed top-level pass; readiness remains blocked, no governance clearance |
| Scope/regression and whitespace checks | pass; eight intended canonical/checker paths, allowed derived files, no forbidden drift |

Initial resources: 17 GB available memory, 110 GB free disk, above both 6 GB/50 GB hard stops. The worktree stayed sparse. Before index generation the ignored currentness edition was copied from the shared checkout; all fifteen source/destination hashes matched and explicit sha256sum confirmation was recorded. No native complete owner read, append/receipt codec/flush/crash, transaction CAS, backup/restore or deletion/withdrawal execution is claimed. These remain NOT_RUN obligations under the existing owners. No WorkNode, readiness or governance seal follows. The pushed detached worktree is removed at handoff.

Evidence receipts (path plus SHA-256):

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/currentness-copy.json` — `97f0aba3bd0d844c9663e5f22539d6c43ca711138551fc43a3d8ebbd069a56a8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/currentness-final.json` — `c8a379a5310e80b54cea282e240b1bd43f93b36f2856ea5e746070482cf14150`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/verify_deliverables.py` — `fd78b10265763e295311cd7937baaf1d755ed82c289ae5a32cebd479d7b3fc1a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/retention-premise.json` — `c89cf8dc5d25f2f7de1b0a45759c28ad05eabca9c9fa68e4847728f89761fe52`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/runtime-baseline.json` — `1573f09ec97e87fa8a566b104d93528733a331b7441ff27a1e9456ca3907f754`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/scope-and-regression.json` — `2d446b9ead7337e189e76f4698da9c54286f1aecae7588c433807d9366d5e231`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/observation-source-search.json` — `90855db2b9c6f9230149a241b46b4ec017e04604b18c809c60899a902f895849`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/retry-source-search.json` — `e07c160ab019963576603c76b9b714c7e237021622ed2280d868e89f334ce941`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix1/review_probes_after.py` — `dc04794df8ee6ed3e80d88e3ad377c6d65a363942ff301979ca5e3a2b563c527`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DX-sol/REVIEW.md` — `99486117c3b2c983fbdfd5058acce64cd0101ab7cdb9f751510e6242cc14776d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DX-sol/REGRADE.json` — `e873ee804df768fb8edf154e0cc5a5de76ba548a9e3ce829292d9823666b5ef7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DX-sol/PROBES.py` — `27913071c782d33d467485189c856eb8bc2583e10e6bd54d696e2ca98b1fedf8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DX-sol/PROBES.json` — `152e71e35df2ce552f59ae8f41784ad50b04c85cee6a14f8cf070064b0869ad6`.

## Original contract binding/search lineage

The following source-dated first/pass-two per-family searches support the reused original bindings. Their earlier grades are superseded by the 192-cell round-1 comparison above.

### First-pass independent binding searches

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
