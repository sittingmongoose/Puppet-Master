# Landing record: TestOpus5.5 Guided Tour, milestone M2, 2026-09-24

Branch `concept/testopus55-tour-m2-20260924`, rebased onto `main` `9f0da5c2b1`, concept tip `8e6e80a2dd`; this
record is one report-only commit on top. The branch touches 17 paths, all `Concepts/onboarding/opus-5.5/**` plus the
generated `Concepts/TestOpus5.5PmConcept.html`; no `Plans`, `scripts` or `tests` file.

## Procedure

1. Landing lock taken at 2026-09-24T16:26:50Z, before the fetch, and held through the fast-forward, the checks, the
   push of `main` and the worktree removal.
2. `git fetch`, `git rebase origin/main`: clean. `tools/build.py --check` passes on the rebased tree.
3. Pre-check in the branch's own worktree (full tree, `git sparse-checkout disable`):
   `python3 scripts/pm-landing-check.py --base origin/main` exits 2 with **0 rows naming a path this branch
   touches**. Its totals (run-gates 3,288, audit-governance 3,272, plan-migration-validate 33,072, evidence and plan
   graph 876) differ from the shared checkout's only by what exists there and not in a fresh worktree: the 16
   `json_syntax` `raw_capture_manifest_path_unresolved` rows name capture paths under the git-ignored
   `tests/agent_packet_restrictions` symlink.
4. Shared checkout: `git merge --ff-only` to this record's commit, then the shard check and the landing check,
   then the push in the same step. The push goes ahead only if that run names none of the branch's paths and every
   total equals what `main` recorded at the storage owner closeout landing (`LANDING_20260924_STORAGE_OWNER_CLOSEOUT.md`:
   run-gates 3,279, audit-governance 3,279, plan-migration-validate 33,072, evidence and plan graph 876);
   otherwise `main` is reset back with `git reset --keep origin/main`. The five items the baseline `75bcda93bc` does
   not excuse are `main`'s own, classified in that record (evidence and plan-graph rises 665 → 876, the Spec Lock
   storage bucket 1 → 2, and the plan-migration staleness rises). No reseal request comes from this landing.

## What landed

The Guided Tour for `Concepts/TestOpus5.5PmConcept.html`, rebuilt in the real app (details in
`Concepts/onboarding/opus-5.5/README.md`): Ask and understand (Chat, Teacher, the local answer, ELI5 rewriting the
same answer), Make the workspace yours (the orientation glide, docking Chat, adding and placing the Approval queue
widget), and Plan before building (the Wizard by its visible route, the practice goal, outcomes, the access question
with Why this matters, review, the plan read part by part, the answer edit that changes only the affected decisions,
the fenced Approve And Build, Restore or Keep). The onboarding's Ready screen hands over by turning its window into
the tour's first callout.

## Results (recorded here, not as files)

Jared asked on 2026-09-24 that recorded media (screenshots, contact sheets, film frames, videos, audio) be deleted
when the work is finished, so no evidence directory is cited for M2; what was seen is written down instead.

- `tools/tour_scenarios.mjs`, real CDP input, final build: **t1–t5 pass** (every step by hand then Restore; every
  action through Show Me then Keep; Skip restores everything; resume after a reload; a missing target offers Take
  me there). Each run asserts zero fetch/XHR requests, an unchanged usage ledger and chat context, that no raw copy
  key ever shows, that a settled callout never covers its target, and (t1) that the dashboard returns exactly to its
  snapshot with the catalog offering the Approval queue again.
- `tools/tour_shots.mjs`: every step in all eight themes at 1600×1000, four themes at 760×900 and four at 390×844,
  reviewed by eye. Defects found and fixed on this branch: a raw copy key on the intro; the activity-bar Chat icon
  hiding the Files panel (the shell keys it on a stripped `title`); a dashboard restore that silently did nothing;
  callouts covering their targets, moving twice, sliding under the learner's click, or overlapping the tour bar on
  narrow windows; the drop zone being too faint; a false "target missing" while dragging; the app's hover tags
  stacking on the callout; an unreadable glass practice button; a focus ring on the callout heading; and narrow
  windows where no dock could be reached by dragging, the Wizard tab folded into a menu, and Chat covered the Wizard.
- `tools/tour_film.mjs`: 16 moments filmed at 60 fps in slow motion in six themes (Glass partly), reviewed frame by
  frame; `tools/motioncheck.py` passes all 64 films in the four fully filmed themes (no flash, no blank dip). The
  Show Me pointer now moves like a hand (time by distance, per-family ease, the cue during travel): opening Chat
  completes in about 0.9 s instead of 1.5 s.
- `tools/tour_census.mjs` on the real tour: 14 meaningful actions, 7 in Planning (50 %); 4.5 minutes at 200 words a
  minute, 53 % of it in Planning. The packet asks for at least half of both.
- Canon: the onboarding carries F3-520's eleven-stage main graph and six-stage connect graph; the tour resumes after
  a reload as F3-521 asks.
