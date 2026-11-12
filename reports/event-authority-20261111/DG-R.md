# DG-R — `goal_run.cancelled` R1-R6 on the shared TEST_ONLY adapters (stream E, 2026-11-12)

Branch `plans/ea-goal-dg-r-20261111`, cut from `origin/plans/ea-goal-own-c3-w34b-20261105` at `e9e712a7b5`, with the shared adapters merged (`origin/plans/ea-goal-adapter-20261111` at `62e61fe59a`, self-test 204/204) and the K(s) correction applied. VM, local worktree `/home/sittingmongoose/pm-worktrees/DG-R`. Brief: `lanes/DG-FAMILY.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Everything here is TEST_ONLY. No registry row, admission, Decision Log entry, retention or deletion policy, PlanUnit, Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter file was changed. No original bank, URI, hash or stored byte was rewritten or restamped. No `Plans/*.md` top-level document was edited, so no shard or index regeneration was needed (shard check run anyway, exit 0).

## Result per group

| Group | Status | Exact blocker or remaining work |
|---|---|---|
| R1 older scoped routing | **COMPLETE** | — |
| R2 positive D06/D05 causal graph | **NOT COMPLETE** | (a) the already-terminal byte-preservation branch (TerminalPreservation / PreservedResult / D01 `d06_preserve_terminal`, no new Event, genuine settlement still required) is not authored; (b) the native-v7 edition of the retained/inspection methods is not executed. Every other item of the judge's R2 case is executed (below). |
| R3 settlements / rollback / flush | **NOT COMPLETE** | The effect owners issue whole-root FileSafe binding/journal/origin and process birth/admission/termination/shutdown/origin originals, and D05 settlements must cover that inventory exactly, but no modeled effect state changes and no rollback transition is applied by the owner; the restore-transaction internals are schema filler. Needed: a modeled workspace/process state, an owner-applied safe-point restore joined to the journal, and an unknown-effect refusal. |
| R4 fresh current readers | **NOT COMPLETE** | The current-cancelled reader cannot yet return a whole `CombinedCurrentRead`: `CurrentSuccessfulReadback.current_start` (`CurrentSourceArgument`, original_started branch), the D05 current `SuccessfulReadback` inside `d06_readback.safe_stop`, `original_revision_join`, the separate `CurrentRead`, and `CurrentCancelledGoal` (`CurrentGoalStopArgument` plus current D06 controls) need genuine owner issuance. Native-v7 current dispatch is also not executed. The historical reader, fresh current-source acquisition at entry and final boundary, helper-return injection and the started-view refusal are executed. |
| R5 combined prefix / reducer | **COMPLETE** | — |
| R6 CAS / crash / cutover / withdrawal / reference | **COMPLETE** | — (two adapter tool issues recorded below; neither makes a real check falsely pass) |

None of the open items is a product question or an owner-text gap; each is technical authoring under the general successor rule. Nothing here needs a new PlanUnit. The exact remaining list with next commands is in `/home/sittingmongoose/pm-scratch/DG-R/RESUME.md` (copied to `drafts/DG-R/`).

## What was built

All new code is in new files named for the lane:

| File | Role |
|---|---|
| `scripts/pm_goal_dg_r_world.py` | TEST_ONLY world: native run, D01, Start, Goal Stop/SourceAudit/binding, SchedulerStop, D05, FileSafe, process and D06 owners; the modeled original D06 issuance chain; replay, retry and re-entry |
| `scripts/pm_goal_dg_r_readers.py` | Passive consumer: `read_retained_native`, `inspect_original` |
| `scripts/pm_goal_dg_r_projector.py` | Combined started+cancelled projector (`project_prefix.reference.v1`), generations and cutover, historical/current readers, child-process commit |
| `scripts/pm_goal_dg_r_oracles.py` | R1-R6 cases; exit 0 only when every case passes |

**How authority works.** Every original is a whole outer wrapper validated against its exact original root in its own realm. Validation of the routed realm uses the CV-1136 edge only through `retained_original_d05` (a `$ref` keyword override: the exact target URI is looked up in the retained registry; nested resolution stays there). Each original is issued by its registered owner as a test-Storage cell in a real transaction and kept in that owner's custody. Joins are original `SourceSelector`/`D05Selector` values whose `physical_value_sha256`/`physical_sha256` is SHA-256 of the complete outer canonical MessagePack; the consumer resolves each against Storage, or, for a superseded version at a mutable key, the owner's immutable custody, and refuses a Storage cell that is not the owner's own latest issuance. The consumer acquires originals only through `OwnerRegistry` handles. The D06 `goal_run.cancelled` v3 Event, the Start `goal_run.started` Event and the Goal-level cancellation Event are appended by Storage as first barriers; Storage assigns sequence, times and first receipts. The idempotency key is EP-118's exact recipe (JCS of the eleven-member tuple). Every integer and timestamp goes through `pm_event_numbers` / `pm_event_datetime`.

**What is filler.** Members no predicate reads come from a schema seeder; selectors outside the W4 causal inputs (deep provenance such as installed workgraphs or permission sources) resolve to TEST_ONLY ancillary provenance originals that carry no semantic authority. This is stated in the owner text.

**Findings the original contracts forced.** The D06 cancelled Event's first append must be a barrier-class durable append (`FirstBarrier`), so the issuer uses `barrier` and the consumer has `event/first_barrier`. A `mutation_started=true` payload requires non-empty `settlement_refs`, which is now joined to the effect owners' inventory. `record_reference` is reachable with genuine originals only at the Goal command id cap (256 characters) with a long actor reference; the checkpoint payload-reference spill needs three generations at that cap.

## Oracles

| Group | Positives | Negatives | Failures |
|---|---:|---:|---:|
| R1 | 4 | 39 | 0 |
| R2 | 7 | 72 | 0 |
| R3 | 3 | 14 | 0 |
| R4 | 4 | 7 | 0 |
| R5 | 6 | 15 | 0 |
| R6 | 8 | 32 | 0 |
| **Total** | **32** | **179** | **0** |

R1 includes the adopted adapter demonstration (1 positive, 31 negatives, rerun here unchanged), the binding of its derived route to the authored CV-1136 `routing.v1.json` (2 positives, 7 negatives) and routed versus predecessor validation (1 positive, 1 negative). R5 and R6 include 23 direct invocations of the projector's lower helpers (decode, checkpoint read, unpack, reducer step, cutover) with one substituted argument.

Every positive builds a fresh world in which the owners perform their modeled issuance and then calls the consumer or projector. Every negative passes exactly one defect to an issuing owner (so dependents are recomputed by the owners) or substitutes one presented value, and must refuse with exactly its expected code.

**R2 executed:** original_started and initialized-no-Start positives; whole-root `RetainedNativeCancellation`, `ProjectGoalCauses`, `RetainedFileSafeEffects`, `OriginalCancelled`; recorded original chronology (candidate, intent, prepared control, prepare origin, native body/control CAS, append, result, committed control, publish origin, D01 update/head/origin); distinct D05/D06/Scheduler/native/Goal/flush/effect operations; Goal Stop, SourceAudit and binding joins; SchedulerStop to native RunOperationResult/PublicationOrigin; D05 bounded outcome (origin chain, flush, cut, capability dispositions, no pre-attempt effects); native revision +1 once with activation and all unrelated members preserved; exact v3 Event, producer digest, first barrier receipt and full-value commitment from Storage's own record; equal replay (same operation: no second Event, same receipt and read), semantic equal retry (new operation: dedupe), altered re-entry and altered-source retry conflicts, uncertainty after append (truthful `MISSING_ORIGINAL_VALUE`, then re-entry completes from the same reservation), second cancellation refused by the native CAS; presented transport dict, foreign handle, unregistered owner, cell substituted at rest, withdrawn original.

**R3 executed:** mutation=false empty settlements; mutation=true with one settlement per effect invocation selecting the owner's actual result and origin, `settlement_refs`/`rollback_refs` equal to the effect inventory; omitted, duplicated and shared settlements; wrong process result; census flag mismatch; extra rollback ref; reopened capability; sticky earlier flush failure; `unknown` flush outcome; pre-attempt effect; omitted tuple members; withdrawn journal.

**R4 executed:** historical read (whole `CombinedHistoricalRead`), historical pass after a lawful native advance, current-source freshness at entry and final boundary, started view refused after cancellation (`STALE_NATIVE`); refusals for an original withdrawn after a returning helper, a row substituted after a returning helper, native advance, newer Goal Stop, changed D06 control, advanced D01 head, drift between entry and final boundary.

**R5 executed:** combined started+cancelled and initialized-no-Start rows; the whole source-backed `CombinedProjectPrivate` validated on every call; off-run rows validated then no-op; coverage over the global prefix; deterministic reprocessing; an authenticated retention gap continues; halts before unsupported same-run `stopped`/`blocked`/`replanned`, a cancellation without its native cancellation, a duplicate Start, a second terminal, pending first custody and a malformed off-run frame at rest; substituted Start commit receipt.

**R6 executed:** row and checkpoint in one Storage transaction under source-token, coverage and CAS checks; real child-process death before commit (neither visible) and after commit (both visible; retry resolves the same first transaction); staged rebuild and full-coverage cutover retiring the prior generation; inline, `event_reference`, `record_reference` and checkpoint payload-reference forms decoded back into the identical original record; K(s) keys; refusals for a fourth generation slot, projector and reader withdrawal (including a held reader at final release), source loss, withdrawn and corrupt packs, stale source token at commit, preempted checkpoint CAS, premature cutover, a reference chosen where inline fits, a lower-hex key, a row substituted at rest, disclosure permission revoked before commit and before release. Passive reads are recorder-checked to change no owner or Storage.

## Guards for the shared guard-isolation sweep

`DG-R-guards.json` (beside this report in `drafts/DG-R/`) maps every guard code to the negatives that refuse with exactly that code. No local guard-removal engine and no check-11 claim are made; the shared tool adjudicates isolation.

- **Product guards:** 204 codes in the DG-R consumer and projector; **114** have at least one negative refusing with exactly that code.
- **Without a dedicated negative (90), listed in the JSON:** most are joins that a coherent one-defect negative reaches only after an earlier guard (the generic selector resolution, a whole-root schema rule, or the same join checked at another record first), self-consistency checks on owner output, or final-boundary repeats of an entry predicate. They go to the shared sweep; none is shown to make a real check falsely pass. This gap is one reason R2-R4 are not graded COMPLETE.
- **R5/R6 guards without a dedicated negative, and why:** `cas/coverage` (any frame change moves the log-derived token first, so `cas/source_token` refuses; a duplicate pair for the sweep), `decode/stored_event` (a coherent Event substitution changes Storage custody first: `decode/custody_commitment`), `final/projection` and `read/original_event` (final-boundary repeats; a row change after a returning helper is refused by `read/row_frontier` first), `read/no_row` (row and checkpoint commit in one transaction, so a checkpoint without its row is unreachable through the projector), `pack/canonical` (non-canonical pack bytes are refused by the shared decoder before this check), `operation/size` and `representation/compact_oversize` (no original value within the owner id caps makes the compact `record_reference` wrapper or an operation exceed 16 KiB; the guards stay as fail-closed limits). These are reported for the shared guard-isolation tool to adjudicate as duplicate pairs or unreachable limits; R5 and R6 are graded COMPLETE on that basis, and the tool may overturn it.
- **Oracle assertions (24):** positive-case assertions (crash visibility, replay, determinism, order, spill, gap), not product guards.
- **Adapter, Storage, NUMRULE and schema refusals reached by DG-R negatives (46 codes):** also in the JSON, for example `original/handle_type`, `original/issuer`, `original/withdrawn`, `registry/unregistered_owner`, `custody/receipt_mismatch`, `resume/conflict`, `append/conflict/producer25`, `tx/cas_absent`, `pack/unavailable`, `payload/numrule/payload_digest`, `native/cas_body`.

Product guards with negatives (count): `cas/source_token` (1), `checkpoint/key` (1), `checkpoint/logical_key` (1), `checkpoint/scope` (1), `checkpoint/storage` (1), `current/d01_head` (1), `current/d06_control` (1), `current/goal_stop` (1), `current/native_body` (2), `cutover/complete_coverage` (1), `cutover/no_checkpoint` (1), `cutover/no_staged` (1), `cutover/row` (1), `d01/head_current` (1), `d01/head_update` (1), `d01/origin_causation` (1), `d01/owner_origin` (1), `d01/owner_result` (1), `d05/capability_reopened` (1), `d05/final_flush` (1), `d05/flush_aggregate` (1), `d05/flush_sticky` (3), `d05/pre_attempt_effects` (2), `d06/control_intent` (1), `d06/control_once` (1), `d06/control_result` (1), `d06/prepare_operation` (1), `d06/publish_control` (1), `d06/publish_native_body` (1), `decode/commitment` (1), `decode/custody_commitment` (1), `decode/dataset` (1), `decode/full_value` (1), `decode/identity` (1), `decode/key` (1), `decode/metadata_has_no_event` (1), `decode/representation_minimal` (1), `decode/storage` (1), `effects/mutation_census` (1), `effects/process_partition` (1), `effects/process_settlement_result` (1), `effects/rollback_refs` (1), `effects/settlement_count` (2), `effects/settlement_once` (1), `event/expected_revision` (1), `event/first_barrier` (1), `event/goal` (1), `event/goal_run` (1), `event/goal_run_revision` (1), `generation/limit` (1), `goal/binding_origin_revision` (1), `goal/binding_revision_selection` (1), `goal/publication_audit` (1), `goal/publication_first_receipt` (1), `goal/publication_receipt` (1), `goal/stop_intent_audit` (1), `goal/stop_latched` (1), `goal/stop_receipt_intent` (1), `join/association/intent` (1), `join/association/result` (1), `join/goal_stop/aggregate` (1), `join/goal_stop/domain_cut` (1), `join/goal_stop/intent` (1), `join/goal_stop/scheduler` (1), `join/inventory/aggregate` (1), `join/inventory/coverage` (1), `join/inventory/intent` (1), `join/inventory/result` (1), `join/inventory/scheduler` (1), `join/safe_stop/intent` (1), `join/safe_stop/result` (1), `join/scheduler/aggregate` (1), `join/scheduler/intent` (1), `join/scheduler/result` (1), `native/activation_preserved` (1), `native/after_cancelled` (1), `native/control_body` (1), `native/control_once` (1), `native/prepared_body` (1), `native/prepared_control` (1), `native/revision_once` (1), `native/unrelated_preserved` (1), `operations/distinct` (2), `pack/media_type` (1), `pack/reference_type` (1), `permission/project` (1), `permission/read` (1), `projector/no_relevant_event` (1), `projector/withdrawn` (1), `r1/authored_aliases` (1), `r1/authored_nested_realm` (1), `r1/authored_no_fallback` (1), `r1/authored_sites` (2), `r1/authored_source_hash` (1), `r1/authored_target` (1), `read/no_checkpoint` (1), `read/row_frontier` (2), `reader/withdrawn` (2), `reducer/cancel_commitment` (1), `reducer/cancel_producer` (1), `reducer/cancel_receipt` (1), `reducer/start_barrier` (1), `reducer/start_commitment` (1), `reducer/start_receipt` (1), `scheduler/native_cancel_operation` (1), `scheduler/native_origin_operation` (1), `scheduler/native_origin_record` (1), `scheduler/run_control_after` (1), `scope/event_candidate` (1), `select/cell_substituted` (1), `start/before_cancel` (1), `start/birth_body` (1), `start/birth_origin` (1), `start/commit` (1).

## Components used

ST (append, frames, first receipts, custody), TX (cells, CAS, transactions, snapshots, seeds), PK (packs), RT (retention gap), RO (real child-process cut and fresh reopen for the projector commit), IF (registry, owners, handles, withdrawal), MR (ordered calls, before/after observations, passive no-effect), GS (generic source and reducer), KC (K(s)), RB-equivalent whole-root banks (`W4Roots`), RQ (R1 demonstration), NR (all groups).

## K(s) correction

Applied exactly as the adapter report says, by cherry-picking DG-S's commit `bf6b5a8da5`. The three files are byte-identical with `origin/plans/ea-goal-dg-s-20261111`:

| File | SHA-256 |
|---|---|
| `Plans/goal_run_projection_reference_contracts/started.md` | `c139da0495675b287674b7c55cd8dd64eb45e51c8eab14970e8b1610f5e9abe9` |
| `Plans/goal_run_projection_reference_contracts/cancelled.md` | `80df93179da6cd1ddd83af460e0af051f2e3ca6f725a651846f54fcdc1a000aa` (W34b's bytes) |
| `scripts/pm_goal_own_c3_w34_reference_oracles.py` | `ce0a1311b5c49543befd1a2e45b3d9fab4a8259290ec138ec93734c62e2f6817` |

## Units amended

No PlanUnit was added. Owner text amended in place, W4 rows only:

- `Plans/goal_own_c_contracts/protocol.md:75` — W4: the DG-R executable TEST_ONLY composition, authority model, filler and ancillary statement, native NOT_RUN line.
- `Plans/goal_run_cancelled_w4_contracts/protocol.md:35` — completion accounting: DG-R reports R1-R6 separately.
- `Plans/goal_own_c_contracts/suites.json:130` — W4 `dg_r_executable_composition` entry.
- `Plans/goal_run_projection_reference_contracts/started.md:7` — K(s) correction (shared with DG-S).

## Re-grade on the twelve criteria (`goal_run.cancelled`)

`PASS PASS PASS PASS PASS PASS PASS PASS PASS PARTIAL PASS PARTIAL` — **10/12, unchanged** from W34b. Criterion 10 (consumers/checkpoints) stays PARTIAL because the current-cancelled reader (R4) is not complete; criterion 12 (positive/negative oracles) stays PARTIAL because R2, R3 and R4 are not complete. The executed evidence behind both cells is far stronger than at W34b, but no cell is upgraded while a group is open, and none is lowered for native NOT_RUN.

## Shared-file hunks for the merge

New-side `start,count` relative to the K(s) commit `6fc64de2a5` (the adapter merge `f74c7386f0` brings the adapter's own `protocol.md` section unchanged):

- `Plans/goal_own_c_contracts/protocol.md`: 75,2 (W4 section only).
- `Plans/goal_own_c_contracts/suites.json`: 129,11 (W4 entry only).
- `Plans/goal_run_cancelled_w4_contracts/protocol.md`: 34,2 (W4-private file).
- `Plans/goal_run_projection_reference_contracts/started.md`: 7,1 (K(s); identical with DG-S).
- `scripts/pm_goal_own_c3_w34_reference_oracles.py`: 23,1; 136,1; 193,1; 210,1; 224,1; 432,1 (K(s); identical with DG-S).

New files: `scripts/pm_goal_dg_r_{world,readers,projector,oracles}.py`, `reports/event-authority-20261111/DG-R.md`.

## Tool issues (adapter batch; neither makes a real check falsely pass)

1. The shared test Storage keeps cells and the log behind one manifest, so every cell write changes the token's `current_bytes_sha256`, `manifest_bytes_sha256`, `manifest_generation` and `checkpoint_ref`. Native redb cells do not move the seglog CURRENT/manifest. DG-R's CAS and cutover compare every other token member exactly plus the frame-derived coverage (`pm_goal_dg_r_projector.log_token`).
2. The adapter token's `index_dataset_name` (`TEST_ONLY:event_record_index@eig_…`) does not match the original index-checkpoint pattern `event_record_index.v2@eig_<64 hex>`; the generic snapshot's index checkpoint uses the original pattern with the token's own generation id.

## Checks

All heavy runs were serial and memory-gated at 13.5 GB inside the job (`long-job`), `PM_GOAL_AUDIT_WORKERS=1`.

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_dg_r_oracles.py --output <evidence>/oracles.json` | 0 | pass: 32 positives, 179 negatives, 0 failures (12m32s) |
| `python3 scripts/pm_goal_test_adapters_selftest.py` | 0 | 204 cases pass (64 positives, 140 negatives) |
| `python3 scripts/pm_goal_test_demo_r1.py` | 0 | pass: 1 positive, 31 negatives |
| `python3 scripts/pm_goal_test_numrule.py` | 0 | NUMRULE pins verified |
| `python3 scripts/pm_goal_own_c3_w34b_oracles.py --qualify-only` | 0 | W34b scoped-routing qualification passes on this branch (20s) |
| `python3 scripts/pm_goal_own_c3_w34b_oracles.py` | 2 | expected: W34b's deliberate NOT_COMPLETE sentinel exit |
| `python3 scripts/pm_goal_own_c3_w34_reference_oracles.py` | 2 | expected NOT_COMPLETE sentinel; after the K(s) fix 30 representation positives, 358 negatives, 0 failures |
| `python3 scripts/pm_goal_own_c3_w34_oracles.py` | 2 | expected W34 diagnostic sentinel |
| `python3 scripts/pm_goal_own_c_oracles.py` | 0 | pass (after the owner-text edits) |
| `python3 scripts/pm_goal_own_c_source_oracles.py` | 0 | pass (after the owner-text edits) |
| `python3 scripts/pm_goal_current_writer_oracles.py --guard-table` (dg-current) | 0 | pass |
| `python3 scripts/pm_goal_run_stop_block_oracles.py --guard-table` (dg-stop-block) | 0 | pass |
| `python3 scripts/pm_goal_lifecycle_successor_oracles.py --guard-table` (dg-lifecycle) | 0 | pass |
| `python3 scripts/pm_goal_history_reader_fixtures.py --guard-table` (dg-history) | 0 | pass (1589s) |
| `python3 scripts/pm-goal-runtime-lineage.py --self-test` | 0 | pass |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass (no `Plans/*.md` edited; no regeneration needed) |
| `python3 scripts/pm-plan-index.py validate` | 1 | 126 known baseline failures at `origin/main` `77bae0c636`: 21 legacy-ledger errors and 105 main-ahead units absent at this older base; **0 name a branch file** (`index-attribution.json`). Run with the live 15-file currentness edition copied into the ignored path (hashes in `currentness-sha256.txt`). |
| `git diff --check` | 0 | clean |


Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-R/` with `SHA256SUMS`.
