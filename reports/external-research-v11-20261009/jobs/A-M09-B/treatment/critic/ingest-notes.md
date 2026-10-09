# Critic-stage ingestion notes — A-M09-B / treatment / critic (S03, M09)

Written 2026-10-09 by the critic stage. Scope: ingestion of exactly the inputs declared in
`input-map.json` (assignment, brief, four research-stage predecessors, `research/sources` tree).
No campaign/history/evaluator/counterpart material was read. All concrete claims below are
cited to their input file so the subsequent `critique.md` can challenge them against the
retained primary evidence.

## Ingestion register (all paths verified present via `ls -la`)

| Input | Path | State |
|---|---|---|
| assignment | `critic/assignment.md` | 2940 B, read in full (stages 1–5 incl. critic duties) |
| input map | `critic/input-map.json` | 1195 B, valid; 4 predecessors, 1 source root, deadline 2026-10-09T19:00:57Z |
| brief | `cases/S03/brief.md` | 1436 B, read in full |
| predecessor 1 | `research/draft.md` | 19452 B, read in full |
| predecessor 2 | `research/discovery.md` | 18000 B, read in full |
| predecessor 3 | `research/source-map.json` | 7769 B, valid JSON, 13 sources S01–S13 |
| predecessor 4 | `research/revealed-plan.md` | 345 B, read in full |
| source root | `research/sources/` | 13 evidence files + `INDEX.md`, tree listed |

## Concrete claim cited from each input

- **brief.md**: the reviewed service is for "an academic ecology group" with "mixed Python/R
  projects"; O4 obliges comparing "every exact P clause" after plan reveal and distinguishing
  correction / optional enhancement / user decision / already-covered / rejected / uncertain;
  O6 obliges separating executed checks from proposed validations.
- **draft.md**: P2 is disposed as **"correction (material)"** on the claim that "'latest'
  contradicts both reproduction and the brief", grounding execution defaults in nbconvert
  "per-cell timeout 'is 30 s', `allow_errors` defaults to False" (S06); §8 asserts exactly three
  executed checks (retrieval/record, structural acceptance checks, checksum freezing) and that
  no notebook, Docker build or badge ever ran.
- **discovery.md**: key negative finding that "none of these review tools executes notebook
  code" (A1, from S01); drift finding that repo2docker's detection list contains `install.R`
  and `DESCRIPTION` but "no renv.lock" (S04 vs S07, chain B); four lenses L1–L4 each grounded
  in answer-conditioned Q→A chains; §10 freeze statement that discovery was saved before
  `reveal-plan.py` and `plan-root-only.md` was never accessed.
- **research/source-map.json**: 13 immutable IDs with URL/version/locator/access-timestamp and
  operations, e.g. S11 Renku "accessed … via WebSearch extraction; direct fetches of
  docs.renku.co and renkul.io failed with DNS errors in this sandbox", and S13 Code Ocean
  "NOT ACCESSED … HTTP 404 on /product; HTTP 403 on /"; `usage_billing` recorded null for every
  source.
- **revealed-plan.md**: the frozen thin plan text "P1: Store notebooks in Git. P2: Run each
  notebook in a Docker container using the latest dependencies. P3: Capture stdout and HTML as
  proof. P4: Resolve data URLs at execution time. P5: Show a green reproduction badge when exit
  code is zero. P6: Add collaborative annotations later." — verified character-identical to the
  verbatim quote in `draft.md` §1.
- **research/sources tree**: `INDEX.md` tables all 13 IDs S01–S13 with version and role (e.g.
  S06 nbconvert 7.17.1 "30 s/cell timeout, allow_errors=False, kernel from metadata"; S13
  marked "NOT ACCESSED (404/403); evidence absent, excluded"); each ID has a bounded extract
  file present.

## Cross-input integrity checks executed at ingestion

1. `sha256sum discovery.md` = `b40894b4d7601b018b50da306365c2880499f51b644cc7c3399e21436273a5c1`
   — matches the draft's freeze claim "sha256 `b40894b4…73a5c1`, 18000 bytes" (draft §0); file
   size 18000 B confirmed.
2. `python3 -c json.load` on `research/source-map.json` succeeds; stage "research"; index
   points at `sources/INDEX.md`, which exists.
3. Revealed-plan text vs draft §1 quote: identical (checked by reading both).
4. Deadline from input-map: **2026-10-09T19:00:57.047784+00:00** (stage) / arm
   2026-10-09T19:28:01+00:00; critic writing must protect the last quarter per assignment §3.

## Initial tension candidates for critique.md (to be adjudicated there, not here)

- P6 disposition is a split ("rejected as sequenced / optional enhancement reframed") — O4's
  six-way taxonomy does not name a "split" disposition; is this compliant or a hidden merge?
- Chain B's absence claim ("no native renv.lock in repo2docker") rests on a docs page whose
  own version is unpinned ("latest", mutable drift) — challenge applicability.
- S11 Renku evidence entered via search-result extraction after DNS failures — challenge
  whether it can ground L3/P4 claims at primary-source strength.
- P5 "uncertain" disposition vs O6: does the draft's tri-state badge recommendation cross
  from uncertain into an ungrounded design choice?
- Draft's proposed validations 1–6 duplicate discovery §9's 1–5 in part — check separation of
  executed vs proposed remains clean and non-double-counted.
