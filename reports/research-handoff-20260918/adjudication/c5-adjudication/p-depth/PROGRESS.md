# Arm P (prioritized depth) adjudication progress — continuation 5

Adjudicator: Opus 5 agent (claude-opus-5[1m]). Ran no arm.

## Stage 1 — reading and verification (complete)

- Read continuation5/PROGRESS.md (sha256 02960c49372a44f86bede1831665502d56e8aa047e62109f76e446ff45ec39b9)
  and the runner bundle on research/continuation5-20260917 at commit eda0c92821 (9 files).
- BOTH manifests verified THREE ways - row recompute, runner's quoted value, and an independent tree
  re-hash: p-depth bb21eaef... (7,404 files) and p-rank 9ef19ee2... (115 files). Zero differing files.
  The runner quiesced the monitor and allowance heartbeat before freezing, which fixes the race I
  reported on glm53 in continuation 4.
- Designed stop confirmed before scoring: "Stop: admitted_attempt_cap" in campaign-terminal.json and
  monitor-state.json.
- Job table rebuilt from durable state. Arm P's own jobs are J0017-J0028 (J0001-J0016 are byte copies
  of the frozen premium artifacts and are NOT this arm's output; no credit cites them). 6 reconcile,
  6 compare; 43-89 receipts per job; all 12 accounting-complete with receipts == requests, zero gaps.
- Ranked order verified independently: every compare job's lead_ids mapped through
  arm-p-admission-order.json gives exactly ranks 1-16, no gaps.
- Every runner figure I checked was already correct.

## Stage 2 — corpus (complete)

53 documents, 705,002 bytes: 12 notes.md and 41 authored lead documents, J0017-J0028 only.

## Stage 3 — code-fact verification (complete) — THE STANDING ADDITION

23 code-fact assertions verified against pinned bytes BEFORE credit, recorded as V-P1..V-P23 in the
per-finding code_fact_verification arrays:
- 7 in lib/src/stacked_table.rs at TAG v0.44.0 via the arm's own fetch receipt (sha 713fed9e...),
  including the negative that proves the #9648 fix is absent from the frozen profile;
- 2 in lib/src/git.rs at v0.44.0 (sha eace5106...), including the negative that proves the
  #9711/#9712 cache-tree discard is absent;
- 1 contract fact against the frozen Plans at bc7569b3f5, verified BYTE-EXACTLY;
- 13 in the arm's pinned cache at e6dd2c0d.
ALL 23 UPHELD. ZERO errors. The only arm in the campaign with a clean verification record.

## Stage 4 — scoring (complete)

32/110 (29.09%): corrections 0/5, optional capability 2/36, product choice 1/6, unsupported 29/63.
5 partials (F001, F029, F071, F087, F107). Every credit is earned in a compare job.

HEADLINE: prioritization LOST. 32 against claude-hicap's 45 on identical inputs - net -13 - while
comparing 16 leads to its 14 and spending more ($85.50 vs $82.52) and taking 18.6% longer.
Gained 6 (F005, F019, F052, F054, F057, F064); lost 19, dominated by two families the ranking pushed
below rank 16.

RANKING YIELD IS FLAT: 7/6/2/5/7/5 credits by rank band; ranks 11-13 match ranks 1-3. The ordering
did not predict union yield.

Adds 2 over all six continuation-4 arms (F054, F064). Seven-arm union 57 -> 59; no arm 53 -> 51.

## Stage 5 — candidates and write-up (complete)

6 candidates, FOUR of them inside continuation 3's standing rejections (C5P-02 the writer-bearing
snapshot_capable_read class = rejection 2 almost verbatim; C5P-03 the extras detector = rejection 4
by name; C5P-05 the conflict route; C5P-06's taxonomy and route halves). C5P-01 (the JJ closure
record cannot express whether the fence held, while the neutral record can) is the strongest and is
not rejected - it is the same shape as continuation 3's own F106.
6 observations, including that the arm contains BOTH sides of the reads-may-write remedy boundary in
two different jobs.

## Stage 6 — bundle

Remaining: manifest, compact bundle on research/jj-c5-adjudication-20260917, push. Do not land.
