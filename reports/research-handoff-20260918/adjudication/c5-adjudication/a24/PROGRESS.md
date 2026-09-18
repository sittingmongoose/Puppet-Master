# A24 adjudication — progress

Opus 5 agent (`claude-opus-5[1m]`), adjudicator. Ran no arm. Continuation 5, fourth and last arm.

1. **Manifest verified three ways** — rows recomputed, the runner's quoted
   `b08f251811a565eca2730ead9c256504da56fef3ace2bd361a6c333ef929f460` matched, and an independent
   re-hash of the live tree. 18,368 files, **zero differing**.
2. **Designed stop confirmed before scoring.** `Stop: admitted_attempt_cap`, 2026-09-18T01:29:51Z.
3. **The three stopped jobs investigated from the journal, not the status.** `budget_truncated` is the
   adapter's label for any meter denial; the priced-usage journal shows `admission_hold_pinned` on a
   typed five-hour `allowed_warning` at 0.90 with a $145.19 headroom pin against $176.46 committed of a
   $300 cap, then three `next_request_denied` events. **Sentinel, not money.**
4. **Lead sets compared lead by lead.** claude-hicap's 14 compared leads are a **strict subset** of
   A24's 26, and the split falls exactly on a job boundary: J0020/21/22/26/27/29 carry hicap's fourteen,
   J0031/33/35/36 carry twelve hicap never reached. This is what makes the marginal measurement exact.
5. **All ten delivered compare documents read in full**, plus the arms' lead files where distinctness
   was at stake. The 14 reconcile documents were read for corroboration only.
6. **Code facts verified** against the arm's own pinned checkout at
   `a497458e49e89a5559f32f3884e1d5294bd77a4f`: V-A1 (`snapshot_results` matcher arguments) and V-A2 (the
   `IntersectionMatcher`/`EverythingMatcher`/`NothingMatcher` chain that bounds the sparse set). Both
   held, and together they *bound* a blast radius earlier arms left unbounded.
7. **Scored 43/110 (39.09%)** — 1 correction, 6 optional capability, 2 product choice, 34 unsupported
   or already-covered; 6 partials.
8. **Marginal value of admissions 13–24 computed directly**: first six compare jobs 38 credits on 14
   leads (2.71/lead), last four 5 new credits on 12 leads (0.42/lead).
9. **Variance floor confirmed a second time**: 38 versus hicap's 45 on identical lead sets with no
   limit reached — seven findings, against T80's eight.
10. **Six out-of-union candidates** recorded with rejection checks; none added to the union.
11. **Written** with `../a24-manifest.json`; the continuation-5 bundle then finalized with the five-arm
    table, the cross-continuation union, the consolidated candidates and the production reading. Pushed.
    **Not landed.**
