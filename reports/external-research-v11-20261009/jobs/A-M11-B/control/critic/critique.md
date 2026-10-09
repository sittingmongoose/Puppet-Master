# ER11 M11 critic — museum-search

**Stage:** A-M11-B / control / critic; case S05. **Reviewed:** 2026-10-09.  
**Scope:** independent review of the exact brief, revealed P1–P6 plan, the complete declared research draft/discovery/source map, and all five notes under the declared research `sources/` root. I also reopened governing primary documentation and independently selected public primary sources. I read no parent, counterpart, evaluator, or campaign/history material. No candidate repair or runtime validation was performed; the prescribed critic artifacts are this critique and its source map/evidence notes.

## Assessment

The research draft is unusually careful about exact identifiers, rights-sensitive delivery, versioned behavior, community authority, and what was not tested. Its central dispositions on P1, P3, P4, and P6 are sound. I found no primary-source contradiction in its stated Typesense .7/.3 default, pgvector exact-search baseline and dimensions, Qdrant RRF defaults, OpenRefine human-review caveat, IIIF delivery/auth separation, or the pinned Cantaloupe 5.0.5 HTTP-401 fix (C03–C08; inherited S01–S15). The issues below are mostly overbroad requirements or unmade operating decisions, not reasons to discard the draft.

## Material findings

### M1 — Keep public search and curator search as separate scopes (P1)

The correction to “all fields” is right for the public projection: field approval, least disclosure, and checking suggestions/facets/snippets as well as result rows matter. But the recommendation to exclude all staff-only/internal fields can be read as excluding them from every search surface. The brief also requires curator transparency and exports; it does not say whether curators need staff-only search. State the role boundary explicitly: public search indexes only fields approved for public discovery; a curator workspace may search separately approved staff fields under staff authorization and audit, if that is a product need. Do not expose the staff index, its facets, counts, or suggestions through public endpoints. This is a scope decision, not a reason to weaken the public projection.

### M2 — Narrow P2’s “descriptive text only” rule

Rejecting unrestricted whole-record embeddings is justified: the record may combine identifiers, internal notes, rights data, and restricted wording. However, embedding only prose descriptions may omit useful approved structured metadata such as public title, creator, object type, material, place, date, and reviewed aliases. Typesense’s versioned documentation explicitly supports generating an embedding from concatenated selected source fields (C03, lines 175–184). The safer correction is “a deliberately constructed, versioned, public semantic representation,” with field allowlisting and provenance, rather than either the entire database row or prose alone. Compare prose-only and selected public metadata representations on the same judged set. Preserve a distinct no-description/no-context state; do not synthesize semantic evidence for it. Keep identifiers and access-control fields on deterministic paths.

### M3 — Distinguish copyright/reuse status from delivery authorization (P3/P4)

The draft correctly warns that a label or IIIF viewer flow does not itself enforce access. Make the data model and access matrix express this distinction directly. RightsStatements.org describes its vocabulary as communicating copyright and reuse status for digital objects (C02, lines 35–37); that scope does not decide whether a museum serves an image, public metadata, a cultural protocol, or a member-only derivative. Those are related but distinct decisions. Store/link the descriptive rights statement, institution delivery policy, and community-defined protocol separately, with authority and review provenance. Test a record where public metadata is allowed but the original image, thumbnail, caption, or derivative has a different rule. Do not infer one field’s permission from another.

### M4 — Turn “current policy” into an observable revocation contract (P4)

Reject the nightly job as the sole access control. The proposed test matrix is comprehensive, but “check current policy” and “promptly remove” have no operational boundary. Define the authoritative policy source, maximum acceptable time from a restriction change to denial at each public route, cache/CDN invalidation behavior, and what happens when policy or identity lookup is unavailable. Set those bounds with the museum; do not invent a universal number. Use fixtures with an explicit permission oracle for each role × record field × media derivative, so a security test does not incorrectly demand hiding metadata the museum intentionally permits. Assert that unauthorized outputs reveal none of the specifically withheld representations, while allowed metadata/substitutes remain available. Include facets, autocomplete, snippets, logs/analytics, exports, and direct asset URLs in the matrix.

### M5 — Replace categorical rejection of source writeback with a review gate (P5)

Reject unattended enrichment that overwrites authoritative source values. The stronger claim “reject direct source writes” is broader than the brief or the evidence supports. A curator-approved correction may be written back to the system of record if it provides actor/decision provenance, versioning or a recoverable original, authorization, export visibility, and a tested rollback path. If those guarantees or APIs are absent, use a separate proposal/enrichment layer. The disposition should therefore be: stage proposals; require human approval; allow only controlled, auditable writeback where the source system supports recovery. OpenRefine’s documented semi-automated review workflow supports the approval gate, not a blanket prohibition on approved writeback (C07).

### M6 — Add Meilisearch as a bounded lexical challenger, not a product recommendation

One useful independent option is missing from the alternatives list: Meilisearch could be compared as a lexical-first, typo-tolerant alternative to PostgreSQL FTS and Typesense. Its first-party documentation describes configurable typo tolerance, including disabling it on numeric tokens or identifier fields; the default accepts no typo below five characters, one for five-to-eight characters, and two for nine or more (C01). That is directly relevant to visitor typos versus accession/object IDs. Add it only as an optional challenger if a small proof is warranted; verify deployed version, field settings, licensing/hosting and data policy before selection. This source supports behavior, not a claim that it will outperform another engine.

## P-by-P disposition review

| Plan | Critic disposition | Finding |
|---|---|---|
| P1 “Index all fields with keyword search.” | **Keep correction; clarify scope.** | Public field allowlist and leak surfaces are appropriate. Add a separately authorized curator-search decision (M1). |
| P2 “Add embeddings of each entire record for semantic search.” | **Keep conditional evaluation; refine correction.** | Exclude unrestricted rows and restricted fields, but compare controlled public metadata templates as well as prose-only (M2). |
| P3 “Publish resized images with their catalog captions.” | **Keep conditional decision.** | Access and rights can differ by representation. Separate copyright/reuse descriptions from delivery policy and community protocol (M3). Captions and generated alt/context also need their own approved fields. |
| P4 “Restricted records are removed during the nightly index job.” | **Reject nightly-only enforcement.** | Keep event-driven/index cleanup as defense in depth and enforce every protected route. Add a museum-set revocation bound and fail behavior (M4). |
| P5 “Enrichment writes directly to source records.” | **Reject unreviewed overwrite; conditionally permit approved writeback.** | Use proposal/review by default. A reversible, audited source update after curator approval is not inherently incompatible with transparency (M5). |
| P6 “Validate search with the curator’s favorite ten queries.” | **Keep as a seed, not the sole evaluation.** | Exact queries are absent from the supplied brief/plan, so they cannot be reproduced. Add visitor-language, identifier, ambiguity, sparse-description and access cases; split tuning from held-out judging. Do not invent the ten queries. |

## Minor findings and limits

- The proposed validation inventory is valuable but risks becoming a one-shot procurement bake-off across too many engines and modalities. For this small brief, first agree a field/access model and judged query set, then compare a baseline plus one challenger. Add further engines only if that result leaves a real decision unresolved.
- Report p50/p95 and ranking metrics as measurements, but do not imply acceptance thresholds from them. The museum must choose latency, relevance, completeness, accessibility, and revocation targets before a release decision.
- The source map marks Cantaloupe `develop/CHANGES.md` as mutable and without a captured commit. That caveat is honest; preserve it. For any claim that depends on a later release, prefer an exact release tag/commit. The pinned v5.0.5 source confirms its specific HTTP-401 exception fix only; it does not establish current security or IIIF Auth 2.0 compliance (C08).
- Current online docs are not a compatibility test for a chosen release, model, catalog, role matrix, or deployment. No benchmark or implementation check ran in this review.

## Validation amendments

1. Before indexing, approve a role-aware field matrix: public metadata, curator-only fields, restricted cultural text, rights/reuse description, and each image/caption/derivative. Treat every derived index and embedding as a governed copy.
2. For P2, compare lexical-only, prose-only semantic input, and one curated public metadata template on the same training and held-out query sets. Include exact ID/title tasks and empty-description records; keep the identity/access rules identical.
3. For P4, perform a timed restriction-change exercise and record the interval to denial at search, typeahead/facets, catalog APIs, original/derivative URLs, caches/CDN, and exports. Repeat during policy-service failure. Museum policy owners choose the allowed time and outage behavior.
4. For P5, test proposal, reject, approve, source writeback (if supported), provenance export, original-value recovery, and rollback as separate curator actions.
5. Keep all checks labeled proposed unless an allowed, qualified sandbox actually runs them. This review ran none.

## Source navigation

Start with [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Inherited evidence IDs S01–S15 remain bound to the exact research map and notes; new critic IDs C01–C08 identify the additional first-party pages independently opened for this review.
