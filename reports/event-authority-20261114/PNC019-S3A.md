# PNC-019 lane s3a: depth of the 18 registered Goal, historical and complete families (S3), 2026-11-14

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Branch `plans/ea-pnc-s3a-20261114`, base `origin/plans/ea-batch3-int-20261114` at `3c33510c57` (batch 3 had not landed on `main`). Worktree `/home/sittingmongoose/pm-worktrees/pnc-s3a`. Brief: `lanes/PNC019-RUN.md` (row s3a) and `drafts/PNC019-SCOPE/PLAN.md` (finding 8, S3 row). Ids SP/CV/ATS-2100..2199 and DL-2900..2949 were checked free on every origin ref; **none was minted**. No registry, Decision Log, Spec Lock, `.evidence`, `auto_decisions.jsonl` or frozen-validator edit; no landing-lock use; `main` not pushed.

## Result

- **Fresh grades for all 18 families** at the base and at the lane head, 12 criteria each, every cell with exact quotes checked mechanically at their lines: `reports/event-authority-20261114/PNC019-S3A-grades-before.json` (554 quotes, 30 files) and `PNC019-S3A-grades-after.json`. Check either with `python3 scripts/pm-pnc019-s3a-grade-check.py <file> [--root <tree at assessed_tree.commit>]`.
- **Gaps closed this lane:** two stranded drafting packages merged by unit (DG-OWN-D, DG-OWN-B), the `goal_run.stopped`/`goal_run.blocked` projection clock contradiction repaired (Sol's DG-OWN-A F1), the DL-478 "current GoalRun envelope" wording re-routed, and DG-OWN-B's stale transitive pin refreshed with a closure proof.
- **Still open: no family is at 12/12.** Thirteen families are at 11/12, and for each of them the oracle cell is the only open cell: the three "complete" families and the ten historical-only ones. Under the stream E oracle bar, which lane s3b applies too, criterion 12 PASS needs an executable checker whose guard rows the gated tool proves. On the 2026-09-24 rubric alone the three complete families are still 12/12. Every remaining gap is technical work under DL-045 or a later stage (the S5b registry switch). The largest single item is the shared sweep over the Goal oracle suites: guard tool, shared numbers and date-time, retained-read recipe selection.
- **No contingency question for Jared.** The candidates checked are listed below with the reason each is not his to decide.

## Grades, before and after

Vector order: membership, owner, producer, closed payload, scope/identity, replay, retention, redaction/custody, transitions, consumers/checkpoints, compatibility/withdrawal, oracles. `P` PASS, `p` PARTIAL, `A` ABSENT, `C` CONFLICT.

| Family | Group | Before (`3c33510c57`) | After (lane head) | Vector after |
|---|---|---:|---:|---|
| `goal.created` | complete (12 on 2026-09-24) | 11 | 11 | `P P P P P P P P P P P p` |
| `restore_point.deleted` | complete (12 on 2026-09-24) | 11 | 11 | `P P P P P P P P P P P p` |
| `run.started` | complete (12 on 2026-09-24) | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.child_status_changed` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.degraded` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.progressed` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.replanned` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.scheduled` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.stopped` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.verification_decided` | historical-only | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.evidence_captured` | Goal (DL-079: history) | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.receipt_recorded` | Goal (DL-079: history) | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.tool_check_recorded` | Goal (DL-079: history) | 11 | 11 | `P P P P P P P P P P P p` |
| `goal.blocked` | Goal | 8 | **9** | `P P P p p P P P P P P p` |
| `goal.completed` | Goal | 8 | **9** | `P P P p p P P P P P P p` |
| `goal_run.blocked` | Goal (DL-080) | 7 (consumer **C**) | 7 (consumer **p**) | `P P p p p P P P P p P p` |
| `goal_run.stopped` | Goal (DL-080) | 7 (consumer **C**) | 7 (consumer **p**) | `P P p p p P P P P p P p` |
| `goal_run.replanned` | Goal (DL-080) | 3 | 3 | `P P p C p p P p p A p p` |

How "before" was built: the latest prior grade per family (DG round 2 self-grade at `686382d061` for the 15 Goal families, the 2026-09-24 assessment for `run.started` and `restore_point.deleted`) was re-read at `3c33510c57`. All 539 prior quotes were re-found; none sits in a retired or superseded unit. The governing units are unchanged in substance since those grades except for DL-478 (GRS-026 and SP-215 retired; CV-287, CV-288, SP-214, GRS-041, GRS-086 and CV-366 changed) and the projects-refresh app-scope additions (ACD-086, SP-274/285, UCC-126, EP-116, OP-036). Each was read for its effect on these families:

- **Oracle bar (three downgrades):** the stream E oracle bar is applied as lane s3b applies it. `goal.created`, `restore_point.deleted` and `run.started` keep their authored cases but have no executable checker with gated-tool guard rows. `restore_point.deleted`'s five pinned external suites are present with matching SHA-256, and `goal.created`'s `validate-goal-runtime-event-fixtures` passes. Their oracle cell is therefore PARTIAL: 12 to 11.
- **One owner-text downgrade:** `goal_run.stopped`/`goal_run.blocked` consumers/checkpoints PARTIAL to CONFLICT. GRS-202 (`Plans/Goal_Runtime_System.md`, base line 8568) required `expected_goal_run_revision` to equal the last projected revision. `Plans/workflow_standard_source_contracts/native-v7/protocol.md:61` and `:65` let non-emitting progress and provisional success advance the body revision with no Event. Sol's DG-OWN-A review (`reviews/DG-OWN-A-sol/REVIEW.md`, F1) grades exactly this CONFLICT and classes it (c), technical under DL-045.
- **No other cell moved.** DL-478's CV-287 now qualifies `goal.scheduled`, `goal.child_status_changed` and `goal.verification_decided` as `historical_only`, which agrees with their disposition. The app-scope additions create separate app editions and leave the registered Project versions as graded.

## DL-079 and DL-080, checked first

- **DL-079 (three Goal record events become history), confirmed by DL-409 (Card 3 A):** GRS-205/206/207, SP-431/432/433, CV-424/425/426 and the CV-366 rows give each family its own both-scope writer refusal and historical reader, so all three are HISTORICAL_ONLY at 11/12. DG-OWN-D's SP-1147/1148/1149 (merged here) add their boundary suites. The one DL-409 action not yet done is a registry action: withdraw the three unused application editions at the next registry checkpoint. That belongs to the admission writer (S5/S5b), not this lane.
- **DL-080 (current blocked/stopped/replanned run events, stopped and blocked first, replanned after the Replan v8 source work):** GRS-200/201, EP-200, SP-426/427/428 and CV-420/421 exist for stopped and blocked. Their projection clock is repaired here. They still need a fresh Workflow source edition listing EP-200's writers and the rest of DG-OWN-A's fix list. `goal_run.replanned` stays at 3/12 by DL-080's own negative constraint: no contract before the `pm.executor.workflow_source.all_writers.v8` source work. DL-080 makes that work needed and does not schedule it.

## What this lane changed

| Commit | What | Where | Verify |
|---|---|---|---|
| `99706a8d75` | Merge of DG-OWN-D (`plans/ea-goal-own-d-20261105` @ `7a9e42fad6`): ten historical reader boundary contracts SP-1140..1149, ATS-1119, reader adoptions in SP-271/277/280/300-303/431-433 and ATS-211, the four degradation-flag type checks, new suite `scripts/pm_goal_own_d_oracles.py` | `Plans/storage-plan.md:46048` (SP-1140) to `:46480` (SP-1149); `Plans/Automated_Testing_System.md:12104` (ATS-1119) | `python3 scripts/pm_goal_own_d_oracles.py` |
| `8c3e78c9d0` | Merge of DG-OWN-B (`plans/ea-goal-own-b-20261105` @ `62664bee88`): original host sources for `goal.blocked` and `goal.completed`, and DL-081's exception route (GRS-1120..1122, CV-1120..1122, SP-1120..1122, EP-1120, HITL-1120, PS-1120, SIR-1120, ATS-1113..1115), suite `scripts/pm_goal_own_b_oracles.py` | `Plans/Goal_Runtime_System.md:9401`, `:9616`; `Plans/storage-plan.md:45605`; `Plans/Contracts_V0.md:41081`; `Plans/Executor_Protocol.md:12363`; `Plans/human-in-the-loop.md:2805`; `Plans/Permissions_System.md:11009`; `Plans/Shared_Integration_Runtime.md:3307`; `Plans/Automated_Testing_System.md:11961` | `python3 scripts/pm_goal_own_b_oracles.py` |
| `6b2e70b4dd` | GRS-202 revision relation: a row's expected revision is its own native before-revision; a higher one than the projected revision is accepted only across intervening revisions the original D01/native chronology authenticates as non-emitting native steps. A gap, a lower revision or an intervening unsupported Event halts. SP-428 says what the projected revision is. ATS-212 adds 3 positives and 13 one-defect negatives to the bounded projection oracle. GRS-200/201 and CV-420/421 now point at the GoalRun envelope grammar that CV-288 keeps for Event Authority custody after DL-478, not a "current GoalRun envelope". | `Plans/Goal_Runtime_System.md:8585` (GRS-202 text), `:8602` (criteria), `:8636` (rule table), `:8453`, `:8519`; `Plans/storage-plan.md:27571`; `Plans/Contracts_V0.md:40759`, `:40812`; `Plans/Automated_Testing_System.md:11905`; `scripts/pm_goal_run_stop_block_oracles.py:60`, `:101`, `:107` | `python3 scripts/pm_goal_run_stop_block_oracles.py` (494 cases, 440 negatives) |
| `e05abaa0c6` | DG-OWN-B pinned `Plans/shared_integration_runtime.schema.json` at its Nov 4 bytes; batch-line commit `3a93424300` changed the file, so the package refused with `resource/hash`. The package reaches the file through eight `$defs`; their whole in-document closure and every root keyword are byte-identical, so the pin moves to the current bytes. | `Plans/goal_lifecycle_host_contracts/resources.json` | `python3 scripts/pm_goal_own_b_oracles.py` (571 cases) |
| (this commit) | Grade files, the grade checker, this report | `reports/event-authority-20261114/PNC019-S3A*`; `scripts/pm-pnc019-s3a-grade-check.py` | `python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261114/PNC019-S3A-grades-after.json` |

Both merges were integrated unit by unit, not by accepting git's interleaved hunks. Amendments were applied as patch hunks at their offsets. Each appended block was placed right after its base anchor, which also puts it before DG-OWN-C's block (appended the same way). One correction: DG-OWN-D's SP-433 adoption paragraph was moved back under SP-433, because DG-OWN-B's block would otherwise have separated it from its unit. Line counts per owner document equal each lane's own diff. The ids were those lanes' allocations; an all-origin scan on Nov 14 found each defined only on its own branch. Shards and the plan index were regenerated after each step, never hand-merged. Each regeneration touched only the edited documents, and every shard check passed.

**DG-OWN-A is not merged.** Sol's review leaves it NOT_READY with nine blocking findings (F1 to F9), and it carries a 533,913-line resource bank. Its F1 premise is now repaired in canon. A DG-OWN-A fix round must reconcile its GRS-202/SP-428 amendments with `6b2e70b4dd`.

## Verification

| Check | Base `3c33510c57` | Lane head | Notes |
|---|---|---|---|
| `scripts/pm_goal_history_reader_fixtures.py` (ATS-211) | pass, 6,143 cases / 6,032 negatives | pass, 6,187 / 6,072 | own guard audit; +44 cases from DG-OWN-D's flag checks; no gated-tool credit claimed |
| `scripts/pm_goal_current_writer_oracles.py` (ATS-210) | pass, 931 / 861 | pass, 931 / 861 | |
| `scripts/pm_goal_run_stop_block_oracles.py` (ATS-212) | pass, 478 / 427 | pass, 494 / 440, 0 unproved | +16 cases for GRS-202 |
| `scripts/pm_goal_lifecycle_successor_oracles.py` (ATS-213) | pass, 514 / 487 | pass, 514 / 487 | |
| `scripts/pm_goal_own_d_oracles.py` (ATS-1119) | — | pass, 51,670 / 49,420, 114 guard inventory | same counts as DG-OWN-D's report |
| `scripts/pm_goal_own_b_oracles.py` (ATS-1113..1115) | — | attempt 1 exit 1 (`resource/hash`); attempt 2 after `e05abaa0c6` pass, 571 / 503 | both attempts kept |
| `scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures` | pass | — | `goal.created` fixtures |
| restore-point external frozen suites | 5 of 5 pinned paths present, SHA-256 match | — | pinned in `Plans/restore_point_deleted_contract_fixtures.json` |
| `scripts/pm_event_datetime_inventory.py` | 290 nodes, 0 unclassified, 4 failures | identical | the 4 cite files under the sparse-excluded `Plans/.audits/stage-a-…` |
| shard generate / index generate / shard check | — | exit 0 after each of the three Plans steps | |
| grade quote check | 554 quotes, 30 files pass | 591 quotes, 30 files pass | |

All runs used `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0` (3G for regeneration) and started only with at least 12 GB available. The 15-file currentness edition was copied in, and its SHA-256 checked, before every index generation. The landing check, run-gates and audit-governance were not run; they belong to landing.

## What remains, by family

- **Ten historical families (oracle cell only).** Run the shared sweep over ATS-211 and ATS-1119 (`scripts/pm_goal_history_reader_fixtures.py`, `scripts/pm_goal_own_d_oracles.py`):
  - guard tables as real predicates, proved by `scripts/pm_guard_isolation.py` (Method B);
  - the shared number and date-time calls through `scripts/pm_goal_test_numrule.py`;
  - retained reads that select the recipe only from the sealed receipt, with missing, ambiguous and other-original receipt negatives.

  The checkers use the old private `Gates`/`Audit` removal engine, about 650 inline guards. This is a full W3-P2-sized job, and the lane did not start it. With it, all ten reach 12/12.
- **`goal.blocked`, `goal.completed`:**
  - closed payload and scope/identity turn PASS at the S5b registry switch to v3 (EA-P3 A standing rule);
  - oracles need the same sweep over ATS-213 and ATS-1113..1115.
- **`goal_run.stopped`, `goal_run.blocked`:**
  - the producer needs a fresh Workflow source edition whose all-writers descriptor lists EP-200's writers (DG-OWN-A EP-1110..1112, held);
  - consumers need SP-428's row metadata in a closed projection root (Sol F3) and the fresh typed consumer method graph (F9);
  - oracles need the complete source and projection cases (F2, F4 to F8) and the sweep;
  - closed payload and scope switch at S5b;
  - `goal_run.stopped` also needs DL-448's distinct application edition.

  This is a DG-OWN-A fix round followed by the merge.
- **`goal_run.replanned`:** after stopped and blocked, the Workflow Replan v8 source work, then its own contract. The `cmd.runtime.replan` wiring still expects the historical `goal.replanned` (DG open item 5).
- **Three complete families (oracle cell only):** an executable checker over their authored cases (goal_start fixtures; restore-point fixtures and external suites; run_started consumer, retention and index-adoption fixtures), with gated-tool guard tables, shared number and date-time calls and sealed-receipt retained reads. Nothing else is open at their registered versions.

## Contingency questions for Jared

**None.** Checked and found not to be his:

1. **DL-478 vs DL-080/DL-448.** DL-478 retired the GoalRun build flow, but it edits no earlier Decision Log row and excludes Event Authority vocabulary. EA-P3 A (Nov 14, after DL-478) keeps `goal_run.started`/`cancelled`/`certified` current as Workflow-run events, so `goal_run.blocked`/`stopped` stay current under DL-080. The only defect was wording, fixed in `6b2e70b4dd`.
2. **The GRS-202 clock.** Sol ruled it technical, classification (c). It is now repaired.
3. **DL-081's exception route in GRS-1122 vs DL-477/478 ("Goals have no checks").** The verification and exception belong to the owning Workflow (GRS-065, which DL-478 keeps). The Goal receives only owner-supplied completion evidence (GRS-050). Reviewers should confirm this reading.
4. **App restore-point deletions.** SP-349 maps app deletion commits and a `restore_point_deleted_checkpoint_application` key, while the registered family is `project_only`. CV-366 keeps `missing_event_registration` until a separate admission. This is an app edition for the token ledger or a later admission, not a product choice.
5. **The Replan v8 source work.** DL-080 already makes it needed. Scheduling it is the lead's call.

## Notes for the lead

- **Grading bar for the three "complete" families.** They are graded 11/12 under the stream E oracle bar, matching lane s3b; under the 2026-09-24 rubric they would stay 12/12. If you want depth rows graded on the old rubric, only their oracle cell changes, and the grade files say so in each row's notes.
- **Unrelated test failure on the base.** `tests/test_pm_restore_phase_contracts.py::test_restore_command_and_ui_consumers_use_one_owner_contract` expects `backup_restore_command_request`, but the catalog now names `backup_restore_command_request_v2`. It concerns backup restore, not restore points, and it was not touched.
- **Pin pattern.** DG-OWN-C stores frozen copies of the same old `shared_integration_runtime.schema.json` bytes (`whole-resource-locations.v2.json`). DG-OWN-B pinned the live path instead, so this lane re-pinned it after the closure proof. A reviewer may prefer DG-OWN-C's frozen-copy pattern instead.
- **Worktree.** `/home/sittingmongoose/pm-worktrees/pnc-s3a` is kept until you say the lane has merged.
