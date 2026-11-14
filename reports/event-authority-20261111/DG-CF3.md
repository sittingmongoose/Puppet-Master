# DG-CF3: goal_run.certified F0, CF-10, CF-11, CF-12, P4, P5, P6 and P8 on the shared TEST_ONLY adapters (stream E, 2026-11-11)

Branch `plans/ea-goal-dg-cf3-20261111`, cut from `origin/plans/ea-goal-own-c3-w5-20261105` at `498e35e153`, with `origin/plans/ea-goal-adapter-20261111` (`62e61fe59a`) merged. Run on **Nas1**, trimmed cone worktree `/home/sittingmongoose/pm-worktrees/dg-cf3` (no superseded migration snapshot runs). Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Everything here is TEST_ONLY. Nothing here admits anything, changes the Event registry, adds a Decision Log entry, a retention or deletion policy or a PlanUnit, or touches `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files. No original bank, URI, hash or stored byte was rewritten or restamped. No subagent was used.

## Results at a glance

| Item | Result |
|---|---|
| Oracle run (`scripts/pm_goal_dg_cf3_oracles.py`) | **pass**, exit 0: **23 positives, 150 one-defect negatives, 8/8 real-process fault-matrix rows, 0 failures** |
| Adapter self-test after the merge | 204/204 (64 positives, 140 negatives), exit 0 |
| Guard sites in the lane's code | 128; 102 refuse in at least one negative with exactly their code; the other 26 are listed with their reason (duplicate pair, internal self-check, or unreachable from genuine originals) |
| Index validate | exit 1; 126 failures on the pre-edit base and 126 on the branch against origin/main `77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947`: **0 added, 0 removed** |

## Per group

The judge's complete case (`reviews/DG-sol/JUDGE-original-path.md`, "What complete and authentic mean"): full valid baseline inputs, independently acquired owner originals, the actual ordered modeled method calls with before/after observations, exact entire candidates/results/receipts, and coherent one-defect negatives at every applicable independent boundary.

| Group | Status | Exact remaining item |
|---|---|---|
| F0 projection-reference prerequisite | **COMPLETE** | None. The "still-oversize compact operation" refusal is unreachable from genuine originals: Storage caps every authority value and Event at 16,384 bytes, so the compact record-reference row stays small (largest measured, long-ID run: well under the cap). It stays covered by the W5 component control (`size/complete_projection_operation`). |
| CF-10 entire global prefix and certified reducer | **NOT COMPLETE (one item)** | The certified branch is complete, along with every transition and halt, the expired-Start survivor proof and the whole global prefix. Missing: the legacy **old-profile versus native-v7 Start and positive-cancellation whole-source admission**. See "The CF-10/P4 item" below. |
| CF-11 checkpoint, generation, CAS, cutover | **COMPLETE** | None for this lane. |
| CF-12 lifetimes, original backup, rebuild after restore | **COMPLETE** | None. Actual physical backup, deletion and restore stay NOT_RUN. |
| P4 raw-source acquisition and bounded reducer | **NOT COMPLETE (one item)** | Same item as CF-10: P4 requires "each whole source and exact original old-profile/native-v7 branch". |
| P5 keys, birth, anchor, frontier | **COMPLETE** | None. |
| P6 lower publication, staging, cutover, interruption | **COMPLETE** | None. |
| P8 three generations, lifetimes, backup, no repair | **COMPLETE** | None. |

### The CF-10/P4 item

The combined reducer reduces started and cancelled rows from this lane's TEST_ONLY Start and positive-cancellation owners. Those owners genuinely issue the v3 Events (barrier custody), Start candidate/commit/origin, D05 and D06 records, and the native/D01 publication. They are compact and single-profile.

- **What the judge requires:** admitting the whole original roots per profile:
  - `OriginalStarted` (`FullOriginalAppend` + `RetainedNativeStart`) and its native-v7 companion;
  - `OriginalCancelled` (`CancelledOriginalValue` + `RetainedNativeCancellation`) and its v7 companion.
- **Where they come from:** these originals are issued only by the S1/S2 and R2 TEST_ONLY owners being built in parallel:
  - `plans/ea-goal-dg-s-20261111`: `scripts/pm_goal_dg_s_start.py`, `pm_goal_dg_s_world.py`;
  - `plans/ea-goal-dg-r-20261111`: `scripts/pm_goal_dg_r_world.py`.
- **Why this lane cannot supply them:**
  - A schema-generated `OriginalStarted` is a relation specimen, not an issued original (judge, "What complete and authentic mean").
  - The brief forbids building another lane's groups.
  - So no authored contract or successor on this branch can supply them before the DG merge.
- **Next step:** `/home/sittingmongoose/pm-scratch/dg-cf3/RESUME.md` (copied to the evidence folder) lists the exact steps and commands. In short: wire `_start_record` and `_cancel_record` to those owners' acquisition, with profile dispatch and the cast/old-birth negatives.

Like DG-CF2, this lane's native, D01, Standard and coordinator records are compact TEST_ONLY owner records. Every selector the consumer stores is recomputed from their exact stored bytes. Their whole roots (`StorageWorkflowResult`, `StorageWorkflowUpdate`, `DurableStandardRead`, coordinator Commit/Origin/Release and so on) are composed by DG-CF1/DG-CF2 and integrate at the merge.

## What the corpus does

### Owners (`scripts/pm_goal_dg_cf3_world.py`)

Registered TEST_ONLY owners issue every value from their own execution; Storage assigns sequences, Storage times, seeds and first custody.

- **Goal owner:** Goal body, control, Stop, binding revision and binding control records.
- **Native owner (Executor):**
  - birth (body, control, birth, birth origin, initial control origin, current pointer);
  - per publication: a body CAS plus D01 update/origin/head.
- **Start owner:** the started-v3 Event (payload validated against the original v3 schema) with barrier custody, then candidate/commit/origin, coissued with the native/D01 publication in one Storage transaction.
- **Cancellation owner:**
  - D05 result/origin first;
  - then the cancelled-v3 Event with barrier custody;
  - then the D06 candidate/intent/result/prepare and publish origins with the native/D01 publication;
  - original-started or initialized-no-start branch.
- **Certified path:**
  - the Standard receipt and capture origin in one Storage transaction;
  - the adapter's CF-01 identity owner and producer, imported unedited (I0/I1, the 25-field producer and the v3 payload root);
  - a barrier append;
  - one transaction coissuing native certified result/origin, D01 update/origin/head, the native body CAS and coordinator Commit/Origin;
  - Release after readback.
- **Transaction handles:** Storage-issued (`LaneStorage.begin`). Storage assigns the transaction id and time before a write set is computed, and a commit after any other transaction refuses (`tx/reservation_stale`).
- **Issuance-time knobs** produce the one-defect originals the negatives need. One owner issues the defective record, so every copy, digest and key is computed from the same value.

### Consumer (`scripts/pm_goal_dg_cf3_projector.py`)

- **Reducer (P4):**
  - It runs over the adapter `GenericSource` snapshot: whole CURRENT, manifest and segments; every raw frame CRC- and schema-checked; index rows compared with first custody; retention gaps authenticated.
  - Rows are processed in global order. Pending custody, an unregistered family or a mismatched payload schema halts even off-run; only after that does an off-run row count as a no-op.
  - Same-run started, cancelled and certified rows resolve every selector against the exact stored bytes of the same snapshot and apply their branch joins:
    - native transition and protected fields;
    - D01 update/origin/head and same-transaction joins;
    - Standard semantics and capture origin;
    - coordinator Commit/Origin/Release chronology;
    - Event revisions, first receipt and commitments;
    - causal order;
    - initialized-no-start;
    - D05/D06.
  - It halts before: unsupported same-run rows (blocked, stopped, replanned), a second terminal (including certification after cancellation), Start after terminal, a duplicate Start, and certification without a scanned Start or an authenticated expired-Start survivor gap.
- **Successor forms (F0):** inline, Event reference and record reference rows; inline or payload-reference checkpoint. Built through the W5 successor `Representation`, imported read-only, with packs bound to the adapter Storage's pack owner.
- **Keys and hashes (P5):**
  - K(s) is unpadded base64url of exact UTF-8, recomputed independently in the oracle.
  - The anchor and frontier use the original P5 domains with this edition's profile name and its independently acquired profile digest.
  - Coverage and gap digests are recomputed from Storage's own index in the oracle.
- **Lower Storage publisher (P6),** `owner.storage...publish.reference.v1`, is the only writer. It:
  1. reacquires every source;
  2. rederives row, checkpoint, anchor, frontier and lifecycle with the Storage-issued transaction id and time;
  3. compares the whole candidate and the before-image;
  4. verifies every pack before and after the last helper;
  5. reruns its final predicate over seglog, authority, controls, root, coverage and rows;
  6. commits row plus checkpoint in one transaction under per-key CAS.
  - `Projector` (`owner.goal_run...project_prefix.reference.v1`) only requests publication.
  - A lost acknowledgement resolves the same transaction; a refused batch leaves the earlier prefix intact.
- **Lifetime (P8):** RP-PROJECTION-3GEN, enforced through `collect`:
  - at most three generations;
  - current without TTL;
  - retired plus 604800 seconds on Storage's own clock (a TEST_ONLY clock-owner control advances it);
  - actual hold authority records; a hold string holds nothing; an unregistered hold owner is ignored.
- **Reader:** reopens root, row and checkpoint in one snapshot, rederives the row from lawful retained originals, and runs final fences.

### Backup and restore (`scripts/pm_goal_dg_cf3_restore.py`)

- **`BackupOwner.take`:**
  - captures one coherent original-authority unit at one manifest generation: CURRENT, manifest, live segments and durable packs, each with SHA-256 and size;
  - privately retains the sealed unit;
  - names derived tables as excluded (BRS-031: rebuilt after restore).
- **`TombstoneOwner`:** the current deletion ledger, held outside the restored Storage.
- **`RestoreDriver.restore`, in order:**
  1. authenticates the unit against the retained seal;
  2. refuses incomplete, mixed, archive-bearing, re-sealed or derived-as-authority units;
  3. installs into a fresh directory and reopens Storage (CURRENT→manifest hash join, SP-347 recovery);
  4. enforces current tombstones through the registered retention owner (no resurrection) and pack withdrawal;
  5. drops every derived table;
  6. rebuilds through the lower publisher.
- It appends no Event, issues no custody and completes no pending work.

## Oracle counts

| Group | Positives | Negatives |
|---|---:|---:|
| F0 | 4 | 15 |
| CF-10 | 6 | 58 |
| P4 | 2 | 6 |
| CF-11 | 1 | 0 (its P5/P6 cases below are CF-11's shared corpus) |
| P5 | 1 | 21 |
| P6 | 3 | 25 |
| CF-12 | 2 | 7 |
| P8 | 4 | 18 |
| **Total** | **23** | **150** |

Fault matrix (real processes; CF-11/P6, plus pack ordering for F0). Each row:
1. Copy a template Storage.
2. Run the operation in a child that dies by `os._exit(73)` at the cut.
3. Read back in a fresh process.
4. Re-enter twice in fresh processes with the same request.

| Op | Cut | Child exit | Read-back | Re-entry ×2 |
|---|---|---:|---|---|
| stage | `publish_before_commit` | 73 | no checkpoint | fresh stage commits |
| stage | `publish_after_commit` | 73 | staged generation visible | — |
| advance | `publish_after_pack` (Event-reference run) | 73 | pack durable; neither row nor checkpoint advanced | first commits, second replays |
| advance | `publish_before_commit` | 73 | neither row nor checkpoint | first commits, second replays |
| advance | `publish_after_commit` | 73 | both row and checkpoint | both replay the same transaction; no change |
| cutover | `publish_before_commit` | 73 | still staged | first cuts over, second replays |
| cutover | `publish_after_commit` | 73 | current | both replay; no change |
| advance | none (control) | 0 | both | both replay |

Every re-entry leaves the Event and custody counts unchanged.

## Guards for the shared isolation sweep

`reports/event-authority-20261111/DG-CF3-guards.json` maps every new guard code to the negatives that refuse with exactly that code: 102 of the 128 sites. It also lists the 26 sites without a dedicated negative, each with its reason:

- **Duplicate pairs to prove together:**
  - `advance/expected_frontier` and `cutover/expected_frontier` with `publish/replay_conflict`;
  - `cutover/source_defect` with `cutover/unsupported_or_malformed_row`;
  - `publish/final/withdrawn` with `publish/final/controls`;
  - the coverage, defect and rows fence members with `publish/final/seglog`;
  - `pack/noncanonical` with the pinned decoder's `pack/canonical_decode`;
  - `pack/reference_fields` with the PayloadRef schema;
  - `stage/anchor_collision` with `stage/seed_reused`;
  - `reducer/custody_receipt` with the adapter's `source/custody_receipt`.
- **Unreachable from genuine originals on the adapter Storage:** `advance/source_selection_changed`, `advance/row_removed`, `checkpoint/size`.
- **Static profile integrity, covered by the W5 component:** `profile/file_sha256`, `profile/logical_digest`.
- **Internal API or self-checks:** `reduce/*`, `sources/coordinated_snapshot`, `tx/identifier`, `release/readback`, the backup/restore driver preconditions, and `restore/storage_instance` / `restore/manifest_generation` (behind `restore/seal`).

No local removal engine or check-11 claim is made.

## Components used

**ST**, **TX**, **PK**, **RT**, **RO** (pattern with real child-process cuts and fresh-process reopen), **IF**, **MR**, **GS**, **KC** and **NR** throughout. **RB**: the CF-01 RootBank, and the W5 successor `ProjectionBank` read-only for every whole-root validation. RQ was not needed.

## Units amended (no new PlanUnit)

- `Plans/Automated_Testing_System.md:7706`: dated DG-CF3 amendment paragraph of ATS-1121 (`### ATS-1121` at :7652), selecting this corpus for exactly F0, CF-10, CF-11, CF-12, P4, P5, P6 and P8.
- `Plans/goal_own_c_contracts/protocol.md:128-137`: section "DG-CF3 complete original-path oracles (2026-11-11)".
- `Plans/goal_own_c_contracts/suites.json:158-169`: `dg_cf3` key in the goal_run.certified suite.

## Shared-file hunks for the DG merge

- **`Plans/Automated_Testing_System.md`**, `@@ -7705,0 +7706,2 @@`: amendment paragraph and blank line after the ATS-1121 YAML block, before the ContractRef line. DG-CF2 (and DG-CF1) add paragraphs at the same place; keep all.
- **`Plans/goal_own_c_contracts/protocol.md`**, `@@ -127,0 +128,10 @@`: appended after the adapter section. DG-CF2's section lands at the same place; keep both.
- **`Plans/goal_own_c_contracts/suites.json`**, `@@ -157,0 +158,12 @@`: the `dg_cf3` object after `c3_w5_part3`. The `dg_cf2` and `dg_cf1` objects go beside it; mind the comma.
- **Regenerated** (regenerate at merge rather than hand-merge):
  - `Plans/_shards/automated_testing_system/**`: 52 files, source-hash headers only;
  - `Plans/.plan_index/{plan_units.jsonl, doc_cards.json, dependencies.json, coverage_report.json, node_readiness_report.json}`: 85 ATS rows (`source_doc_sha256`) plus generated timestamps.
- **New files only:**
  - `scripts/pm_goal_dg_cf3_world.py`;
  - `scripts/pm_goal_dg_cf3_projector.py`;
  - `scripts/pm_goal_dg_cf3_restore.py`;
  - `scripts/pm_goal_dg_cf3_oracles.py`;
  - this report and `DG-CF3-guards.json`.
- **K(s):** not applicable (DG-S and DG-R only). This lane's keys already use base64url, through the certified reference edition.

## Twelve-criterion re-grade (goal_run.certified, this lane's groups)

| Criterion | Before (W5 part 3) | After |
|---|---|---|
| Membership/version | PASS | PASS |
| Owner document | PASS | PASS |
| Producer | PASS | PASS |
| Closed payload | PASS | PASS |
| Scope/identity | PASS | PASS |
| Replay/idempotency | PASS | PASS |
| Retention | PASS | PASS |
| Redaction/custody | PASS | PASS |
| Transitions | PASS | PASS |
| Consumers/checkpoints | PASS | PASS |
| Compatibility/withdrawal | PASS | PASS |
| Positive/negative oracles | PARTIAL (0 complete CF/P tuples) | **PARTIAL for the family.** F0, CF-11, CF-12, P5, P6 and P8 now have complete original-path corpora: genuine issuance, whole-root products, coherent one-defect negatives and real-process cuts. CF-10 and P4 are complete except the legacy whole-source admission item. The family cell stays PARTIAL until that item and DG-CF1/DG-CF2's groups integrate at the merge. |

Family: 11/12 before and after. No grade is raised by this lane alone.

## Adapter notes for the tool batch (not blocking a real check)

- The adapter Storage co-persists cells in its seglog manifest, so CURRENT/manifest bytes, manifest generation and `checkpoint_ref` move with any cell transaction. The publisher's generic-frontier fence and cutover's frontier equality therefore compare every seglog-derived token field and exclude those four (same note as DG-CF2).
- Nas1 lacked `msgpack`, `blake3` and `rfc8785`. All runs used a scratch venv (`~/pm-scratch/dg-cf3/venv`, msgpack 1.2.4, blake3 1.0.x). The adapter self-test, including its byte-exact canon fixtures, passes 204/204 under it.

## Checks

All runs on Nas1, serial (`PM_GOAL_AUDIT_WORKERS=1`). The oracle run peaked at 449 MB RSS and the history-reader checker at 801 MB. The four inherited DG checkers ran through a gate that starts each one only at ≥ 8 GB available. The live fifteen-file currentness edition was copied byte-exact before index generation (`currentness-copy.sha256` equals `currentness-live.sha256`).

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_test_adapters_selftest.py` | 0 | pass; 204 cases (64 positives, 140 negatives incl. 14 matrix rows) |
| `python3 scripts/pm_goal_dg_cf3_oracles.py --output <evidence>/oracles.json` | 0 | pass; 23 positives, 150 negatives, 8/8 matrix rows; 577 s, 449 MB |
| `python3 scripts/pm_goal_own_c_oracles.py` | 0 | pass |
| `python3 scripts/pm_goal_own_c_source_oracles.py` | 0 | pass |
| `python3 scripts/pm-goal-runtime-lineage.py --self-test` | 0 | pass |
| `python3 scripts/pm_goal_own_c3_w5_projection_oracles.py --output <evidence>/w5-projection.json` | 0 | PASS; 13 component positives, 31 negatives |
| `python3 scripts/pm_goal_own_c3_w5_successor_oracles.py --output <evidence>/w5-successor.json` | 2 | expected: the preserved historical stored-root counterexample reports BLOCKED (same as W5 parts 2/3 and DG-CF2) |
| `python3 scripts/pm_goal_own_c3_w5_oracles.py` | 2 | expected: preserved predecessor bank failure, 22 unresolved (same as W5 part 2 and DG-CF2) |
| `python3 scripts/pm_goal_test_demo_cf01.py` | 0 | pass |
| `python3 scripts/pm_goal_current_writer_oracles.py --guard-table <out>` | 0 | started at 8 GB available; 23.9 s, 69 MB |
| `python3 scripts/pm_goal_run_stop_block_oracles.py --guard-table <out>` | 0 | started at 11 GB available; 18.2 s, 48 MB |
| `python3 scripts/pm_goal_lifecycle_successor_oracles.py --guard-table <out>` | 0 | started at 11 GB available; 8.6 s, 50 MB |
| `python3 scripts/pm_goal_history_reader_fixtures.py --guard-table <out>` | 0 | pass; 6143 cases, 6032 negatives, 0 unproved guards; started at 11 GB available, rerun with a 3600 s cap after the first run hit the gate's 1500 s cap at row ~590/650 (exit 124, recorded in `dg-checkers.tsv`); 2026.5 s, 801 MB |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass; only `automated_testing_system` shards changed |
| `python3 scripts/pm-plan-index.py generate` | 0 | pass; only ATS rows (`source_doc_sha256`) and generated timestamps changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 1 | 126 failures on branch = 126 on base, against origin/main `77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947`; 0 added, 0 removed (`index-baseline-comparison.json`) |
| `git diff --check` | 0 | clean |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-CF3/` with `SHA256SUMS`, including `RESUME.md` for the CF-10/P4 item.
