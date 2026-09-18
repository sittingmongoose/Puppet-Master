# Arm muse13 adjudication progress (Opus 5 adjudicator, 2026-09-16)

## Stage 1 — verification: DONE
- TERMINAL STOP IS A DESIGNED GATE, checked first as instructed: campaign-terminal.json and
  monitor-state.json both record "Stop: admitted_attempt_cap". Not an exception. Safe to score.
  (Contrast the quarantined union/glm53 runs, whose stop_reason is a Python FileNotFoundError.)
- arm-outputs/muse13-manifest.json internal manifest_sha256
  c20aa3925d8a04521fe5314ff993b9a861b80c4c02ca6f1b500b9502659991d3 (the runner's figure);
  manifest file bytes 2763e496eaf3d35ccb460a26befe499f243f659cd4445131bf58ad088efa2aa1.
  Recomputed from the 11,510 rows: MATCH. Independently re-hashed the whole tree
  (11,510 files, 227,493,876 bytes): MATCH. Frozen since 2026-09-16T22:19:55Z.
- Job table rebuilt from durable state: 12 arm-run jobs J0017-J0028 = 7 reconcile
  (J0017,18,19,20,23,25,27) + 5 compare (J0021,22,24,26,28). CONFIRMED.
  10 completed + 2 budget_truncated (J0018 at 40 responses, J0020 at 41). CONFIRMED.
  366 native responses; receipts == responses in all 12. CONFIRMED.
  reconcile wall 557.8 s, compare wall 527.9 s, arm wall 668.7 s, summed 1693.9 s,
  avg concurrency 2.5330. CONFIRMED. Captured $0.164390. CONFIRMED.
  notes.md from 11 of 12; 25 lead deliveries. CONFIRMED. 12/12 reconciled, $0 unresolved.
  Every response records provider muse-code, model muse-spark-1.3-contributor.
- budget_truncated CAVEAT RE-VERIFIED from durable state, as for deepseek41: protocol/arm-budgets/
  muse13.json has NO per-job money ceiling (only muse13_usd: 50); captured $0.164390 against $50;
  timing.json money_stop_reason null; and both truncated jobs sit at 40/41 responses while the ten
  completed jobs sit at 20-38. Both are RESPONSE-ceiling truncations; no job was money-truncated.
- Leads: 88 input + 5 authored = 93 total; 79 at discovered, 3 reconciled, 11 comparison_delivered.

## Stage 2 — corpus: DONE. 16 assertion documents, 236,309 bytes, in 11 of 12 jobs.
- notes.md x 11 (10,664-37,571 bytes) + 5 workspace/leads/*.md (J0017 x2, J0020 x3).
- J0018-reconcile is the only job with no assertion document at all (40 responses, 41 source receipts,
  no notes.md, no leads). Its lead L-7dc9a6726cf9 was re-attempted and delivered by J0020.
- STRUCTURAL GAP: the GitButler triple (L-732df4469871, L-3c0712b66649, L-0eb0bdc5ba1a) was reconciled
  by J0027 but never admitted to a compare job; the 12-admission cap ran out. Same shape as deepseek41's
  loss of the graph triple's compare.

## Stage 3 — read the 16 documents and score: IN PROGRESS

## Stage 3-4 — DONE.
Credited 40/110 (36.36%): corrections 1/5 (F107), optional 3/36, product choice 1/6, unsupported 35/63.
8 partials, 5 out-of-union candidates, 3 observations.
NESTING: claude (18) and deepseek41 (33) are both proper subsets of muse13 (40), which is a proper subset
of claude-hicap (46). claude and deepseek41 are not comparable with each other. Four-arm union = 46 =
claude-hicap's own set; no arm contributed a finding claude-hicap missed.
muse13 did NOT make the UNIX_EPOCH error both Claude arms made: it records the call and draws only the
conclusion the evidence supports, without characterising an implementation it did not read.
Files: adjudication/muse13/{README.md, muse13-findings.json, muse13-candidates.json, muse13-scoring.json,
PROGRESS.md}.

## Post-review revision — 2026-09-17

Independent review REVIEW_ADJUDICATION_20260916.md returned "fix first". It upheld the method, the
nesting (including its set-equality form), the manifests, the quarantine discipline, the frozen-input
boundary, the garbage-collection reading and the absence of family bias, and re-derived 80 credits
including every correction. I re-verified each item against the run state before applying it.

Credit changes: claude-hicap -F001 (B4), glm53 -F068 (B5), union -F015 (B6), deepseek41 +F043 at 2 of
3 clauses with the third disclosed (S10). Post-review recall: 18 / 34 / 36 / 40 / 42 / 45.
Four-arm review union 45, still set-equal to claude-hicap; five-arm 48; six-arm 57; no arm 53.
Every structural conclusion survives. Text and pointer items S1-S9, S11, S12 and N1 applied.
