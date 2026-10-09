# ER11 S05 museum-search — independent discovery (pre-reveal)

Case: A-M05-A / control / research. Written 2026-10-09 before any plan reveal (reveal-plan.py not yet run; discovery frozen by it afterwards). Scope: the brief's product problem only — a public search interface for a local museum with 40,000 catalog records, uneven descriptions, images, changing rights and some restricted cultural material; visitors need meaningful discovery without expert vocabulary; curators need transparent corrections and exports. Every claim is graded: **verified** (an evidence file under `sources/` quotes the source; ID in brackets) or **candidate** (named from domain knowledge, primary evidence absent — logged in SRC-09). Runtime: no runtime/sandbox was used to execute any product code this session; nothing below is an executed check (O6 honesty).

## 1. Problem decomposition

Four load-bearing sub-problems, in dependency order: (a) metadata enrichment (uneven descriptions, no expert vocabulary), (b) search (keyword baseline + semantic layer), (c) image handling (serve derivatives, search by content, keep rights visible), (d) access policy (restricted cultural material, changing rights), plus (e) the curator workflow (corrections, exports) that wraps all of them. A fifth cross-cutting condition: anything the public sees must be enforced server-side, because a public interface cannot trust the client.

## 2. Metadata enrichment (O1/O2)

**Approach A — reconciliation to external authorities. Candidate (unverified).** OpenRefine + a reconciliation service (e.g., Wikidata's; Getty AAT/LCSH as other authority targets) aligns messy local strings against authority vocabularies in a human-reviewed batch UI. My primary-source fetch of the OpenRefine reconciling docs failed (SRC-09, content-filter error), so mechanics (endpoint contract, auto-match thresholds) are unverified. Retained because it directly matches "curators need transparent corrections": reconciliation proposals are review-before-commit by design.

**Approach B — search-side vocabulary compensation. Verified defaults.** Instead of enriching all 40k records up front, the search layer can carry synonyms/term expansion. Verified here for the cost side: FTS5 gives none of it built in — default tokenizer `unicode61`, diacritics stripped for Latin script, bm25 with hard-coded k1=1.2/b=0.75, no synonyms (SRC-01). So a FTS5-based baseline needs an application-level synonym layer; Meilisearch/Typesense ship synonyms as a setting (candidate — synonyms setting itself not fetched this session).

**Approach C — model-assisted description drafting. Candidate (unverified).** Embedding/LLM-generated draft descriptions or back-of-image captions, always as *suggested* fields a curator accepts/edits. No primary source fetched; retained as an alternative shape. Condition either way: enrichment must be stored as attributed, reversible overlays (who/what/when produced it), never silent in-place edits of the catalog record — otherwise "transparent corrections and exports" is impossible and rights changes can't be audited.

**Governing defaults worth honoring (O2):** enrichment pipelines must not destroy original fields (export needs original + enriched side by side); authority URIs (e.g., RightsStatements SKOS URIs, SRC-07) should be stored as identifiers, not display strings, so wording changes don't corrupt data.

## 3. Search (O1/O2)

**Baseline keyword — SQLite FTS5. Verified (SRC-01).** Zero-dependency; 40k records is trivially small for it. Consequential behaviors: external-content tables make index/content consistency the operator's job (triggers don't backfill pre-existing rows; `'rebuild'` needed) — with curator edits flowing constantly this is a real silent-drift risk; `contentless_delete=1` (3.43.0+) partially fixes the contentless variant; NEAR defaults to 10 tokens; prefix queries need explicit prefix indexes; results unordered without `ORDER BY rank`. Applicability: strongest when the museum wants everything inside one Postgres/SQLite database and accepts no built-in typo tolerance.

**Typo-tolerant keyword — Meilisearch. Verified defaults (SRC-03).** Typo tolerance on by default with exact thresholds: ≤4 chars → 0 typos; 5–8 → 1; ≥9 → 2; first-char typo counts double; hard max 2; `disableOnNumbers=false` by default (numeric fuzz on). For a museum this is consequential: accession numbers and short personal names sit exactly in the 0–1-typo band, and numeric fuzz can conflate `1943`/`1949` dates or registry numbers — per-attribute `disableOnAttributes` is the governing knob a curator-facing config needs. Facets/filters built in.

**Alternative engine — Typesense. Candidate, index verified only (SRC-08).** Same product class ("open-source typo-tolerant search engine"), documented curation API (pin/hide/replace per query — a direct mechanism for curator overrides), built-in embedding generation + hybrid search in one binary. Its exact typo/ranking defaults were not obtained (docs index points into versioned API pages; not fetched). Retained as a serious alternative to Meilisearch; choosing between them needs the unverified-defaults comparison plus license/hosting terms.

**Semantic layer — pgvector on Postgres. Verified release chain (SRC-02).** HNSW since 0.5.0 (2023-08-28); `halfvec`/`sparsevec`/`binary_quantize` (memory reduction) since 0.7.0 (2024-04-29); **iterative index scans since 0.8.0 (2024-10-30)** — this is the fix for the governing default that pre-0.8.0 index scans could return fewer rows than requested once a filter (e.g., a rights/visibility filter) was applied. That interaction is exactly what a restricted-material museum catalog hits. Embeddings for text and images (e.g., sentence-transformers, CLIP) are candidate mechanisms — no model docs fetched this session. Applicability: at 40k records, exact (non-indexed) scan is also viable; HNSW is an optimization, not a requirement — which de-risks the 0.8.3-class regressions below.

**Issue/fix/release chain (O3). Verified (SRC-02):** 0.8.3 (2026-06-17) "Fixed possible index corruption with HNSW vacuuming"; 0.8.4 further HNSW vacuum/memory fixes; a 2026 run of buffer-overflow fixes (0.8.2 parallel HNSW build, 0.8.6 IVFFlat 32-bit, 0.8.7 IVFFlat build). Evidence for a Meilisearch/Typesense equivalent chain was not gathered this session (absent, stated per O3). Condition: pin pgvector ≥0.8.4 (iterative scans + vacuum fixes) and treat minor upgrades as release-note reading events.

**Hybrid search. Condition/uncertainty.** Combining bm25 and vector scores (reciprocal-rank fusion or Typesense built-in hybrid) is the default modern answer, but it is an *evaluation* result, not an assumption: on short, jargon-poor records semantic recall can rescue vocabulary mismatch, while on accession-number-style queries exact keyword must dominate. Marked uncertain pending the O6 validation set.

## 4. Image handling (O1/O2)

**IIIF Image API 3.0. Verified (SRC-04).** One master image + URL-derived derivatives: `{base}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}` plus `info.json`; processing order fixed ("Region THEN Size THEN Rotation THEN Quality THEN Format"); upscale blocked by default (`^max` to allow); conformance levels 0/1/2, where level-0 permits pure static files; optional `maxWidth`/`maxHeight`/`maxArea` limits; CORS expected. Applicability: a small museum can start at level 0 (pre-generated tiles on static hosting) and move to a dynamic server (Cantaloupe/IIPImage — candidates, not fetched) only if zoom/region demand it. Rights interaction: because serving is per-identifier request processing, watermarks, quality downgrades or region restrictions for restricted material can be enforced in the serving layer rather than baked into files. An image-server choice is therefore an access-policy decision, not just an imaging one.

**Image search. Candidate (unverified).** CLIP-style joint image/text embeddings via pgvector (same store as text vectors) enable "find things that look like this" for visitors without vocabulary. Evidence for model specifics absent this session.

## 5. Access policy and restricted cultural material (O1/O2)

**Protocol-based access pattern — Mukurtu. Verified product evidence (SRC-05, SRC-06).** Mukurtu (GPLv3, Washington State University's Center for Digital Scholarship and Curation) models access as **communities + cultural protocols + categories**, gates media access by protocol membership, uses **duplicate/community records** for tiered views of the same object, **Traditional Knowledge (TK) Labels** for use-expectation communication, and **Media Content Warnings** for sensitive media. Even without adopting Mukurtu wholesale (migration cost from an unknown system of record), this is the domain's established pattern: access decided by community-defined protocol membership per record, not a single public/private flag.

**Standardized rights statements — RightsStatements.org. Verified at repo level (SRC-07).** SKOS vocabulary, CC0-licensed, URI-identified; observed statement IDs InC, InC-EDU, InC-NC, InC-OW-EU, InC-RUU, CNE, NKC. Caveat: the canonical site returned HTTP 526 twice, so the full 12-statement hierarchy is **unconfirmed** — evidence absent (SRC-09). "Changing rights" then means re-pointing a record's statement URI, and history is exportable.

**Design conditions (retained constraints):** enforcement server-side and per-record at query/serve time (never client-side hiding); visibility filters must compose with the search layer (this is where pgvector <0.8.0 would silently under-return — SRC-02); curator UI needs a why-is-this-hidden view; exports must carry rights + provenance. User decisions: which restriction classes exist locally; whether source-community consultation (Mukurtu-style protocols) applies to this collection.

## 6. Implementation and release conditions

- **Small-ops shape:** two credible stacks — (i) single Postgres: FTS (or trigram) + pgvector + app; (ii) dedicated engine (Meilisearch or Typesense) beside a record store. Both fit 40k records; the choice hinges on ops appetite and the typo/facet defaults above.
- **Version pinning as governance:** pgvector ≥0.8.4; engine settings are versioned surfaces (Typesense docs are versioned per-release, SRC-08) — upgrades must re-check typo/synonym defaults.
- **Curator workflow:** corrections queue with before/after diff, attributed enrichment overlays, CSV/JSON export incl. rights URIs. (All candidate design, no fetched source — product-level synthesis.)
- **Unknowns requiring user/curator decisions:** current system of record and ingest format; domain of authorities (local-history vs art vocabularies); restriction classes; hosting budget. Evidence absent by nature (not public).

## 7. Obligation coverage map (this document, pre-reveal)

- O1: unfamiliar tools/products found beyond any plan — Mukurtu's community/cultural-protocol access model (SRC-05/06), IIIF Image API 3.0 (SRC-04), RightsStatements SKOS vocabulary (SRC-07), pgvector iterative index scans (SRC-02), Typesense curation API (SRC-08), FTS5 external-content mechanics (SRC-01); OpenRefine reconciliation named as candidate (SRC-09).
- O2: primary-source behavior and governing defaults with units/thresholds — FTS5 tokenizer/bm25/limits (SRC-01), Meilisearch typo bands (SRC-03), pgvector version-gated behaviors (SRC-02), IIIF URI contract and conformance levels (SRC-04).
- O3: one issue/fix/release chain investigated — pgvector 0.8.x chain (HNSW vacuum corruption fix 0.8.3, iterative scans 0.8.0, buffer-overflow fixes 0.8.2/0.8.6/0.8.7); absence of equivalent gathered evidence for the engines stated.
- O4: exact P-clause comparison happens only after plan reveal by design (assignment); this document is written before reveal and is not rewritten afterwards — the comparison lands in draft.md.
- O5: alternatives, conditions, constraints, disagreement and uncertainty are retained inline above with evidence grading (verified vs candidate), self-contained prose, no bare-ID substitutions; this same retention carries into the final deliverable.
- O6: discriminating validations proposed in §8, explicitly separated from what was executed (source retrieval only).

## 8. Discriminating validations — proposed, none executed (O6)

1. **Golden query set:** 30–50 staff-written visitor queries; score nDCG@10 for FTS5-bm25 vs Meilisearch/Typesense vs +vector hybrid. Discriminates whether the semantic layer earns its ops cost.
2. **Typo torture:** misspell top-100 titles/accession numbers; verify against the *verified* Meilisearch default bands (0/1/2 typos by length) and `disableOnNumbers` on identifier fields.
3. **Filtered vector recall:** restrictive-rights filter + KNN query on pgvector; compare pre/post-0.8.0 iterative-scan behavior (or exact scan) for under-return. Directly tests the SRC-02 chain's consequence.
4. **Rights enforcement probe:** anonymous role queries for each restricted class must return zero records at API level, including through facets/facet counts.
5. **IIIF conformance smoke:** `info.json` + one region/size request per served image class; check upscale-400 behavior and declared profile level.
6. **Reconciliation pilot (if Approach A pursued):** 200-record OpenRefine sample; measure proposed-match precision at the service's auto-match threshold before any bulk commit.

Executed this session: source retrieval only (SRC-01…09). No runtime existed for product witnesses; items 1–6 are proposals.
