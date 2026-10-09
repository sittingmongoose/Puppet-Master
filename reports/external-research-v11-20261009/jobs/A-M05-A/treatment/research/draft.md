# Draft — S05 museum-search (block A-M05-A, arm treatment, stage research, method M05 v1)

Written 2026-10-09 ~19:47 UTC, after `reveal-plan.py` froze discovery (reveal at 19:44 UTC; `discovery.md` mtime 19:43, `source-map.json` 19:41). Discovery was not rewritten after the reveal. Evidence citations (S01–S18) refer to `source-map.json` / `sources/` as frozen. Plan quotes are verbatim from `revealed-plan.md`. This draft is a complete planning deliverable for this scope; later stages (critic, final) may correct it.

## Disposition legend (per O4)

Every P gets exactly one primary disposition from: **correction** (clause is directionally right but wrong in a consequential detail), **optional enhancement** (sound clause, valuable addition beyond it), **user decision** (genuine product/policy choice the museum must make, not a technical finding), **already-covered** (discovery already substantiates the clause as-is), **rejected** (clause as stated should not be built), **uncertain** (cannot be adjudicated on current evidence).

---

## P1: Index all fields with keyword search.

**Disposition: correction.**

Keyword indexing of the catalog is the right backbone — 40k records is trivial scale for every engine studied, and all three server/embedded options are viable (S01 FTS5, S07 Meilisearch, S08 Typesense), with MiniSearch (S06) viable client-side. "All fields" is wrong in three consequential details:

1. **Some fields must be excluded or given exact-match semantics.** Accession numbers and other identifiers need exact matching, not typo tolerance: Meilisearch's `disableOnNumbers: true`/`disableOnAttributes` exist precisely so "123 will not match 132" (S07); Typesense needs `:=` instead of `:` (S08). Indexing internal/administrative fields into a public search surface is also an access-policy leak (see P4).
2. **"All fields" has a mechanical cost in FTS5:** external-content tables index explicit columns, sync via triggers the implementer owns ("It is still the responsibility of the user to ensure that the contents of an external content FTS5 table are kept up to date", S01), and triggers added after data load do not backfill — `rebuild` does. A field inventory and a sync test are conditions.
3. **Relevance needs configuration, not defaults-blindness:** FTS5 BM25 has hard-coded k1=1.2, b=0.75 (S01), so tuning is column weights only; Meilisearch gives 4-letter words zero typo tolerance by default (oneTypo=5, S07) — deadly for catalog vocabulary ("mask", "jade"); Typesense's num_typos=2 has no minimum length (S08). Field weighting (title/description/material) must be deliberate in whichever engine.

**Retained finding:** the engine-default disagreement on short words is the sharpest discriminator in this area (discovery §2, §9).
**Condition:** engine choice (user decision, below) plus a field inventory (curator decision).
**Alternative kept:** single-file SQLite (FTS5) or Typesense-one-server vs MiniSearch static-site; decided by P4's policy needs and operating budget.
**Uncertain:** actual field list and description length distribution of the 40k records (not in brief; discovery never saw data).

## P2: Add embeddings of each entire record for semantic search.

**Disposition: correction.**

Semantic search is the right second pillar for visitors without expert vocabulary, and the discovered encoders are fit for purpose (all-MiniLM-L6-v2: 384-dim, 22.7M params, Apache-2.0, S09). "Each entire record" is wrong in a measurable way and an architectural one:

1. **Truncation:** "input text longer than 256 word pieces is truncated" (S09). Uneven catalog descriptions over ~256 tokens silently lose their tails — the embedding represents the record's head, not the record. Correction: chunk long descriptions (and/or embed head + curator summary), or accept and measure the loss (validation V3).
2. **Whole-record blur:** concatenating all fields embeds accession number, dates, and names together; multi-object records blur further. Correction: embed the descriptive prose (with field weighting on the keyword side), keep identifiers out of vectors.
3. **Hybrid, not vector-only:** pure vector search drops keyword precision for names/numbers. Typesense's built-in hybrid fuses ranks as `0.7*K + 0.3*S` keyword-leaning by default (S08) — a safer default for museum queries; its `embed.from` auto-embedding with built-in models (`ts/e5-small`, `ts/all-MiniLM-L12-v2`) removes the pipeline burden. sqlite-vec (S11) is the single-file alternative, pre-v1 with a DELETE-bug fix release (v0.1.9, 2026-03-31) as its volatility evidence.

**Retained finding:** domain gap (Reddit-heavy training mix vs catalog prose) is plausible and unquantified (S09; discovery §3).
**Optional enhancement (beyond clause):** CLIP image embeddings for query-by-image ("image search, zero-shot image classification" listed uses, S10) — the plan has no image-search capability at all. Blocked on unverified CLIP facts (dim/77-token/license not on the fetched card).
**Uncertain:** sqlite-vec ANN vs brute-force status (README silent, S11); hybrid-mode typo tolerance in Typesense (S08 page silent).
**Validation:** V3 (truncation recall), V4 (sqlite-vec KNN quality/latency).

## P3: Publish resized images with their catalog captions.

**Disposition: already-covered (core), with one correction and one optional enhancement.**

"Resized images" is already-covered as the low end of a standard pipeline: IIIF Image API 3.0 (S02) formalizes exactly this — `info.json` contract, `{region}/{size}/{rotation}/{quality}.{format}` grammar with specified 400/501 failure semantics, and compliance **level0** (fixed sizes) servable from pre-generated static files with no dynamic server. Captions belong in the catalog/metadata layer (rendered beside the image), not baked into pixels.

- **Correction:** publishing derivatives can leak embedded metadata — Cantaloupe's own release history includes fixes for "issues related to EXIF metadata parsing" (S18), and EXIF on originals can carry GPS/author data; scrub at generation time.
- **Correction (rights plumbing):** IIIF `info.json` has an optional `rights` property and `service` hook for auth services (S02) — publish rights with the image, not only in the search index.
- **Optional enhancement:** deep zoom (level1/2 tiling + OpenSeadragon, S17) for high-resolution objects. If adopted, pin ≥6.0.2/6.1.1 and regression-test the WebGL drawer on kiosk hardware — 5.0.1 shipped a fix cluster including "the WebGL drawer would draw the image in white" (#2620, S17).
- **User decision:** static pre-generated sizes (cheap, long-lived, no server) vs a IIIF server (Cantaloupe; inherits a dependency-CVE treadmill per S18 issue #634 and a ~19-month release gap) vs hybrid (static public sizes, server only where zoom is justified).

**Retained finding:** level0-vs-server is the cost lever for a small museum (discovery §5).

## P4: Restricted records are removed during the nightly index job.

**Disposition: rejected as stated; correction toward tiered, event-driven policy.**

Two flaws, one mechanical, one philosophical:

1. **Removal is the wrong policy shape.** The discovered access model (IIIF tiered access, S03) 302s clients to a lower tier or 401s with auth services (External → Kiosk → Clickthrough → Login) — restricted material can show *that it exists* (metadata, low-res tier) while gating the full tier. Blanket removal also hides culturally restricted items from the communities and researchers who most need to know they exist; Local Contexts TK Labels (S16) express *conditions* of access (seasonal, gender-restricted, secret/sacred) — conditions imply tiers, not erasure.
2. **Nightly is the wrong latency for "changing rights."** Rights changes are assertions with dates in the discovered model (RightsStatements URIs versioned in-path, `/1.0/`; a change = new dated assertion, S15) and can arrive as takedown requests; a nightly batch leaves a 24-hour exposure window and no same-day compliance path. Re-index on rights-row change (event or intra-day job), and keep the batch job only as a reconciliation sweep.

**Correction kept from the clause:** there *must* be an automated propagation step from rights rows to the search surface — the nightly job's instinct is right, its trigger and granularity are wrong. Also note the P1 interaction: if search is client-side (MiniSearch), removal from the index is impossible post-shipment — the index payload itself must be tiered (public index excludes restricted records entirely; a server-side index can filter per request).
**User decision:** per-class policy — which restriction levels get (a) full removal from public index, (b) metadata-only tier, (c) low-res image tier — a museum/community governance choice (TK labels require community partnership, not software defaults, S16).
**Uncertain:** exact taxonomy of the museum's restriction classes (brief says "some restricted cultural material" without categories).

## P5: Enrichment writes directly to source records.

**Disposition: rejected as stated; correction to assertion-then-apply.**

Direct machine writes to source records destroy exactly what the brief demands ("curators need transparent corrections"): no provenance, no diff, no undo. Discovery §4 established the alternative shape: enrichment candidates are recorded as **assertions with provenance** — which vocabulary (Getty AAT, 74,460 concepts under ODC-By 1.0, S05; or Wikidata via `wbsearchentities`, limit default 7/max 50, S04), which match, what confidence, who/what proposed it — and curators approve, correct, or reject; approval applies a *versioned, dated* statement (the RightsStatements pattern generalizes: add a dated row, never overwrite history).

Machine-only confidence is bounded by discovered evidence: AAT carries generic terms only ("'cathedral' is in scope but Chartres Cathedral is not", S05 — agent/place/iconography needs other vocabularies not yet investigated), and Wikidata language fallback silently widens matches unless `strictlanguage` is set (S04). Any "auto-apply high-confidence matches" must be an explicitly flagged, reversible fast-path (optional enhancement), not the default write path.

**Retained finding:** enrichment is a workflow feature (candidate → review → applied), not a batch job (discovery §4, §7).
**Condition:** curator review UI and an assertions table are in scope when this clause is built.

## P6: Validate search with the curator's favorite ten queries.

**Disposition: correction (keep, shrink, and extend).**

Curators' ten queries are expert-vocabulary probes — the one population the brief says *already has* vocabulary. Kept as a regression slice, they cannot be the validation standard for "meaningful discovery without expert vocabulary." Correction: extend to a mixed suite (all proposed, none executed — no runtime was available):

- **Known-item queries** for retrieval sanity (title/accession lookups).
- **Short-word typo set** ("mask", "jade" misspellings) — directly discriminates Meilisearch's oneTypo=5 default against Typesense's num_typos=2 (S07 vs S08; validation V1).
- **Visitor-task queries** ("something like a teapot from the 1800s", object-type browsing via AAT facets, S05).
- **Truncation recall set** — long descriptions embedded whole vs chunked at the 256 word-piece limit (S09; V3).
- **Rights-behavior checks** — restricted items appear per tier policy (P4), rights changes propagate same-day (V7), pinned rights vocabulary resolves (V6 — re-check after the observed 526 outage of rightsstatements.org, S15).
- **Client-side load probe** if MiniSearch/static is chosen — 40k-record index weight and first-query latency on low-end mobile (S06; V5).

**Retained finding:** validation must separate *executed* checks (in this phase: artifact existence, JSON validity, reveal-timestamp ordering) from *proposed* work — nothing in V1–V9 has run (discovery §10; O6).

---

## Cross-cutting retained findings (O5 — restated, not replaced by IDs)

One: every candidate engine has consequential defaults that must be consciously set (BM25 weights, typo thresholds, diacritics, hybrid alpha, per_page caps). Two: rights and cultural access are data-model concerns (versioned assertions, tiered services), not nightly-batch concerns. Three: the image pipeline has a cheap standard form (level0 static) whose upgrade path (IIIF server + deep zoom) carries operational weight (CVE treadmill, WebGL regressions). Four: enrichment is valuable exactly insofar as it is auditable. Five: the "unfamiliar tool" finds — sqlite-vec, TK Labels, IIIF Auth kiosk pattern, Typesense built-in embeddings, Wax-style minimal computing — each carry a named condition (pre-v1 volatility, community partnership, cookie deprecation, model pinning, exhibit-scale focus).

## Optional capabilities and user decisions (consolidated)

1. Search engine: embedded SQLite (FTS5 ± sqlite-vec) vs Meilisearch vs Typesense vs client-side MiniSearch (depends on P4 policy, operating budget, restricted-tier architecture).
2. Image pipeline: static level0 vs IIIF server vs hybrid (depends on deep-zoom demand and scanning/upgrade appetite).
3. Restricted-material tier taxonomy per restriction class (with communities where TK Labels apply).
4. Auto-apply threshold for high-confidence enrichment (or none).
5. Deep zoom scope (which objects warrant level1/2).
6. CLIP image search adoption (blocked on verifying dim/limit/license from config/paper, S10).

## Uncertainty register (post-reveal updates in bold)

Carried from discovery §9: MiniSearch ranking basis unspecified; CLIP dim/77-token/license unverified; sqlite-vec ANN status; TK Label canonical count (page self-inconsistent, S16); Omeka S / Pawtucket2 search depth unverified; OpenSeadragon 5.0.x year attribution inferred; Typesense hybrid typo interplay unstated; rightsstatements.org 526 outage (availability drift). **New from reveal comparison: the field inventory and description-length distribution of the 40k records; the museum's restriction-class taxonomy; whether "all fields" includes any fields with privacy or policy exposure — all three are data facts this phase could not observe and gate P1/P2/P4 respectively.**

## Validation ledger — proposed vs executed (O6)

Executed in this phase (only): artifact existence/non-emptiness checks, `source-map.json` JSON-validity assertion, 18-source ID uniqueness, reveal-timestamp ordering (`discovery.md` 19:43 ≤ reveal 19:44), `plan-root-only.md` never read. **Proposed, not run:** V1 short-word typo discrimination (S07/S08); V2 FTS5 diacritics/tokenizer behavior (S01); V3 MiniLM truncation recall (S09); V4 sqlite-vec KNN + delete re-test (S11); V5 MiniSearch index weight on mobile (S06); V6 rights-vocabulary pinning drill post-outage (S15); V7 IIIF tiered-access walkthrough with OpenSeadragon (S02/S03/S17); V8 image-server dependency scan (S18); V9 enrichment precision sample graded by curators (S05/S04). No runtime was available for any of V1–V9; nothing here pretends otherwise.

## Open questions carried to the critic

(1) Is tiered-access (P4 correction) acceptable to the museum's communities and counsel where legal takedown requires true removal? (2) Should P2's embeddings include image vectors (CLIP) despite unverified card facts? (3) Does the ten-query suite (P6) survive as a curated regression fixture once the visitor-task suite exists? (4) Engine choice ordering: does P4's tiering requirement eliminate client-side search outright for the restricted subset, or only force a two-index split?
