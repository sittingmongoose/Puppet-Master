# Native answer — ER11 S05 museum-search, A-M05-A/control, critic stage (complete final answer)

Critic verdict on the control/research draft (method M05): **directionally reliable and evidence-honest; the fact
base survives independent adversarial re-fetching wholesale; five targeted revisions are required before the final.**

## What was verified (independent re-fetch, ≈19:50–19:52Z, 2026-10-09)

Every quoted primary-source default matched the research evidence verbatim, zero misquotes, zero silent rebinds:
SQLite FTS5 (unicode61 default tokenizer, remove_diacritics '1', bm25 k1=1.2/b=0.75 hard-coded, NEAR N=10,
external-content consistency duties incl. "creating the triggers does not copy existing rows" + ['rebuild'],
contentless_delete 3.43.0+, 32768-byte token cap, arbitrary order without ORDER BY rank); Meilisearch typo settings
(enabled=true, oneTypo=5, twoTypos=9, disableOnNumbers=false, from the API-reference layer the researcher had not
fetched); the pgvector 0.5.0→0.8.7 release chain (iterative index scans 0.8.0; HNSW vacuum corruption fix 0.8.3;
0.8.4 vacuum/memory fixes; buffer overflows 0.8.2/0.8.6/0.8.7; halfvec/sparsevec/binary_quantize 0.7.0); IIIF Image
API 3.0 (URI contract, "Region THEN Size THEN Rotation THEN Quality THEN Format", non-`^` upscale → 400, level0
static conformance, optional max-dimension limits, CORS); Mukurtu (GPLv3, WSU CDSC, communities/cultural protocols/
categories, duplicate records, TK Labels, Media Content Warnings). The research stage's negative-evidence honesty
was corroborated: my independent OpenRefine fetch reproduced the same content-filter failure class, so reconciliation
mechanics remain unverified candidates and the draft said exactly that.

## Material findings (M1–M7)

- **M1 (P4):** the nightly-removal rejection stands on its fragility and category-error grounds, but its exposure-
  window ground assumes an enforcement-latency requirement the brief never states, and its curator-visibility ground
  is contradicted by the draft's own allowance of a separate internal index scope — re-scope those two as conditions/
  user decisions.
- **M2 (O1/O2 completeness):** two draft "uncertainties" were resolvable with one fetch each from surfaces the
  researcher had already indexed — the RightsStatements TTL (repo) and Typesense's versioned search reference.
  Typesense's verified defaults (num_typos=2, min_len_1typo=4, min_len_2typo=7, typo_tokens_threshold=1) differ
  materially from Meilisearch's bands, which the draft's "unknown" framing understated.
- **M3 (RightsStatements):** the master TTL defines exactly twelve statements — InC, InC-OW-EU, InC-RUU, InC-EDU,
  InC-NC, NoC-NC, NoC-CR, NoC-OKLR, NoC-US, NKC, CNE, UND — with OOC absent (removal-comment only) and NoC-CR
  present. The researcher's 7-ID observation and my own critic hypothesis (which predicted OOC) were both corrected
  by the evidence; the draft's refusal to assert the hierarchy from partial evidence was correct discipline.
- **M4 (P1):** the public-field-allowlist correction conflates record-level visibility (brief-given) with field-level
  sensitivity (assumed, user-side unknown) — keep it as a conditioned default, not a discovered defect.
- **M5 (O1 gap):** the Solr/Elasticsearch/OpenSearch family and museum platforms (CollectiveAccess, Omeka S,
  Islandora) are silently absent; they must be named and disposed, even if rejected on 40k-record small-ops grounds.
- **M6 (O6):** validation V3 (filtered KNN on pgvector) applies only if the engine choice lands on Postgres; the
  draft labels V6's condition but not V3's.
- **M7 (P3):** "captions double as alt text" is a false-correction risk — catalog captions are object text, not
  screen-reader descriptions; downgrade to an optional enhancement needing its own check.

## Minor findings (m1–m6)

P5's "rejected" overstates necessity (correction-with-strong-default is accurate; overlay-with-provenance remains the
right default); P6's "ten queries cannot discriminate" lacks sample-size evidence while the 30–50 staff-written
replacement carries the same insider bias it is meant to fix; the ≥0.8.4 pgvector pin wording could imply <0.8.4
lacks filtered scans (iterative scans need only ≥0.8.0); "verified" grades quote-accuracy against the fetched surface,
not deployment authority; Meilisearch's "≤255" bound remains unconfirmed by my fetch (not contradicted); master-branch
sources are pinned by tag+date and must stay so cited.

## Net instruction to the reviser

Keep the draft's structure, evidence grades and honesty register intact. Apply five changes: (1) re-scope P4 grounds
and P1 conditioning per M1/M4; (2) strike the caption=alt-text correction per M7; (3) soften P5 to correction-with-
strong-default; (4) add named dispositions for the missing alternatives per M5; (5) label V3's conditionality (M6)
and replace the two now-resolved uncertainties (RightsStatements twelve; Typesense defaults) with their verified
values. All other content stands as written. Executed-vs-proposed separation remains honest end to end: no product
code was run in either stage; all checks above are source verifications, executed only against public primary
sources treated as data.
