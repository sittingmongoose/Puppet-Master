# Arm B (breadth then compare) adjudication progress — continuation 5

Adjudicator: Opus 5 agent (claude-opus-5[1m]). Ran no arm.

## Stage 1 — verification (complete)
- Read continuation5/PROGRESS.md (sha256 142f4ffd3282cb239bbc370183cd02963ba76e8e325e69178e901d99971b8d5a)
  and the runner bundle at 2a0a15078d.
- BOTH manifests verified three ways: b-breadth 711302fa... (18,258 files) and b-compare attempt 2
  17b32556... (20,012 files). Zero differing files.
- ATTEMPT BOUNDARY: scored attempt 2 (runs/jujutsu-b-compare-20260917-133734) ONLY. Verified
  independently that attempt 1 (runs/jujutsu-b-compare-20260917-123157, manifest 5b340f3ae1...)
  delivered zero comparisons and that no job in it wrote notes.md - it holds no scoreable assertion.
- Designed stops confirmed: both stages Stop: admitted_attempt_cap.
- ISOLATION CHECKED INDEPENDENTLY of the runner's proof: rebuilt from the compare jobs' own upstream
  chains; every reconcile job cited is a Muse b-breadth job, none of the twelve premium reconcile jobs
  appears. Carry-across byte-faithful: all 23 Muse notes.md sha256-identical across the two trees.
  Caveat recorded: the compare jobs do see the premium implementation/history study notes, as every
  arm did; the isolated layer is the reconcile layer.
- Delivery order verified: 32 leads = Muse delivery positions 1-32, no gaps.
- Job tables rebuilt: breadth 30 jobs (16 response-limited, 14 finished, 54 deliveries, 23 notes);
  compare 12 jobs all completed, 56-86 receipts, 12/12 notes, 32 deliveries, all reconciled.

## Stage 2 — corpus (complete)
Compare: 12 notes.md (582,651 bytes) + 37 lead docs. Breadth: 23 notes.md (265,797 bytes) + 12 leads.
Both read - the breadth corpus was read separately to answer the by-stage question.

## Stage 3 — code-fact verification (complete)
8 facts verified against pinned bytes (V-B1..V-B8), all upheld: the --at-op=@ vs --ignore-working-copy
distinction from the arm's own fetch receipts; diffedit3 FileEntry / save_unchecked / MAX_FILE_LENGTH
at 0ae89095; MergeToolPartialResolutionError and the tx.finish-before-error ordering; ToolAborted
before snapshot_results; get_head on an empty head set. Pinned cache for this run is f9588f37.

## Stage 4 — scoring (complete)
39/110 (35.45%): corrections 1/5 (F107), optional 6/36, product 1/6, unsupported 31/63. 5 partials.
vs claude-hicap 45: gained 8, lost 14 (net -6). vs Arm P 32: gained 15, lost 8 (net +7).
Adds F027, F060, F110 over ALL seven prior arms. Eight-arm union 62/110; no arm 51 -> 48.

RECALL BY STAGE: Muse reconcile alone = 0, structurally - all 23 notes are "no Plans comparison" and
NOT ONE cites a Plans passage. Every credit is earned at compare.

RECONCILE ADEQUACY: adequate in substance (no false conclusion adopted), thin as evidence - 11 of 12
compare jobs re-verified; 14 of the 32 compared leads came from a response-limited Muse job; the
--connectivity-only case is the clearest limitation, where Muse handed forward an unresolved question
AND a wrong rationale that J0047 had to fetch Git's docs to correct.

PER-LEAD YIELD: 1.22 against Arm P's 2.00 and claude-hicap's 3.21. Breadth has sharply diminishing
returns against a fixed union.

## Stage 5 — candidates and write-up (complete)
6 candidates, NONE inside a continuation-3 rejection (against 4 of 6 for Arm P). 7 observations.

## Stage 6 — bundle
Remaining: manifest, extend research/jj-c5-adjudication-20260917 with the three-arm table, push.
Do not land.
