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

## A1: `plans/replan-v8-a1-20260925`

**What it does.** Installs `pm.executor.workflow_source.all_writers.v8`, with its Replan Stop route and its producer component `pm.goal_run_certified.producer_source.v3`, into canon as source contracts. It adds 13 owner units (EP-125 to 127, GRS-086 to 089, CV-354, SP-321, SP-322, ATS-059, ATS-060, BRS-031), an index section, 74 placed files, 34 registry rows and eight census re-pins. It adds no Event registry row, payload successor, consumer, projector or checkpoint, and nothing native. See `A1-canonical-placement-20260925.md`, with its evidence under `a1/`.

**Where it stands.** Compiled on the branch, pending the blind review.
- The canonical-draft package `replan-v8/goal-replan-v8-canonical-draft-20260925/v1` (manifest `bb6be609…`, commit `083be9a`) is accepted: independent review cycle 1 required repairs (3 blocking, 20 should_fix, 15 notes), cycle 2 accepted (1 should_fix, 4 notes, all applied), and root accepted it for the canon compile (`a7f5bb5f…`). The records are on branch `replan-v8-canonical-draft-20260925` (tip `3928dd6`) of `sittingmongoose/PuppetMaster-Packages`. That branch is merged to the repository's `main` (`3928dd6`).
- Owner prose (task 1): `94585533b`. Companions (task 2): `48a2b6840`: the 74 files byte-identical to the package, the registry at `45e383b2…` (328 families), the eight re-pins and the index section. The report and its `a1/` bundle are the commit after them. The shard check passes, and the census unit tests run 95 OK.
- `Plans/.plan_index/node_readiness_report.json` is deliberately left at `main`'s version. The cloud session lacks the gitignored currentness receipt, so regenerating it here rewrites rows for documents A1 does not edit. The lander regenerates it (below).
- Next: one blind form-driven review of the canon branch, cycle cap two, then the handover for landing.

**Decisions.** `a1/author-decisions-20260925.md`, ratified by Jared on 2026-09-25; the review questions were ruled by the independent and root reviews. O-13 (retention): root raised no card; the ruling is stated in the report for Jared's confirmation under DL-045.

**Open questions.** O-13 confirmation (Jared); O-20 / A0 Q-01, child goal runs (Goal Runtime owner, Jared); U3-Q7 (Storage owner, before A2); Q-U4-05, Q-U4-07, Q-U4-08; A0 Q-04, Q-07, Q-08 and the blocked trigger (A3); A0 Q-10: the narrow Replan v3 root review `13437dc7…` and the full prebirth plan exist only on the NAS, the cloud session did not read them, and canon cites the prebirth plan by hash only (`21e672ca…`) and does not cite the root review; read both on the VM before landing, or record that A1 relies on them by hash only (A1 lander, on the VM).

Cost: to be filled by the host

**Rebase note.** This branch is rebased onto `origin/main` `63cf2cb97`, where A0 has not landed. Its `STATUS.md` repeats A0's section, so if A0 lands first the rebase conflict on this file resolves by keeping this branch's version.

## Landing A1 (on the VM)

A local session that Jared designates lands the branch. Prerequisites:
- A0 (`plans/replan-v8-a0-20260925`) is on `main`, and so is `plans/replan-v8-process-answers-20260925` (`616f12bfd`). The placed `composition.json` cites both report files.
- If `main` has moved past `63cf2cb97f` in any file the package binds or in the storage census (or in a relied-on passage or a file A1 edits), run the package's `scripts/rebase_check.py --landing-base <new main>` and re-derive the re-pins before landing.
- The node readiness report is regenerated after the rebase with the currentness receipt present, and committed with the landing, never hand-merged (precedent: Step 8(d) review A-08).

    mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held   # then write agent, branch, UTC time to held/holder.txt
    git -C /mnt/Cursor/PuppetMaster fetch origin
    # in a fresh full worktree of the branch: git rebase origin/main (with A0 and the process answers on main)
    #   re-check the 13 unit IDs against origin/main and every origin/* branch
    #   link the ignored currentness edition from the shared checkout, as the certified-anchors landing did:
    #   ln -s /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness Plans/.audits/
    #   python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json
    #   python3 scripts/pm-plan-index.py generate
    #   git status --short          # only Plans/.plan_index/: node_readiness_report.json gains the 13 units;
    #                               # other index files change at most generated_at_utc; anything else stops the landing
    #   python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
    #   python3 scripts/pm-plan-index.py validate   # no stale_generated_index_artifact
    #   git add Plans/.plan_index/node_readiness_report.json && git commit   # the regenerated readiness report
    #   python3 -m unittest tests.test_pm_onboarding_phases tests.test_shared_runtime_storage_contracts tests.test_pm_assistant_contract_closure
    #   sha256sum Plans/storage_value_registry.json   # 45e383b2aedf8056cc21d300d96d44c3088e91f93d0d8f3a46415e965db94c13 while main is at 63cf2cb97f
    #   push the branch again (it moved)
    cd /mnt/Cursor/PuppetMaster && git status --short   # must show nothing in any file the branch touches
    git merge --ff-only origin/plans/replan-v8-a1-20260925
    python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
    python3 scripts/pm-landing-check.py --base origin/main --keep-check-reports /mnt/Cursor/PuppetMaster-Evidence/landing-checks/replan-v8-a1-20260925
    git push origin main        # or, if anything stops the landing: git reset --keep origin/main
    # landing record: reports/landing-checks/LANDING_<date>_REPLAN_V8_A1.md
    rm -r /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held
    git push origin --delete plans/replan-v8-a1-20260925

**Expected landing check.** Exit 1 with 0 blocking items. The rows naming this branch's files should be governance staleness only: Spec Lock `stale_hash` for the edited documents, the registry and the readiness script; `artifact_hash_stale` evidence and plan-graph rows for the edited documents and their shards; currentness drift; the PNC-019 source hashes; run-002 batch rows; the readiness report; the current snapshot. Any other failure on the branch's files stops the landing. The node readiness report must be regenerated with the receipt present and committed before this check. A `stale_generated_index_artifact` on it means that step was skipped or ran without the receipt; redo it on the branch before pushing `main`.

**Reseal items** (report, "Reseal request"). Spec Lock for `Executor_Protocol.md`, `Goal_Runtime_System.md`, `Contracts_V0.md`, `storage-plan.md`, `Automated_Testing_System.md`, `00-plans-index.md`, `storage_value_registry.json` and `scripts/pm-implementation-readiness.py`; the plan-sharding evidence rows; readiness; R-1 carried from A0 plus the new `Executor_Protocol.md` and `Backup_Restore_System.md` members of `goal_certified_family_composition.json` and the consumer's `owner-sources.json` line 29 and `source-citations.json` C10 to C12; the PNC-019 source hashes of the four edited source paths; the currentness edition; run-002 rows and `snapshot-current`. R-2 (`goal_run_cancelled_consumer_schema_resources.json`, two `native_consumer` rows) is for that file's owner.

## Next

The blind form-driven review of the A1 canon branch, then its handover for landing after A0 and the process answers. After A1: A2 (consumer adoption) and A3 (the Event contracts and registry rows, each with its own DL-036 card).
