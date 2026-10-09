# ER11 research draft — museum-search (S05)

**Block/arm/method:** A-M11-B / treatment / M11 entity-community-research-synthesis  
**Prepared:** 2026-10-09 UTC  
**Scope:** complete planning deliverable for the brief, exact revealed clauses P1–P6, and evidence in [discovery.md](discovery.md).  
**Evidence navigation:** [source index](sources/index.md) · [machine-readable source map](source-map.json) · [revealed plan](revealed-plan.md).

## Recommendation

Retain a public keyword-search baseline, but replace “all fields” with an explicit approved-field allowlist and access policy. Treat semantic embeddings as a later, optional and evaluated capability over a deliberately selected subset of public text; reject embedding every entire record by default. Make image publication and permitted record/field visibility explicit curator and community policy decisions. A nightly index refresh is insufficient as the only restriction mechanism when rights can change: apply current policy at search, detail, export, manifest, image-info, derivative, and cache boundaries, and define revocation timing. Enrichment should be reviewed and staged with provenance before source-record updates. Validate with a representative, user-informed query set and a reproducible permission/revocation matrix rather than ten favored queries alone.

This fits the stated collection scale as a bounded discovery project, but no performance or cost guarantee is possible without the schema, hosting, query and image profile, visitor traffic, operational context, and policy rules. No product choice is final. For catalog cleanup, OpenRefine reconciliation is a useful curator-side option; for image delivery, IIIF and a static derivative path are alternatives; Local Contexts may support culturally specific labels/notices when communities and institution choose it. Search-engine, embedding-provider, image-server, rights vocabulary and governance workflow choices remain contingent.

## Critic/reviser pass

I performed a second, skeptical pass against the source neighborhoods and corrected one material retrieval error before plan reveal: the search-result listing had associated the title about facet counts with issue number #6591, but opening the exact #6591 URL shows an open Meilisearch 1.52 report about hybrid ranking-score changes after adding a null searchable field. The source evidence, source map, discovery ledger and validation proposal now reflect the direct issue page. I found no remaining facet/count claim for that issue.

I checked each consequential product recommendation against the relevant local source note and linked source section: OpenRefine protocol version and human-review/performance conditions; Meilisearch ratio/embedder configuration and the exact open issue; IIIF Image/Presentation/Auth scope and rights rendering; Local Contexts Label/Notice distinction and API v2 conditions; and Cantaloupe issue-to-fix release notes. I separated directly documented behavior from inferences about the museum's risk. In particular, the need to keep policy checks current across copies/caches is a design inference from mutable rights and restricted content, not a quoted product feature. No product was installed, no service API was called, and no test result is claimed.

### Cross-clause disposition labels

- **Already covered, with an incomplete boundary:** P1 includes keyword search, P3 includes resized images and captions, and P6 includes query validation. Retain those concepts only under the corrections in the matrix.
- **Optional enhancement:** limited-field hybrid search, local authority reconciliation, IIIF presentation/deep zoom, and a live Local Contexts connection if the collection/community and operations conditions support them.
- **Uncertain:** actual visibility rules, community protocols, source system, external processing permission, runtime, cost, languages, traffic and service support are unknown until the museum supplies decisions/evidence.
- **Rejected:** blanket embeddings of each entire record in P2, as specified.
- **Correction:** P1, P4, P5 and P6 need narrowed fields, current policy enforcement, staged provenance and a broader evaluation respectively.
- **User decision:** P3 requires the museum's rights/access policy and community direction for each relevant class of images and captions.

## Exact per-clause dispositions

| Plan clause | Disposition | Retain, correct or reject |
|---|---|---|
| **P1: “Index all fields with keyword search.”** | **Correction** | Retain keyword search as the initial retrieval baseline. Replace “all fields” with a versioned, reviewed allowlist of fields approved for public discovery. Separate visitor-facing text from curator-only notes, personal/sensitive details, culturally restricted text, rights evidence, unreviewed enrichment and internal workflow data. Decide whether a restricted item's existence, title, identifier, broad category or thumbnail may appear. Searchable-field selection is itself an access/governance decision, not a performance-only setting. |
| **P2: “Add embeddings of each entire record for semantic search.”** | **Rejected as written** | Do not embed every whole record by default. A full-record embedding can combine public and restricted fields and make sensitive content inferable through result selection or rank shifts; it can also dilute short titles and exact identifiers with noisy descriptions. Embedding can involve an external provider and sends configured document text for processing. **Optional enhancement:** test hybrid search using an explicit, approved text template such as selected public title, public description, approved subject terms and safe aliases. Keep exact identifiers and keyword matching strong. Select model/provider, hosting, ratio, freshness and retention only after data-transfer, rights, multilingual, ranking and cost review. |
| **P3: “Publish resized images with their catalog captions.”** | **User decision** | The institution must decide item-by-item or by approved policy which images, previews, detail sizes and captions may be shown, with attribution/re-use terms, community protocols, expiry and replacement behavior. A resized derivative can still disclose a restricted image; caption text does not establish display permission or provide all required statements. A public image policy must include derivative URLs, cached copies, IIIF manifests/info and direct access. If standardized zoom/viewing is needed, IIIF Image API/Presentation API are a supported alternative to static files; profile and auth behavior must be verified. Display applicable Local Contexts Labels/Notices close to material where adopted. |
| **P4: “Restricted records are removed during the nightly index job.”** | **Correction** | Nightly removal alone leaves a possible exposure window and does not protect direct record endpoints, exports, already-issued media URLs, thumbnails, IIIF manifests/info, cached derivatives, search suggestions or indexes/embeddings not included in the job. Define a canonical policy decision and revocation time, fail closed when status is absent/ambiguous, gate each route and purge/invalidate affected indexes, caches and derived representations. If the museum intentionally chooses a nightly propagation window, that is an explicit risk/owner decision and needs a measured maximum delay and exposure review. |
| **P5: “Enrichment writes directly to source records.”** | **Correction** | Stage proposed changes in a reviewable queue. Keep original text, candidate/authority URI, vocabulary/service and version, source record ID, match score as provided by that service, reviewer, decision, timestamp, rejected/ambiguous status and rollback data. Commit accepted changes through an authorized curator workflow with an audit trail; preserve historic values and export provenance. OpenRefine can support reconciliation and review, including Getty ULAN/AAT/TGN, Wikidata and local CSV-backed authority services. An external candidate match or high score is not approval to overwrite source language, policy, or community terminology. |
| **P6: “Validate search with the curator's favorite ten queries.”** | **Correction** | Retain curator-authored queries as one slice of an evaluation, not the whole acceptance test. Build a judged set covering identifiers, common and specialist terms, spelling variants, ambiguous names, multilingual and culturally preferred terms, sparse records, restricted items, image-only records and no-result queries. Include non-expert visitor tasks and accessibility checks. Compare baseline and candidate modes with exact-match success, recall at k, top-k usefulness, query latency, facet behavior, policy leakage and regression tests. The set size should follow available evaluation time; 50–100 representative queries is a starting proposal, not a fixed guarantee. |

### Why these dispositions follow from the evidence

**P1 — Searchable does not mean publishable.** OpenRefine's reconciliation API separates labels, identifiers, optional types and properties; the service-specific context affects matches. Meilisearch requires deliberate searchable/filterable settings. The catalog is explicitly described as having changing rights and restricted cultural material, so “all fields” conflicts with the brief unless every field receives a documented visibility approval. Preserve exact IDs with keyword search and construct public-facing synonym/term maps without replacing collection language. Sources: [S01](sources/01-enrichment.md#s01), [S02](sources/01-enrichment.md#s02), [S07](sources/02-search.md#s07), [S17](sources/04-rights-governance.md#s17), [S18](sources/04-rights-governance.md#s18).

**P2 — Keep embeddings narrow and optional.** Meilisearch's v1.6 article documents a configured embedder and semanticRatio from 0 to 1, with 0.5 as that release's default; it does not justify an implicit ratio for a later target version. Current docs describe embedding templates and low-relevance results. Current issue #6591 reports score/ranking-path changes when a null field is added to searchableAttributes in reported Meilisearch 1.52. The issue is open and not independently reproduced here. Consequently, field-schema changes and score thresholds need target-version regression checks. A hybrid mode may help broad-language queries, while lexical search remains preferable for accessions, names, dates and exact terms. Do not infer that semantic recall permits indexing restricted text. Provider cost, billing, retention, security and use terms remain unobserved. Sources: [S03](sources/02-search.md#s03), [S04](sources/02-search.md#s04), [S06](sources/02-search.md#s06).

**P3 — A caption or rights label is not an access rule.** IIIF Presentation 3.0 distinguishes requiredStatement, which clients must render, from rights, which is informative and may not be rendered visibly. RightsStatements.org supplies linked-data summaries of copyright/re-use status and says those statements supplement detailed information and can be inaccurate. Local Contexts Labels and Notices complement copyright; Labels are community-authored/customizable, Notices are institution-facing and non-customizable. IIIF Authorization Flow bridges to an existing access system; it does not define that system's policy. Sources: [S08–S10](sources/03-image.md#s08), [S17](sources/04-rights-governance.md#s17), [S18–S20](sources/04-rights-governance.md#s18).

**P4 — Define and enforce effective access.** A search filter or nightly job does not guarantee that all copies of a record or image are controlled. Meilisearch's tenant-token rules can constrain searches if trusted code issues correctly signed filters; the vendor guide says record-level permission changes stored on documents require reindexing, while a join/access-control index may support more frequent changes. Neither is a museum cultural-policy process. IIIF Auth describes access/token/probe flow over HTTPS, while the institution still supplies authorization. The historical Cantaloupe issue where a 401 delegate response raised an uncaught exception was fixed in 5.0.5. It is evidence for a denial-path regression, not evidence current builds remain defective. Sources: [S05](sources/02-search.md#s05), [S10](sources/03-image.md#s10), [S13–S16](sources/03-image.md#s13).

**P5 — Preserve and review transformations.** OpenRefine retains the original value alongside the selected entity link in a reconciled cell, supports candidate preview and human review, and cautions that ambiguous matches need a choice. For a large set, its manual recommends small batches and notes per-service differences and lack of request-throttle control. A local authority with reconcile-csv/csv-reconcile is an alternative when remote authority matching is unsuitable. Data should only move to canonical source fields through an institution-approved correction path. Source: [S01–S02](sources/01-enrichment.md).

**P6 — Favor a discriminating user-centered evaluation.** Ten favorite queries are too narrow to separate exact identifier behavior, public discovery, multilingual support, sparse text, ranking drift and policy leakage. Include user tasks, not just ranking scores. If Local Contexts applies, community participation and display choices cannot be simulated by curator preference alone. This is a scope correction for the small product brief, not a proposal for unlimited production certification. Sources: [S04](sources/02-search.md#s04), [S06](sources/02-search.md#s06), [S20–S21](sources/04-rights-governance.md#s20).

## Retained findings, optional enhancements and alternatives

### Retained core

- Keyword search is a suitable baseline for known names, accession IDs, exact phrases and specialist terms. Create a public field allowlist, spell correction/synonyms and understandable facets; preserve canonical record values and attribution.
- Curator-controlled enrichment can discover unfamiliar authority links and harmonize variants, but a match remains a candidate until reviewed.
- Changing rights require an effective policy that covers search, details, exports, image service and cache. Rights metadata, community protocols and technical authorization must be represented separately.
- Public results need transparent corrections and export provenance.

### Optional enhancements

- A hybrid keyword/semantic mode can help visitors search by a plain-language description when catalog descriptions support it. It must be evaluated on local queries and restricted to approved text.
- IIIF can standardize image delivery and presentation if deep zoom, compound objects or reuse across viewers matter. Static generated files are a valid lower-operational alternative under the Image API.
- OpenRefine plus Getty vocabularies, Wikidata or a local reconciliation endpoint can be a curator tool, not necessarily a live service dependency.
- Local Contexts API/project embedding can keep Labels/Notices current; static downloaded content is an alternative when third-party calls are unavailable, with a freshness responsibility. API v2 credentials and project visibility are conditions. Communities decide whether/when to apply Labels.
- Cantaloupe is a dynamic Java IIIF server candidate. As accessed, its GitHub releases list shows v5.0.7 as latest while develop contains 6.0 work. Recheck release/security state and Java staffing before adoption.

### Alternatives with different tradeoffs

| Approach | Value | Cost/condition |
|---|---|---|
| Curated lexical index with alias/synonym map | Precise names/IDs; predictable; no embedding provider needed | Less tolerant of conceptual descriptions; requires field cleanup and term governance |
| Hybrid lexical + embeddings | May help natural-language discovery across sparse or varied text | Requires model configuration, template/field approval, model evaluation, data-transfer/cost review and ranking stability checks |
| OpenRefine against public authorities | Fast curator workflow and access to established vocabularies | Remote service terms/availability vary; large reconciliations can be slow; review remains required |
| Local CSV authority and reconciliation service | Keeps local terms under museum control and can avoid remote match calls | Museum maintains authority quality/service; performance not measured |
| Static image derivatives | Lower runtime complexity and easy cache/CDN path | Fixed sizes and less deep zoom; access revocation and derivative refresh still needed |
| IIIF dynamic service | Standardized crops/sizes and viewer interoperability | Adds image server, source/derivative cache, authorization, monitoring and release lifecycle |
| Local Contexts live API/embed | Can reflect community updates and put context near objects | Account/API permissions and service availability/key management; community workflow required |
| Local Contexts static snapshot | Works for print/offline or systems without external API | Must track version/freshness and refresh when communities update; not a substitute for authorization |

## Proposed validation, separated from executed checks

The following are proposals, not completed results:

1. Build a representative judged query set. Compare keyword baseline, synonym/crosswalk behavior and one or more explicit hybrid ratios using top-k relevance judgments from curators and non-experts.
2. Pin Meilisearch version and test exact match, empty query, no match, facets, pagination and score thresholds. Specifically test whether adding null or sparse searchable fields changes order/scores as issue #6591 reports.
3. Use public/restricted test records to inspect leakage through snippets, counts, facets, suggestions, IDs, exports, embeddings and direct APIs.
4. Test public, missing-token, expired-token, revoked-token and allowed access across item detail, manifest, info.json, thumbnail, image tile, full size, static derivative, cache and export. Test policy revocation while a warmed cache exists.
5. Check IIIF profile declarations, image dimensions/region/size outputs, CORS, required attribution statement and chosen viewer behavior over HTTPS. Compare static resources and the candidate dynamic server against image format/traffic needs.
6. Run small OpenRefine reconciliation samples by entity type, record matched/unmatched/ambiguous rates and curator false positives, confirm service terms and request limits, and test export round-trip retaining source value and authority URI.
7. Have curators complete correction, reject, undo and export tasks; inspect audit history and role restrictions.
8. Where community material exists, review item/field visibility, wording, community contact/approval, Label/Notice placement and update/revocation process with the relevant communities.

### Executed in this research stage

- Read the exact assignment and input-map, and the brief named by that map.
- Consulted public primary documentation, specifications, repository release history and issue/discussion pages listed in source-map.json.
- Saved discovery.md and source-map.json before invoking the reveal script.
- Ran the declared reveal-plan.py command successfully and then read revealed-plan.md.
- Created this comparison draft.
- **No implementation tests, benchmarks, product API calls, external provider transactions or runtime checks were executed.**

## User decisions and unresolved facts

- Which fields are public, restricted, conditionally visible or never indexed; may an item's existence and public identifiers be shown?
- What are the actual rights categories, review owners, embargo/revocation SLA and permission groups?
- Which communities and protocols apply, who can approve or change public wording, and does Local Contexts fit the museum's existing relationship and agreement?
- Which catalog source is authoritative and how can corrections/exports be staged and reverted?
- What languages, transliteration, visitor goals, common query patterns and accessibility requirements matter?
- Are hosted embeddings and remote authorities allowed to receive catalog text? Which provider, model, retention terms, rates, budget and fallback are acceptable?
- Are zoomable images and multi-page presentation required? What formats, storage, traffic and operations support exist?
- Which search/image runtime can the museum safely operate, and how often can it patch and review releases?

Until those decisions and validations are resolved, recommendations remain conditional. The brief is small in product scope; the work does not claim comprehensive rights adjudication, community consent, production capacity or universal access safety.

## Sources

Full source provenance, version/revision, URL, locator, observed operations and usage/billing state are recorded in [source-map.json](source-map.json), with bounded evidence notes in [sources/](sources/index.md).
