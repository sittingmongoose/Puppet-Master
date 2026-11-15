# DG-CB — goal.cancelled: C5 and C6 COMPLETE

Lane DG-CB of `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`, stream E. Branch `plans/ea-goal-dg-cb-20261111`, cut from `origin/plans/ea-goal-dg-ca-20261111` at `f87dbe1f30` (DG-CA's branch: the shared adapters merged at `3d1870bf32`, DG-CA's `World`/`Route`/`Suite`/`LeasedStorage` framework, C1, C2 and the C4 assignment). Sibling DG-CA3 builds C3/C4 inspection on its own branch from the same base. This branch touches only C5/C6 rows in shared files.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.** Every owner, value and record here is TEST_ONLY. Nothing admits anything, changes the event registry, adds a Decision Log entry, retention or deletion policy or PlanUnit, edits Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files, or rewrites an original bank, URI, hash or stored byte. No PlanUnit was minted; the PlanUnit count stays 7481.

## Groups

| Group | Result | Basis |
|---|---|---|
| C5 six-owner native source-image mapping and authentic completeness (M2-M6) | **COMPLETE** | The judge's C5 complete case executed end to end on the adapters (table below) |
| C6 atomic destination installation, manifests, recovery and withdrawal (M7-M9) | **COMPLETE** | The judge's C6 complete case executed end to end, including real child-process crash cuts (table below) |

No technical blocker remains for either group. One item named in M8 is outside the judge's C6 complete case and stays open for the family exactly as DG-CA left the family backup rows: backup/restore of the migration authority (M8 last sentence; DG-CA coverage rows 11-12/32-33 are the family's backup rows).

## What was built (new files only)

| File | Lines | SHA-256 | Role |
|---|---:|---|---|
| `scripts/pm_goal_dg_cb_owners.py` | 1818 | `27367c6b5bc8542119a03f0ca63b7c8edc1861b4363ea709301e616e25d0fe91` | pre-enrollment owners, MigrationStorage, MigrationWorld |
| `scripts/pm_goal_dg_cb_migration.py` | 1053 | `12a5157e9a425e272f877702a170b5872f21a0cbf846950adbf5c5f36f95c485` | StorageMigrationCoordinator (C5 capture, C6 commit/recover/read/withdraw/reinstall) |
| `scripts/pm_goal_dg_cb_c5_cases.py` | 939 | `8edf0f7bfb30370bb204128c0e06fb1226ff8e938c44152c81e45454453f9fc6` | C5 cases |
| `scripts/pm_goal_dg_cb_c6_cases.py` | 669 | `02cb793321ab2a2dcb41d6aeb020b70656ca15e5e3681601dbbc525902fbd6a8` | C6 cases |
| `scripts/pm_goal_dg_cb_crash.py` | 229 | `08e6f0e5ca0172566b26a04a0e273b99bd19f1b24e390324059bc7e0e9ab5164` | child-process crash matrix |
| `scripts/pm_goal_dg_cb_oracles.py` | 128 | `01b5aa66cc9723521b63c0802be277422dfaaf195d87f0fe57ff3d7cf495574e` | runner and guard inventory |
| `Plans/goal_own_c_contracts/dg-cb-migration-v1/test-only-sources.v1.schema.json` | 821 | `f5cbaf472cbaf6efe6cad25b372084bb08efeb6f39231c19bc1b5c86547bd448` | TEST_ONLY custody envelopes (newly authored) |
| `Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json` | 660 | `b5642189e7d05de7ff7c257b74a76b61441cc9eb4c38c384ff214d01823cbe89` | per-method and judge-element coverage map |

**Pre-enrollment owners** (`pm_goal_dg_cb_owners.py`). Six independently registered owners hold a Goal that has no SP-305 binding yet, each issuing its own physical originals through the test-owner Storage with its own ids, clock (NUMRULE `storage_utc_z`), CAS epochs and revisions (NUMRULE `uint64`), and writing a TEST_ONLY issuance origin (an `OriginalTransaction` naming owner, method, operation and permission source) in the same transaction:

- **Goal body** (`LegacyGoalOwner`, subclass of DG-CA's `GoalOwner`): body, every objective revision and origin, v1 or already-v2 control and every body-mutation receipt. Two physical editions: pre-DL-270 canonical JSON (`pm.goal.canonical_json.v1`, the pinned original Goal codec from `source-witness-inputs.json`), stored as exact bytes in a TEST_ONLY carrier because the registry family is `json_canonical`; and post-DL-270 MessagePack. Ordinary pending body reservations and an old already-v2 cancellation reservation are issued by the owner itself.
- **Host Stop** (`LegacyHostStopOwner`): the host-born StopControl at epoch 0 (the virgin-domain proof is this issuance), manual Stop/resume receipts, an unsupported legacy codec edition (negative only) and a Goal-local zero copy (negative only). `read_for_binding_migration.v1` (M4) authenticates its records and returns the exact projection.
- **Plan** (`LegacyPlanOwner`, subclass of DG-CA's `PlanOwner`): the original build-as-Goal joint birth (plan record, goal-driven PlanRun, SourceOrigins, the seven-field GoalPlanBinding and the Goal's `active_run_ref` in one transaction), run transitions with completion anchors, later approvals, and an unpublished pending attach carrying a complete candidate with its preimages and disposition.
- **Workflow** (`LegacyWorkflowOwner`): the native D01 run body/control (`workflow_activation_sources.v4`), Start `WorkflowBirth`/`WorkflowUpdate`/`WorkflowHead`/`CurrentPointer` and `WorkflowMutationOrigin` (`executor_workflow_original_start.v2`), all in the `native` realm, joined with the Goal's `active_run_ref`; a positive D06 publication (status cancelled, head 2, pointer 2, update lineage); in-flight D05/D06 operations and their reconciliation.
- **Scheduler** (`LegacySchedulerOwner`, subclass of DG-CA's `SchedulerOwner`): run schedules, run bindings and quota-resume consents with origins, an unrelated scheduled message, and callback admissions (admitted = pending effect, settled = history).
- **SIR** (`LegacySIROwner`, subclass of DG-CA's `SIROwner`): accepted Goal cancel dispatches with acknowledgement outcomes and terminal no-effect outcomes.
- **Native writer registration** (`MigrationRegistrationOwner`): the seven SP-305 categories plus every native implementation (old adapters, timers, restore) with its disposition and enrollment, persisted in Storage. **Binding owner** (`MigrationBindingOwner`): DG-CA's binding owner with the domain generation and the SP-423 cutoff read from Storage. **Maintenance** (`MaintenanceOwner`): root, namespace, maintenance and restore epochs, per-scope holds and deletion requests.
- `MigrationWorld` persists its owner roster in Storage, so a fresh process reopens the same owners after a real crash. The Plan, Workflow and Scheduler owners also implement DG-CA's association-inventory protocol, so an enrolled Goal enters DG-CA's unchanged C1 route.

**StorageMigrationCoordinator** (`pm_goal_dg_cb_migration.py`). `capture.v1`, `commit.v1`, `recover.v1`, `read_result.v1`, `withdraw.v1` take only their closed `contracts.schema.json` roots; `reinstall` models M9's new writer-domain admission. Details in the C5/C6 tables.

**Crash matrix** (`pm_goal_dg_cb_crash.py`). Setup, run (dies by `os._exit(73)` at the cut), read back, and two re-entries, each in its own fresh process.

## C5 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| Genuine modeled all-writer exclusion | capture writes a stored exclusion for the Goal scope; every owner writer refuses `exclusion/<role>/excluded` while it is held (5 negatives); a writer implementation that ignores it (an old adapter writing the Goal) is caught at the next helper recheck (8 boundary negatives); the exclusion is deleted by a refused capture, released inside the commit transaction, revoked by withdrawal, and a stale one is released by `recover` |
| Six independently registered owners enumerate complete source images, original schemas/physical keys/codecs/issuance and every pending effect | each owner is acquired from the registry by id and role and issues its own `OwnerMapping` statement; every `SourceImage` is checked against Storage's own physical bytes, the family's supported codecs, its original schema realm (`producer`, `plan`, `native`, or the lane TEST_ONLY bank with nested canonical members validated in their realm) and its issuance origin (owner, role, issued key/hash/codec/schema, permission of that owner); membership is compared with the owner's own database read, pending effects and prior receipts with what the images say; 15 statement-defect and 4 origin-defect negatives; 40 helper-boundary negatives across 8 capture points |
| Whole Goal body/control/history/origin | both Goal editions, 1-3 revisions; the original native Goal model validates the decoded snapshot; birth and head receipts are required; missing body, control, both (never birth), origin, birth receipt or head receipt refuse |
| Actual old Stop records/receipts; exact old Stop projection | M4 method; nonzero unassociated latched epochs 4/3 and a latched Stop with a pending body operation map exactly; zero needs the host's birth issuance; a Goal-local zero copy, a missing last receipt, a missing domain and an unsupported representation refuse |
| Bound associations and native D01/Start/D05/D06 | Plan-bound (GoalPlanBinding, PlanRun, plan record, SourceOrigins) and Workflow-bound (D01 body/control, Start birth/update/head/pointer/lineage) positives; a completed D06 run and a completed PlanRun are still imported (no implicit detach); an in-flight D06 and a partial D05 are `blocked_unresolved`; a missing D06 head breaks the head chain |
| Plan records and schedule/consent/callback/pending command data | Scheduler sources are joined field by field to the Plan run (target version/hash, run binding); an unrelated scheduled message stays byte-unchanged and outside the mapping; an admitted callback and an unfinished SIR cancel command are `blocked_unresolved`; a terminal SIR outcome is imported as a prior receipt |
| Authenticate real empty inventories | Plan, Workflow, Scheduler and SIR mappings with no sources are each owner's issued statement; a false-empty Plan statement refuses `inventory_incomplete` |
| All implementations of the seven writer categories | old adapter (disabled), timer and restore implementations join the dispatch commitment and WriterDomain; an unenrolled implementation, an unregistered category, a category with no implementation, an implementation joined to another category or to another Storage, and a registration change after the domain was installed refuse |
| Derive BindingRevision/Origin/Control, optional GoalPlanBinding, preserved body-control v1->v2, exact old Stop projection | the Goal owner is the BindingOrigin issuer (`adopt_existing.v1`) and the origin records THIS migration; the original GoalPlanBinding row is imported byte-exact as `original_binding_source`; every v1 control field and pending object is preserved and only `cancellation_pending: null` is added; an already-v2 control is kept unchanged; a representable pending Plan attach maps to `BindingPending` through its original owner's candidate, operation, epoch and preimages |
| Nonzero unassociated Stop, concurrent Stop recapture, latched/pending | positives above; a real host Stop injected after a helper makes capture release and recapture the newer domain (recorder shows two M4 reads); a Stop that keeps changing makes capture unavailable |
| Contradictory/unsupported source cases | `blocked_unresolved` positives: Plan and Workflow both claiming the Goal, Plan claiming a Goal whose `active_run_ref` is null, contradicting plan version, unknown or unrepresentable pending attach, old cancellation pending without receipt, unknown Workflow/Scheduler/SIR work; unsupported codec, noncanonical JSON, duplicate key, unknown schema edition refuse |
| Missing data cannot become empty or virgin | each of the six owner databases unavailable, absent reverse rows (binding without run, run without binding), an `active_run_ref` no owner accounts for, a callback for an unaccounted run, missing plan record or Workflow member all refuse; a blocked result followed by the owner's genuine reconciliation lets a later independent capture enroll while the blocked result stays immutable |

## C6 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| C5's authenticated capture and actual writer/Stop fences fed to the coordinator | commit rereads every source at entry and again after its last helper (`_read_once`), requires the presented request to equal that capture, rechecks maintenance and permission, and recomputes the whole candidate for equality |
| One modeled transaction installs binding/control/origin, Stop mapping, WriterDomain/head, ordered content-free manifest parts and the first immutable result under source/whole-head CAS | `MigrationStorage.transact(writes, checks=...)` applies the write set and a version check of every source cell and issuance origin all or none; the head is checked absent (first install) or at its version (join); the exclusion is released in the same transaction; Storage's cell generation and transaction counter advance by exactly one |
| All destination members absent before commit and present after; bounded MessagePack parts/operations; whole manifest commitment | observed key by key; each stored part and each (key, value) operation measured against 16 KiB; manifest members are each source selection followed by its origin selection (no source body); the parts' whole commitment and the immutable BindingOrigin's part selections are verified by `read_result`; a 12-schedule Plan Goal splits into ordered parts; a Goal with 40 revisions has a MigrationResult over 16 KiB and is refused before enrollment |
| Interruption, lost acknowledgement, unknown transaction | 6 child-process crash rows (table below); in-process lost acknowledgement resolved by `recover`; a destination member or manifest part without a result stays unknown (`ambiguous`) and never retries birth; `recover` of an uncommitted capture releases the stale exclusion and refuses `not_committed` |
| Exact replay and conflict | identical request returns the first result with no Storage change; an altered request under the same identity conflicts; seven caller-altered requests refuse `independent_capture` or the closed root |
| Passive result read after disposed mutable content | after enrollment the PlanRun completes, consents are deleted and the Goal changes; `read_result` returns the original result without change; capture refuses `already_enrolled` |
| `blocked_unresolved` | result and manifest only, in one transaction; no domain, binding or control migration; the pre-migration domain selection is recorded |
| Concurrent Stop | a Stop between capture and commit refuses the stale commit without overwriting the Stop; recapture under the same identity enrolls the newer domain; a Stop at any commit helper refuses |
| Withdrawal preserving pending work and immutable results | committed: immutable withdrawal result, original result byte-unchanged, binding never rolled back, Stop not cleared, pending body operation preserved, SP-423 cutoff recorded, retained result readable, replay immutable; uncommitted: live capture revoked (commit refuses `exclusion_not_held`), pending callback preserved; blocked: withdrawn without cutoff |
| Held-reader invalidation | DG-CA's `hold_current_read`/`release_held` on the enrolled Goal refuses `C1/held_reader/withdrawn`; C-source refuses `writer_cutoff`; binding writers refuse `domain/writer_withdrawn` |
| Fresh reinstall/rebuild | `reinstall` admits writer-domain generation 2 in one transaction with new registrations and remaps each enrolled binding (revision 1, origin naming the previous revision/origin/control); C-source works again; the original and withdrawal results stay readable; a refused reinstall adds no effect |
| Enrolled source keeps its own route | a migrated pre-DL-270 JSON Goal cancels end to end through DG-CA's unchanged C1 route (C-source to SIR-050 terminal) with its original Goal body/history/origin/receipt bytes unchanged; the migration is not rerun |

### Crash matrix (real child processes)

| Cut | Exit | Read back after the crash | Re-entry 1 | Re-entry 2 |
|---|---:|---|---|---|
| control | 0 | result present, destinations all present, parts 1, exclusion released, withdrawal absent, control v2 | recovered:enrolled, replayed | recovered:enrolled, replayed |
| after_exclusion | 73 | result absent, destinations all absent, parts 0, exclusion held, withdrawal absent, control v1 | not_committed, enrolled_once | recovered:enrolled, replayed |
| before_migration_tx | 73 | result absent, destinations all absent, parts 0, exclusion held, withdrawal absent, control v1 | not_committed, enrolled_once | recovered:enrolled, replayed |
| after_migration_tx | 73 | result present, destinations all present, parts 1, exclusion released, withdrawal absent, control v2 | recovered:enrolled, replayed | recovered:enrolled, replayed |
| before_withdrawal_tx | 73 | result present, destinations all present, parts 1, exclusion released, withdrawal absent, control v2 | withdraw | withdraw |
| after_withdrawal_tx | 73 | result present, destinations all present, parts 1, exclusion released, withdrawal present, control v2 | withdraw | withdraw |

Every row also requires the Stop to be unchanged by re-entry and the second re-entry to leave the Storage manifest generation unchanged.

## Oracle counts

| Group | Positives | Negatives | Failures |
|---|---:|---:|---:|
| C5 | 26 | 115 | 0 |
| C6 | 20 | 66 | 0 |
| **Total** | **46** | **181** | **0** |

Every negative starts from a valid complete case, makes one genuine owner change or presents one substituted/transport-shaped value at one boundary, must be refused with exactly its own code, and must leave Storage changed only by the injected change (DG-CA's `Suite.negative`, reused; `effects_preserved` true for all). Writing the guard-coverage negatives found one real defect, fixed before the final run: a refused `reinstall` had already committed new registrations; reinstall now validates every scope first and commits registrations in its single transaction.

**New guards with their negatives.** `DG-CB-guards.json` lists every literal `require` site in the lane's five code files with the negatives that refused with exactly that code: 158 sites, 105 with at least one dedicated negative and 53 without; 164 distinct refusal codes observed. Sites without a dedicated negative fall into: owner-API shape and state guards (`host_stop/manual_action`, `goal/mutation_cancelled`, `workflow/d06_pending`, `sir/already_terminal`, ...); self-consistency joins that a scope-derived key or an earlier guard already settles (`goal_scope`, `goal_receipt_scope`, `plan_binding_scope`, `stop_projection`, `workflow_join`, `read_result/result_identity`, `origin_member`, `blocked_unpublished`); readback/passivity self-checks (`commit/readback`, `commit/replay_no_effect`, `read_result/final`, `read_result/passive`, `withdraw/final_original_result`); operation caps masked by the stored-part cap (`commit/operation_cap`, `withdraw/operation_cap`, `manifest_part_cap`); and helpers whose callers check first (`image/*`, `selection/*`, `selector/*`, `*/unavailable`, `codec/msgpack_noncanonical` behind the stricter shared decoder). They go to the shared guard-isolation sweep; no local guard-removal engine and no check-11 claim are made.

## Components used

| Component | Use |
|---|---|
| ST | test-owner Storage cells, MessagePack canonical bytes, Storage clock; DG-CA's C1 append/first custody/terminal in the enrolled-Goal cancellation |
| TX | every physical original, issuance origin, exclusion, migration, withdrawal and reinstall write; `MigrationStorage` adds whole-source version checks inside one all-or-none transaction |
| RO | `S.Crash`/`os._exit(73)` cut semantics and fresh-process reopen (`MigrationStorage.open`, roster), in the lane's own matrix |
| IF | `OwnerRegistry`, `TestOwner` custody, `acquire` (the only route to each owner statement), `PublicationOwner` via C1 |
| MR | ordered calls with before/after observations; the recapture positive asserts two M4 reads |
| RB | `RootBank` for `contracts.schema.json`, the lane TEST_ONLY schema and binding custody; W12's selected `producer`/`plan`/`native` realms unchanged |
| NR | every integer through `uint64`/`integer`, every time through `storage_time`, canonical bytes through `event_value_bytes` |

Not used: PK (no SP-337 route is selected by M7's compact result; an oversized result is route-unavailable), GS, RT, KC (migration keys keep SP-305's hex `k` recipe), RQ.

## Units amended

| Unit | Path:line | Change |
|---|---|---|
| ATS-1117 | `Plans/Automated_Testing_System.md:7542` | validation surfaces `:7577-7578`; DG-CB paragraph `:7601` |
| SP-1131 | `Plans/storage-plan.md:30500` | validation surfaces `:30532-30533`; DG-CB paragraph `:30556` |
| protocol M section | `Plans/goal_own_c_contracts/protocol.md:43` | DG-CB paragraph after M9 (not a PlanUnit) |

## Per-family re-grade (twelve criteria)

Order: membership/version, owner, producer, closed payload, scope/identity, replay, retention, custody/redaction, transitions, consumers/checkpoints, compatibility/withdrawal, oracles.

| Family | Before | After | Vector |
|---|---:|---:|---|
| `goal.cancelled` | 10/12 | 10/12 | `P P P P P P P P P P p p` |

C5 and C6 are complete; the M1-M9 migration contributes its full SP-423 withdrawal, held-reader and reinstall evidence. Compatibility/withdrawal and oracles stay PARTIAL for the family only because C3 (DG-CA3) and the C4 private inspection are not yet complete; with DG-CA's C1/C2 and these two groups, they are the family's remaining groups. Native execution is NOT_RUN independently.

## Shared-file hunks for the DG merge

| File | Hunk | Note |
|---|---|---|
| `Plans/goal_own_c_contracts/protocol.md` | `@@ -40,6 +40,8` | one DG-CB paragraph after M9, before `## W1`; DG-CA's and DG-CA3's W2 paragraphs are elsewhere |
| `Plans/goal_own_c_contracts/suites.json` | `@@ -73,7 +73,15` | `goal.cancelled` row: keys `dg_cb_corpus`, `dg_cb_oracle`, `dg_cb_crash_matrix`, `dg_cb_group_closure`, `dg_cb_test_only_sources` after `dg_ca_assignment_successor` |
| `Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json` | `@@ -197,9 +197,9` | row 22 (`adopt_existing_binding`, assigned to DG-CB) only: status `DG_CB_C5_C6_EXECUTED`, note, oracle |
| `Plans/Automated_Testing_System.md` | `@@ -7574,6 +7574,8`, `@@ -7596,6 +7598,8` | ATS-1117: two validation surfaces at the end of the list; a new DG-CB paragraph after the footer paragraph |
| `Plans/storage-plan.md` | `@@ -30529,6 +30529,8`, `@@ -30551,6 +30553,8` | SP-1131: two validation surfaces at the end of the list; a new DG-CB paragraph after the footer paragraph |
| `Plans/_shards/automated_testing_system/**`, `Plans/_shards/storage-plan/**`, `Plans/.plan_index/**` | regenerated | regenerate at merge, never hand-merge; only rows owned by the two edited documents change (446 PlanUnit rows: 362 storage-plan, 84 ATS; 24 acceptance rows), PlanUnit count 7481 |

## Merge notes

- No change to `scripts/pm_goal_oracle_common.py`, the adapter files, NUMRULE, the guard tool, DG-CA's scripts or any earlier part's script. DG-CA's classes are subclassed in the lane's own files.
- `MigrationStorage` (lane subclass of the shared test-owner Storage) adds `checks=` whole-source version checks and the migration cut points; if the adapter later gains read-version checks inside `transact`, retire this subclass in its favour. It does not include DG-CA's `LeasedStorage` lease/fence because migration appends no Event.
- Destination stored wrappers follow the convention DG-CA and W12b already use (Storage canonical MessagePack); the binding families' registry rows still name `json_canonical`, the same note DG-CA's report carries.
- The migration families (`goal_binding_migration_result`, `goal_binding_migration_manifest_part`, `goal_binding_migration_withdrawal`) and the lane's TEST_ONLY envelopes need storage-value registry rows at integration; none are added here.
- `Plans/goal_own_c_contracts/dg-cb-migration-v1/test-only-sources.v1.schema.json` defines only TEST_ONLY custody envelopes; canonical members nested in them are validated in their own realms.

## Checks

All runs serial, one process at a time, `PM_GOAL_AUDIT_WORKERS=1`, at head `54397c4c25`. The DG historical reader ran under the lead's 2026-11-11 23:22Z memory rule: its own per-process 2 GB RSS cap, pause below 10 GB, start/resume at 11 GB. Commands and resource files: `checks.json` and `*-resource.txt` in the evidence folder.

| Check | Exit | Result |
|---|---:|---|
| Adapter self-test `scripts/pm_goal_test_adapters_selftest.py` | 0 | 64 positives, 140 negatives (204), 14 fault-matrix rows; elapsed=21.70 max_rss_kb=40000 |
| DG-CB oracles `scripts/pm_goal_dg_cb_oracles.py` (C5, C6, crash matrix) | 0 | C5 26/115, C6 20/66 (positives/negatives, incl. 6 crash rows); 0 failures; every negative `effects_preserved`; elapsed=230.92 max_rss_kb=174736 |
| DG-CA oracles `scripts/pm_goal_dg_ca_oracles.py` (shared family, unchanged scripts) | 0 | C1 21/230, C2 7/98, C4A 4/60; 0 failures (unchanged from DG-CA); elapsed=288.52 max_rss_kb=199944 |
| W12b corpus `scripts/pm_goal_own_c3_w12b_oracles.py` | 0 | 547 cases, 241 positives, 306 negatives (unchanged); elapsed=75.14 max_rss_kb=192056 |
| W12 successor qualification | 0 | 106 cases; elapsed=11.20 max_rss_kb=189296 |
| DG-OWN-C oracles | 0 | 355 cases, 46 positives, 309 negatives; elapsed=0.42 max_rss_kb=40444 |
| DG-OWN-C source components | 0 | 293 cases, 112 positives, 181 negatives; elapsed=4.17 max_rss_kb=56688 |
| Goal lineage self-test | 0 | pass; elapsed=0.25 max_rss_kb=29796 |
| DG current writer | 0 | 931 cases, 861 negatives, 143 guards removed, 0 unproved; elapsed=19.93 max_rss_kb=67532 |
| DG stop/block | 0 | 478 cases, 427 negatives, 90 guards removed, 0 unproved; elapsed=15.32 max_rss_kb=47932 |
| DG lifecycle | 0 | 514 cases, 487 negatives, 104 guards removed, 0 unproved; elapsed=9.18 max_rss_kb=50060 |
| Shard check | 0 | pass; elapsed=18.97 max_rss_kb=60564 |
| Plan-index validate | 1 | 126 failures against `origin/main` `e9c6a46389`: exactly the set DG-CA recorded (85 W12b baseline records and 41 `plan_unit_removed_without_ledger_decision` rows for PlanUnits added on main after the base); 0 new, 0 gone; no ledger, Decision Log or baseline rewritten; elapsed=40.02 max_rss_kb=476064 |
| DG historical reader (gated) | 0 | 6,143 cases, 6,032 negatives, 650 guards removed, 0 unproved; peak RSS 0.8 GB, 5 pauses, cap 2 GB; elapsed=1758.67 max_rss_kb=797684 |
| Shard generate / plan-index generate (after the Plans edits) | 0 / 0 | only rows owned by ATS and storage-plan change; PlanUnit count 7481 |
| `git diff --check` | 0 | clean |

The live fifteen-file currentness edition was copied byte-identically before the index generation (`currentness-copy.sha256`). No aggregate gate, landing check or reseal was run; the edited documents' existing stale readiness row only changes its expected hash, a reseal request for the separately assigned governance task.

Raw outputs, the copied currentness edition hashes and `SHA256SUMS`: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-CB/`.
