# Replan v8 (Step 8(b) Group A): status

The thread runs in a cloud session, which cannot reach the NAS or the shared checkout. Each branch is therefore pushed reviewed and handed over for landing here. The next branch is cut from `origin/main` meanwhile.

## A0: `plans/replan-v8-a0-20260925`

**What it does.** It re-adjudicates the combined Replan v8 source v3 (`9ed8ba4f…`) against `main` `a6480b0f7c`. The frozen currentness review had compared it against `4a72aa12`, which is not on `main`. This is a report only. See `A0-currentness-placement-20260925.md`, with its evidence under `a0/`.

**Result.**
- **Currentness: PASS.** Every change since the pinned bases is adjudicated.
- **A new conflict.** DL-076 now conflicts with the proposed family `draft_replan_release` (P-01).
- **Placement: CONDITIONAL.** Eighteen conditions for A1 are listed in section 8. Three are marked "decide first" because they change the v8 digest.
- **The package's own checks reproduce.** With the real `jsonschema`/`referencing`, every counted figure matches and every PASS output is byte-identical to its frozen file.

**Review.** Pending: one blind form-driven review, capped at two cycles.

**Open questions.** Q-01 to Q-12 in the report. Four need Jared:
- Q-02: DL-078 and row revisions.
- Q-03: DL-077 records for families among the original 37.
- Q-09: what "B01" is.
- Q-12: may A1 install with D06 unavailable?

## Landing A0 (on the VM)

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

**Reseal items.** None are caused by this branch. It carries forward R-1: the certified-family pins that were already stale on `main`.
- `goal_certified_family_composition.json` members `00-plans-index.md`, `Goal_Runtime_System.md`, `storage-plan.md` and `storage_value_registry.json`.
- The consumer's `owner-sources.json` and `physical-retention-install.json`.

The 2026-09-25 landing record asks only for the `Goal_Runtime_System.md` member.

## Next

A1 (install v8 with the Stop route, through a new canonical-draft package) is cut from `origin/main` after A0's review. Its authority to start is this thread's charter, Jared's decision of 2026-09-24 to run Group A. DL-080 records only that the work is needed. The three "decide first" choices (P-09, P-10, P-11) are settled in the canonical-draft package and its review.
