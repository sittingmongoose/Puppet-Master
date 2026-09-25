# Replan v8 (Step 8(b) Group A): status

The thread runs in a cloud session, which cannot reach the NAS or the shared checkout. Each branch is therefore pushed reviewed and handed over for landing here. The next branch is cut from `origin/main` meanwhile.

## A0: `plans/replan-v8-a0-20260925`

**What it does.** It re-adjudicates the combined Replan v8 source v3 (`9ed8ba4f…`) against `main` `a6480b0f7c`. The frozen currentness review had compared it against `4a72aa12`, which is not on `main`. This is a report only. See `A0-currentness-placement-20260925.md`, with its evidence under `a0/`.

**Result.**
- **Currentness: PASS.** Every change since the pinned bases is adjudicated.
- **A new conflict.** DL-076 now conflicts with the proposed family `draft_replan_release` (P-01).
- **Placement: CONDITIONAL.** Eighteen conditions for A1 are listed in section 8. Three are marked "decide first" because they change the v8 digest.
- **The package's own checks reproduce.** With the real `jsonschema`/`referencing`, every counted figure matches and every PASS output is byte-identical to its frozen file.

**Review.** One blind form-driven review, capped at two cycles: cycle 1 is `a0/review-cycle-1.json`; cycle 2 re-reviews the repaired rows (`a0/review-cycle-2.json`).
- Cycle 1 on `c0e9644a57`: repairs required. 1 blocking finding (the verdict named two of the three decide-first choices), 16 should_fix and 6 notes. Each was applied in the reviewer's wording in its own commit; A0-C1-23 needed no change.
- Cycle 2 on `f29ca48b75`: **ready**, with no blocking finding. Its 3 should_fix findings and 5 notes were applied the same way.
- The cycle cap is reached. No review finding is left open. Of the report's open questions, the process thread has since answered Q-02, Q-03, Q-09 and Q-12; the others stand.

**Open questions.** Q-01 to Q-12 in the report. The PM Low cost/complexity process thread answered Q-02, Q-03, Q-09, Q-12 and the package home on Jared's delegation. The answers are in `reports/event-authority-20260911/replan-v8/process-answers-20260925.md`, branch `plans/replan-v8-process-answers-20260925`, commit `616f12bfd`, and the report's "Process answers" section summarises them. That section was added after the review cycles.

**Cost.** A0 used about 5.5 agent-hours and about 0.95M output tokens: the re-adjudication workflow (9 subagents, 2.6 agent-hours, 0.83M output tokens), the blind reviewer (2 cycles, 0.6 agent-hours, 0.04M output tokens) and the host (about 2.3 hours). Jared cleared the thread on 2026-09-25 to run over the plan's estimates, which for A0 were half an agent-day and 150K to 250K output tokens.

## Landing A0 (on the VM)

Per the process answers, a local session that Jared designates lands the branch; the cloud thread does not.

The branch touches only `reports/event-authority-20260911/replan-v8/`. It edits no `Plans/**` file, so there is nothing to regenerate.

    mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held   # then write agent, branch, UTC time to held/holder.txt
    git -C /mnt/Cursor/PuppetMaster fetch origin
    # in a fresh worktree of the branch: git rebase origin/main, then push the branch again if it moved
    cd /mnt/Cursor/PuppetMaster && git status --short reports/event-authority-20260911/replan-v8   # must be empty
    git merge --ff-only origin/plans/replan-v8-a0-20260925
    python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
    python3 scripts/pm-landing-check.py --base origin/main --keep-check-reports /mnt/Cursor/PuppetMaster-Evidence/landing-checks/replan-v8-a0-20260925
    git push origin main        # or, if anything stops the landing: git reset --keep origin/main
    # landing record: reports/landing-checks/LANDING_<date>_REPLAN_V8_A0.md
    rm -r /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held
    git push origin --delete plans/replan-v8-a0-20260925

**Expected landing check.** Exit 0 or 1. No failure can name a file this branch touches except the new report files, and no check reads them.

**Cloud preview.** `pm-landing-check.py --base origin/main` ran on `c0e9644a57` in the cloud clone, a full checkout, in 3 minutes. It exited 1: nothing stops the landing. The baseline `792d2fb8b1` is current. No row names a path this branch touches. 647 rows are new since the baseline, and all of them are off-branch:
- Staleness left on `main` by the Step 8(d) landing: Spec Lock `stale_hash` for `Goal_Runtime_System.md` and `storage-plan.md`, and 143 `artifact_hash_stale` rows in each of the evidence and plan-graph aggregates (132 for the two documents and their 130 shards, 11 for `main`'s own Decision Log rows), keyed from their exports.
- Rows from the cloud environment, for example `raw_capture_manifest_path_unresolved` on `tests/fixtures/governance/raw_evidence_capture_modes.json`. The NAS path behind `tests/agent_packet_restrictions` does not exist here.

The landing check on the VM is the one that counts.

**Reseal items.** None are caused by this branch. It carries forward R-1: the certified-family pins that were already stale on `main`.
- `goal_certified_family_composition.json` members `00-plans-index.md`, `Goal_Runtime_System.md`, `storage-plan.md` and `storage_value_registry.json`.
- The consumer's `owner-sources.json` and `physical-retention-install.json`.

The 2026-09-25 landing record names the `Goal_Runtime_System.md` member and notes the `storage-plan.md` member as already stale; it does not name the other two or the consumer's pins.

## A1: `plans/replan-v8-a1-20260925` (in progress)

**What it does.** Installs `pm.executor.workflow_source.all_writers.v8`, with its Replan Stop route, into canon. The route runs through a canonical-draft package, `replan-v8/goal-replan-v8-canonical-draft-20260925/v1` in `sittingmongoose/PuppetMaster-Packages`, which is reviewed before any canon edit. Canon then gets owner prose first and companions second.

**Decisions.** See `a1/author-decisions-20260925.md`. Jared ratified the eleven process questions on 2026-09-25. Review questions take the design's defaults until the package reviews adjudicate them. O-13 (retention) and O-20 (child goal runs) are carried open.

**Where it stands.**
- The package is being built in the cloud scratch workspace: select, relocate, rename, repair, bind, author, checks C1 to C11, then the manifest.
- Next steps: the package's independent review, the root review, the push to the packages repository, then owner prose on this branch.

**Rebase note.** This branch is cut from `origin/main` `1e5d9b097`, where A0 has not yet landed. Its `STATUS.md` repeats A0's section so that, if A0 lands first, the rebase conflict on this file resolves by keeping this branch's version.

## Next

A1 (install v8 with the Stop route, through a new canonical-draft package) is cut from `origin/main` after A0's review. Its authority to start is Jared's go of 2026-09-24 for Group A, given in this thread's charter and not yet recorded in the repository; the plan's Part 2 status requires that go before package work starts. DL-080 records only that the work is needed. The three "decide first" choices (P-09, P-10, P-11) are settled in the canonical-draft package and its review.
