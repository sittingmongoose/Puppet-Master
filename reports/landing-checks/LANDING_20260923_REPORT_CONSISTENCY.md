# Landing record — closure-report consistency amendment — 2026-09-23

**Branch:** `fix/closure-report-consistency-2026-09-23` (1 commit `9367ad3e5cb7bf14341ec63c61e5dac3db00f58c` on main `ca6c5db70f`)
**Main:** `ca6c5db70f8b4fd52533f12635e5561c05d031df` → `9367ad3e5cb7bf14341ec63c61e5dac3db00f58c` (ff-merge; pushed: single `git push origin main` via dual pushurls; GitHub + TrueNAS ls-remote verified)
**Environment:** VM worktree `/home/sittingmongoose/pm-worktrees/report-consistency-2026-09-23`; no git against the share from Windows paths.
**Scope:** reports-metadata only (2 files) — matrix evidence hashes/pointer counts and changed_paths sha256 backfill + wave5 section. Zero canon, test-content, or fixture changes; no derived regeneration; no reseal need. Suite re-run for sanity: 38/38 OK.

## What was fixed (post-acceptance advisory, all five defects verified on published main before fixing)

1. `CCR-01-REG` + `CCR-02-RESIDUAL` evidence: test-file sha256 refreshed to the tripwire-11 version (`c0eb5ce2…`; the stale `2747de4a…` predated the annex wave's QuestionnaireEnvelope addition).
2. `CCR-01-REG` annex evidence entry: sha256 filled (`7b9c2db1…`; was null).
3. `CCR-02-RESIDUAL` pointer text: "ten quoted schema_ids"/"enumerates all ten" → eleven (matching the landed tripwire list).
4. `changed_paths` wave3+wave4: UNVERIFIED.md sha256 refreshed to the post-heading-fix bytes (`7855f8bd…`) and matrix sha256 to the post-amendment bytes.
5. New `wave5` section recording this amendment.

## Checks

| Check | Tree | Exit | Result |
| --- | --- | ---: | --- |
| `pm-landing-check.py --base origin/main` | VM worktree, frozen head `9367ad3e5c`, baseline `75bcda93bc` | **1** | Checker's own verdict: **"Nothing reported stops the landing: it is new but names no file this branch touched, so report it to Jared; and a subcheck that reports more than the baseline, with every failure still printed."** Naming a path this branch touches: **0**; gone-since-baseline 3. New off-branch items are the standing environmental class (16 `raw_capture_manifest_path_unresolved` + truncated-rise rows) reported to Jared per the exit-1 rule; nothing fixed to pass, no baseline refresh. Log `w5_landing_check.log`. |
| `pm-shard-plans.py --check` | shared checkout after ff, before push | **0** | pass, 99 sources (`w5_shared_shard.log`) |
| `pm-landing-check.py --base origin/main` | shared checkout after ff, before push | **0** | **"Nothing to report. The three checks found only what the baseline already knew."** (`w5_shared_landing.log`) |

Pre-merge scan: branch paths (2) vs shared-checkout dirty entries — **zero intersection** (`w5_branch_paths.txt` / `w5_shared_dirty.txt`).

## Cleanup

VM worktree removed after the push; local branch deleted; remote branch retained at `9367ad3e5c`. Evidence: `w5_*` logs + this snapshot in `/mnt/Cursor/PuppetMaster-Evidence/tests/bsd-lifecycle-closure-20260923/`. The wave-2 reseal request stands unchanged; this wave adds no reseal need.
