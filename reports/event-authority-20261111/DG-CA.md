# DG-CA — goal.cancelled: C1 and C2 COMPLETE, C4 assignment admission COMPLETE, C4 private inspection waits for C3 (DG-CA3)

Lane DG-CA of `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`, stream E. Branch `plans/ea-goal-dg-ca-20261111`, cut from `origin/plans/ea-goal-own-c3-w12b-20261105` at `cf7132263a`, with the shared adapters merged (`origin/plans/ea-goal-adapter-20261111` at `62e61fe59a`, merge `3d1870bf32`; adapter self-test 204/204). Session 1 (2026-11-11) delivered C1; session 2 (2026-11-12, lead's order: assignment, then C2, then C4 inspection; C3 to lane DG-CA3) delivered the SP-305/SP-310 assignment admission (pushed `af6e644265`, mailed to the lead) and C2. Sibling DG-CB (C5, C6) works on the same family; this branch touches only C1–C4 rows.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.** Every owner, value and record here is TEST_ONLY. Nothing admits anything, changes the event registry, adds a Decision Log entry, retention or deletion policy or PlanUnit, edits Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files, or rewrites an original bank, URI, hash or stored byte.

## Groups

| Group | Result | Basis |
|---|---|---|
| C1 authenticated no-association | **COMPLETE** | Judge's C1 complete case executed end to end on the adapters (table below) |
| C2 bound-Plan route | **COMPLETE** | Judge's C2 complete case executed end to end (table below). Run retirement/compaction (coverage rows 44–48) is in the bound method map but outside the judge's C2 case; it stays open and is listed |
| C3 Workflow Stop / D05 / D06 | **Assigned to lane DG-CA3** by the lead (2026-11-12 00:12Z) | Not authored here |
| C4 late assignment / private inspection | **NOT_COMPLETE.** The SP-305/SP-310 assignment admission is **COMPLETE**; the SP-313 v2 private inspection is not authored | Exact dependency, not a technical blocker: `InspectCurrentEventEntryV2` needs `WorkflowSourceAudit` and `OriginalGoalAppendReadback`, whose `original_assignment` is the Workflow `StorageLateAssignmentAudit` built from `LateAssignmentEntry` → `PostOwnersEntry` → `StorageWorkflowScopeProof` + `WorkflowOwnerSettlement`. Only C3's `owner.goal.workflow_cancel.settle_owner.v1` over `OriginalOwnersNativeEntry` issues those. The SP-278 Event Record Index read source is also still to build. The judge already sequences C4 "1–2 runs after C3". Remaining list: `/home/sittingmongoose/pm-scratch/DG-CA/RESUME.md` (copy in `drafts/DG-CA/RESUME.md`) |

## C1 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| Whole Goal body/control/history, enrolled binding/origin/writer domain, host Stop domain | `birth_none`: one transaction for body, objective revision/origin, v2 control, host Stop domain, binding revision0/origin0/control0, under a writer domain installed over seven issued native writer registrations. Fresh enrollment, never migration. |
| Complete authenticated empty association/pending inventory | Plan, Workflow and Scheduler inventory owners each issue a complete statement; the `none_required` scope proof is a stored record joining them. A caller dict, a missing database or a member held by any owner refuses. |
| C-source, C-stop, receipt, `none_required`, frozen Event, first append/full-value receipt, control, SIR-050 terminal | Recorded in that order. Storage assigns sequence, times, frames, first custody, group digest and full-value commitment; the terminal is published once through the append reservation. `receipt.accepted_at` = `payload.cancelled_at_utc` = producer `occurred_at_utc` (SIR-051; corrected in session 2 with its own guard and negative). |
| Unchanged body/revision/history; preserved prior Stop; display only after publication | Byte-identical body/history for active, paused, blocked; prior Stop receipts unchanged, latch +1/+1; display flips at `publish_control`. |
| Duplicate replay, altered conflict, completed/already-cancelled, unknown pending, lost acks, false-empty | All executed (see oracle kinds). |
| Every boundary; crash cuts; retained vs current; number/type forms | Nine-source recheck after every helper and before every transaction; 12-row child-process crash matrix of the Event protocol; retained audit after SP-423 withdrawal; exact-number walk after every root check. |

## C4 assignment admission (SP-305/SP-310 tuple)

`scripts/pm_goal_dg_ca_assignment.py` executes `reserve_append_assignment`, `issue_assignment_audit`, `admit_codec_domain` and `append_reserved` inside a complete cancellation path (`AssignedCancel`), in GRS-076's order (C-source → SIR acknowledgement durably read back → reservation → audit → admission → C-stop … → reserved append).

- **Storage:** `LeasedStorage`, a lane subclass of the shared test-owner Storage (adapter files untouched; listed for the merge): the original 4096-ID sequence lease as a stored `sequence_lease_control` record; one nonserializable exclusive append fence; a reservation fixing the never-reused next sequence, segment and byte offset; abandonment turning the sequence into an `allocator_lease_abandoned` gap that later appends skip; the seglog selection generation advancing only on seglog changes, so redb-cell transactions between reservation and append leave the selected manifest generation unchanged (observed from reservation through the append).
- **Sources:** `SeglogControlOwner` returns the unchanged native `current`, `manifest` and `sequence_lease_control` roots as typed views of Storage's own CURRENT/manifest/segment bytes; `CodecOwner` registers the four codec resources by the SHA-256 of the files actually executed.
- **Audit and admission:** the EncodingTerm template is the complete EventRecord fixed at C-source with exactly three slots (`event.observed_at_utc`, `event.persisted_at_utc`, `cancellation_receipt_sha256`); numeric path domains follow `Plans/goal_cancel_contracts/numeric-paths.json` row by row from actual sources (null branches omitted, never 0); SP-305's input and domain commitments are recomputed by every consumer. At the reserved append the evaluated template must equal the stored Event (only Storage's sequence and times differ) and every receipt field must lie in its admitted domain.
- **Newly authored successor:** a genuine complete `AssignmentAudit` measures over the family's 16 KiB value cap (DL-270/SP-340; the numeric-path member alone exceeds 12 KiB) and the family selects no reference route. Under the general successor rule, `Plans/goal_own_c_contracts/dg-ca-assignment-successor-v1/` stores the whole unchanged audit as one SP-337 pack (durable and read back before the reference is written) behind a compact `StorageAssignmentAuditReference`; every reader verifies BLAKE3, size, media type and the exact-bytes SHA-256 and revalidates the predecessor root. The predecessor schema, family map, URIs and hashes are unchanged.

## C2 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| Original APR PlanRun/AssistantPlanRecord/GoalPlanBinding, approved version/hash | `PlanOwner` issues the approved plan (hash over its stored content) and the goal-driven run, each with a SourceOrigin; `commit_plan_binding` writes the seven-field GoalPlanBinding, PlanAssociation and binding revision1/origin1/control in one transaction. |
| Goal/Stop/binding/control, full Scheduler schedule/consent/correlation/admission/callback inventory, SIR source | Bound C-source validates `BoundSourceCaptureEntry` whole; `SchedulerOwner` issues run schedules, run bindings (admission refs) and consents and states its complete run selection; callbacks are admitted only against the current run epoch, run state and Stop. |
| Authentic Plan preparation | `prepare.v3`: reserved identities as stored owner reservations, future slots (joint commit time; genuine Stop/cancellation receipt hashes; each changed/new value's physical hash and origin-key digest), complete value templates for every target, numeric assignments derived from actual before/after values, codec resources and carrier policy admissions, over the current `AssignmentAdmission`; `BoundBeforeStopEntry` validated whole before C-stop. A target that cannot fit SP-306's 16 KiB returns `PreparationUnavailable` (`unrepresentable_required_value`) before C-stop and abandons the reservation. |
| Original Stop/reservation/receipt; native PlanRun/control CAS; schedule/consent invalidation | C-stop and receipt as C1; `commit.v3` + `participate.v3` write plan `building→canceled`, run `→cancelled` with epoch +1 and the first completion anchor, run schedules `→invalidated` (revision +1, cancellation reason), consents `enabled→false`, both effects, the result and every origin in one joint transaction under whole-value CAS; every written value must equal its evaluated template. |
| Owner settlement, Event, first receipt, control, terminal in order | `bound_plan_settled` from the current effect readers (`read_current_plan_effects`/`verify_current_custody`), `BoundOwnersEntry` whole, reserved append, control, `BoundTerminalEntry`; retained replay through `BoundRetainedReplayEntry` and `read_retained_plan_effects`. |
| Exactly the applicable effects; unrelated scheduled messages and Goal history unchanged; late callbacks fenced | Observed per field; the unrelated scheduled message and Goal body/history are byte-identical; a callback is admitted before cancellation and refused after it. |
| Source/Plan epoch drift, missing owner, unknown settlement, duplicate/conflict, every fault/helper boundary | Plan version and run drift before capture, prepare and commit; Scheduler database unavailable; settlement before effects; unknown terminal; joint-commit lost acknowledgement resolved from Storage only; duplicate commit (no second increment); dispatch conflict; duplicate replay; seven genuine source changes at every helper and final boundary of capture, prepare, commit and settlement. The latch, receipt, freeze, reserved-append, control and terminal boundaries run the same code as C1 and C4A and are covered there. |

## Oracle counts

| Group | Positives | Negatives | Failures |
|---|---:|---:|---:|
| C1 | 21 (9 route positives + 12 child-process crash rows) | 230 | 0 |
| C2 | 7 (active, paused, blocked, authenticated empty Scheduler set, over-cap Scheduler set refused before C-stop, unknown terminal without Plan effects, joint-commit lost ack resolved from Storage) | 98 | 0 |
| C4 assignment (C4A) | 4 (active, paused, blocked, abandoned reservation never reused) | 60 | 0 |
| C4 private inspection | 0 | 0 | not authored (waits for C3) |
| **Total** | **32** | **388** | **0** |

Every negative is built from a valid route, makes one genuine owner change or presents one substituted/transport-shaped value at one boundary, must be refused with exactly its own code, and must leave Storage changed only by the injected change (`effects_preserved` true for all 388). C2 negatives: 6 entry (including the dispatch conflict), 4 prepare, 2 latch, 9 commit (including unknown-without-commit), 1 participate, 3 settlement, 1 retained reader, 2 callback, 70 helper/final boundary drifts (capture 3 points, prepare 2, commit 3, settlement 2; seven genuine sources each). C4A negatives: 3 entry, 3 fence (including the non-copyable fence), 1 lower, 2 custody, 2 codec, 1 commitment, 5 pack, 8 append, 35 helper/final boundary drifts (3 methods, 5 points, seven sources).

**New guards with their negatives:** `DG-CA-guards.json` lists every literal `require` site in the lane's files with the negatives that refused with exactly that code: 230 product-model sites (owners 36, C1 80, assignment 49, C2 65), 102 with at least one dedicated negative and 128 without; the 44 sites in the two case modules are positive-observation assertions, not guards. 351 distinct refusal codes were observed (including the adapters' and the original roots' codes). Sites without a dedicated negative fall into: Storage/self-consistency joins unreachable from inputs (custody, group, receipt, template-event, domain membership, pack readback, seglog CURRENT/manifest join); defense in depth behind a closed root or an earlier guard on the same invariant (e.g. `C4A/append_reserved/template_keyset` behind the closed ProducerInput root; `C1/capture_source/retry_conflict` behind `accepted_dispatch`; pending/control guards behind the owner's `goal/pending_cancel_fenced`); per-target dynamic codes (`C2/plan_commit/template_value/<target>`, `before_source/<target>`, `cas_present/<target>`) exercised for one target each; and owner shape checks. They go to the shared guard-isolation sweep; no local guard-removal engine and no check-11 claim are made.

## Components used

| Component | Use |
|---|---|
| ST | append, frames, first custody, `full_value_result`, `active_durable_group`, `publish_terminal`, reservations (subclassed for the lease/fence) |
| TX | every stored record via `transact` with per-key CAS; the joint Plan/Scheduler/Storage commit |
| PK | SP-337 pack for the assignment-audit successor (`put_pack`/`read_pack`/`withdraw_pack`) |
| RO | `FaultPlan` cuts in real child processes, `classify`, the adapter `MATRIX` |
| IF | `OwnerRegistry`, `TestOwner`, `acquire`, `AppendOwner`, `PublicationOwner` |
| MR | ordered calls with before/after observations of every owner and Storage |
| RB | `RootBank` for the successor schema |
| NR | Storage/owner times, `uint64`, `producer_digest`, `full_value_commitment`, replay-only refusal, pack verification |

Not used: GS, RT, KC (cancellation keys keep SP-305's scoped hex recipe, Plan keys SP-306's), RQ.

## New files

| File | Lines | SHA-256 |
|---|---:|---|
| `scripts/pm_goal_dg_ca_owners.py` | 747 | `1614baa696a47522fa3f2ed775c1f362f8af722a6e85ccedafba16f0707fd823` |
| `scripts/pm_goal_dg_ca_c1.py` | 895 | `5b98a463c094c6ffdcb62de9a02aaa6a60f6fd5454705c88eb3443d5e4c15d75` |
| `scripts/pm_goal_dg_ca_crash.py` | 183 | `791ce4ab2f1c55ccdc7cab54774c9b6eedae22d8f8cf63782dfa0cc460e8acb9` |
| `scripts/pm_goal_dg_ca_assignment.py` | 793 | `eb0f94d660f6b9acc5fa97227984f5754671d214040b02e0faeb2202fde50094` |
| `scripts/pm_goal_dg_ca_c2.py` | 1351 | `f68b07c8c21e1bbbcacd90e4f03c0fc0e1592185519c771cad53ed43dee31f9b` |
| `scripts/pm_goal_dg_ca_oracles.py` | 914 | `03584a0e0f1975c521d2fc56656887935960347285c1fef9fde85d013d7c7f43` |
| `scripts/pm_goal_dg_ca_c4_cases.py` | 340 | `0cb9e71d33231ffce81c5649b39307d791527f8ba4e6c523ec0c34ab4747528a` |
| `scripts/pm_goal_dg_ca_c2_cases.py` | 378 | `e09fb664cb6bece88e51263820c3da12ea0e7eb098eaaba73fe79e12aff550c6` |
| `Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json` | 551 | `a1162c2cebcd7bad127612f50e32e8eceddea6d421ab17d6621c346decda8faa` |
| `Plans/goal_own_c_contracts/dg-ca-assignment-successor-v1/assignment-audit-reference.v1.schema.json` | 137 | `27cc108f8106360fbc6178d2c828bcc15644de80d7f502f451c41563754c12c9` |
| `Plans/goal_own_c_contracts/dg-ca-assignment-successor-v1/selection.v1.json` | 46 | `66ebbe2fde82d44cf03c19462503c5dba16b6a31e0c9051fc9ad5eb883b520d3` |

`coverage.json` maps all 66 inherited method rows: 10 C1 and C2 executed, 10 C1 executed, 9 C2 executed, 4 C4 assignment executed, 12 C3 (DG-CA3), 7 C4 after C3, 5 outside the judged C2 case (retirement), 3 C2/C3 whole binding tuples, 5 unassigned (backup, delete), 1 DG-CB (migration adoption).

## Units amended

| Unit | Path:line | Change |
|---|---|---|
| ATS-1117 | `Plans/Automated_Testing_System.md:7539` | validation surfaces `:7569-7570`; footer `:7597` (C1, C2 and the C4 assignment executed; C3 is DG-CA3; C4 inspection open; native line) |
| GRS-1131 | `Plans/Goal_Runtime_System.md:8977` | validation surface `:9008` |

No PlanUnit added; PlanUnit count stays 7481.

## Per-family re-grade (twelve criteria)

Order: membership/version, owner, producer, closed payload, scope/identity, replay, retention, custody/redaction, transitions, consumers/checkpoints, compatibility/withdrawal, oracles.

| Family | Before | After | Vector |
|---|---:|---:|---|
| `goal.cancelled` | 10/12 | 10/12 | `P P P P P P P P P P p p` |

Compatibility/withdrawal stays PARTIAL until the Workflow route exercises SP-423 too. Oracles stay PARTIAL: C1, C2 and the C4 assignment are complete; C3 (DG-CA3), the C4 inspection and C5/C6 (DG-CB) are not. Native execution is NOT_RUN independently.

## Shared-file hunks for the DG merge

| File | Hunk | Note |
|---|---|---|
| `Plans/goal_own_c_contracts/protocol.md` | `@@ -72,0 +73,4` | two DG-CA paragraphs at the end of W2, before `## W3`; DG-CB's W2 paragraph lands at the same place: keep both |
| `Plans/goal_own_c_contracts/suites.json` | `goal.cancelled` row | keys `dg_ca_corpus`, `dg_ca_oracle`, `dg_ca_group_closure`, `dg_ca_assignment_successor` |
| `Plans/Automated_Testing_System.md` | `@@ -7568,0 +7569,2`, `@@ -7595 +7597` | ATS-1117 validation surfaces and footer |
| `Plans/Goal_Runtime_System.md` | `@@ -9007,0 +9008` | GRS-1131 validation surface |
| `Plans/_shards/automated_testing_system/**`, `Plans/_shards/goal_runtime_system/**`, `Plans/.plan_index/**` | regenerated | regenerate at merge, never hand-merge; only rows owned by the two edited documents change |

## Merge notes

- `LeasedStorage` subclasses the shared `pm_goal_test_storage.TestOwnerStorage` in this lane's own file instead of editing it (append floor from the stored lease, fence, reservation, seglog-only generation). If the adapter later gains a native lease/fence, retire this subclass in its favour.
- `pm_goal_dg_ca_owners.World` takes `storage_cls`; DG-CA3 should build C3 on `pm_goal_dg_ca_assignment.assigned_world` and `AssignedCancel` so C4's Workflow late assignment and inspection reuse the same Storage.
- The successor family `goal_cancel_assignment_audit_reference` needs storage-value registry rows at integration; none are added here.
- No change is needed in `scripts/pm_goal_oracle_common.py`, the adapter files, NUMRULE, the guard tool or any earlier part's script. The lead's 2026-11-11 23:22Z memory rule was applied to the one heavy check (DG historical reader): its own per-process 2 GB RSS cap, pause below 10 GB, start/resume at 11 GB.

## Checks

All runs serial, one process at a time, `PM_GOAL_AUDIT_WORKERS=1`, at head `e04c8cbcb9` (scripts and Plans unchanged since; the report commit only adds this file). Commands and resource files: `checks.json` and `*-resource.txt` in the evidence folder.

| Check | Exit | Result |
|---|---:|---|
| Adapter self-test `scripts/pm_goal_test_adapters_selftest.py` | 0 | 64 positives, 140 negatives (204), 14 fault-matrix rows |
| DG-CA oracles `scripts/pm_goal_dg_ca_oracles.py` (all groups, with the crash matrix) | 0 | C1 21/230, C2 7/98, C4A 4/60 (positives/negatives); 0 failures; every negative `effects_preserved` |
| W12b corpus `scripts/pm_goal_own_c3_w12b_oracles.py` | 0 | 547 cases, 241 positives, 306 negatives (unchanged from W12b) |
| W12 successor qualification `scripts/pm_goal_own_c3_w12_successor_oracles.py` | 0 | 106 cases |
| DG-OWN-C oracles `scripts/pm_goal_own_c_oracles.py` | 0 | 355 cases, 46 positives, 309 negatives |
| DG-OWN-C source components `scripts/pm_goal_own_c_source_oracles.py` | 0 | 293 cases, 112 positives, 181 negatives |
| Goal lineage self-test | 0 | pass |
| DG current writer | 0 | 931 cases, 861 negatives |
| DG stop/block | 0 | 478 cases, 427 negatives |
| DG lifecycle | 0 | 514 cases, 487 negatives |
| DG historical reader (gated: 2 GB per-process RSS cap, pause below 10 GB, start/resume at 11 GB) | 0 | 6,143 cases, 6,032 negatives, 650 guards removed, 0 unproved; peak RSS 0.8 GB, 8 pauses |
| Shard generate / plan-index generate (each documents edit) | 0 / 0 | only rows owned by the edited documents (ATS, GRS); PlanUnit count 7481 |
| Shard check | 0 | pass |
| Plan-index validate (`origin/main` `77bae0c636`) | 1 | 126 failures: all 85 W12b baseline records unchanged; 41 new `plan_unit_removed_without_ledger_decision` rows, each naming a PlanUnit present on `origin/main` and absent from both the branch base `cf7132263a` and this branch (added on main after the base; `index-baseline-attribution.json`). None is a removal by this branch. No ledger, Decision Log or baseline rewritten. |
| `git diff --check` | 0 | clean |

The live fifteen-file currentness edition was copied byte-identically before each index generation (`currentness-copy.sha256`). No aggregate gate, landing check or reseal was run; the two edited documents' existing stale readiness rows only change their expected hashes, a reseal request for the separately assigned governance task.

Raw outputs, the copied currentness edition hashes and `SHA256SUMS`: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-CA/`.
