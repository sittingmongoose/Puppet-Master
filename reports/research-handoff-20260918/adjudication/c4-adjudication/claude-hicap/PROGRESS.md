# Arm claude-hicap adjudication progress (Opus 5 adjudicator, 2026-09-16)

Control arm for Arm C's ceiling caveat: same model (claude-opus-5 xhigh, CLI 2.1.226), same premium
artifacts and starting state, limits raised to 160 responses / 3600 s / $20 per job, $150 cap.

## Stage 1 — verification: DONE
- arm-outputs/claude-hicap-manifest.json internal manifest_sha256
  ebf8612dd5953cbf8f4da9fa6b6b5b11a89e4015cc907c26d0afc553b0eafbb5 (the runner's figure);
  manifest file bytes feefc4c94ccec49890db58d57ccd0d350d35d2bd0fabc33936760f670f16b983.
  Recomputed from the 8,098 rows: MATCH. Independently re-hashed the whole tree
  (8,098 files, 228,660,085 bytes): MATCH. Frozen tree unaltered since 2026-09-16T21:41:42Z.
- Job table rebuilt from durable state: 12 jobs = 6 reconcile (J0017,18,19,23,24,25) +
  6 compare (J0020,21,22,26,27,28). CONFIRMED.
- ALL 12 `completed` with raw-claude terminal_reason "completed" and result_is_error false.
  NOTHING WAS BOUND: responses 37-110 of 160 (mean 66.7), elapsed 685.6-1070.1 s of 3600,
  per-job CLI cost $4.0991-$12.1166 of $20. timing.json money_stop_reason null. CONFIRMED.
- 800 native responses; receipts == responses in all 12; captured $82.516376 = CLI reported;
  12/12 job-end reconciled, $0 unresolved. CONFIRMED.
- reconcile wall 2635.6 s, compare wall 2682.6 s, arm wall 3535.2 s, summed 10259.3 s,
  avg concurrency 2.9021. CONFIRMED.
- 12/12 wrote notes.md; 28 receipted lead deliveries. CONFIRMED.
- Leads: 88 input + 52 authored = 140 total; 126 still at 'discovered', 14 comparison_delivered,
  0 reconciled (every reconciled lead was promoted to comparison_delivered).

## Runner corrections to my earlier flags (arm-outputs/corrections.json, runtime-identity.json) — READ AND ACCEPTED
- C1: the "stale selector" I flagged on deepseek41 is NOT a deepseek41 field. It is the frozen
  continuation-3 cost-policy block bound.deepseek_metadata describing the HYBRID arm's research model,
  copied into every arm's budget including the claude arms. My deepseek41 note overstated it; I am
  correcting my own deepseek41 files.
- C2: the omp runtime genuinely self-reported 18.1.13 when the union attempt ran at 18:49Z and 18.2.2
  after Jared updated the binary in place at the same path. The brief's "18.1.13" was not wrong when
  written; it went stale. Per-arm job records are authoritative and deepseek41 ran against 18.2.2.
- C3: the 41-responses-against-40 shape is a post-response boundary kill window, not an off-by-one:
  the ceiling is enforced after a response, so oh-my-pi can already have dispatched one more.
  Accounting stayed consistent (41 receipts == 41 durable count, 0 unresolved).

## Stage 2 — corpus: DONE. 64 assertion documents, 836,145 bytes, in 12 of 12 jobs.
- notes.md x 12 (29,455-65,166 bytes each) + 52 workspace/leads/*.md.
- 4.6x Arm C's 18-document, ~180 KB corpus. Every job produced assertions; none is empty.

## Stage 3 — read the corpus and score: IN PROGRESS

## Stage 3 — DONE. Corpus read; scoring settled.
Credited (46 of 110, 41.82%): corrections 3/5 (F001 F106 F107), optional capability 4/36 (F028 F035
F066 F090), product choice 3/6 (F032 F044 F083), unsupported or already-covered 36/63.
Full list: F001 F002 F004 F006 F007 F008 F010 F011 F028 F029 F030 F031 F032 F033 F034 F035 F036 F037
F043 F044 F050 F051 F053 F056 F059 F061 F062 F066 F072 F073 F074 F079 F080 F081 F082 F083 F084 F087
F088 F089 F090 F092 F094 F102 F106 F107.
Partial (6): F019 F020 F022 F069 F076 F103.
CONTROL RESULT: a strict superset of Arm C (18) and of deepseek41 (33). 28 findings gained over Arm C,
none lost. Zero unique to the arm; 44 of 46 in premium, 35 in hybrid, 2 hybrid-only (F073, F083),
11 premium-only. Corrections still missed: F108, F109 only.

### CROSS-ARM FINDING 2 — the higher ceiling did NOT fix the UNIX_EPOCH error
claude-hicap repeats Arm C's factual error, and repeats it while holding the correct primary source.
- hicap J0019 correction 2 quotes the correct predicate ("The implementation removes any file whose
  mtime is not greater than keep_newer", lib/src/simple_op_store.rs:286-299) and then concludes
  "Passing UNIX_EPOCH therefore disables the concurrency grace window entirely ... every operation and
  view not reachable from the freshly-resolved head is destroyed server-side immediately."
- hicap J0023 and its lead L-3f9c21d4a87e state the same predicate ("mtime > keep_newer ? keep :
  remove") and the same wrong conclusion ("the concurrency mitigation is fully disabled").
I read the whole gc implementation myself in hicap's own cache
(cache/v3/repos/jj-vcs--jj/lib/src/simple_op_store.rs, sha256
a42ce0f6208002fc26c5796af00240b7e8b64b9b52957cc64446fc5b2ce610da, lines 285-357): reachable entries
`continue`; unreachable entries go to remove_file_if_not_new, which KEEPS when mtime > keep_newer.
With keep_newer = UNIX_EPOCH every file's mtime is greater, so NOTHING is removed.
Both Claude arms are wrong in the same direction; deepseek41 is right. Arm C never read the
implementation (it cited the docs.rs trait page); hicap read it, quoted it correctly, and drew the
opposite conclusion two sentences later. That is a reasoning error, not a budget error — the control
arm separates coverage from judgement, and on this point the extra budget bought nothing.
Effect on score: none. F079/F004/F082 rest on independent Plans citations in both arms.

## Stage 4 — write adjudication files + manifest: IN PROGRESS

## Stage 4-5 — DONE. Pushed, NOT landed.
Commit 96268895b4 on research/jj-c4-adjudication-20260916; remote head
96268895b40e0c88e1a39c98c60cfc1603ff6e9e. Bundle now holds three arms plus a shared
evidence-manifest.json and SHA256SUMS. Worktree kept for the remaining arms. Do NOT land until told.

## Resume notes for glm53 / muse13 / union
- Same five-stage method. Verify the manifest's INTERNAL manifest_sha256 and re-hash the tree.
- For union: it is a FULL arm from discovery, not a same-input review replacement, so its recall is NOT
  bounded by the premium artifacts the way the other three are. Score it against the same union but say
  so prominently; it is the only continuation-4 arm whose coverage is not structurally capped by what the
  premium arm happened to discover.
- Score SAVED assertion documents, not receipted deliveries (the deepseek41 J0020 lesson).
- For any oh-my-pi arm, re-verify the budget_truncated caveat from durable state; and read corrections.json
  first, since the runner now files corrections there against adjudicator flags.
- The current comparison table lives in adjudication/claude-hicap/README.md; the two older per-arm READMEs
  carry a pointer to it. Each new arm's README should carry the table forward and supersede the previous.
- Standing rule now proven twice: when arms disagree on a code fact, read the primary source directly.
  Two cross-arm factual conflicts have appeared and in both the majority of arms was wrong.

## QUARANTINE — 2026-09-16, coordinator instruction. DO NOT SCORE THESE TWO RUNS.
- runs/jujutsu-union-20260916-214322  — interrupted, 2 of 4 jobs interrupted, $0 captured
- runs/jujutsu-glm53-20260916-214321  — interrupted
Both are being accounted for by the runner and requeued as FRESH arms. Score only the reruns.
This supersedes the line in my earlier resume note that recorded glm53 and union as terminal: terminal
is not the same as clean, and campaign-terminal.json stop_reason is the field that tells them apart.

OBSERVATION FOR THE RUNNER (from the durable terminal records, not an adjudication):
both runs died on the SAME defect, 27 seconds apart, not on two independent failures --
  union 2026-09-16T21:57:16.744919Z and glm53 2026-09-16T21:57:43.481803Z,
  each stop_reason: FileNotFoundError renaming jobs/<job>/worker-process.json.tmp -> worker-process.json
  (union J0004-implementation, glm53 J0017-reconcile).
So it is one atomic-rename bug that took out both concurrently running arms, and the union's interrupted
jobs are plausibly a consequence of that crash rather than a separate event. Worth fixing before the
requeue, or the next pair of concurrent arms is likely to hit it again.

## Next resume: muse13 (when terminal AND clean), then the clean union and glm53 reruns.
Check campaign-terminal.json stop_reason before starting any arm: a clean arm stops on
"Stop: admitted_attempt_cap" (or another designed gate), never on a Python exception.

## Post-review revision — 2026-09-17

Independent review REVIEW_ADJUDICATION_20260916.md returned "fix first". It upheld the method, the
nesting (including its set-equality form), the manifests, the quarantine discipline, the frozen-input
boundary, the garbage-collection reading and the absence of family bias, and re-derived 80 credits
including every correction. I re-verified each item against the run state before applying it.

Credit changes: claude-hicap -F001 (B4), glm53 -F068 (B5), union -F015 (B6), deepseek41 +F043 at 2 of
3 clauses with the third disclosed (S10). Post-review recall: 18 / 34 / 36 / 40 / 42 / 45.
Four-arm review union 45, still set-equal to claude-hicap; five-arm 48; six-arm 57; no arm 53.
Every structural conclusion survives. Text and pointer items S1-S9, S11, S12 and N1 applied.
