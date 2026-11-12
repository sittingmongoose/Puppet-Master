# DG-S — goal_run.started S1 to S6 on the shared TEST_ONLY adapters (stream E, 2026-11-11)

Branch `plans/ea-goal-dg-s-20261111`, cut from `origin/plans/ea-goal-own-c3-w34a-20261105` at `91ffd2047d`, adapters merged from `origin/plans/ea-goal-adapter-20261111` at `62e61fe59a`. VM, local worktree `/home/sittingmongoose/pm-worktrees/DG-S`. Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Everything here is TEST_ONLY: owners, Storage, values, receipts and transactions are modeled. Nothing here proves native issuance, locking, fsync, crash durability, deployment enrollment, installation or restore. No event-registry row, admission, Decision Log entry, retention or deletion policy, new PlanUnit, Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter file was changed. No original bank, URI, hash or stored byte was rewritten or restamped.

## Result per group

| Group | Result | Complete case exercised |
|---|---|---|
| S1 original Start/native/D01 production and publication | **COMPLETE** | Before-birth descriptor; whole `OriginalWorkflowArgument` from 31 independently registered owners; separate `OriginalGoalArgument`; `OriginalCommitArgument`, `OriginalD01StartPublicationArgument`, `RetainedNativeStart` and `PublicationResult` validated at both publishers; the ordered method graph (recorder) with Storage-assigned sequence/time/first custody; exactly one Event, one transition and one immutable first receipt; lost-acknowledgement dedupe; semantic conflict on the same operation; missing participant; future source at entry; stale native CAS and a lower-publisher refusal after the append, both preserving the truthful prefix; a 13-row real child-process matrix in which pending/unknown prefixes stay fenced and are never completed. |
| S2 native-v7 source-method dispatch | **COMPLETE** | The same owners under the explicitly selected native-v7 composition (v6 custody/D01 roots, `workflow_start_standard_source.v5`, the started native-v7 companion): production, retained and inspection reads, and the same 13-row matrix. Old-profile dispatch to old roots; both cross-bank casts refuse; an old birth presented to the v7 coordinator refuses; a v7 descriptor with the old profile header and a v7 producer with the wrong payload header refuse; an undeclared companion edge refuses the composition. |
| S3 generic source, global prefix and reducer | **COMPLETE** | The adapter's whole generic source (every frame of every scope validated before off-run filtering, custody compared with frame-derived receipts) feeding the started reducer, which joins each Start row to its retained native Start; whole `GenericFrame`, `DurableGenericToken` (nine fields, no snapshot id) and `ProcessedPrefix` roots; an authenticated retention gap continues; malformed off-run frame, second Start, unsupported same-run row, Start without retained native, substituted custody/commitment, wrong Storage, false empty inventory, unproven gap, pending custody and reordered frames halt or refuse before the defect, with the frontier stopping before it. |
| S4 fresh independent readers and helpers | **COMPLETE** | `read_retained_native`, `inspect_original`, `read_historical`, `read_current`, each acquiring its own graph (retained Storage custody; whole generic source; projection row and checkpoint; fresh `CurrentStartSource` from the D01 owner and native truth; separate fresh `CurrentGoalArgument` from the Goal owner). One change injected after each returning helper and before final release (Stop latched, native advanced, projector withdrawn, reader withdrawn, Goal original tombstoned, newer row) refuses that call; retained/historical originals survive lawful native advance while current refuses; no passive call changes Storage (checked inside every call, net of concurrent owner writes). |
| S5 projection transaction, generation lifecycle and withdrawal | **COMPLETE** | Successor `ProjectorResult`/row/checkpoint derived from S1/S3 sources and own preimages; one row+checkpoint transaction under full CAS with the lower publisher rederiving the row; real child-process cuts before and after commit (neither / both, retry resolves the first transaction); staged generation hidden, atomic cutover after full coverage, interrupted cutover keeps the prior current; stale CAS, fourth slot, held retired generation, premature cutover, cutover before replay, caller-computed afterimage, writer cutoff and original-source loss refuse; the 604,800-second retirement window removes the oldest unheld retired generation; reinstall rebuilds a fresh generation. |
| S6 original inline/reference/metadata/checkpoint-spill paths | **COMPLETE** | Authentic originals through inline and event_reference rows and a checkpoint spill (owner-issued holds), each read back through historical and current reads with every stored part and complete operation measured; record_reference reconstructed from forced packs on the authentic original and refused as a published row by deterministic selection (finding 2); withdrawn, corrupt-at-rest, noncanonical and foreign packs, false commitment, size, media type and event identity, a reference chosen when inline fits, an oversize compact operation (encoder) and a pack withdrawn before final release all refuse. |

No group has a technical blocker. The deep leaves of each upstream owner's whole value (for example the fields inside the native-compile checkpoint) are owner-chosen TEST_ONLY content bound per world; the joins the W3 Start contract names are all enforced, and every selector resolves to a Storage cell its owner wrote. The upstream families' own internal joins belong to their own owner contracts.

## What was built

Four new files, all lane-named; no earlier script, adapter, `pm_goal_oracle_common.py` or NUMRULE file was edited except the brief's K(s) correction in `pm_goal_own_c3_w34_reference_oracles.py`.

| File | What it does |
|---|---|
| `scripts/pm_goal_dg_s_world.py` | Isolated whole banks for both editions (v3 profile: `current_workflow_native_activation` + the started reference successor, with the Goal-control realm; native-v7: the certified `native` realm, its one inherited exact edge at its original hash, and the started native-v7 companion, every companion-to-native `$ref` checked against `imports.json`). Schema skeletons repaired only for conditional consts/enums/exact-count `contains`. The `Binder` binds every identity, scope, owner, Storage id, time, K(s) key and selector from the world's own execution; every selector it issues points at a Storage cell the same owner wrote (SP-337 pack-backed when a source value exceeds a cell). Reopenable owner custody for real child-process cuts. |
| `scripts/pm_goal_dg_s_start.py` | `StartWorld` and its independently registered owners: descriptor, native Workflow (birth, immutable per-revision body/control cells, current pointer, StartControl epoch 0 with its OwnerIssueOriginPhysical, A4 outbox), seven original-input owners, seven activation-source owners, graph / required set / WorkNodes / receipts / staging / readiness / activation receipt, launch chain, D01 (CurrentSource, real v4 head and v2 current pointer), runtime context, Goal-control realm. `StartOwner.commit_start` is `owner.workflow.activation.commit_start.v2`; `StartStorageParticipantOps.commit_original` is `owner.storage.workflow_start.commit_original.v2`; `dedupe` and `recover_start`. |
| `scripts/pm_goal_dg_s_readers.py` | Retained readback and the relation set; the started reducer on the adapter's generic source; the whole `GenericFrame`/`ProcessedPrefix` roots; the four passive readers with per-helper and final fences; the successor projector (generations, atomic row+checkpoint CAS, staging, cutover, withdrawal, reinstall, retirement window, holds) and the inline / event_reference / record_reference row and inline / payload_reference checkpoint representation over Storage packs. |
| `scripts/pm_goal_dg_s_oracles.py` | The oracle harness: S1 to S6, the child-process fault matrices, guard export, JSON output. Exit 0 only when every case passes. |

### The original Start path (S1, and S2 under native-v7)

1. The descriptor owner installs the coordinator descriptor (profile, both methods, whole-schema pins of the custody, D01, activation, consumer and Goal-argument resources) in a Storage transaction **before** birth.
2. The native owner births the run: body at revision 7, status `ready`, activation `start_event_pending` revision 11; control joined to the body record; StartControl epoch 0 with no pending/committed/operation; its `OwnerIssueOriginPhysical` (`owner.workflow.activation.begin.v1`, issued key and record hash); the prepared A4 outbox.
3. Every other owner issues its whole original under its exact root (validated at issue): 7 durable inputs, 7 activation sources, installed graph (its commitment fixes the run identity), required set, 2 born WorkNodes, 2 materialization receipts (born key and record hash), staging, readiness, activation receipt, launch chain, D01 CurrentSource (current body/control equal native truth, head and pointer cells), runtime context, and the separate `OriginalGoalArgument` with its Workflow association joined to the native birth body.
4. `commit_start` acquires everything through the registry only (a dict, another owner's handle, a same-id unregistered owner, a missing participant or an extra future source refuses), runs the entry joins, prepares the producer from the sources (Storage clock time, runtime/actor/account context, goal revision, before/after revisions, workgraph, activation receipt, request membership, the v3 idempotency recipe and event id), assembles and validates the whole `OriginalWorkflowArgument` and `OriginalGoalArgument`, persists the `StartCandidate` with StartControl pending, appends the one Event with a synced barrier and first custody, derives the native after-images, then Commit, StartControl, StartOrigin, then the D01 update/head/pointer/origin, and validates `OriginalCommitArgument`, `OriginalD01StartPublicationArgument` and `RetainedNativeStart`.
5. The Storage participant revalidates both whole arguments, the argument hash, the rederived after-images and every hash join, authenticates the receipt against Storage custody, CAS-checks native truth, and commits the whole union in one transaction. Only then is the transition receipt issued and `PublicationResult` returned.
6. The same operation afterwards returns the first Event, first receipt and transition (`dedupe`) with no write. `recover_start` only classifies. A pending or ambiguous prefix stays fenced.

## Oracle counts

| Group | Positives | One-defect negatives | Failures |
|---|---:|---:|---:|
| S1 | 15 | 84 | 0 |
| S2 | 15 | 6 | 0 |
| S3 | 3 | 11 | 0 |
| S4 | 2 | 18 | 0 |
| S5 | 7 | 14 | 0 |
| S6 | 4 | 16 | 0 |
| **Total** | **46** | **149** | **0** |
| Coverage supplement (5 later negatives: S1 4, S4 1) | 0 | 5 | 0 |
| **All distinct cases** | **46** | **154** | **0** |

Fault-matrix rows count as positives: 13 Start rows in the v3 profile (S1), 13 in the native-v7 composition (S2), 3 projection-transaction rows (S5). Runtime 924 s, one process plus sequential children.

### Start fault matrix (real child processes, fresh-process read-back and two re-entries)

| Cut | Exit | After the crash | Native rev | Events | First re-entry | Second re-entry | Final | v7 row |
|---|---:|---|---:|---:|---|---|---|---|
| none (control) | 0 | committed | 8 | 1 | dedupe | dedupe, manifest unchanged | committed | pass |
| after_prepare | 73 | prepared_unappended | 7 | 0 | published | dedupe, manifest unchanged | committed | pass |
| before_reservation | 73 | prepared_unappended | 7 | 0 | published | dedupe, manifest unchanged | committed | pass |
| after_reservation | 73 | reserved_unappended | 7 | 0 | published | dedupe, manifest unchanged | committed | pass |
| before_append | 73 | reserved_unappended | 7 | 0 | published | dedupe, manifest unchanged | committed | pass |
| torn_member_frame | 73 | reserved_unappended | 7 | 0 | published | dedupe, manifest unchanged | committed | pass |
| torn_commit_frame | 73 | reserved_unappended | 7 | 0 | published | dedupe, manifest unchanged | committed | pass |
| after_append_frames | 73 | appended_without_first_custody | 7 | 1 | refused `start/pending_fenced` | refused `start/pending_fenced`, manifest unchanged | appended_without_first_custody | pass |
| after_append | 73 | appended_without_first_custody | 7 | 1 | refused `start/pending_fenced` | refused `start/pending_fenced`, manifest unchanged | appended_without_first_custody | pass |
| before_first_receipt | 73 | appended_without_first_custody | 7 | 1 | refused `start/pending_fenced` | refused `start/pending_fenced`, manifest unchanged | appended_without_first_custody | pass |
| after_first_receipt | 73 | receipted_unpublished | 7 | 1 | refused `start/pending_fenced` | refused `start/pending_fenced`, manifest unchanged | receipted_unpublished | pass |
| before_terminal | 73 | receipted_unpublished | 7 | 1 | refused `start/pending_fenced` | refused `start/pending_fenced`, manifest unchanged | receipted_unpublished | pass |
| after_terminal | 73 | committed | 8 | 1 | dedupe | dedupe, manifest unchanged | committed | pass |

### Projection transaction matrix (real child processes)

| Cut | After the crash | Retry | Final |
|---|---|---|---|
| none (control) | row True, frontier 1 | replay of the first transaction | row True, frontier 1 |
| before_terminal | row False, frontier 0 | first commit | row True, frontier 1 |
| after_terminal | row True, frontier 1 | replay of the first transaction | row True, frontier 1 |

## Guards for the shared isolation sweep

`DG-S-guards.json` beside this report maps every expected refusal code to the negatives that refused with exactly it, and lists every static `require()` site in the three DG-S modules with the negatives matched to it. No local guard-removal engine and no check-11 claim are made; the shared `scripts/pm_guard_isolation.py` sweep proves isolation.

186 static `require()` sites in the three DG-S modules; **121 have at least one negative that refuses with exactly their code** (146 distinct refusal codes across 154 negatives). The other 65, by reason, for the shared sweep and the next tool batch; none is shown to let a real check falsely pass:

| Reason | Sites | Codes |
|---|---:|---|
| Self-check on the owner's own output | 14 | `context/workgraph_sha256`, `selector/cell_present`, `selector/cell_value`, `binder/passive_unbound_selector`, `reopen/unissued`, `reopen/custody_hash`, `start/stored_producer`, `recover/no_write`, `projector/transaction_id`, `representation/commitment_recomputed` (custody comparison fires first), `checkpoint/storage`, `retained/birth_unissued`, `<reader>/passive_effect`, `birth/descriptor_cell` |
| Static selection or refusal mapping | 5 | `code`, `<where>/pack_value_hash`, `v7/no_network`, `v7/edge_target_unique`, `v7/companion_unique` |
| Caller handle-map type and shape | 2 | `start/handles_type`, `start/handle_shape/<name>` |
| Order fixed by construction | 3 | `start/descriptor_before_birth`, `start/birth_descriptor` (birth acquires the descriptor first), `lower/reservation_receipted` (append inside the same held invocation) |
| Duplicate of an earlier guard on the same invariant (prove as pairs) | 18 | `start/start_control_epoch`, `start/start_control_committed` (with `start/start_control_birth`), `start/native_control_join`, `lower/after_control`, `lower/candidate_control` (control members of the body guards), `<reader>/native_status`, `<reader>/native_body_join` (with `native_advanced`), `<reader>/goal_state`, and ten `final_*` same-value fences (each final helper rerun refuses first, e.g. `read_current/final/goal_stopped`) |
| Whole-root rule refuses at the issuing owner first | 3 | `start/staging_not_released`, `start/goal_association_member`, `start/run_cancellation_null` |
| Members co-committed atomically | 8 | `<retained>/control_missing`, `origin_missing`, `d01_missing`, `initial_origin_missing`, `first_custody_missing`, `cutover/row_missing`, `projector/no_start`, `projector/not_installed` |
| Generic-source divergence refused first by the source adapter | 3 | `<reader>/generic_row_missing`, `generic_custody`, `generic_event` |
| Dynamic code covered in its prefixed form | 1 | `projector/<halt>` (`projector/reducer/unsupported_same_run:goal_run.blocked`) |
| Compact checkpoint operation size, unreachable for authentic checkpoints | 2 | `representation/checkpoint_operation_size` |
| Reachable, no dedicated negative yet (tool-issues list) | 6 | `native/body_unavailable`, `native/start_control_unavailable` (Storage-internal reads beside the covered `native/current_unavailable`), `<where>/selector_type`, `start/dedupe_unavailable` (3, Storage reservation/control consistency) |

Two Start guards I first wrote duplicated a whole-root schema rule (activation integrity `const true`, non-empty request membership `minItems`); I removed them, and their negatives now name the schema refusal at the issuing owner. The pack decoder's noncanonical check likewise belongs to the shared decoder (`numrule/physical_noncanonical`), so DG-S adds no copy.

## Findings

1. **K(s).** Applied exactly as the brief's step 3 says. The files are byte-identical with DG-R's branch (`plans/ea-goal-dg-r-20261111` at `2d6cd3469d`):

   | File | SHA-256 |
   |---|---|
   | `Plans/goal_run_projection_reference_contracts/started.md` | `c139da0495675b287674b7c55cd8dd64eb45e51c8eab14970e8b1610f5e9abe9` |
   | `Plans/goal_run_projection_reference_contracts/cancelled.md` | `80df93179da6cd1ddd83af460e0af051f2e3ca6f725a651846f54fcdc1a000aa` (W34b's bytes) |
   | `scripts/pm_goal_own_c3_w34_reference_oracles.py` | `ce0a1311b5c49543befd1a2e45b3d9fab4a8259290ec138ec93734c62e2f6817` |

   The reference oracle still reports 30 positive / 358 negative representation checks with no failure after the change. **Merge item:** `scripts/pm_goal_own_c3_w34a_oracles.py` (W34a's component corpus, not in the brief's list) still builds its specimen keys with lower-hex `h()`. I did not edit an earlier part's script; the DG-S corpus uses `k_component` everywhere.
2. **`record_reference` and a still-oversize compact operation are unreachable from an authentic Start.** Measured on authentic test-owner Starts: the projection metadata (record without the Event) is always smaller than the candidate and D01 update wrappers the same Start must store within 16 KiB, because every identifier that grows the metadata grows those wrappers faster (the D01 update carries the run identity twice; the candidate carries about 17 K(s) keys). Growing a 300-character goal id already makes Start refuse its candidate (`tx/stored_part_cap`, 17,834 bytes) while the event-reference row is still about 8 KB. So a published `record_reference` row cannot arise for goal_run.started under the current bounds. The case is still complete: the authentic record is driven through forced `record_reference` packs and reconstructed byte-identical with every join, deterministic selection refuses that form as a published row, and the compact-operation guard is witnessed at the encoder with one coherent oversized scope. Checkpoint spill is reached authentically through owner-issued generation holds.
3. **Number domain.** Every integer goes through `pm_event_numbers` and every timestamp through `pm_event_datetime` via the adapters; DG-S adds no cap or serializer.

## Components used

ST (append, frames, receipts, custody, reads), TX (cells, CAS, transactions, seeds, snapshot token), PK (packs), RT (retention gaps), RO-style real child-process cuts (DG-S's own matrix on the same Storage cut points, plus `after_prepare`), IF (registry, owners, handles, `ActivationOwner`), MR (method recorder), GS (generic source), KC (`k_component`, `scope_partition`), RB-style whole banks (`OriginalBank` for both editions), RQ pattern (the native-v7 composition qualification). NR throughout.

## Owner text amended

| Unit | Location | Change |
|---|---|---|
| GRS-1132 | `Plans/Goal_Runtime_System.md:9035` (amended text at :9043) | the inherited-root sentence replaced by the DG-S oracle selection and the native line |
| GRS-1136 | `Plans/Goal_Runtime_System.md:9202` (canonical text :9207) | K(s) recipe and the W3 representation result, appended |
| SP-1134 | `Plans/storage-plan.md:30669` (amended text at :30679) | TEST_ONLY Storage coverage of the corpus, appended |
| EP-1130 | `Plans/Executor_Protocol.md:9188` (amended text at :9196) | the inherited-root sentence replaced by the Start-contract coverage and the native line |

ATS-1118 and ATS-1120 are shared with W4/W5 and stay untouched; GRS-1136's acceptance criterion "An incomplete original-root corpus remains explicitly blocked" is history now superseded by its amended canonical text.

## Twelve-criterion re-grade, goal_run.started

Carried from W34a: 10/12, with criteria 10 and 12 PARTIAL. DG-S re-grade at this head: **12/12 planning PASS; native NOT_RUN.**

| Criterion | Before | After | Why |
|---|---|---|---|
| Membership/version | PASS | PASS | unchanged |
| Owner | PASS | PASS | GRS-1132/SP-1134/EP-1130/GRS-1136 amended in place; no new PlanUnit |
| Producer | PASS | PASS | producer derived from owner sources; 22 producer negatives |
| Closed payload | PASS | PASS | whole `TypedProducerSubmission`/`TypedOriginalEvent` roots in both editions |
| Scope/identity | PASS | PASS | v3 idempotency recipe and event id recomputed; K(s) corrected to base64url |
| Replay/idempotency | PASS | PASS | dedupe on the same operation, conflicts, replay-only refusal |
| Retention | PASS | PASS | retention gap, source loss yields unavailability, 604,800 s window, holds |
| Redaction/custody | PASS | PASS | Storage custody authenticated at every reader and publisher |
| Transitions | PASS | PASS | native after-images and D01 lineage rederived at the lower publisher |
| Consumers/checkpoints | PARTIAL | PASS | S3 to S6 complete on actual Storage source, rows, checkpoints and packs |
| Compatibility/withdrawal | PASS | PASS | native-v7 dispatch, casts refused, writer/reader withdrawal, reinstall |
| Positive/negative oracles | PARTIAL | PASS | complete original-path positives and one-defect negatives for every group; guard isolation proof stays with the shared sweep |

## Shared-file hunks for the merge

New-side hunks relative to `91ffd2047d` (W34a); generated `_shards`/`.plan_index` are regenerated at merge, never hand-merged:

- `Plans/goal_own_c_contracts/protocol.md`: start 67, count 2 (W3 only, after the C3-W34a paragraph). The adapter merge separately adds its own section at the end (new lines 103 to 133).
- `Plans/goal_own_c_contracts/suites.json`: start 108, count 18 (W3 object only, key `dg_s_complete_original_path`).
- `Plans/goal_run_projection_reference_contracts/started.md:7` and `cancelled.md:7`: the K(s) line, byte-identical with DG-R.
- `scripts/pm_goal_own_c3_w34_reference_oracles.py`: one import line (new line 23) and the five K(s) lines (old 135, 192, 209, 223, 431), byte-identical with DG-R.
- Owner units: the four hunks in the table above (W3-only units).
- New files only otherwise: the four DG-S scripts, this report and `DG-S-guards.json`.

## Checks

Serial, one at a time, `PM_GOAL_AUDIT_WORKERS=1`. Heavy steps ran under a memory cgroup cap of 2 GB per step (no swap), starting at 11 GB available and pausing below 10 GB (lead rule, 23:22Z); no step exceeded the cap. Light steps ran directly. `origin/main` at every step: `77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947`.

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_dg_s_oracles.py` (final full run, head `e3efb15da8`) | 0 | 46 positives, 149 negatives, 0 failures, 924 s |
| same, `--groups COV` supplement after the last five coverage negatives | 0 | 62 negatives (the final run's 57 plus 5), 0 failures, 154 s |
| `python3 scripts/pm_goal_test_adapters_selftest.py` | 0 | 64 positives, 140 negatives (204), including the 14-row adapter matrix |
| `python3 scripts/pm_goal_own_c3_w34_reference_oracles.py` (after the K(s) correction) | 2 | unchanged by design: 30 positive / 358 negative representation checks, no failure; the script reports W3/W4 qualification it does not itself run |
| `python3 scripts/pm_goal_own_c3_w34a_oracles.py` | 2 | unchanged by design: 9 positive / 283 negative component cases, no failure; superseded for W3 by the DG-S corpus |
| `python3 scripts/pm_goal_own_c_oracles.py` | 0 | 355 cases (46 / 309) |
| `python3 scripts/pm_goal_own_c_source_oracles.py` | 0 | 293 cases (112 / 181) |
| `python3 scripts/pm_goal_current_writer_oracles.py` | 0 | 931 cases, 861 negatives |
| `python3 scripts/pm_goal_history_reader_fixtures.py` | 0 | 6,143 cases, 6,032 negatives, 2,117 s |
| `python3 scripts/pm_goal_run_stop_block_oracles.py` | 0 | 478 cases, 427 negatives |
| `python3 scripts/pm_goal_lifecycle_successor_oracles.py` | 0 | 514 cases, 487 negatives |
| `python3 scripts/pm-goal-runtime-lineage.py --self-test` | 0 | pass |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | only `executor_protocol`, `goal_runtime_system`, `storage-plan` shards change |
| `python3 scripts/pm-plan-index.py generate` (live currentness edition copied first; byte-identical to W34a's) | 0 | changed index rows come only from the three edited documents |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 1 | 126 failures: W34a's 29 recorded baseline failures, all still present, plus 97 `plan_unit_removed_without_ledger_decision` rows for units that today's `origin/main` added after this branch's 2026-11-05 base. No new row names a unit or document this branch edited; none resolved. The branch base, not this lane, causes them; they disappear when the branch is rebased for the merge. |
| `python3 -m py_compile` (four DG-S scripts and the corrected reference oracle) | 0 | pass |
| `git diff --check` | 0 | clean |

Governance staleness is the expected consequence of editing canon before the next reseal: Spec Lock and evidence hashes for GRS-1132, GRS-1136, SP-1134 and EP-1130 and the readiness report's expected hashes for the three documents. This is a reseal request for Jared, not a landing defect. No aggregate gate, landing check, reseal or baseline refresh was run.

Copies of this report, the oracle JSON, the guard file and every check output are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-S/` with `SHA256SUMS`.
