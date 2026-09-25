STATUS: handover, 2026-09-25. The DL-039 Steps 8-9 agent (under the coordinator's thread) stopped on Jared's change of plan: the Event Authority program moves to its own session. Last completed step: the SP-286 repair round (`plans/ea-browser-pair-sp286-20260924` at `d08075c7c7`, pushed). Last landing: the 8(d) anchors (`main` `9507c8d2e8`, record `a6480b0f7c`). No work is in progress and no lock is held.

# DL-039 Steps 8 and 9: handover, 2026-09-25

## Landed on `main`

| What | `main` | Record | Landing check |
|---|---|---|---|
| Step 9 batch 1 (DL-074/075 applied) | `41fbecb612` | `bc1d99c11e` | exit 0 |
| DL-077 and DL-078 | `8650c2f9e8` | `ac9c0ad2e4` | exit 1, staleness only |
| 8(a) depth assessment `ba9b84f9...`, DL-079 to DL-083 | `3ce6eb882c` | `38b8c1301d` | exit 1, staleness only |
| Step 8 remaining-work plan | `b359936728` | `2cdd280768` | exit 1, `main`'s staleness |
| DL-077 validator amendment: validator `190a86f2...`, receipt `dceb7f21...`, 3 admission records | `2b73d6b7c0` | `a7869662e7` | exit 1, `main`'s staleness |
| 8(d) `goal_run.certified` owner anchors (GRS payload minima, SP-214, SP-214-A006) | `9507c8d2e8` | `a6480b0f7c` | exit 1, staleness only; evidence and plan graph keyed from exports |

## Branches and their state

- **`plans/ea-browser-pair-sp286-20260924` at `d08075c7c7`** (8(c), first half; on `main` `a6480b0f7c`; worktree `~/pm-worktrees/ea-browser-pair-sp286-20260924`).
  - Review cycle 1 repairs S-02 to S-10 are applied, one commit each. Section 15 equals the reviewer's tested proposed file plus the two S-08 entries.
  - Report: `reports/event-authority-20260911/step-08-browser-pair-sp286-20260924.md`.
  - Next: blind review cycle 2 (review directory `~/PM-Experiments/review-ea-browser-sp286-20260924/`), then the landing on the coordinator's go.
  - Expected at landing: exit 1, with +30/+30 evidence and plan-graph rows, +1 readiness row and +3 run-002 rows.
- **`plans/ea-browser-created-v2-current-20260924` at `05daf756bc`** (8(c), second half; built on SP-286's old tip `2df56dd8a9`; worktree `~/pm-worktrees/ea-browser-created-v2-current-20260924`).
  - It moves Browser-created to the v2 checkpoint: the storage row, admission binding, SP-266, SMPFS-167 and the validators. Report: `step-08-browser-created-v2-current-20260925.md`.
  - Not yet reviewed. It also edits SMPFS-167, so after SP-286 passes cycle 2 it is rebased onto SP-286's tip, then blind-reviewed.
  - It lands after SP-286. The exports repair it was waiting for is now on `main`.
- **Withdrawn: `fix/ea-compaction-pm7-validator-20260924`** (tip `a3f68cbaf0`).
  - The packet-canon-closure thread's stricter `96ab84f13c` carries the fix.
  - It is deleted on both remotes and locally. It is kept as the bundle `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/compaction-pm7-withdrawn-20260925/fix-ea-compaction-pm7-validator-20260924.bundle`, SHA-256 `372d481facbc82b77b85c8560366468509e75b7b51bcd78c3697a0637d2ca5d8`, which requires `ac9c0ad2e4`.
  - Its review: `~/PM-Experiments/review-ea-compaction-pm7-20260924/`.

## Step 9 count and the next batch

- **Count after batch 1:** 0 registered, 7 excluded, 0 carded, 245 remaining, all TECHNICAL_BLOCKED. Batch 2 was not started.
- **Next batch** (largest owner group): the 40 rows owned by `Plans/orchestrator-subagent-integration.md`.
  - `coordination.` (7): `agent_registered`, `agent_status_updated`, `agent_operation_updated`, `agent_file_ownership_updated`, `agent_unregistered`, `agent_crashed`, `agent_aborted`.
  - `crew.` board (3): `board_message_posted`, `board_message_read`, `board_messages_archived`.
  - `crew.` lifecycle (6): `formed`, `member_added`, `member_removed`, `coordination`, `completed`, `disbanded`.
  - `subagent.` (21): `spawned`, `started`, `completed`, `failed`, `cancelled`, `timeout`, `paused`, `resumed`, `progress`, `tool_called`, `tool_completed`, `message_sent`, `message_received`, `output_truncated`, `retried`, `context_warning`, `model_switched`, `budget_warning`, `escalated`, `spawn_requested`, `spawn_completed`.
  - Diagnostics (3): `phase.force_completed`, `config.validation.failed`, `parser.error`.
- **Unreviewed evidence map**, from a read-only survey of `main` `d30bbc95e8`: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-batch2-evidence-map-20260925/evidence-map.md`, SHA-256 `7d4a6b509421624f3c9b09ca57c3f36c1f8281bc566dc2a8327e5428f13a7959`. It suggests:
  - the 7 coordination rows can be registered with no product question (retention `RP-COORDINATION-180D` is bound);
  - the other 33 wait on three draft product questions: retention for child-run, crew and diagnostic histories; retiring the six crew lifecycle events in favour of `collaboration.*`; retiring the two spawn-request events.
  - The drafts are not DL-036 cards and nothing has been shown to Jared.
- **Registration procedure (DL-077, DL-078).** Each family needs:
  - a full contract;
  - a blind review;
  - its own landing, one family per landing;
  - the coordinator's go;
  - in that same landing, its DL-077 admission record, which needs a depth row with all twelve criteria at PASS, plus the checkpoint constants and test pins moved under DL-078.

## Standing rules

- **Card freeze.** A card file is frozen at the bytes Jared sees, with its hash recorded at presentation. Any later change to what it covers is a new card or an addendum, never an edit.
- **Evidence directories** are never rewritten. A re-run writes a new dated subdirectory.
- **Currentness is per family (V-10).** A record's assessment row is current when its `family_id` and `family_revision` equal the live registry row.
- **The V-07 re-pin rule.** A later change to a pinned registry row, the DL-040, DL-046 or DL-077 section, the assessment or the receipt re-pins the admission records in the same landing.
- **D-07.** A registration landing regenerates only the derived plan index. The gate report is left to the reseal.
- **One reseal** for the whole wave, by the designated Plans agent.
- **Decision Log numbers** are taken at landing, after a fetch.
- **Product decisions are Jared's,** on DL-036 cards.

## Reseal list (one reseal, the designated Plans agent)

- **Plan-sharding bundle rows:** `Decision_Log.md` and its 10 shards (11), `Goal_Runtime_System.md` and `storage-plan.md` with their 130 shards (132), and later Section 15 and its 29 shard files (30).
- **Spec Lock:** `Goal_Runtime_System.md` and `storage-plan.md`.
- **The certified-family pins:** the composition manifest's GRS member (`ccedade9...` to `f233eb9c...`), the storage-plan member (`328858615b...`, already stale) and citations C01 to C05. Also the PNC-019 hash for GRS.
- **Currentness:** an edition covering `Decision_Log.md`, both anchor documents and later Section 15. Until then `test_pm_pnc019_currentness` fails.
- **Run-002:** Decision Log row 43, storage-plan rows 173 to 180, later Section 15 rows 168 to 170, and the final summary (6,728 PlanUnits).
- **The readiness gate report and the migration snapshot.**

## Open questions

- **For Jared:**
  - the V-09 `.gitignore` line `!/tests/test_event_authority_holding_bucket.py`;
  - DL-083's Platform part;
  - 8(b) Group A (Replan v8) go. Group B stays uncompiled until its roles have sources;
  - compaction C-04 (a legacy-alias guard) and C-05 (the ATS-037 checker and `tests/fixtures/pm7_shared/assistant_context_continuity.json` still expect zero events for a ring-revision-changing Compact Now, contradicting DL-040 and ATS-040). These go to the packet-canon-closure thread. The authority for PM7 validator edits is ATS-040 (`Automated_Testing_System.md` line 3701).
- **Recorded, not blocking:**
  - mutation survivors M9, M16 and M17;
  - procedure questions D-05, D-02, D-08, D-12 and 7;
  - the depth42 application record's line-40 wording;
  - anchors A-10 (no executable check reads SP-214-A006);
  - SP-286 A005 and A006 have only a named native obligation;
  - the certified registry anchors still name the old sections and move with the next approved registry revision;
  - DL-082's worknode follow-up;
  - the DL-079/080/081/083 owner follow-ups in `step-08-depth42-card-answers-20260924.md`.

## Commands to resume

```
cd /mnt/Cursor/PuppetMaster && git fetch origin
# existing worktrees: ~/pm-worktrees/ea-browser-pair-sp286-20260924, ~/pm-worktrees/ea-browser-created-v2-current-20260924
# a new worktree: see .claude/CLAUDE.md "Where to work"; then, for any check that reads the currentness audit:
ln -s /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness Plans/.audits/event-authority-2026-08-13-currentness
# after any Plans/*.md edit, in the worktree:
python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json && python3 scripts/pm-plan-index.py generate
python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json && python3 scripts/pm-plan-index.py validate
# rebase conflicts in Plans/.plan_index: take main's, regenerate, never hand-merge
git checkout --ours -- Plans/.plan_index/   # then the two generate commands, git add Plans/.plan_index Plans/_shards, git rebase --continue
# landing (shared checkout, under /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held with holder.txt):
git merge --ff-only <branch> && python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence dir>/check-reports
git push origin main && git push truenas-backup main   # or git reset --keep origin/main on exit 2
# the independent seal validator rewrites its tracked receipt; run it only through
python3 ~/PM-Experiments/event-authority-step8-9-20260924/validator-amend/run_validator_harness.py
```

The session log is `~/PM-Experiments/event-authority-step8-9-20260924/SESSION_LOG.md`.
