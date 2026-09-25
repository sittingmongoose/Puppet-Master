# Replan v8 (Step 8(b) Group A): handoff at a stop, 2026-09-25

The cloud host thread for Replan v8 stopped on Jared's instruction on 2026-09-25: "when its safe, come to a stop. We are going to handle all this work with a different process."

This record says where every branch stands, which decisions Jared made, which questions are open, and what the design work found. The designs in this directory are working documents. Only the parts of them named below as Jared's answers are decisions; everything marked "prop." is a proposal.

The work was stopped at a safe point:
- Nothing was pushed half-done except one packages-repo branch, which is named as work in progress.
- The canon working tree was clean.

## Branches

| Branch | Tip | State |
|---|---|---|
| `plans/replan-v8-a0-20260925` | `632f557c0` | A0 currentness and placement report. Blind review ran two cycles and found it ready. **Ready to land.** It must land byte-identical: report SHA-256 `297b0f29…`. |
| `plans/replan-v8-process-answers-20260925` | `616f12bfd` | The PM process thread's answers (Q-02, Q-03, Q-09, Q-12, package home). Must land byte-identical (`8c16d369…`) before A1. |
| `plans/replan-v8-a1-20260925` | `31c0a086c` (reviewed content at `e8d61ace4`; one STATUS note after it) | A1 installs `all_writers.v8` as source contracts: 13 units, 74 placed files, 34 storage rows, 8 census re-pins. Blind review ran two cycles and found it ready. **Not landable as it stands**; see "A1 needs a rebase". |
| PuppetMaster-Packages `main` | `3928dd6` | A1 canonical-draft package v1 (manifest `bb6be609…`), with its independent review (two cycles) and root acceptance. |
| PuppetMaster-Packages `replan-v8-canonical-draft-20260925-rebase1-wip` | `e37921e` | **Unreviewed, incomplete.** Two tooling commits from the stopped rebase. `344fd08` moves BASE to `bd95afcc8c` and locates the census re-pins by content. `e37921e` makes C08 part 1 exclude the A1 program branch. No rebuilt output and no re-freeze. |
| `plans/replan-v8-handoff-20260925` | this branch | This record and the design documents below. |

## A1 needs a rebase before it can land

- `origin/main` moved from `63cf2cb97f` to `bd95afcc8`. The move is another thread's first Step 9 registration, `coordination.agent_registered` (DL-094, event registry `2026-09-25.1`, 43 families).
- That landing changed six files A1 also edits:
  - `Plans/storage_value_registry.json`: three pattern edits, still 294 families;
  - `Plans/storage-plan.md`;
  - `Plans/Contracts_V0.md`;
  - `Plans/Automated_Testing_System.md`;
  - `scripts/pm-implementation-readiness.py`;
  - `tests/test_pm_onboarding_phases.py`.
- The package's `scripts/rebase_check.py --landing-base bd95afcc8c55b9140f08b72c6bfa47f3fa01f44f` gives `BUILD_FAILED` at stage `author`: "census re-pin lines in tests/test_pm_onboarding_phases.py are [314, 315], the landing base holds them at [312, 313]".
- Root acceptance condition 1 therefore applies in full. It requires:
  1. rebuild and re-run `run_all.py`;
  2. re-freeze and record every base-derived change;
  3. review the changed package;
  4. recompile the canon branch from the new manifest;
  5. review the changed canon edition.
- **The v8 descriptor digest will change.** `owner-sources.json` and `source-citations.json` are digest members, and they pin base files that moved. The A2 critic saw the stopped rebuild give `0da022d2…` in place of `7b22c1f4…`. So CV-354, ATS-059 and every text that quotes the digest change with the rebase.
- The A1 STATUS on its branch carries the same note.

## Jared's decisions on 2026-09-25 (DL-036 cards, full text in `a3-stopped/cards-C2-C4-20260925.md`, SHA-256 `057b6e47…`)

- **C-2** `EA-A3-GOALRUN-STOPPED-MEANING-001`: option 1. Pause and Abort Run both record `goal_run.stopped` (`user_stopped`) and latch the run's Goal Stop. Pause can resume later through replan; Abort cannot resume. The Debug "Cancel investigation" keeps its own `cancelled` meaning. ("Recommended is good for c-2 and c-3")
- **C-3** `EA-A3-GOALRUN-STOPPED-INFLIGHT-001`: option 1. New work is blocked at once. Running steps finish under their own owners, and the run is recorded stopped once it is quiet.
- **C-4** `EA-A3-GOALRUN-STOPPED-PROFILES-001`: option 2 (asked, re-presented, then approved: "approved").
  - No stop writer is reserved in v8.
  - A1 lands as reviewed.
  - The stop writer and the blocked writer go into a later `all_writers.v9`.
  - v8 births never record `goal_run.stopped` or `goal_run.blocked`.
- **Effort levels:** workers run at high effort, reviewers at extra high, and nothing runs at maximum.
- These answers are not yet Decision Log entries. The process answers (Q-02) say each answered card is recorded before the work that relies on it lands.

## Open questions and cards not yet answered

- **`EA-A2-SCOPE-V9-001`** (presented, unanswered; `a2/card-A2-scope-20260925.md`, SHA-256 `e66db1ec…`): fold the v8 consumer adoption (A2) into a single v9 adoption. The recommendation is yes. It would save about 15 to 23 agent-hours and 2.2M to 3.5M output tokens. On v8 runs only "started" could ever show in the run history.
- **Cards B-1 to B-3 for `goal_run.blocked`** (drafted, not presented; `a3-blocked-v9/A3-blocked-design.md` §7):
  - B-1: which situations count as a blocked run;
  - B-2: whether the Goal also shows blocked (rec. no);
  - B-3: whether to record blocked in v9 with Abort as the only exit until run replan exists (rec. yes).
- **B-1's recommendation is not settled.** `a3-blocked-v9/owner-questions-B1.md` proposes:
  - option 1 is unsound;
  - option 2 is needed, with v9 admitting the canon dependency `record_failed.v1`.

  Its blind critique (`owner-questions-B1-critique.json`) found it **unsound**: 1 blocking finding, 7 should_fix and 3 notes. The critique was not applied because the work stopped there. The blocking finding, OQ-01, says the TB-26 ruling does not make an ordinary v9 run quiet enough for a C-3 stop. OQ-08 says Jared's approved C-3 promise may conflict with "no native completion after Stop".
- **A2 design cards:**
  - C-A2-1: Replan finishes only on v9 runs. It is answered by `EA-A2-SCOPE-V9-001` option 1.
  - C-A2-2: certified results for v8 runs wait for v9. It is conditional.
- **The P-02 stored-token name ruling** needs Jared's answer or a new delegation. DL-076's delegation covered only two Storage owner questions (A2 critique A2C-05).
- **DL-045 retention confirmations:** A1 O-13, and the A2 projection rows reuse `RP-PROJECTION-3GEN@1.0.0`.
- **Other open lists:**
  - A1's open questions, in its report;
  - T-01b, T-02 to T-27 (stopped design and addendum);
  - TB-01 to TB-27 (blocked design);
  - OT-/PR- items (A2 design);
  - Q-V9-* (v9 plan).

## What the design work found

1. **The v8 native roster is success-only.** Each WorkNode gets one attempt. No v8 method records a failed check, a retry, a repair or a step that waits (A1 native-v8 `protocol.md` 129, 163, 169). v9 carries this forward unless it adds writers.
2. **Replan cannot finish on v8.** The v8 Replan release input is the output type of A1's separate draft projector (`grscrg_`). No member of the one `goal_run_projection` chain can produce that type (A2 design §2.5, R2 F-1).
3. **Stopped and blocked need v9** (C-4). The stop writer needs a quiescence proof. Whether an attempt left `verify_pending` after a failing verifier counts as running (TB-26) decides whether a stop can ever complete on such a run.
4. **What puts a run into blocked is undefined in canon** (Q-09), and on v9 runs only a failed check with no way on can reach it (blocked design §2.3a).
5. **Proposed projection chain:**
   - v5 (current);
   - v6: A2, or the v9 adoption if A2 is folded;
   - then one successor for the stopped and blocked branches on v9 births;
   - then replanned.

   DL-080's order (stopped and blocked before replanned) holds under every variant.
6. **Proposed order of work:** A0 and the process answers land, then A1 rebased, then stopped source contract, then blocked source contract (after B-1), then the v9 package and compile, then the adoption, then the stopped and blocked row revisions (one Q-02 card each), then replanned.
   - Estimates (prop.): v9 profile 18 to 30 agent-hours; everything to live stopped and blocked Events 50 to 80 agent-hours; A2 15 to 23.5 agent-hours.
7. **Collision risk:** a DL number collision between other threads is reported on main (DL-099 at risk). Re-check unit IDs and DL numbers against every origin branch before any landing.

## Contents

| Path | What it is |
|---|---|
| `a3-stopped/A3-stopped-design.md` | The `goal_run.stopped` design, written before C-2 to C-4 were answered |
| `a3-stopped/cards-C2-C4-20260925.md` | Cards C-2 to C-4 with Jared's answers and the C-4 re-presentation |
| `a3-stopped/S1-*.md` … `S5-*.md` | Its five evidence notes |
| `a3-blocked-v9/A3-stopped-design-addendum.md` | What C-2, C-3 and C-4 change in the stopped design |
| `a3-blocked-v9/A3-blocked-design.md` | The `goal_run.blocked` design, with cards B-1 to B-3 and the Q-02 card draft |
| `a3-blocked-v9/v9-profile-plan.md` | The `all_writers.v9` plan and the order of all remaining work |
| `a3-blocked-v9/critique.json` | The blind critique of those three documents (applied, with a disposition table in each) |
| `a3-blocked-v9/B1-*.md`, `B2-*.md`, `V1-*.md` | Their evidence notes |
| `a3-blocked-v9/owner-questions-B1.md`, `owner-questions-B1-critique.json` | TB-25, TB-26, TB-12 and TB-02, with their unapplied critique (verdict unsound) |
| `a2/A2-design.md` | The A2 design, revision 2, after its critique (section 12 has the disposition) |
| `a2/A2-design-critique.json` | Its blind critique |
| `a2/card-A2-scope-20260925.md` | Card `EA-A2-SCOPE-V9-001` |
| `a2/R1-*.md` … `R5-*.md` | Its evidence notes |
| `SHA256SUMS` | SHA-256 of every file above (`sha256sum -c SHA256SUMS` in this directory) |

Citations in these documents name refs `origin/main` at `63cf2cb97f`, `abdf4eead` or `bd95afcc8`, and `origin/plans/replan-v8-a1-20260925` at `e8d61ace4` or earlier. Scratch paths they mention were in the cloud session's ephemeral scratchpad and no longer exist.

## Cost

- **A0:** about 5.5 agent-hours and 0.95M output tokens.
- **A1, to its reviewed tip `e8d61ace4`:** about 28 agent-hours and 4.8M output tokens.
- **After A1:** about 5.2 subagent-hours and 1.47M output tokens, plus about 2 hours of host time.
  - A3 stopped scoping: 1.1 agent-hours, 0.35M.
  - A2 design: 2.2 agent-hours, 0.58M.
  - A3 blocked and v9 scoping: 1.1 agent-hours, 0.39M.
  - Owner questions, stopped at the critique: 0.4 agent-hours, 0.12M.
  - A1 rebase, stopped in its first stage: 0.4 agent-hours, 0.03M.
- **Thread total:** about 41 agent-hours and about 7.3M output tokens.
