# Museum-search: complete research synthesis and planning draft

**ER11 stage:** A-M11-B / control / research; case S05; M11 entity-community-research-synthesis.  
**Research completed:** 2026-10-09. **Plan reveal:** after frozen discovery.md and source-map.json were saved by the required reveal script.  
**Scope:** a public visitor search interface over 40,000 local museum catalog records with uneven descriptions, images, changing rights, some culturally restricted material, and curator-transparent corrections/exports. This is a planning deliverable, not implementation, policy approval, security certification, legal advice, or benchmark.  
**Execution record:** no runtime, catalog export, target application, rights matrix, qualified witness sandbox, or curator judgment set was supplied. No product behavior was deployed or locally tested, and none of the validations below ran. Public documentation/release behavior is not a test of this museum’s configuration.

## Complete disposition of the revealed plan

| P | Exact plan clause | Disposition | Result in this draft |
|---|---|---|---|
| P1 | “Index all fields with keyword search.” | **Correction** | Retain keyword search as a dependable baseline, but index only explicitly approved/searchable fields. Preserve exact IDs, title/proper-name matches, field weighting, plain-language facets, and current access filters. Do not let the index become an authorization boundary. |
| P2 | “Add embeddings of each entire record for semantic search.” | **Conditional retention plus correction; user/curator decision** | Keep semantic search as an evaluated capability, not an assumed full-record embedding requirement. Embed only approved descriptive text fields, with clear handling of empty text, multilingual coverage, model/provider/privacy/version and reindex costs. Pair it with keyword retrieval; do not embed restricted text or treat distances as confidence. |
| P3 | “Publish resized images with their catalog captions.” | **User/community decision plus correction; optional capability** | Preserve useful approved captions/context, but publish each original, derivative, thumbnail, crop and alternate image only at its authorized tier. Decide whether metadata can remain public when media is restricted. IIIF is an optional interoperability route; resizing/captioning alone does not set or enforce rights. |
| P4 | “Restricted records are removed during the nightly index job.” | **Rejected as the security control; correction** | A nightly deletion leaves an exposure window and misses direct image/metadata/cache/export paths. Use a current policy check at query and object delivery, minimize public index projections, and revoke derived copies promptly. A scheduled job may reconcile/clean indexes but must be defense in depth. |
| P5 | “Enrichment writes directly to source records.” | **Rejected; correction; underlying transparency/export duty already covered by the brief** | The curator-transparent correction/export requirement is already part of the brief. Reject direct source writes; use a separate, reversible proposal/review layer. |
| P6 | “Validate search with the curator’s favorite ten queries.” | **Correction; retain as a seed set when supplied** | The brief and revealed plan do not enumerate those ten queries. Once the curator supplies them, retain them as one useful slice, but add visitor-language, exact-identifier, title, typo, ambiguity, sparse-description, language, access-control and zero-result cases. A held-out, judged set plus task usability and access tests is needed before choosing rank defaults. |

The dispositions below preserve the useful intent while identifying policy and operating decisions that the brief and public documentation cannot settle.

## P1 — Keyword indexing, field selection and discoverability

**Disposition: correction.** Keyword search is necessary for exact object/accession numbers, titles, artist/person names and rare words, and remains a robust baseline for everyday visitor queries. “All fields” is not a safe or useful indexing rule. Searchability must be field- and policy-aware: approved title, public description, creator, date, type, place, material, approved names/subjects and public aliases may be indexed with deliberate weighting; identifiers need exact matching; structured values are often better as filters/facets than dumped into full text. Exclude internal notes, staff-only fields, hidden access instructions, unreviewed enrichment, suppressed names/terms and fields whose visibility has not been decided.

Run current access policy before returning hits and before exposing typeahead suggestions, facets, counts, snippets, spelling suggestions or related-item results. A hidden record can leak through a suggestion or facet count even when the result page is removed. Search projections should contain only approved display fields, and policy must be checked again when opening an object or image. Do not rely on stale/nightly search-index synchronization to decide whether a current visitor can see a record.

The visitor’s non-expert language need calls for everyday terms, aliases, examples and filters that do not require knowing an internal subject vocabulary. Show why an item appeared in ordinary language when useful (title/description phrase match, approved synonym, or related-topic result); do not portray opaque score values as certainty. Keep normalization and synonyms curator-reviewable and reversible. Do not overwrite the original phrase or conceal that a controlled term was added.

**Options and conditions.** If the museum already stores catalog rows in PostgreSQL, PostgreSQL full-text search with configured dictionaries, a GIN index, weighted fields and SQL filters is a low-complexity baseline. PostgreSQL 18 documents GIN as the preferred text-search index; it indexes lexemes and rechecks weighted queries against rows. Field configuration/language and ranking still need work. If current infrastructure makes a purpose-built search service materially simpler, Typesense is an integrated option with text, filters/facets and hybrid vectors. Qdrant is a vector-first alternative with explicit sparse/dense retrieval; it is not automatically necessary at 40k records. The brief does not establish existing infrastructure or operators, so no product can be selected yet. See [S04–S07](sources/01-search-and-ranking.md).

## P2 — Semantic search and embeddings

**Disposition: conditionally retain semantic retrieval; correct “each entire record”; decide after baseline.** Lay-language searches can find objects whose catalog wording differs from visitor phrasing, but embedding every field or complete record uncritically blends IDs, rights metadata, staff notes and heterogeneous descriptions into one representation. A whole-record vector is especially brittle when descriptions are uneven or absent. Separate search fields and model inputs; embed only fields approved for public semantic retrieval, with stable field/model versioning and explicit no-description behavior. Records with no meaningful public prose should not gain artificial relevance from an empty or placeholder vector. Exact identifiers and precise title/name matching should continue to use a lexical path.

Evaluate semantic retrieval beside—not instead of—the keyword baseline. In Typesense v30.2, the documented hybrid default gives keyword rank weight 0.7 and vector rank weight 0.3. Cosine vector distance ranges from 0 to 2, with 0 closest; it is not a probability or calibrated confidence. By default, a hit found by only one leg can retain only that leg’s score; enabling rerank_hybrid_matches computes both components at added cost. Indexing/query behavior also depends on model, field triggers, vector count, language, remote inference and retry/timeouts. A built-in ONNX model avoids provider calls but downloads the model and uses local resources; remote embedding services receive text and make retries, cost, network and privacy operational concerns. Capture model name/version, vector dimensions, source fields, language, generation date and replacement strategy so a model update can rebuild and compare rather than mix embeddings silently. Never send restricted/unapproved text to a provider.

Two architecture alternatives merit a controlled evaluation:

1. If PostgreSQL is already in use, begin with exact pgvector search on the small corpus and access filters so ground truth/recall is explicit. Add HNSW only if exact query latency measured under realistic filters requires approximation. For v0.8.7, standard vector supports at most 2,000 dimensions; HNSW defaults are m=16, ef_construction=64 and ef_search=40. Approximate filtering happens after the index scan; iterative scans introduced in v0.8.0 are opt-in and bounded. This is a condition, not an implementation detail to hide.
2. Typesense offers an integrated search service; Qdrant explicitly fuses named dense/sparse vectors. Qdrant’s current docs describe RRF as equal-weight with k=2 by default; it ranks candidate positions and discards score margins. Prefetch depth and shard placement matter. Weighted RRF is a measured feature in current docs, not an unmeasured default. Use the same judged set across designs.

An optional later capability is a curator-approved “related objects” mode distinct from query search. It must suppress records/media unavailable to the current viewer and disclose when relevance comes from semantic similarity. It should not quietly mix “same artist/title” with “conceptually related” into one unexplained ordering.

## P3 — Images, captions and rights-dependent publication

**Disposition: image/context publishing is conditional on a policy decision.** A resized image and catalog caption are useful public discovery components only if both are approved at that access tier. Rights can change, and item metadata, original media, thumbnails, preview/zoom derivatives, generated alternatives, IIIF manifests, cached bytes and exports can each have different conditions. Model these separately. “Public item with restricted media” is a credible state: Mukurtu v4 explicitly demonstrates open item/metadata with strict image-media protocol, and an option to synchronize or independently govern asset protocols. This is a useful data-model precedent, not proof that adopting the CMS is appropriate.

IIIF Image API 3.0.0 is a strong optional interoperability mechanism when zoom, crop, region, format or reusable viewers matter. Its URI describes image delivery and info.json capabilities; its scope does not manage images or enforce cultural policy. It can be backed by static derivatives too, so it does not require a large dynamic service. IIIF Authorization Flow 2.0.0 is an optional browser pattern if authentication/tiered content is real: restricted Image API services declare probes in info.json, transport is HTTPS, tiers/substitute resources use distinct URIs, and the content provider defines actual authorization. Test the full delivery boundary, not only what the viewer hides: original-source URLs, image APIs, info documents, manifest/annotation data, thumbnail paths, cached/CDN variants, direct downloads, response snippets, public index, reports/exports and access after a rights change.

**Research inference from S10–S13:** a rights statement, cultural label, descriptive caption or user-interface badge does not by itself guarantee that a request for protected bytes is denied. IIIF Image API describes delivery/capabilities, while IIIF Auth describes the viewer/provider access flow and Local Contexts describes community-specific context/rules; the server still needs to enforce the institution’s policy on each protected resource. Local Contexts TK Labels may be valuable where communities choose them; do not invent equivalent labels, use them without relevant cultural authority, or assume a displayed label prevents retrieval. Decide whether content should be public, masked, lower-resolution, limited to particular members, temporarily withheld, or fully suppressed; for each, specify who can decide/review, which assets and metadata share the rule, whether access requires login or another mechanism, how changes propagate and who receives notice. Unknown or expired rights should have explicit “review required” state, not mean unrestricted.

Cantaloupe can be assessed as a IIIF server rather than presumed required. Release records show a 4.1 authorization callback evolution and v5.0.5 fixed an uncaught exception when authorize() returned HTTP 401 (commit 096ffed). That history supports denial-path testing; it does not certify current Cantaloupe or establish IIIF Auth 2.0 support in a chosen version. Pin a release and test version-specific image info, authorization, response, derivative and cache behavior. Current observed releases and notes are in [S14–S15](sources/04-evolution-and-regressions.md).

## P4 — Restricted data and nightly index job

**Disposition: reject the nightly job as the enforcing boundary; retain only as synchronization/cleanup.** A nightly process creates an interval in which a changed restriction can remain searchable. It also does not control direct object URLs, image derivatives, cached snippets, alternate formats, exports, duplicate media keys or a second index. Simply removing an entire restricted item may conflict with a policy that permits a public title/record while keeping its media restricted; the museum must decide.

Use a current, auditable access policy at retrieval and at every content/media response. Restrict search index payloads to approved fields; apply authorization and rights state to hits/counts/facets/suggesters and recheck before fetching authoritative object data or bytes. A near-real-time update may promptly remove or refresh an index projection, and nightly reconciliation can catch stale state, but neither may grant access that current policy denies. Keep access decisions, allowed substitutes and expiration/review markers explicit. Purge or invalidate all derivatives/caches on restriction changes; use distinct URIs/cache keys for different access tiers. Apply the same policy to curator/guest export actions, but make the export’s authorized scope and audit visible.

Specific index/database/asset architecture is a user/operations decision because no existing infrastructure was provided. The protected object store should be private for restricted source files; if any source is already public and unrevocable, the museum needs a policy decision before it is indexed or linked. A background nightly job may repair synchronization drift; it cannot be the security mechanism.

## P5 — Enrichment and direct source edits

**Disposition: reject direct-write enrichment; correct to staged, reviewable proposals.** The brief asks for curator-transparent corrections and exports. OpenRefine’s official manual says reconciliation is semi-automated and requires human review; service scores are not comparable across authorities, typos/whitespace affect default string matching, and exact-ID mode skips lookup. Treat enriched values as candidates with provenance and service-local confidence semantics, not truth. Use small batches and manually inspect ambiguous entities before any bulk approval.

Maintain original catalog value and current source-of-record separately from proposed normalized forms, public aliases, authority links, generated tags and reviewer-edited values. For every proposal record: original value; proposed value; source authority URI and source version/date; algorithm/model/service and settings; service-local candidate score/evidence; reviewer, decision, timestamp and reason if supplied; resulting export fields/destination. Show added, changed, retained and rejected items and preserve a revert path. Do not quietly treat a Getty or Wikidata record as the sole community naming authority. Do not autonomously enrich cultural or rights-policy fields. Exact external authorities and treatment of legacy data require museum/domain/community input. See [S01–S03](sources/02-curation-and-vocabulary.md).

**Optional path:** run a contained OpenRefine pilot on a catalog copy or approved field export against Getty AAT/TGN/ULAN and a separate local authority where warranted. Reconcile the appropriate column/type, bring in corroborating fields if the service exposes them, inspect candidate judgments and preserve operation history. Do not depend on retired Getty XML services or static archived data as if current.

## P6 — Ten curator queries

**Disposition: ten favorite queries are a useful seed, not sufficient validation.** The brief and plan do not supply the ten query strings, so they cannot be reproduced here. When the curator provides them, retain them exactly as one labeled query slice. A small convenient set cannot represent visitors’ language or expose leakage/false matches. Before choosing rank weights, model or threshold, add a held-out set judged by curator and representative non-expert visitors (or otherwise capture their plain-language tasks) across these classes:

- accession/object numbers and unique IDs with punctuation, variants and near-match IDs;
- exact/partial title, artist/person name, place/date/material, rare historical term, spelling variant and common typo;
- everyday description of an object using terms absent from its record; broad theme versus precise lookup; ambiguous names/terms;
- long conversational or multiword search, short one-word query, empty/no-match query and no-description records;
- approved multilingual names and terms if the collection warrants them;
- public, restricted, pending-rights and public-record/restricted-media items, including terms that must be withheld.

Blind-judge relevance on a reserved split; tune on a separate split. Compare lexical-only, a specific hybrid default, proposed changed fusion weights and relevant alternatives, with exact identifiers as a separate hard requirement. Report top-k relevance (nDCG@10/MRR/recall@k where appropriate), exact-ID success, no-result/refinement success, false matches, task completion and p50/p95 latency. Assess UI readability and whether a visitor understands why an item appears, where terms confuse, and whether a result suggests a restricted record exists. Measure accuracy under the same access filters visitors will see.

## User/community and operating decisions still needed

Public sources and the brief cannot answer these:

1. Who has authority to designate sensitive cultural material and set conditions, including representatives of relevant communities/knowledge holders? What review, correction, appeal, seasonal/expiring and emergency-withdrawal paths do they control?
2. Which parts may be public separately: title/identifier/record, description, object existence, thumbnail, full image, metadata exports, semantic embedding/search cues, usage label and original download? Are masked or low-resolution alternatives acceptable?
3. What does “restricted” mean for this museum: public record/restricted image, logged-in group, request workflow, time-bound restriction, suppression, or multiple policies? What happens when rights are unknown or expired?
4. Does a catalog database, DAM/image server, identity provider or search index already exist? Who operates upgrades, models, hosting, backup, physical-object links and revocations? What are latency/availability goals, traffic, budget and allowable third-party processing?
5. What languages, historical terms, accessibility expectations, geographic/name coverage and visitor tasks matter? Which fields may feed embeddings and external inference? Does model text leave the museum? Are license, retention and attribution acceptable?
6. What corrections/exports are authorized, where do exports go, which fields/provenance accompany them, who may bulk approve, and how is rollback/denied export logged?
7. Should search default to keyword while semantic mode is evaluated, or can a staged hybrid pilot expose results to visitors? What judged quality/latency/access thresholds are required?

Until answered, use reversible architecture and evaluation. Do not assume a public policy taxonomy, organization infrastructure or confidence threshold.

## Retained alternatives and uncertainty

- **Database-first:** PostgreSQL FTS, deterministic filters, exact vectors and later measured pgvector HNSW if a current PostgreSQL catalog exists. Simpler operations may help; search language and UI still need measurement.
- **Integrated search service:** Typesense for a single search feature set and simple operational proof; rank, vector, remote-model and reindex defaults require review.
- **Vector retrieval service:** Qdrant with dense+sparse retrieval and RRF when relevance evidence warrants the extra data synchronization and operations.
- **Curation/authority:** OpenRefine plus Getty/local reconciliation for reviewable cleanup. It is a workflow companion, not runtime search; services and authority data can drift.
- **Image interoperability:** IIIF Image API / Authorization Flow and a pinned server such as Cantaloupe if multi-size/region/reusable viewer/tier features warrant them. Static derivatives may be simpler. Mukurtu is a full alternative if cultural protocols and participatory workflow drive the product; Local Contexts Labels may complement chosen policy but do not enforce it.

Unknowns include whether an existing stack can meet p95 at 40k, which model fits languages/content/query forms, whether descriptions can be embedded outside the museum, actual image formats/cache behavior, rights completeness, which communities must approve policy/labels, and staff capacity to operate model/index/reconciliation refreshes. Public documentation cannot answer; tests and stakeholder input can.

## Proposed validation versus executed work

### Proposed and not executed

1. Build a representative, access-approved snapshot of all 40k records plus media metadata. Track missing/short descriptions, languages, duplicate identities and file formats. Do not ingest or transmit restricted prose/media without approval.
2. Use a held-out curator/visitor-judged query set described above. Compare baseline PostgreSQL FTS where relevant, Typesense, and Qdrant/pgvector only under common data/model/authorization snapshot. Report query class and filters with each metric; use separate tuning and evaluation splits.
3. For ANN, compare output/count/order to exact vector ground truth after every category/rights filter. Record pgvector versions, HNSW parameters, iterative_scan mode and caps; include selective/broad filters, 40k scale, latency, shortfall and exact recall. If considering Qdrant, sweep dense/sparse candidate depths and tune RRF weights only on a separate training split. If Typesense, compare documented .7/.3 default with tuned alpha on training queries and check component scores/timeouts.
4. Audit the information surface as signed-out visitor, permitted member, disallowed member and staff export roles: record endpoint, search, autosuggest, snippets, result counts/facets, info.json, every image URL, alt/preview image, manifest, annotation, static/original file, derived/cache/CDN bytes and export. Assert denied requests contain no prohibited data and allowed substitutes use distinct URIs. Change access, invalidate caches, repeat.
5. In an OpenRefine sample, include exact IDs, spelling/whitespace variants, near-duplicate people, ambiguous terms, no match, low/duplicate scores and culturally sensitive terms. Compare scores only within a service; inspect approval/revert, source-value preservation, source/version attribution and export round-trip.
6. Run representative supported images (large, EXIF-rotated, unusual aspect, cropped, color/line art, corrupt/unsupported) through the proposed delivery path; verify info.json profiles and actual endpoints, captions/context/alt text, IIIF clients, caches, resize latency, rights-change revocation and errors.
7. Benchmark full import/rebuild, incremental changes, model generation, inference billing/local CPU, backup/restore and correction/export under known hardware/network. Record model license/version and source fields. Test accessibility and visitor task observation for terms, empty states, filters, ranking cues and screen-reader access.

### Executed

- Read assignment, exact input-map.json and its declared case brief. Predecessors/source roots are empty; no other case plan, history, evaluator or counterpart was read.
- Consulted and recorded public primary sources and exact locators in source-map.json; short evidence notes are in sources/.
- Wrote frozen discovery.md and source map before invoking the prescribed plan reveal script. Read only resulting revealed-plan.md afterwards.
- No software, database, query, import, media access-control, accessibility, curator study or performance validation was run. No runtime was available and the assignment permits only an already qualified witness sandbox; none was provided.

## Source navigation

Start at [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Source IDs map to exact public URLs, versions/tags when available, locators, access-request timestamp and observed browser operations. discovery.md is the independent pre-plan record and is frozen; comparison and synthesis are maintained here.

