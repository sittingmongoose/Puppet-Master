# DG-CF2: goal_run.certified CF-06, CF-07, CF-08, CF-09 and P7 on the shared TEST_ONLY adapters (stream E, 2026-11-11)

Branch `plans/ea-goal-dg-cf2-20261111`, cut from `origin/plans/ea-goal-own-c3-w5-20261105` at `498e35e153`, with `origin/plans/ea-goal-adapter-20261111` (`62e61fe59a`) merged (`a6ab7bb5cd`). VM, sparse local worktree `/home/sittingmongoose/pm-worktrees/dg-cf2`. Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Every owner, value, transaction and record here is TEST_ONLY. Nothing here admits anything, changes the Event registry, adds a Decision Log entry, a retention or deletion policy or a PlanUnit, or touches `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files. No original bank, URI, hash or stored byte was rewritten or restamped. No subagent was used.

## Results at a glance

| Item | Result |
|---|---|
| Oracle run (`scripts/pm_goal_dg_cf2_oracles.py`) | **pass**, exit 0: 11 positives, 90 one-defect negatives, 18 real-process fault-matrix rows, 0 failures |
| CF-06 | 3 positives, 29 negatives, 13 matrix rows |
| CF-07 | 2 positives, 17 negatives, 5 matrix rows |
| CF-08 | 2 positives, 21 negatives |
| CF-09 | 3 positives, 14 negatives |
| P7 | 1 positives, 9 negatives |
| New guards listed for the shared isolation sweep | 86 guards, each with the negatives that refuse with exactly its code |
| Whole roots validated in the corpus | coordinator: Request, Prepared, Intent, Birth, Control, EventPhase, NativeCandidates, ReleaseCandidates, RetainedAuthority, RecoveryResult, GuardReadRequest, GuardReadResult and the seven Storage wrappers; append phase: AppendEvidence, AppendedHeld; Event: EventRecord 2.0.0, custody_v2, full_value_result, active_durable_group; native/Standard: StorageWorkflowResult, StorageWorkflowOrigin, StorageWorkflowUpdate, StorageWorkflowHead, StorageWorkflowMutationOrigin, StorageCurrentPointer, DurableStandardRead; consumer: RetainedCertifiedNative, CertifiedEventCustody, OriginalCertified, CertifiedProjection, StorageProjection, LogicalCheckpoint, HistoricalCertified; identity/payload: IdentityInput, IdentityResult, certified v3 payload |
| Index validate | exit 1, 126 failures on the branch and 126 on the pre-edit base against the same origin/main `77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947`: **0 added, 0 removed** |

## Per group

The judge's complete case (`reviews/DG-sol/JUDGE-original-path.md`, "What complete and authentic mean") asks for full valid baseline inputs, independently acquired owner originals, the actual ordered modeled method calls with before and after observations, exact entire candidates, results and receipts, and coherent one-defect negatives at every applicable independent boundary. Each group below states what its corpus now does and, separately, the exact whole-root inputs it still receives from other owners.

| Group | Status | Exact remaining item (owner) |
|---|---|---|
| CF-06 append barriers, all-member custody, dedupe | **COMPLETE** for the phase corpus | The `complete_preappend_storage_source` argument and the returned `OriginalEventPrerequisite.complete_current_source` are the adapter Storage's own whole-byte source (CURRENT, manifest and every retained segment's bytes, custody inventory, nine-field token, both identity indexes, complete generic-prefix validation). They are not the canonical `NativeCurrentEventSource` root, because the shared adapter Storage persists its own TEST_ONLY CURRENT/manifest and no SP-278 `pm.storage.seglog_current.v1` / `pm.storage.seglog_manifest.v1` / `event_record_index_checkpoint` images or `GenericIndexRow`s. Carrying Storage-held canonical bytes needs that adapter change (shared file; listed for the tool batch). |
| CF-07 joint commit, readback, release | **COMPLETE** for the phase corpus | `PublishedWorkflow` (commit/readback/release output) is whole except its `current` member, `CurrentWorkflowSource` (Start source, every WorkNode publication, requirement sources, about 400 definitions), composed by the CF-02/CF-03 native owners (DG-CF1) and S1 (DG-S). This lane's native body/control are compact owner records. |
| CF-08 independent native, Goal and guard boundaries | **COMPLETE** for the coordinator participants and the guard supplement at all 161 declared occurrences | The original method bodies of the 149 inherited native, producer and Workflow occurrences keep their own owners and stay NOT_RUN as native; the supplement here is the Q1-Q4 guard part only. `CurrentGoalArgument` (Goal binding/writer-domain/Start member roles) is composed by the Goal binding owners (DG-CA/DG-CB) and S1. |
| CF-09 retained, Event, historical, current reads | **COMPLETE** | None for its own reads: RetainedCertifiedNative, CertifiedEventCustody, OriginalCertified, CertifiedProjection, StorageProjection, LogicalCheckpoint and HistoricalCertified are whole roots. The current read's `published_native` member is the CF-07 item. |
| P7 released/current disclosure and exact prefix | **NOT COMPLETE** | The certified current branch is complete except `CurrentCertified.published_native` (the CF-07 item). The legacy branches the judge names (old-profile and native-v7 `read_current_started` / `read_current_cancelled`) need the S1 Start source and R2 positive D06 source owners being built in DG-S and DG-R; no owner for those sources exists on this branch. |

The whole native current-source roots consumed as inputs by every coordinator method (`OriginalCertificationSource`, `CertificationCandidateResult`, `WholeProducerSource`) are likewise carried as compact owner records here and are composed by CF-02/CF-03 (DG-CF1). They are integration inputs for the DG merge, not authored by this lane. `/home/sittingmongoose/pm-scratch/dg-cf2/RESUME.md` lists every remaining item with next commands.

## What the corpus does

### World and owners (`scripts/pm_goal_dg_cf2_world.py`, `scripts/pm_goal_dg_cf2_native.py`)

Registered TEST_ONLY owners issue every value from their own execution through the adapter `OwnerRegistry`; Storage assigns sequences, Storage times, transaction identifiers and seeds. A Storage subclass stamps the Storage-assigned transaction identifier into the write set and writes Storage's own issuance row (time and writer) in the same transaction.

- **Birth (prerequisite; CF-05 belongs to DG-CF1).** One transaction coissues the native birth, body and control, the activation_begin D01 update, head revision 1, lineage origin and current pointer, the compact Birth and the epoch-0 empty Control.
- **Native progression.** Each pre-certification native publication writes a whole `workflow_standard_result.v4`, `workflow_standard_origin.v4`, `executor_workflow_workflow_update.v8`, an immutable `executor_workflow_workflow_head.v8` per revision, `executor_workflow_lineage_origin.v8` and a CAS on `executor_workflow_current_pointer.v2`, ending at provisional_success.
- **Phase 0.** The Standard owner issues the whole `goal_receipt.v2` (current_standard_certification_custody_v2) and `workflow_standard_capture_origin.v4` in one transaction; together they validate as `DurableStandardRead`.
- **Identity and producer.** The adapter's CF-01 owners (imported unedited) run I0/I1 and prepare the 25-field producer.
- **Phases 1-6.** The coordinator runs prepare, arm, append_held (F5a, F5b, F5c, F5d), commit_native, readback, release and read_current. Compact records use the coordinator's lowercase-hex family key codec and validate against their whole roots in the coordinator package's `coordinator` realm; native, D01 and Standard wrappers validate in its `native` and `standard` realms.
- **Guard reader.** `owner.storage.certified_event.read_guard.v1` builds `GuardStoreSource` from its own Storage snapshot (seven family rows, whole bytes, inventory, Storage issuance per row, installed descriptor bytes and digest, native birth selection) and derives the whole `GuardReadResult`. A serialized replacement source is compared against a fresh acquisition and returns unavailable.
- **Passive recovery.** `recover_original` reads only surviving compact authority, first custody and Storage's durable reservation table; `reenter` classifies and refuses to complete.

### Consumer readers (`scripts/pm_goal_dg_cf2_consumer.py`)

- **read_retained_native** reads native, D01 and Standard originals through the original Commit's selectors (key and SHA-256), never the Goal body or current native body, and validates the whole `RetainedCertifiedNative`.
- **inspect_original** reads the raw frame through Storage (hash, CRC, boundaries), first custody, full-value result and group, recomputes the value commitment and producer digest, requires the EventPhase to select the same Event and custody, and validates `CertifiedEventCustody` and `OriginalCertified`.
- **publish_projection** is this lane's P7 fixture publisher: it derives the complete `CertifiedProjection` from P2/P3 originals, encodes the reference.v1 row through the W5 successor's `Representation` (imported read-only) and commits row plus logical checkpoint in one transaction. The full P5/P6/CF-11 corpus belongs to DG-CF3.
- **read_historical** reopens row and checkpoint in one snapshot, requires their joint transaction, rederives the row from lawful originals and validates `HistoricalCertified`.
- **read_current** adds the fresh coordinator tuple, the released guard, exact equality with the complete current generic prefix (seglog-derived token fields, verified row count, through sequence, coverage) and a final fence after the last helper.

### CF-06

Positives: the complete held append with an unrelated-scope member in the same durable group (frame CRC decode, frame hashes, barrier receipts, group digest, EventPhase joins, Storage-assigned fields, own guard acquisition); lost-acknowledgement re-entry of the same operation (no Storage change, identical result); equal retry through Storage (dedupe, same first receipt, no new frame). The fault-matrix rows for CF-06 are listed under "Fault matrix".

Negatives refuse at F5a (future custody presented, stale pre-append source, unarmed control, replay-only policy, caller-supplied sequence, altered producer25, Goal edit, Stop, revoked permission, native advance, substituted Intent bytes, stale Control, request scope, control epoch, substituted identity, malformed earlier frame, append already attempted, Event already present), at F5c (partial receipt set, invalid global prefix) and at F5d (ordinary durability, partial member list, filtered group, manufactured receipt, substituted full-value result, substituted Event, Stop before EventPhase), plus same-operation altered retry and Storage altered retry.

### CF-07

Positives: the joint transaction (every native, D01 and compact member carries the same transaction identifier; native revision +1; protected fields and Goal store unchanged; whole native wrappers validated), current refused while pending and while committed-unreleased, readback, Release and current_complete; passive recovery returns pending_unknown after commit and original_complete after Release with no Storage change. Negatives: pending/armed current reads, release before commit, missing D01 head write, altered afterimage, distinct D01 store (missing_participant), stale native CAS, Stop before commit, commit before EventPhase, substituted EventPhase, duplicate commit, substituted union and transaction identifier at readback, Goal change before readback, release without readback, Stop before Release, recover-and-complete refused.

### CF-08

Positives: guard outcome at every phase (unborn, empty, pending at armed, event_durable and native_committed, released) with each participant's own guard read recorded as its child call; the Q3 supplement at all 161 occurrences in every phase state and in a store whose issuance is missing (all refuse). The supplement's registration table assigns each occurrence one rule from its method identity: birth (4 occurrences: only authentic_unborn_absence admits), current (16: released allows current certification, empty only the original behavior, pending only physical facts), retained (18: released is original_complete, pending is pending_unknown) and writer (123: empty, pending and released keep the original writer behavior with no certification action); unavailable refuses everywhere. This table is the lane's TEST_ONLY model of the fixed native registration that selects the occurrence, listed for review. Negatives: substituted declaration hash, caller-supplied guard, unknown method, source change between occurrence entry and final, guard omitted by a helper at six participants, borrowed reader authority, stale guard epoch, cross-Goal guard, unborn absence for a born run, unavailable guard (missing issuance), drift after the arm and read_current helpers, and four guard-owner source defects (replacement source, inventory omission, deleted Intent row, schema-invalid row).

### CF-09 and P7

CF-09 positives: separate retained, inspect, historical and current reads with no Storage or Goal store change; lawful history after Goal edit, Stop, Goal body removal and a later unrelated Event; lawful history after a later native D01 update (original head retained while current refuses). Negatives: armed-only, Event-only and committed-unreleased retained reads, phantom Release transaction, expired Standard receipt, substituted native result, D01 update and D01 head, payload-only inspection, frame substituted at rest, row substituted, missing checkpoint, non-atomic row rewrite, revoked disclosure.

P7 positive: current disclosure with the fresh coordinator tuple as a recorded child call. Negatives: a prior pending guard presented, Stop, revoked disclosure, uncovered later Event, Goal change, withdrawn Standard receipt, later native D01 update, permission revoked after the last helper, root change before disclosure.

## Fault matrix (real processes)

Each row creates the Storage directories and runs the original path in a child process that dies by `os._exit(73)` at the cut (Storage cuts are installed only for the certified append), classifies with `recover_original` in a fresh process, then re-enters twice in fresh processes. Re-entry must refuse (`reenter/live_invocation_lost`) or, after Release, find nothing to complete, and must leave Storage unchanged.

| Cut | Group | Child exit | Classification (fresh process) | Read back: events / custody / reservation | Re-entry x2 | Result |
|---|---|---:|---|---|---|---|
| `none (control)` | CF-07 | 0 | original_complete | 3 / 3 / receipted | original_complete, original_complete | pass |
| `before_arm` | CF-06 | 73 | no_append (current_source_unavailable) | 1 / 1 / None | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_arm` | CF-06 | 73 | no_append (current_source_unavailable) | 1 / 1 / None | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `before_reservation` | CF-06 | 73 | no_append (current_source_unavailable) | 1 / 1 / None | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_reservation` | CF-06 | 73 | pending_unknown (append_unknown, append_attempted) | 1 / 1 / reserved | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `before_append` | CF-06 | 73 | pending_unknown (append_unknown, append_attempted) | 1 / 1 / reserved | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `torn_member_frame` | CF-06 | 73 | pending_unknown (append_unknown, append_attempted) | 1 / 1 / reserved | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `torn_commit_frame` | CF-06 | 73 | pending_unknown (append_unknown, append_attempted) | 1 / 1 / reserved | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_append_frames` | CF-06 | 73 | pending_unknown (custody_unknown, append_attempted) | 3 / 1 / appended | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_append` | CF-06 | 73 | pending_unknown (custody_unknown, append_attempted) | 3 / 1 / appended | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `before_first_receipt` | CF-06 | 73 | pending_unknown (custody_unknown, append_attempted) | 3 / 1 / appended | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_first_receipt` | CF-06 | 73 | pending_unknown (barrier_unknown, append_attempted) | 3 / 3 / receipted | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `before_event_phase` | CF-06 | 73 | pending_unknown (barrier_unknown, append_attempted) | 3 / 3 / receipted | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_event_phase` | CF-06 | 73 | pending_unknown (native_unknown, event_durable) | 3 / 3 / receipted | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `before_native_commit` | CF-07 | 73 | pending_unknown (native_unknown, event_durable) | 3 / 3 / receipted | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_native_commit` | CF-07 | 73 | pending_unknown (release_unknown, native_committed) | 3 / 3 / receipted | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `before_release` | CF-07 | 73 | pending_unknown (release_unknown, native_committed) | 3 / 3 / receipted | reenter/live_invocation_lost, reenter/live_invocation_lost | pass |
| `after_release` | CF-07 | 73 | original_complete | 3 / 3 / receipted | original_complete, original_complete | pass |

## Guards for the shared guard-isolation tool

Each new guard and the negatives that refuse with exactly its code. Guard proof machinery belongs to `scripts/pm_guard_isolation.py` in the sweep; no local removal engine or check-11 claim is made here. `DG-CF2-guards.json` beside this report carries the same table.

| Guard | Negatives |
|---|---|
| `append/conflict/producer25` | CF06-N21 |
| `append/guard_outcome` | CF06-N03 |
| `append/guard_scope` | CF08-N07 |
| `append/guard_type` | CF08-N-omit-append |
| `append/guard_unavailable` | CF08-N09 |
| `arm/guard_type` | CF08-N-omit-arm |
| `arm_final/permission` | CF08-N10 |
| `commit/event_phase_bytes` | CF07-N10 |
| `commit/guard_phase` | CF07-N09, CF07-N11 |
| `commit/guard_reader` | CF08-N05 |
| `commit/guard_stale` | CF08-N06 |
| `commit/guard_type` | CF08-N-omit-commit |
| `commit/missing_participant` | CF07-N06 |
| `commit/native_changed` | CF07-N07 |
| `commit/write_set` | CF07-N04 |
| `commit/write_value` | CF07-N05 |
| `commit_final/effective_stop` | CF07-N08 |
| `consumer_current/disclosure_denied` | P7-N03 |
| `consumer_current/root_changed` | P7-N09 |
| `consumer_current/stale_generic_token` | P7-N04 |
| `consumer_current_final/permission` | P7-N08 |
| `current/effective_stop` | P7-N02 |
| `current/goal_current` | P7-N05 |
| `current/guard_outcome` | CF07-N01, CF07-N02, P7-N01 |
| `current/guard_type` | CF08-N-omit-current |
| `current/native_current` | P7-N07 |
| `current_final/guard_stale` | CF08-N11 |
| `f5a/append_attempted` | CF06-N22 |
| `f5a/control_bytes` | CF06-N12 |
| `f5a/effective_stop` | CF06-N08 |
| `f5a/expected_control_epoch` | CF06-N24 |
| `f5a/future_inputs` | CF06-N01 |
| `f5a/future_receipt` | CF06-N27 |
| `f5a/generic_prefix` | CF06-N28 |
| `f5a/goal_current` | CF06-N07 |
| `f5a/intent_bytes` | CF06-N11 |
| `f5a/native_current` | CF06-N10 |
| `f5a/permission` | CF06-N09 |
| `f5a/preappend_source` | CF06-N02 |
| `f5a/producer25` | CF06-N06 |
| `f5a/replay_policy` | CF06-N04 |
| `f5a/request_scope` | CF06-N23 |
| `f5a/source_commitments` | CF06-N25 |
| `f5a/storage_assigned_supplied` | CF06-N05 |
| `f5c/all_members` | CF06-N19 |
| `f5c/generic_prefix` | CF06-N29 |
| `f5d/barrier_durability` | CF06-N13 |
| `f5d/group` | CF06-N15 |
| `f5d/member_custody` | CF06-N16 |
| `f5d/member_event` | CF06-N18 |
| `f5d/member_full_value` | CF06-N17 |
| `f5d/member_set` | CF06-N14 |
| `f5d_final/effective_stop` | CF06-N26 |
| `guard_result/unavailable/partial_authority` | CF08-N14 |
| `guard_result/unavailable/schema_unavailable` | CF08-N15 |
| `guard_result/unavailable/source_changed` | CF08-N12, CF08-N13 |
| `historical/atomic_publication` | CF09-N12 |
| `historical/checkpoint_missing` | CF09-N11 |
| `historical/row_binding` | CF09-N10 |
| `historical/standard_expired` | P7-N06 |
| `inspect/frame/read/frame_hash` | CF09-N09 |
| `inspect/presented_not_original` | CF09-N08 |
| `occurrence/caller_guard` | CF08-N02 |
| `occurrence/declaration_sha256` | CF08-N01 |
| `occurrence/final_changed` | CF08-N04 |
| `occurrence/unknown_method` | CF08-N03 |
| `prepare/guard_outcome` | CF08-N08 |
| `prepare/guard_type` | CF08-N-omit-prepare |
| `readback/goal_unchanged` | CF07-N14 |
| `readback/member/native_after_body` | CF07-N12 |
| `readback/transaction/native_after_body` | CF07-N13 |
| `reenter/live_invocation_lost` | CF07-N17 |
| `release/guard_phase` | CF07-N03 |
| `release/guard_type` | CF08-N-omit-release |
| `release/readback` | CF07-N15 |
| `release_final/effective_stop` | CF07-N16 |
| `retained/commit_selects/d01_head` | CF09-N14 |
| `retained/commit_selects/d01_update` | CF09-N07 |
| `retained/commit_selects/native_result` | CF09-N06 |
| `retained/disclosure_denied` | CF09-N13 |
| `retained/missing/commit` | CF09-N02 |
| `retained/missing/eventphase` | CF09-N01 |
| `retained/missing/release` | CF09-N03 |
| `retained/standard_expired` | CF09-N05 |
| `retained/unissued/control` | CF09-N04 |
| `retry/producer25_conflict` | CF06-N20 |

## Components used

ST (append, frames, barrier receipts, all-member first custody, groups, reads), TX (all-or-none CAS write sets with Storage transaction identifiers), RO pattern (real child-process cuts, fresh-process reopen and recovery), IF (registry, owners, opaque handles, acquisition, AppendOwner), MR (ordered calls with before/after observations), GS (whole generic prefix at F5a, F5c and P7), KC (K(s) for native and projection keys), RB (CF-01 RootBank; coordinator and consumer realm banks read-only from the W5 preconditions), NR (shared number and date-time calls through the adapters and the CF-01 producer). PK and RT were not needed.

## Owner text amended

- `Plans/Automated_Testing_System.md:7706` — dated DG-CF2 amendment of ATS-1121 (the W5 acceptance unit, `### ATS-1121` at :7652), selecting this corpus for exactly CF-06, CF-07, CF-08, CF-09 and P7. No new PlanUnit.
- `Plans/goal_own_c_contracts/protocol.md:129-143` — new section "DG-CF2 complete original-path oracles".
- `Plans/goal_own_c_contracts/suites.json:159-177` — `dg_cf2` key in the goal_run.certified suite.

## Shared-file hunks for the DG merge

- `Plans/Automated_Testing_System.md` @@ -7705,0 +7706,2 @@ (amendment paragraph and blank line after the ATS-1121 YAML block). DG-CF1 and DG-CF3 may add their own paragraphs at the same place: keep all three.
- `Plans/goal_own_c_contracts/protocol.md` @@ appended lines 128-143 after the adapter section (lines 97-127 come from the adapter merge).
- `Plans/goal_own_c_contracts/suites.json` @@ -157,0 +158,19 @@ (`dg_cf2` object after `c3_w5_part3`; siblings' keys go beside it).
- Regenerated: `Plans/_shards/automated_testing_system/**` (52 files, source hash headers only) and `Plans/.plan_index/{plan_units.jsonl,doc_cards.json,dependencies.json,coverage_report.json,node_readiness_report.json}` — rows of `Plans/Automated_Testing_System.md` only; the readiness report differs only in `generated_at_utc`. Regenerate at merge rather than hand-merging.
- New files only: `scripts/pm_goal_dg_cf2_world.py`, `scripts/pm_goal_dg_cf2_native.py`, `scripts/pm_goal_dg_cf2_consumer.py`, `scripts/pm_goal_dg_cf2_oracles.py`, this report and `reports/event-authority-20261111/DG-CF2-guards.json`.
- K(s): not applicable to this lane (DG-S and DG-R only); this lane's projection keys already use K(s) through the certified reference edition.

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
| Positive/negative oracles | PARTIAL (0 complete CF/P tuples) | PARTIAL for the family. CF-06, CF-07, CF-08 and CF-09 now have complete phase corpora with real issuance, whole-root products and coherent one-defect negatives; P7's certified branch likewise, without its legacy branches. The family cell stays PARTIAL until DG-CF1 and DG-CF3 finish their groups and the whole native current-source inputs are integrated. |

Family: 11/12 before and after; no grade is raised by this lane alone.

## Adapter notes for the tool batch (not blocking a real check)

- The adapter Storage co-persists redb cells inside its seglog manifest, so CURRENT/manifest bytes, manifest generation and checkpoint_ref move on any redb transaction. P7's exact-prefix comparison therefore compares every seglog-derived token field exactly and excludes those three.
- The adapter Storage persists no canonical SP-278 CURRENT/manifest/index-checkpoint images (the CF-06 item above).

## Checks

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_test_adapters_selftest.py` | 0 | pass; 64 positives, 140 negatives |
| `python3 scripts/pm_goal_dg_cf2_oracles.py --output <evidence>/oracles.json` | 0 | pass; failures 0 |
| `python3 scripts/pm_goal_own_c_oracles.py` | 0 | pass |
| `python3 scripts/pm_goal_own_c_source_oracles.py` | 0 | pass |
| `python3 scripts/pm-goal-runtime-lineage.py --self-test` | 0 | pass |
| `python3 scripts/pm_goal_own_c3_w5_projection_oracles.py` | 0 | pass |
| `python3 scripts/pm_goal_own_c3_w5_successor_oracles.py` | 2 | expected: preserved historical stored-root counterexample reports BLOCKED (same as part 2/3) |
| `python3 scripts/pm_goal_own_c3_w5_oracles.py` | 2 | expected: preserved predecessor bank failure, 22 unresolved (byte-identical to part 2 predecessor-bank.log) |
| `python3 scripts/pm_goal_test_demo_cf01.py` | 0 | pass |
| `python3 scripts/pm_goal_current_writer_oracles.py --guard-table <out>` | 0 | ran at >= 13.5 GB available (22.93 s 68056 KB) |
| `python3 scripts/pm_goal_history_reader_fixtures.py --guard-table <out>` | NOT_RUN | memory gate (13.5 GB available) not reached during the session |
| `python3 scripts/pm_goal_run_stop_block_oracles.py --guard-table <out>` | NOT_RUN | memory gate (13.5 GB available) not reached during the session |
| `python3 scripts/pm_goal_lifecycle_successor_oracles.py --guard-table <out>` | NOT_RUN | memory gate (13.5 GB available) not reached during the session |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass; only Automated_Testing_System shards changed |
| `python3 scripts/pm-plan-index.py generate` | 0 | pass; only Automated_Testing_System rows changed; readiness differs only in generated_at_utc |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 1 | fail 126 = base 126 against origin/main 77bae0c63605d0a6f643aa3f1d8c51c2f3bb7947; 0 added, 0 removed |
| `git diff --check` | 0 | clean |

All runs serial and light (each process under 500 MB; adapter self-test, oracles and matrix children about 300 MB). The four long inherited audits ran through a gate that starts each only at >= 13.5 GB available. The live fifteen-file currentness edition was copied byte-exact before index generation (`currentness-sha256sum.log`).
