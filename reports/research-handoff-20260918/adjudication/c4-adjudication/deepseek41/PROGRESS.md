# Arm deepseek41 adjudication progress (Opus 5 adjudicator, 2026-09-16)

Scope: the CLEAN RERUN runs/jujutsu-deepseek41-20260916-202016 only.
arm-history/deepseek41-attempt-1/ is explicitly NOT scored (cut short by an accounting defect).

## Stage 1 — verification: DONE
- arm-outputs/deepseek41-manifest.json: internal manifest_sha256
  de1811511814da303a8116ce53dbc260ec11144acc1054023b86dccc76206558 (the value the runner reported);
  the manifest file's own bytes hash to b07dae8a565233e449b0fc7d2ff246b3bc5266dae8823dd13d4e47f39eb2389a.
- Recomputed from the 7,015 rows: MATCH. Independently re-hashed the whole tree
  (7,015 files, 351,090,321 bytes): MATCH. Frozen tree unaltered since 2026-09-16T20:40:43Z.
- Job table rebuilt from jobs/*/{job,outcome,delivery,native-job-end-accounting}.json + raw-omp/usage.json:
  12 arm-run jobs J0017-J0028 = 9 reconcile (J0017,18,19,20,21,23,25,26,27) + 3 compare (J0022,24,28).
  CONFIRMED. 10 budget_truncated + 2 completed (J0025 39 responses, J0026 24). CONFIRMED.
  470 native responses; receipts == responses in all 12. CONFIRMED.
  reconcile wall 1133.74 s, compare wall 751.47 s, arm wall 1135.81 s, summed 3095.415 s,
  avg concurrency 2.7253. CONFIRMED. Captured $0.531509 (sum of native tariff receipts). CONFIRMED.
  notes.md from 7 of 12; 17 lead deliveries receipted. CONFIRMED.
- RUNNER CAVEAT VERIFIED INDEPENDENTLY: the 10 budget_truncated jobs are RESPONSE-ceiling truncations,
  not money. Durable evidence: protocol/arm-budgets/deepseek41.json has NO per-job money ceiling
  (report limits job_budget_usd: null); arm cap $50 against $0.531509 captured; per-job max $0.0592;
  timing.json money_stop_reason: null; and every budget_truncated job sits at 40-41 responses while
  both completed jobs sit at 39 and 24. Clean separation at the 40-response ceiling.
- TWO FACTUAL DISCREPANCIES vs the runner's brief to me (do not affect scoring, recorded for the record):
  (a) runtime is the omp-18.1.12-linux-x64 binary self-reporting version "omp/18.2.2"
      (raw-omp/run.json, binary sha256 77c3520ab8ef8318dda02a0715e3b6e69589c427dc23f90a4bb97650caa72f72);
      the brief said oh-my-pi 18.1.13.
  (b) protocol/arm-budgets/deepseek41.json bound.deepseek_metadata.selector says
      "opencode-go/deepseek-v4-flash" (stale, no .1) while every one of the 470 receipts records
      provider opencode-go model deepseek-v4.1-flash, which is the selector the brief names.
- Off-by-one worth noting: 7 of the 10 ceiling-bound jobs recorded 41 responses against a 40 ceiling.
  The adapter registers a response that already happened and then denies the next one.

## Stage 2 — corpus: DONE. 19 assertion documents across 8 of 12 jobs.
- notes.md x 7: J0019, J0021, J0022-compare, J0024-compare, J0025, J0026, J0027. All 7 notes_sha256
  receipts match the file on disk.
- leads/*.md x 12: J0019 (1), J0020 (3), J0021 (2), J0025 (3), J0026 (3).
- J0020-reconcile is a special case: it authored 3 lead documents but never wrote notes.md, so the
  scheduler receipted 0 lead deliveries for it. Its 3 saved lead documents ARE assertion documents and
  are read and scored, per continuation 3's "budget-limited saved findings count when supported".
- Four jobs produced NO assertion document at all: J0017, J0018, J0023, J0028-compare.
- Excluded as inputs: handoff.md, brief.md, assignment.md, sources.md, tool-help.md, research.py.
  Excluded as locator inventories: workspace/research-evidence/sources/**.

## Stage 3 — read the 19 documents and score: IN PROGRESS

## Stage 3 — DONE. All 19 assertion documents read in full; scoring settled.
Credited (33): F002 F004 F006 F007 F008 F010 F011 F029 F030 F031 F032 F033 F034 F035 F036 F037 F050
F053 F056 F059 F061 F062 F066 F072 F074 F079 F080 F081 F082 F084 F089 F092 F102
= 33/110 (30.00%); corrections 0/5, optional 2/36, product choice 1/6, unsupported 30/63.
Partial (9): F001 F028 F051 F052 F069 F073 F083 F090 F094
Candidates outside the union (4, all from the two compare jobs):
 D1 J0022 R2 version binding; D2 J0024 R1 mark_conflict_resolved gate; D3 J0024 R2 JJ conflict command
 preconditions; D4 J0024 sec5 merge-editor save contract.
 (J0022 R1 "sanitized store binding for Git/JJ subprocesses" is NOT a candidate: its proposition is union
 finding F074, credited. The arm's claim that the Plans do not cover it is recorded as an observation.)

### CROSS-ARM FINDING — Arm C made a factual error that deepseek41 caught and I verified myself
Arm C (claude) asserted in J0019, J0022, J0026 and in its lead dojjo-sync-complete-prunes-operation-history.md
that `op_store().gc(head, SystemTime::UNIX_EPOCH)` "preserves nothing by recency" and that the dojjo server
mirror therefore "retains only operations and views reachable from the single resolved head" at each sync.
deepseek41 (J0025 item 2) asserted the opposite, citing jj lib/src/simple_op_store.rs:277-300.
I read the source myself at
runs/jujutsu-deepseek41-20260916-202016/cache/v3/repos/jj-vcs--jj/lib/src/simple_op_store.rs:285-298:
  let remove_file_if_not_new = |entry| { let mtime = metadata.modified()...;
      if mtime > keep_newer { "not removing" } else { "removing" } };
With keep_newer = UNIX_EPOCH every real file's mtime is greater, so NOTHING is removed.
deepseek41 is right; Arm C is wrong. Arm C's F079/F004 credits stand on independent Plans citations, but
its lead dojjo-sync-complete-prunes-operation-history.md is materially false, and one of the two external
legs of Arm C candidate C4C-05 rests on it. The Arm C files are amended accordingly.
Note also deepseek41's J0019 item 5 explicitly declined to assert the retention effect ("was NOT verified
- jj-lib source was not read") and J0025 then went and read the source. Declared uncertainty, then resolved
it with primary evidence.

### Second cross-arm note (not an error, an answered question)
Arm C's J0022 asserted GG has typed "target previews"; it flagged its own open question of whether the hint
is shown at the drop target or only at the source. deepseek41's J0025 answered it: source-side highlight
plus a drop-hint slot string, no preview of the resulting graph (Object.svelte:134-146, Zone.svelte:77-81,
plus greps for preview/highlight). Both arms credited under F066.

## Stage 4 — write adjudication files + manifest + amend Arm C: IN PROGRESS

## Stage 4 — DONE.
adjudication/deepseek41/{README.md, deepseek41-findings.json, deepseek41-candidates.json,
deepseek41-scoring.json, PROGRESS.md}. Arm C files amended for the UNIX_EPOCH error (credits unchanged).

## Stage 5 — repo bundle on the same branch: IN PROGRESS

## Stage 5 — DONE. Pushed, NOT landed.
Commit c66df39caa on research/jj-c4-adjudication-20260916; remote head
c66df39caa948458c48f6770ad3603db9bb9f2f4. Bundle now holds both arms plus a shared
evidence-manifest.json and SHA256SUMS. Worktree ~/pm-worktrees/jj-c4-adjudication-20260916 kept in place
for the remaining arms. Do NOT land until told.

## Resume notes for glm53 / muse13 / union / claude-hicap
- Same five-stage method. Verify the manifest's INTERNAL manifest_sha256 and re-hash the tree.
- For any oh-my-pi arm, re-verify the budget_truncated caveat from durable state the same way
  (no per-job money ceiling in protocol/arm-budgets/<arm>.json, captured vs cap, money_stop_reason,
  and the response count clustering at the ceiling). Do not take the report's bound_by on trust.
- Score SAVED assertion documents, not receipted deliveries: deepseek41's J0020 authored leads without a
  notes.md and the scheduler receipted nothing for it, yet those documents carry the only F008 credit.
- The current comparison table lives in adjudication/deepseek41/README.md. Each new arm's README should
  carry the full table forward and supersede the previous one; the older per-arm READMEs keep a pointer.
- claude-hicap is the ceiling control for Arm C. Its comparison against Arm C (18/110 at 40 responses) is
  the single most informative number left in this experiment.
- Watch for more cross-arm factual conflicts. Two have already appeared on the same corpus; when arms
  disagree on a code fact, read the primary source directly rather than preferring either arm.

## AMENDED 2026-09-16 while scoring claude-hicap
The runner filed arm-outputs/corrections.json against my two discrepancy flags. C1 CORRECTS ME: the
"stale selector" is the frozen continuation-3 cost-policy block describing the HYBRID arm's model, copied
into every arm's budget, not a deepseek41 field. C2: the omp runtime was replaced in place at the same
path (18.1.13 -> 18.2.2); the brief was right when written. C3 answers my off-by-one question: the ceiling
fires after a response, so one more request can already be in flight. README, scoring and candidates files
amended; deepseek41's credited total is unchanged at 33/110.

## Post-review revision — 2026-09-17

Independent review REVIEW_ADJUDICATION_20260916.md returned "fix first". It upheld the method, the
nesting (including its set-equality form), the manifests, the quarantine discipline, the frozen-input
boundary, the garbage-collection reading and the absence of family bias, and re-derived 80 credits
including every correction. I re-verified each item against the run state before applying it.

Credit changes: claude-hicap -F001 (B4), glm53 -F068 (B5), union -F015 (B6), deepseek41 +F043 at 2 of
3 clauses with the third disclosed (S10). Post-review recall: 18 / 34 / 36 / 40 / 42 / 45.
Four-arm review union 45, still set-equal to claude-hicap; five-arm 48; six-arm 57; no arm 53.
Every structural conclusion survives. Text and pointer items S1-S9, S11, S12 and N1 applied.
