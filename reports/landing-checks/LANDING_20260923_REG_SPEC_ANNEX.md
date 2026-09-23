# Landing record — BSD registration-spec annex wave — 2026-09-23

**Branch:** `fix/bsd-registration-spec-2026-09-23` (1 commit `7d125ac476f981fd15e8ea4b1d2a2efbb19ec1bb` on main `a8abc1368a`)
**Main:** `a8abc1368a5665f4b2e66caeb00e313d184e7bb5` → `7d125ac476f981fd15e8ea4b1d2a2efbb19ec1bb` (ff-merge; pushed: single `git push origin main` via dual pushurls; GitHub + TrueNAS ls-remote verified)
**Environment:** VM worktree `/home/sittingmongoose/pm-worktrees/bsd-reg-spec-2026-09-23` (full checkout); no git against the share from Windows paths.
**Scope:** reports + one test-list correction (tripwire 10→11 ids) — zero canon edits, zero derived regeneration, no new reseal need. Suite 38/38; shard-check 0; plan-index validate 0.

## Purpose (post-acceptance advisory follow-up)

1. **Exception-mechanics ground added to `CCR-01-REG`:** the DL-039 scoped exception excuses only findings "also present on main with the same error, path and family" — six newly registered BSD families would mint per-family readiness findings absent from main, outside every existing exception, requiring a fresh central ruling independently of the stale validator pins. Registration is not landable by a repair wave on two independent grounds.
2. **Ready-to-apply registration-spec annex:** `reports/assistant-contract-closure-2026-09-22/bsd_family_registration_spec.md` — ordered prerequisites (owner-lane pin repair first), six proposed family rows (sibling-convention key shapes, value-schema refs into the materialized defs, tiers), nullable-field lists, secondary-index requirements, replay/recovery/migration proposals (`canonical_non_rebuildable` + mandatory backup per the restart-restoration obligation), retention requirements (indefinite closure/quarantine evidence per the disposition `expiry_rule`), readiness pin deltas (294→300, materialized +6, policies 24-pin vs live 27), the same-change test-pin update requirement, and explicit non-changes (event policy, handler_unavailable, non-folding). Marked PROPOSAL INPUT throughout — binds nothing, registers nothing.
3. **Definition-less blocked set corrected 10→11** (`QuestionnaireEnvelope`, the third Q-lane durable record of the wave-1 ACC-ST-03 mapping, added to the tripwire and every enumeration; verified absent from all schemas/registry before pinning).
4. **`UNVERIFIED.md` whole-file wave-2-staleness sweep** (§2 readiness/reseal/baseline state, §3 all three waves' landing outcomes, §6 reviewer roster incl. the finish-pass/annex-wave no-separate-review disclosure, §7 DEP-02 landed + VM-worktree instruction) and **changed_paths wave-3 sha256 backfill** (five entries serialized before their files were final) + wave-4 section.

## Checks

| Check | Tree | Exit | Result |
| --- | --- | ---: | --- |
| `pm-landing-check.py --base origin/main` | VM worktree, frozen head `7d125ac476`, baseline `75bcda93bc` | **1** | Checker's own verdict: **"Nothing reported stops the landing: it is new but names no file this branch touched, so report it to Jared; and a subcheck that reports more than the baseline, with every failure still printed."** Naming a path this branch touches: **0**. New-since-baseline 22 (the off-branch environmental class reported since wave 1: 16 `raw_capture_manifest_path_unresolved` + truncated-rise rows), gone-since-baseline 3 — reported to Jared per the exit-1 rule; nothing fixed to pass, no baseline refresh. Log `w4_landing_check.log`. |
| `pm-shard-plans.py --check` | shared checkout after ff, before push | **0** | pass, 99 sources (`w4_shared_shard.log`) |
| `pm-landing-check.py --base origin/main` | shared checkout after ff, before push | **0** | **"Nothing to report. The three checks found only what the baseline already knew."** (`w4_shared_landing.log`) |

Pre-merge scans: branch paths (6) vs shared-checkout dirty entries — **zero intersection** (`w4_branch_paths.txt` / `w4_shared_dirty.txt`).

## Cleanup

VM worktree removed after the push; local branch deleted (merged); remote branch retained at `7d125ac476` per precedent. Evidence: `w4_*` logs + this record snapshot in `/mnt/Cursor/PuppetMaster-Evidence/tests/bsd-lifecycle-closure-20260923/`.

The wave-2 reseal request (four canon documents + two DEP-02 scripts) stands unchanged; this wave adds no reseal need.
