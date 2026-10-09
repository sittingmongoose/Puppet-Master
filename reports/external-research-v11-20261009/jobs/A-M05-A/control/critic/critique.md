# Critique — ER11 S05 museum-search, block A-M05-A, arm control, stage critic

Method M05 v1 retained-investigator, critic stage. Inputs read in full: the brief (cases/S05/brief.md), the frozen
thin plan (revealed-plan.md), the research stage's discovery.md, draft.md, source-map.json and all ten retained
evidence files under research/sources/ (SRC-01…09 + index.md). Independent verification: nine public primary sources
fetched this session (≈2026-10-09T19:50–19:52Z), treated as data; per-claim verdicts in `notes/verification-verdicts.md`,
inventory in `notes/claim-inventory.md`. No runtime existed for product witnesses; nothing below is an executed check
of product behavior — source verification only (O6 honesty). Grade vocabulary: **material** = could change a decision,
disposition or implementation; **minor** = wording, grading hygiene, or completeness without decision impact.

## 1. Summary verdict

The draft is fundamentally sound. Every quoted primary-source default I re-fetched (SQLite FTS5, Meilisearch settings,
pgvector CHANGELOG, IIIF 3.0, Mukurtu home/support, RightsStatements repo) matched the research evidence verbatim, with
zero misquotes and zero silent rebinds; the negative-evidence log (SRC-09) is honest and my independent retry of the
OpenRefine fetch reproduced the same failure class. All six P1–P6 dispositions use the O4 vocabulary and are defensible
in direction. The material findings below are therefore mostly about **grounds, scope and completeness**, not about
wrong facts: two "uncertain" registers were resolvable with one fetch each, two rejection grounds overreach the brief,
one correction conflates two distinct mechanisms, and one family of alternatives is silently absent.

## 2. Material findings

**M1 — P4 rejection: grounds (a) and (d) overreach; the rejection itself likely stands.** Grounds (b) fragility and
(c) index-removal-is-not-enforcement are sound (category (c) is doc-supported: pgvector pre-0.8.0 filtered under-return
is the same query-time-filtering lesson, SRC-02, verified). But (a) assumes an enforcement-latency requirement — the
brief says rights *change*, never that changes must be publicly effective within minutes — so the "up to 24 hours
exposure window" is a user decision input, not a discovered defect. And (d) ("removal destroys curator visibility") is
weaker than stated because the draft's own P1 correction already allows a separate internal index scope, with which a
nightly public-index removal could coexist. Re-scope P4: rejection upheld on (b)/(c) + curator-transparency design
preference; (a)/(d) downgraded to conditions/user decisions. This matters because P4 is one of only two rejections and
drives the replacement architecture (query-time visibility filtering everywhere; Mukurtu-style protocols).

**M2 — Two draft "uncertainties" were resolvable with one fetch each; the research stage stopped short.**
Draft §6 lists as uncertainty (3) the RightsStatements full hierarchy (site HTTP 526) and as (2) Typesense defaults
("docs index points into versioned API pages; not fetched"). Both were obtainable without the canonical site or any
privileged access: the repo's own `rights-statements.ttl` at master enumerates the complete statement set, and
`/docs/30.2/api/search.md` (exactly the path the research agent's SRC-08 llms.txt index recorded) states the typo
defaults. O1/O2 demand investigation to the primary surface; stopping at the index level when the primary page one
click away was fetchable is a completeness gap, not a sandbox limitation. Consequence for the comparison the draft
actually makes (P1/P2 engine choice): Typesense's verified defaults (num_typos=2; min_len_1typo=4; min_len_2typo=7;
typo_tokens_threshold=1) differ materially from Meilisearch's (0/1/2 typos at ≥9/≥5/≥9-boundary bands; first-char
counts double; max 2) — Typesense allows one typo on shorter words and two from ≥7 chars, so the draft's "engine-level
behavioral differences unknown" framing understated a knowable difference. (Numerical-fuzz behavior: Meilisearch
`disableOnNumbers=false` verified; the Typesense corpus I fetched does not surface an equivalent parameter — left
uncertain, stated.)

**M3 — RightsStatements: the 12-statement set is now evidence-settled, and both prior lists were incomplete in
different ways.** Master TTL defines exactly: InC, InC-OW-EU, InC-RUU, InC-EDU, InC-NC, NoC-NC, NoC-CR, NoC-OKLR,
NoC-US, NKC, CNE, UND. The research agent's SRC-07 observed only 7 of these (missing NoC-CR, NoC-OKLR, NoC-US, NoC-NC,
UND) and my own critic-inventory hypothesis ("likely adds UND, OOC, NoC-NC, NoC-OKLR, NoC-US") was itself partly wrong —
**OOC is not defined** in the current master vocabulary (it survives only in a removal comment as undecided "OOC-NC"),
while NoC-CR, which I did not predict, is in the set. Materiality: the draft's P4 recommendation to surface rights via
RightsStatements URIs survives, but any local statement-allowlist must be drawn from the verified twelve, and the
draft's "full hierarchy unconfirmed" hedge is now discharged — the final deliverable should state the twelve rather
than carry the uncertainty forward. (Canonical site remains untested from this session; repo TTL is the governing
primary artifact. Noted, not hidden.)

**M4 — P1 correction conflates record-level visibility with field-level sensitivity.** The draft's hard correction
("index a declared public-field list, never a blanket all-fields default") is sound practice, but its stated grounds
assume the catalog *contains* sensitive fields (internal curator notes, donor/rights-holder contacts) — the brief
asserts restricted *material* (records), not restricted fields on public records. The two mechanisms are distinct
(record hidden by P4's query-time filtering vs. field excluded from the public index even when its record is public),
and the correction's force depends on the second existing, which is unknown user-side data. Re-scope P1: keep the
allowlist as a recommended default, explicitly conditioned on a user decision about what field-level sensitivity
exists locally.

**M5 — A whole alternatives family is silently absent (O1 gap).** The Solr/Elasticsearch/OpenSearch family is never
named, nor are museum-domain platforms adjacent to the problem (CollectiveAccess, Omeka S, Islandora). At 40k records
all are plausibly rejectable on ops appetite — but O1 requires independent discovery and *disposition*, and §4/§8 of
the draft claim alternatives coverage without these. The omission is material because the engine-choice user decision
(P1) is presented as SQLite/Postgres-FTS5 vs Meilisearch vs Typesense as if that were the discovered universe.
(Justifiable rejection is easy: a JVM cluster for a small museum's 40k records; the finding is the silence, not the
answer.)

**M6 — Validation V3 is listed without its applicability condition.** V3 (filtered KNN recall on pgvector) is only
executable if the engine choice lands on Postgres+pgvector, which draft §1 P1/§5 leave as an open user decision; §7
presents V1–V6 as one instrument without per-item conditions (V6's condition is stated, V3's is not). O6 requires
applicability statements. Fix: mark V3 conditional on the Postgres stack, and note that if Meilisearch/Typesense wins,
the pgvector chain evidence (SRC-02) becomes inapplicable background.

**M7 — P3 "captions double as alt text" is a false-correction risk.** Catalog captions are content-bearing text about
the object, not descriptions written to screen-reader contract; treating caption = alt text can produce accessibility
theater (long captions read wholesale, or captions that omit what the image visually shows). The draft presents this
as a correction of the plan; at best it is an optional enhancement requiring its own check (V-set candidate: alt-text
sampling). Material because a reader would implement it as stated.

## 3. Minor findings

- m1 — P5 "rejected": direction defensible from the brief's transparency/export obligation (overlay-with-provenance
  is the right default), but "rejected" overstates necessity: in-place writes with an audit trail are a known
  alternative pattern; correction-with-strong-default is the accurate disposition. Wording, not direction.
- m2 — P6: "ten queries cannot discriminate" is asserted without any sample-size evidence, and the replacement
  "30–50 staff-written visitor queries" carries the same insider-vocabulary bias the draft imputes to curator
  favorites (staff wrote them). The uncertainty flag is correct and should be retained; the framing is inconsistent.
- m3 — P2 pin wording: "pin ≥0.8.4" is a superset pin; iterative scans alone need ≥0.8.0 (verified). A reader could
  infer <0.8.4 lacks filtered scans. Clarify, don't change, the pin.
- m4 — Evidence-grade hygiene (GR1): "verified" grades quote-accuracy against the fetched surface, not source
  authority (Mukurtu marketing/support pages; Meilisearch learn-guide). The draft's usage is internally consistent and
  SRC-09 says so, but the final deliverable should keep the distinction visible once more where Mukurtu patterns are
  recommended.
- m5 — Meilisearch "0 ≤ oneTypo ≤ twoTypos ≤ 255" (SRC-03): my independent API-reference fetch confirmed
  twoTypos ≥ oneTypo ≥ 0 but did not surface the ≤255 upper bound — residual sub-claim uncertainty, not contradicted.
- m6 — SRC-02 is a mutable master branch; quotes are pinned here by tag+date (0.8.7 @ 2026-10-01, verified verbatim).
  The draft's "releases pinned by tag inside evidence" note satisfies the drift rule; keep the pin when citing.

## 4. Verified base (what the critique confirms, after independent re-fetch)

- FTS5: unicode61 default; remove_diacritics '1'; bm25 k1=1.2/b=0.75 hard-coded; NEAR default 10; external-content
  consistency is the operator's job ("creating the triggers does not copy existing rows"; ['rebuild'] re-syncs);
  contentless_delete 3.43.0+; max token 32768 bytes; arbitrary order without ORDER BY rank. (SRC-01 exact.)
- Meilisearch settings defaults: enabled=true, oneTypo=5, twoTypos=9, disableOnWords=[], disableOnAttributes=[],
  disableOnNumbers=false. (SRC-03 exact at the API-reference layer it did not fetch.)
- pgvector chain verbatim: 0.8.0 iterative index scans (2024-10-30); 0.8.3 HNSW vacuum corruption fix (2026-06-17);
  0.8.4 vacuum/memory fixes; buffer overflows 0.8.2/0.8.6/0.8.7; 0.7.0 halfvec/sparsevec/binary_quantize; 0.5.0 HNSW;
  0.8.1 binary_quantize perf. (SRC-02 exact, every header and bullet.)
- IIIF 3.0: URI pattern; "Region THEN Size THEN Rotation THEN Quality THEN Format"; non-`^` upscale → 400; level0
  static-file conformance; optional maxWidth/maxHeight/maxArea; CORS "should support"; 3.0.0 "Orange Blooms"
  2020-06-03. (SRC-04 exact.)
- Mukurtu: GPLv3, WSU CDSC, communities/cultural-protocols/categories, media access via protocols, duplicate/community
  records, TK Labels, Media Content Warnings, manual at docs.mukurtu.org. (SRC-05/06 exact at product-docs level.)
- Honesty items corroborated: SRC-09's OpenRefine failure reproduced independently this session (same failure class);
  the draft's §7 "no check below has been executed" is unambiguous and nowhere contradicted (OM7 closed).

## 5. P-disposition adjudication (O4)

| P | Draft disposition | Critic adjudication |
|---|---|---|
| P1 | correction + user decision (partially already-covered) | Uphold, re-scope grounds (M4): allowlist is a conditioned default; field sensitivity is a user decision input, not a discovered fact. |
| P2 | optional enhancement + correction | Uphold; wording of the ≥0.8.4 pin clarified (m3); per-field vs whole-record embedding stays a design judgment to be settled by V1, which the draft does say. |
| P3 | correction + already-covered + condition | Uphold IIIF substitution and serving-layer condition (verified); strike/downgrade the caption=alt-text correction (M7) to an enhancement with its own validation. |
| P4 | rejected | Uphold the rejection on grounds (b)/(c) + transparency; re-scope (a)/(d) as conditions/user decisions (M1); Mukurtu-pattern replacement graded product-documented, not deployment-verified (m4). |
| P5 | rejected | Downgrade to correction-with-strong-default (m1): overlay-with-provenance is the right default, outright rejection is stronger than the brief compels. |
| P6 | correction + uncertain | Uphold both parts; note the self-bias tension in the golden set (m2) and keep the uncertainty. |

No disposition is directionally wrong; two carry overweighted grounds and one overweights its verdict strength.

## 6. Discovery/alternatives adjudication

Retained properly: single-Postgres vs dedicated engine; Mukurtu adoption vs pattern-borrowing; IIIF level-0 vs dynamic
server; reconciliation vs search-side compensation vs model-assisted suggestions (all conditioned, graded). Missing and
required in the final: named-and-disposed Solr/Elasticsearch/OpenSearch (M5) and at least acknowledged museum-platform
alternatives (CollectiveAccess/Omeka S/Islandora, M5); Typesense defaults now insertable from verified evidence (M2).
No silent rebind or ID instability was found anywhere in the research sources; redirects were documented (SRC-06, SRC-09).

## 7. Validation applicability (O6)

V1: applicable always; note staff-written-query bias (m2). V2: applicable always; now has concrete expected values for
both engines (M2). V3: conditional on Postgres+pgvector — must be labeled (M6). V4: applicable to any stack; the
strongest rights check; keep. V5: applicable to any IIIF path; level-0 smoke is near-free. V6: conditional on Approach
A, whose mechanics remain unverified (SRC-09 + this session's failed retry) — the draft already says so; keep.
Proposed-vs-executed separation is honest throughout; nothing in this critique was executed against product code.

## 8. Critic-side limitations and self-corrections (recorded, not hidden)

- My own inventory hypothesis about the RightsStatements set was corrected by evidence (M3): NoC-CR in, OOC out.
- The Meilisearch "≤255" bound was not confirmed by my fetch (m5) — left uncertain rather than asserted.
- rightsstatements.org canonical site was not attempted this session; the repo TTL was taken as governing primary
  artifact. OpenRefine docs remain unfetchable from this sandbox (two independent failures, same class).
- No premium/evaluator access used; no candidate repair attempted — repairs belong to the M05 reviser stage.
- Source records for everything above: `source-map.json` (this stage) with immutable SRC-C01…C09; research-stage
  SRC-01…09 remain immutable and were only read.

## 9. Net assessment

Directionally reliable, evidence-honest draft whose fact base survives adversarial re-fetching wholesale. To be
revised (reviser): re-scope P4 grounds and P1 conditioning, downgrade P3's alt-text claim, downgrade P5 to
correction-with-strong-default, add the missing alternatives dispositions, label V3's condition, and replace the two
now-resolved uncertainties (RightsStatements twelve; Typesense defaults) with their verified values. Everything else
stands as written.
