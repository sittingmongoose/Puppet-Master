# Preservation review — A-M08-A/treatment/critic (pre-terminal, M08 final reserve)

Review executed 2026-10-09T20:55–20:56Z, before terminal completion, per assignment ("spend final reserve on contradiction/preservation review").

## Artifact completeness (all present in allowed_write_root)

| Artifact | Role | State |
|---|---|---|
| `critique.md` | final critique (material M1–M4 / minor m1–m5, per-P adjudication, O1–O6 coverage, verdict + repairs) | final; unchanged since v1 (review raised no revisions) |
| `claim-judgments.md` | 34 per-claim verdicts + critic access table | final |
| `source-map.json` | immutable IDs S01–S08 + N01 as re-observations; URLs, locators, access timestamps, observed operations, evidence pointers | JSON-valid |
| `sources/re-observations.md` | bounded verbatim evidence per source incl. N01 probe table | final |
| `sources/index.md` | navigable evidence index (source URL → critic section → predecessor file; reading order) | final |
| `versions/claim-judgments-v1.md` | M08 intermediate (post-verification transition) | retained, identical to live |
| `versions/critique-v1.md` | M08 intermediate (post-draft transition) | retained, identical to live |
| `versions/critique-final.md` | M08 retention at preservation transition | copy of reviewed final |

## Contradiction check (critique vs sources vs judgments)

- Six load-bearing quotes spot-checked across all three layers (`critique.md`, `claim-judgments.md`, `sources/re-observations.md`): v9.11 callback wording ("search will continue until the time limit is crossed"), the 1.000001/1.000002 score-trap example, the $36.14 figure, S06's "fixed, recurring schedule tied to warehouse operations", 1.34.0's "generate list unassign moves fairly", and the absent "no practical size limit" phrase. All consistent; no layer quotes evidence another layer does not hold. The move-selection quote lives in the judgments + evidence layers and is paraphrased (with ID) in the critique — no conflict.
- Per-P adjudications in `critique.md` §2 match the per-claim verdicts in `claim-judgments.md` (P1–P6 sound; M1 attached to P2; no false correction/rejection in either layer).
- Revealed-plan quotes in the critique were compared against `revealed-plan.md` at ingest (byte-identical clauses) and are re-asserted unchanged.
- No contradiction between frozen `discovery.md` and `draft.md` was found at ingest; this review adds none.
- Drift exposure: critic fetches ran 20:47–20:53Z; artifacts written by 20:55Z; review at 20:55–20:56Z. Any post-20:53Z upstream change is outside observed scope and is not claimed.

## Preservation / write-scope check

- Predecessor inputs untouched: all `research/**` and `cases/S08/brief.md` mtimes predate this session's start (~20:45Z; latest is `research/host-runs.json` 20:44:12Z). No predecessor-mutating edits, no regeneration, no deletion.
- Every write this stage landed inside the allowed write root `jobs/A-M08-A/treatment/critic/` (critique.md, claim-judgments.md, source-map.json, sources/{index,re-observations}.md, versions/{3 files}, this review). No Git/repo/canon edits; no config/account changes; no nested agents; no services touched.
- Harness artifacts in the critic dir (`dispatch.json`, `dispatch-request.json`, `freeze.json`, `input-map.json`, `assignment.md`) are unmodified.

## Result

Review passed with no revisions required. The critique's final position stands: predecessor draft publishable after three repairs (M1 citation re-scope; M2 N01 upgrade to docs-vs-repo inconsistency v9.6–v9.15; M3 Timefold 1.x EOL fact), minor items m1–m5 riding along; all six P dispositions upheld.
