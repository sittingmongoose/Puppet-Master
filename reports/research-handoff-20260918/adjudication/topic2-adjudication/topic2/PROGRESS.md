# Topic 2 adjudication — progress

Opus 5 agent (`claude-opus-5[1m]`), adjudicator. Ran no arm.

1. **Read first.** `~/PM-Experiments/topic2-20260917/PROGRESS.md` (1,135 lines) and the runner bundle
   on `research/topic2-20260917` at `4742fc84fb`; the current owner text
   `Plans/Azure_DevOps_Integration.md` on `origin/main` (`4f5eda0d18`, sha256 `3ae59c02…`, 219 lines,
   ADO-001..005) read in full.
2. **All three manifests verified three ways** — rows recomputed, the runner's quoted value matched,
   and an independent re-hash of the live tree: Arm S `4bfc2dcf…` (14,089 files), h2-research
   `c1e7a066…` (8,214), h2-review `88da881a…` (7,458). **Zero differing files in all three.**
3. **Designed stops confirmed before scoring.** All three `campaign-terminal.json` records read
   `Stop: admitted_attempt_cap`; h2-review's durable `stop_kind` is `limit_or_gate` with all 12
   admissions used and no job left non-terminal.
4. **Both runner reading notes checked independently from durable state.** The 13th h2-review journal
   entry is `HOLD-admission-sentinel` (`adapter: null`, `request_count: 0`, `$0.00`, `terminal: false`,
   `coverage: not_a_model_job`) — twelve model jobs ran. Wall-clock stage times confirmed meaningless
   and quantified against summed job time.
5. **Carry-across verified.** h2-review was staged from h2-research's frozen run: 2,563 of 2,724 files
   byte-identical; the 161 absent are raw adapter transcripts and session files only. No workspace
   assertion document differs.
6. **Assertion corpus enumerated** under the standing rule (`notes.md` + `leads/*.md` only): Arm S 130
   documents / 1,032,792 bytes; h2-research 32 / 90,705; h2-review 28 / 296,234.
7. **STRUCTURAL FINDING, established before scoring.** Every reconcile note in both arms and every
   research note in both arms is an external technical study with a **literal zero count of `Plans/`**.
   Only the compare stage reaches the Plans, so the union rests on five documents — arm-s
   J0015/J0016/J0017 and h2-review J0019/J0020 — covering five leads. This governs every number in the
   adjudication and is stated first in the README.
8. **All five compare documents read in full**, plus the arms' own lead files where a proposition's
   distinctness was at stake.
9. **Source verification before admission.** Eleven provider/API facts verified in the arms' own caches
   (V-A1…V-A11) and eleven Plans-side facts verified against `main` (V-P1…V-P11). Every one held.
10. **Blind union built by me**, 73 propositions, each classified against the CURRENT owner text:
    32 corrections, 8 optional capabilities, 4 product choices, 29 unsupported-or-covered. Corrections
    annotated with the product promise served and the contradiction exposed.
11. **Scored.** Arm S 50 of 73 (68.49%), H2 42 of 73 (57.53%); shared 19; Arm S unique 31; H2 unique 23.
    The cheap research half credited 0, structurally. Truncated coverage reported separately for both
    arms.
12. **Written** to this directory with `../topic2-manifest.json`; compact bundle under
    `reports/research-topic2-20260917/adjudication/` on branch `research/topic2-adjudication-20260917`
    from a VM-disk sparse worktree. Pushed. **Not landed.**
