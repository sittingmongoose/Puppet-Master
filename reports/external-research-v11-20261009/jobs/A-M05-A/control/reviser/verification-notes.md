# Verification notes — A-M05-A/control/reviser (ticket 2)

Written 2026-10-09T20:12Z, reviser stage. One entry per criticism ID from `critic/critique.md` (M1–M7 material,
m1–m6 minor; 13 total). Method: every criticism that turns on a factual claim was checked against the predecessor
evidence (`research/sources/SRC-0x`, `critic/notes/verification-verdicts.md`) and the governing text (brief, draft,
revealed plan) by direct inspection this session — not accepted from the critic's prose. Two criticisms (M2, M3)
turned on facts only the critic's fetches held, and my final would assert them; both public primary sources were
therefore re-fetched independently this session (SRC-R01, SRC-R02 below; provisional IDs, formalized in the reviser
source-map.json at ticket 4). Sources treated as data. Usage/billing unobserved: null. All paths relative to
`/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/` unless absolute.

## M1 — P4 grounds (a)/(d) overreach; rejection stands on (b)/(c)

- Factual claims under test: (i) the brief states no enforcement-latency requirement; (ii) the draft's own P1 allows
  a separate internal index scope, weakening ground (d); (iii) ground (c) is doc-supported by the pgvector
  pre-0.8.0 filtered-scan lesson.
- Check: grep of brief text for latency/change language; grep of draft P1 for internal-index allowance; read of
  SRC-02 relevance note.
- Evidence: `cases/S05/brief.md` line 3 ("changing rights … restricted cultural material" — no latency clause);
  `research/draft.md` line 9 ("keep a separate internal index scope for curator search if needed");
  `research/sources/SRC-02-pgvector-changelog.md` line 17 (0.8.0 iterative scans; filter under-return consequence
  stated in its line-23 relevance note).
- Verdict: **confirmed** — re-scope accepted with the M1 nuance: the 24h exposure window is a real factual
  consequence of nightly removal; only its framing as a defect (vs a condition on a user latency decision) overreaches.

## M2 — Draft uncertainties (2)/(3) were resolvable; Typesense defaults differ materially

- Factual claims under test: Typesense 30.2 defaults num_typos=2, min_len_1typo=4, min_len_2typo=7,
  typo_tokens_threshold=1 at exactly the path SRC-08's index recorded; the research stage stopped at index level.
- Check: independent WebFetch GET of https://typesense.org/docs/30.2/api/search.md, 2026-10-09T≈20:10Z (SRC-R02).
  All four defaults confirmed verbatim against the critic's `critic/notes/verification-verdicts.md` C8 entry.
  Bonus: the page documents `enable_typos_for_numerical_tokens` (default true) — the numeric-fuzz knob the critic
  left "no equivalent surfaced"; that residual sub-uncertainty is now discharged.
- Evidence: `research/sources/SRC-08-typesense-docs.md` (llms.txt index naming `/docs/30.2/api/search.md` — the
  one-click-away path); `critic/notes/verification-verdicts.md` C8; SRC-R02 (this session's fetch).
- Verdict: **confirmed and extended** — M2 accepted; final.md states the four defaults plus the numeric-token knob.

## M3 — RightsStatements twelve-statement set settled; OOC absent, NoC-CR present

- Factual claims under test: master `rights-statements.ttl` defines exactly 12 statements (InC, InC-OW-EU, InC-RUU,
  InC-EDU, InC-NC, NoC-NC, NoC-CR, NoC-OKLR, NoC-US, NKC, CNE, UND); OOC appears only in a removal comment; NoC-CR
  is defined; UND is defined.
- Check: independent WebFetch GET of
  https://raw.githubusercontent.com/rightsstatements/data-model/master/rights-statements.ttl,
  2026-10-09T≈20:10Z (SRC-R01). Returned the 12 statement URIs verbatim; UND active (`dc:identifier "UND"`);
  OOC only as `# 2015-09-16: removed (commented) OOC-NC. It is undecided…`; NoC-CR active.
- Evidence: `research/sources/SRC-07-rightsstatements-data-model.md` (research observed only 7 translation files;
  canonical site HTTP 526 twice per `research/sources/SRC-09-failed-fetches.md` entry 4);
  `critic/notes/verification-verdicts.md` C7; SRC-R01 (this session's fetch).
- Verdict: **confirmed** — M3 accepted; the "full hierarchy unconfirmed" hedge is discharged at repo level;
  canonical-site-untested caveat stays.

## M4 — P1 conflates record-level visibility with field-level sensitivity

- Factual claims under test: the brief establishes restricted *material* (records) and never asserts sensitive
  *fields* on public records; the draft's P1 correction assumes such fields exist.
- Check: grep of the brief for "field" (0 hits) and "restricted" (record-framed only); read of draft P1 line 9
  naming "internal curator notes, donor/rights-holder contact fields" as if present.
- Evidence: `cases/S05/brief.md` (whole text; line 3 is the problem statement); `research/draft.md` line 9.
- Verdict: **confirmed** — the field-sensitivity premise is user-side data, not a brief fact; allowlist becomes a
  conditioned default.

## M5 — Solr/Elasticsearch/OpenSearch and museum platforms silently absent

- Factual claims under test: no occurrence of Solr/Elasticsearch/OpenSearch/CollectiveAccess/Omeka/Islandora in the
  research deliverables, while O1 requires discovery and disposition of unfamiliar alternatives.
- Check: case-insensitive grep of `research/draft.md` and `research/discovery.md` for all six names — 0 matches in
  both; O1 text read from the brief.
- Evidence: `cases/S05/brief.md` O1 clause; `research/draft.md` §4/§8 (alternatives coverage claims);
  `research/discovery.md` §6 (small-ops stacks list).
- Verdict: **confirmed** — the silence is real; final.md adds named, graded dispositions (rejection reasoning
  candidate-grade; no new fetch needed).

## M6 — V3 lacks its applicability condition

- Factual claims under test: draft §7 presents V1–V6 as one instrument; V3 depends on pgvector (an open engine
  choice) yet carries no condition, while V6's condition is stated.
- Check: read of draft §7 (single sentence listing V1–V6; V6's gating appears in the P6 disposition instead);
  V3's pgvector dependency confirmed from its own wording.
- Evidence: `research/draft.md` line 54 (§7, V1–V6 in one list; no conditional on V3); `research/draft.md` line 29
  (P6: "reconciliation pilot if that path is pursued" — the contrast case).
- Verdict: **confirmed** — V3 gets an explicit conditional-on-Postgres label plus the SRC-02-becomes-background
  corollary.

## M7 — P3 "captions double as alt text" is a false-correction risk

- Factual claims under test: draft P3 presents caption=alt-text as a *correction* of the plan (word "Corrections:
  (b)"), not an enhancement.
- Check: read of draft P3 line 17; the IIIF facts around it were separately verified (SRC-04/C5, no dispute here).
- Evidence: `research/draft.md` line 17 ("Corrections: … (b) captions double as alt text/accessibility surface").
- Verdict: **confirmed** — split adopted: caption-as-content stays correction; caption-as-alt-text demotes to
  optional enhancement with a proposed alt-text sampling check.

## m1 — P5 "rejected" overstates necessity

- Factual claims under test: draft P5's disposition line reads "rejected" and grounds it solely in the brief's
  transparency/export clause; in-place-with-audit-trail is a real known pattern.
- Check: read of draft P5 line 25 and the brief's curator-transparency clause; the pattern question is design
  knowledge, judged not fetched (no primary source in any retained root asserts or refutes it — stated honestly).
- Evidence: `research/draft.md` line 25 ("**Disposition: rejected.** Direct in-place writes contradict…");
  `cases/S05/brief.md` ("curators need transparent corrections and exports").
- Verdict: **confirmed as wording** — P5 re-graded correction-with-strong-default; the alternative pattern is named
  as candidate-grade reasoning.

## m2 — P6 framing inconsistency (sample-size assertion; staff-written bias)

- Factual claims under test: draft asserts "ten queries also cannot discriminate … at the effect sizes that matter"
  without sample-size evidence, and proposes "30–50 staff-written visitor queries" while imputing insider bias to
  curator favorites.
- Check: read of draft P6 line 29 — both phrases present verbatim; no citation attaches to the discrimination claim.
- Evidence: `research/draft.md` line 29 (P6 disposition); `research/sources/SRC-03-meilisearch-typo.md` (unrelated
  to sample size — confirming no evidence file supports it).
- Verdict: **confirmed** — uncertainty retained; framing restated as design judgment; bias mitigation lead added.

## m3 — "pin ≥0.8.4" is a superset pin; layered requirements should be explicit

- Factual claims under test: iterative index scans arrived 0.8.0 (2024-10-30); HNSW vacuum corruption fixed 0.8.3
  (2026-06-17); further vacuum/memory fixes 0.8.4 (2026-06-30) — so the practical pin is a superset, not the
  filtered-scan floor.
- Check: read of the retained changelog excerpt lines for the three releases; cross-checked against the critic's
  verbatim re-fetch summary (every entry matched).
- Evidence: `research/sources/SRC-02-pgvector-changelog.md` lines 13–17; `critic/notes/verification-verdicts.md`
  C4/C10 (verbatim match, newest entry 0.8.7 2026-10-01).
- Verdict: **confirmed** — final.md states ≥0.8.0 (filtered scans) / ≥0.8.3–0.8.4 (vacuum fixes) layered, keeps the
  ≥0.8.4 practical recommendation.

## m4 — "Verified" grades quote-accuracy, not source authority

- Factual claims under test: Mukurtu evidence is marketing/support-page product documentation (SRC-05 home,
  SRC-06 support index), and Meilisearch SRC-03 is a learn-guide (API layer only fetched by the critic as SRC-C02);
  the grading vocabulary in SRC-09's closing note says exactly this.
- Check: read of SRC-05/SRC-06 evidence headers (page class), SRC-03 header (learn/configuration path vs the
  critic's reference/api fetch), and SRC-09's grading note.
- Evidence: `research/sources/SRC-05-mukurtu-home.md`; `research/sources/SRC-06-mukurtu-support.md`;
  `research/sources/SRC-03-meilisearch-typo.md` (URL path `learn/configuration/`);
  `critic/source-map.json` SRC-C02 entry (API-reference layer); `research/sources/SRC-09-failed-fetches.md`
  (grading consequence note).
- Verdict: **confirmed** — final.md carries the authority distinction once where Mukurtu patterns are recommended.

## m5 — Meilisearch ≤255 bound unconfirmed at the API layer

- Factual claims under test: SRC-03 quotes `0 ≤ oneTypo ≤ twoTypos ≤ 255`; the critic's independent API-reference
  fetch confirmed twoTypos ≥ oneTypo ≥ 0 but did not surface the 255 upper bound.
- Check: read of SRC-03 line 15 (bound present in the learn-guide quote) and the critic's C3 entry (not shown at
  the settings-reference layer; "not contradicted").
- Evidence: `research/sources/SRC-03-meilisearch-typo.md` line 15; `critic/notes/verification-verdicts.md` C3
  (lines 19–21); `critic/source-map.json` SRC-C02 (the fetch that failed to surface it).
- Verdict: **confirmed as residual uncertainty** — retained in final.md, not resolved and not deleted.

## m6 — SRC-02 is a mutable master branch; pins must ride citations

- Factual claims under test: the changelog URL is `master` (moving target); newest observed entry 0.8.7 dated
  2026-10-01; the evidence file records the drift.
- Check: read of SRC-02 header lines; the critic's SRC-C03 entry records the same branch re-fetched with identical
  newest entry, confirming both stability-since-access and the drift discipline.
- Evidence: `research/sources/SRC-02-pgvector-changelog.md` lines 3–5; `critic/source-map.json` SRC-C03 entry;
  `critic/notes/verification-verdicts.md` C10 (all dates matched).
- Verdict: **confirmed** — final.md citations carry tag+date pins; same discipline for Typesense 30.2 versioned
  path and the RightsStatements TTL enumeration+date.

## Session-fetch register (provisional; formalized in reviser source-map.json, ticket 4)

| ID | Source | Access (UTC, ≈) | Operation | Status | Key result |
|---|---|---|---|---|---|
| SRC-R01 | https://raw.githubusercontent.com/rightsstatements/data-model/master/rights-statements.ttl | 2026-10-09T20:10Z | WebFetch GET, statement-enumeration prompt | retrieved | 12 statements; UND active; OOC only in removal comment; NoC-CR active |
| SRC-R02 | https://typesense.org/docs/30.2/api/search.md | 2026-10-09T20:10Z | WebFetch GET, parameter-defaults prompt | retrieved | num_typos=2; min_len_1typo=4; min_len_2typo=7; typo_tokens_threshold=1; enable_typos_for_numerical_tokens=true (default) |

No other public fetch was needed: every remaining criticism resolved against the declared predecessor files and
retained evidence. Canonical rightsstatements.org remains untested from this session (repo TTL treated as governing
primary artifact, per the critic's recorded approach).
