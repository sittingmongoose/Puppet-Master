# Arm union adjudication progress (Opus 5 adjudicator, 2026-09-17)

THE ONLY FULL ARM among the continuation-4 arms. Recall is NOT bounded by the premium arm's artifacts.
Its out-of-union candidates get particular care: a different research model on the frozen case is the one
thing in this experiment that could change the union.

## Stage 1 — verification: DONE
- DESIGNED STOP confirmed first: campaign-terminal.json and monitor-state.json both record
  "Stop: admitted_attempt_cap". Not an exception.
- arm-outputs/union-manifest.json internal manifest_sha256
  2e8ada3ff095c4fd544daee0311e17cc78503b166a43db4331693495d205f5d8 (the runner's figure);
  manifest file bytes 77d2059a34f267191af5e73ccdb2b2a9c6aa0d2f9bf59513e15fd4eefe5dd1da.
  Recomputed from the 7,894 rows: MATCH. Independently re-hashed the whole tree
  (7,894 files, 363,829,324 bytes): MATCH. Frozen since 2026-09-17T00:08:56Z.
- FULL-ARM SHAPE CONFIRMED from run.json: case jujutsu-frozen-20260911,
  input_manifest_sha256 11a497945f... (the same frozen case the premium and hybrid arms ran),
  continuation.fresh_arm true, original_run null, admitted_phases discovery/implementation/history/
  reconcile/compare, and inputs_note "Frozen case snapshot bc7569b3f5 only. Discovery and study workers
  receive the product brief; the frozen Plans enter at reconciliation and comparison. No artifact from
  any other arm." All 20 jobs are the arm's own; none is an inherited premium artifact.
- Job table rebuilt from durable state: 20 jobs = 1 discovery + 5 implementation + 5 history +
  6 reconcile + 3 compare. CONFIRMED. 17 completed, 3 reconcile jobs timeout at 2400 s. CONFIRMED.
  Stage walls discovery 595.1, implementation 1889.2, history 2079.6, reconcile 3699.3, compare 658.3;
  arm wall 6378.3 s, summed 16711.4 s, avg concurrency 2.6200. CONFIRMED.
  Captured $0 at a zero tariff, $3 unresolved, 17 reconciled / 3 unresolved jobs. CONFIRMED.
  20 lead deliveries. CONFIRMED.

### TWO CORRECTIONS TO THE RUNNER'S FIGURES (both verified from durable state)
1. notes.md count is 19 of 20, not 18. Only J0019-reconcile produced none. J0018 and J0020 BOTH timed
   out and still wrote notes.md (6,336 and 8,790 bytes), and J0018 additionally wrote 8 lead documents.
   Those are saved assertion documents and are scored, per continuation 3's rule that budget-limited
   saved findings count when supported.
2. The "12 to 39 responses per job" range reconciles only if you read the durable meter, not the native
   receipts. The three timeout jobs have NO raw-omp/usage.json at all - the process was killed at the
   wall before flushing - so their native receipt count is 0 while the durable meter recorded 27, 12 and
   13 requests. Totals: 484 native receipts across the 17 completed jobs (22-39 each), plus 52
   durable-metered requests in the 3 timeout jobs that were never receipted. That gap is exactly why
   each carries $1 unresolved (accounting gaps: missing_retained_usage_records and
   durable_meter_request_count_mismatch).

## Stage 2 — corpus: DONE. 114 assertion documents, 488,422 bytes, in 19 of 20 jobs.
- 19 notes.md + 95 workspace/leads/*.md.
- J0001-discovery alone authored 30 lead documents - this arm's own research directions, generated
  from the product brief without sight of any other arm's leads. That is the artifact that matters most
  for the union question.
- Only J0019-reconcile produced nothing (timeout, 12 durable requests, 336 KB session transcript).

## Stage 3 — read the corpus and score (incl. recall BY STAGE): IN PROGRESS

## Stage 3 — DONE. Corpus read; scoring settled.
Credited 43/110 (39.09%): corrections 0/5, optional capability 7/36, product choice 0/6,
unsupported or already-covered 36/63.
RECALL BY STAGE (stage at which the finding was first earned):
  discovery 10  (F005 F011 F019 F028 F050 F059 F062 F066 F079 F084)
  reconcile 11  (F002 F004 F006 F007 F008 F010 F056 F057 F082 F094 F102)
  compare   22  (F015 F024 F025 F029 F030 F031 F035 F038 F043 F051 F052 F061 F065 F068 F069
                 F072 F073 F080 F081 F087 F088 F092)

THE HEADLINE: union ADDS 11 findings no review arm reached - F005 F015 F019 F024 F025 F038 F052
F057 F065 F068 F069 - and the five-arm union rises from 46 (41.82%) to 57 (51.82%). Those 11 come
from lead families the premium arm never generated or never routed, which is exactly what a full
arm can reach and a same-input review replacement structurally cannot.
BUT: ZERO findings unique to the union. All 43 sit inside premium or hybrid. So a different research
model on the frozen case REDISTRIBUTED coverage rather than extending it. On this evidence the answer
to "could a different research model change the union" is no.
The review arms hold 14 the union misses (F001 F032 F033 F034 F036 F037 F044 F053 F074 F083 F089
F090 F106 F107), dominated by the diffedit3/external-editor family: union's own discovery DID find it
(lead 23) but never routed it to a study or compare job within 20 admissions.

## Stage 4 — write adjudication files incl. candidate classification: IN PROGRESS

## Stage 4 — candidates, scoring, README (complete)

- `union-candidates.json`: 5 out-of-union candidates (C4U-01..05) and 4 observations. Each candidate
  carries the assertion, the passages cited, my classification and an explicit check against
  continuation 3's four rejected expansions, as the brief requires.
  - C4U-01 correction (J0015 R1): read-class command must not be a default mutating jj invocation.
    NOT rejected by continuation 3 — and the arm independently reaches the same conclusion
    continuation 3 reached when it rejected "add a mutating status.refresh branch".
  - C4U-02 correction (J0015 R2): colocation certification scenario matrix. Not rejected.
  - C4U-03 product choice (J0016 §3): graph gestures are a distinct operand vocabulary. Not rejected;
    overlaps the already-credited F066.
  - C4U-04 capability (J0017 A+B): contextual inspection and assisted revsets. Three of four parts
    are already union findings credited to this arm; the residue is the search-scope disclosure rule.
  - C4U-05 capability (J0016): conflict presentation must not use a deletion-shaped surrogate.
    FLAGGED as probably inside continuation 3's rejected F082/F086/F056 refinement cluster.
- `union-scoring.json`: run verification, 20-row job table rebuilt from durable state, stage timing,
  recall, recall by stage, time-truncated coverage, request-limited (none), reached-delivery.
- `README.md`: by-stage recall table against premium and hybrid on the full pipeline; time-truncated
  coverage as its own section; the full comparison table with the union column filled in.
- Corrected a figure I had carried from continuation 3's end README: premium/hybrid by-class support
  against the EXPANDED 110 union is 4/5, 20/36, 3/6, 51/63 and 2/5, 30/36, 5/6, 53/63 —
  recomputed from comparison.json, not the 105-basis prose.

Headline: 43/110 (39.09%). Zero findings unique to the arm; 11 findings no review arm reached;
five-arm union 57 (51.82%).

Remaining: manifest, bundle, commit, push. Do not land.

## Post-review revision — 2026-09-17

Independent review REVIEW_ADJUDICATION_20260916.md returned "fix first". It upheld the method, the
nesting (including its set-equality form), the manifests, the quarantine discipline, the frozen-input
boundary, the garbage-collection reading and the absence of family bias, and re-derived 80 credits
including every correction. I re-verified each item against the run state before applying it.

Credit changes: claude-hicap -F001 (B4), glm53 -F068 (B5), union -F015 (B6), deepseek41 +F043 at 2 of
3 clauses with the third disclosed (S10). Post-review recall: 18 / 34 / 36 / 40 / 42 / 45.
Four-arm review union 45, still set-equal to claude-hicap; five-arm 48; six-arm 57; no arm 53.
Every structural conclusion survives. Text and pointer items S1-S9, S11, S12 and N1 applied.
