# Card A2-S: fold the v8 consumer adoption into v9

Card ID: `EA-A2-SCOPE-V9-001`
Status: **PRESENTED_UNANSWERED**, 2026-09-25.
Owner: this thread (program scope), with Goal Runtime and Storage.
Evidence: `A2-design.md` revision 2 (§0.1, §1.3, §2.2, §2.5, §10.1 card C-A2-1) and its critique.

**Name:** One consumer adoption, for v9, instead of one for v8 now and another for v9 later.

**Question:** Should A2 stop being "adopt v8 runs into the run history" and become a single adoption for v9 runs, done when v9 exists?

**Why:**
- A2's design found that on v8 runs, only "started" could ever show in the run history:
  - Cancel has no issuer (Q-12).
  - Certified needs a separate Event and Storage admission.
  - Stopped and blocked never exist on v8 (card C-4).
  - Replan cannot finish on v8: its release step is tied to a separate draft projector that cannot join the one run-history chain.
- v8 is not installed. Its descriptor says `CANONICAL_COMPLETE_SOURCE_PROFILE_NOT_INSTALLED`, so no v8 run exists. v9 carries all of v8 forward and is the first profile on which Replan, Stop and Blocked can all work. The A2 design itself calls v8 "a stepping stone to v9".

**What you get:**
- Option 1:
  - About 15 to 23 agent-hours and 2.2M to 3.5M output tokens saved, plus one packages-repo merge and one landing.
  - One consumer adoption in which every branch (started, certified, stopped, blocked, replanned) can go live.
  - A shorter run-history chain.
- Option 2: runs born under v8 get a run history that shows "started", before v9 exists.

**What it costs:**
- Option 1:
  - v8 becomes a source-only stepping stone that is never installed for runs. If it were installed anyway, its runs would have no run history.
  - A1's sentences that say "until A2" and the program plan's A2 line need dated routing notes, written on the v9 branch.
  - Most of the A2 design work already done carries over to the v9 adoption.
- Option 2:
  - A2's full cost for a history that shows only "started".
  - A second adoption later for v9 anyway.

**Options:**
1. **Fold A2 into the v9 adoption (recommended).** Card C-A2-1 ("Replan finishes only on v9 runs") is answered by this: yes.
2. **Keep A2 as designed.** Adopt v8 runs now, and adopt v9 runs later.

**Recommendation:** Option 1. The v8 adoption would add almost nothing a user could see, and everything it prepares has to be redone for v9.

**Answer:** ____________________

## What this card does not do
It does not change A1, which still lands as reviewed after its rebase. It does not change the order DL-080 sets for stopped, blocked and replanned.
