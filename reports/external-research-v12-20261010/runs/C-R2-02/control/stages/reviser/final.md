# Final reviser proposal — evidence-discovery pilot for local urban-heat studies

## Recommendation and status

Run a bounded, preregistered discovery-and-identity pilot. Its purpose is to compare ways of finding local observational studies and municipal reports while preserving record, document, and study identity. It is not a systematic review, an estimate of intervention effectiveness, or a recall study against a complete corpus. No complete reference set or search export was supplied, so the union of search routes can only be an observed candidate set.

The pilot should compare four routes: (A) a baseline lexical search, (B) a separately logged terminology and locality expansion, (C) citation following plus public municipal repositories, and (D) a small independent manual or expert-curated lead exercise. Routes A and B must each be run across at least two public scholarly indexes. The index comparison is a required factor, not an optional citation-search convenience. OpenAlex and Crossref are a provisional publicly accessible pair, subject to the owner confirming their fit; Crossref reflects member and trusted-source metadata deposits, so its absences cannot rule out a municipal report. A second public index may be selected before the run if the owners judge it more appropriate. Do not choose or change the pair after seeing results. The final pair, exact query translations, access mode, and source list are owner decisions to freeze before the primary comparison.

The pilot has three separate outcomes: discovery yield at the eligible-study level, screening workload, and identity quality. More rows alone do not demonstrate improved coverage. The proposal retains all records and reports, uses conservative candidate linking with human adjudication, and preserves uncertainty rather than forcing ambiguous titles into duplicate groups.

## Decisions required before a meaningful comparison

These remain owner decisions; this proposal does not silently define the evidence denominator.

1. **Question and intervention scope:** which urban-heat interventions qualify, such as shade/trees, cool roofs or pavements, cooling centers, heat warnings/outreach, or broader adaptation; whether the target is implementation, measured local exposure, observational evaluation, or empirical observations more generally; and whether simulation-only work qualifies.
2. **Evidence unit and eligibility:** operational definitions for observational, local, empirical, and study; treatment of municipal technical reports with missing abstracts or unclear methods, multi-study reports, reviews, conference papers, theses, and reports that point to another study.
3. **Geography:** eligible jurisdictions, urban boundary, municipality versus metro/neighborhood level, cross-jurisdiction designs, and non-urban comparison data.
4. **Languages and dates:** language set, translation policy and capacity, date limits, undated reports, revised web documents, and historical locality names.
5. **Public sources and access:** the two public scholarly indexes, the selected public municipal portals and search-engine route, citation indexes if used, export limits, and lawful public full-text paths. The case bars private accounts and restricted scraping; choose sources usable within those boundaries.
6. **Seeds and route inputs:** the frozen starting records for citation following, the portal list, and any collaborator-supplied remembered reports. A remembered title is a lead only when the citation or provenance is actually supplied. No titles or case records were supplied here.
7. **Capacity and error tolerance:** follow-on reviewer-hours, number of screeners, calibration and adjudication time, full-text retrieval budget, acceptable unresolved-pair rate, and any decision thresholds.
8. **Query and comparison rules:** baseline concepts, query fields and filters, language/geography blocks, result caps, time allocation, sampling frame, and whether any active-learning or duplicate-hiding software will be excluded or treated as a separate screening condition.

A syntax or alias check can be run provisionally before every decision is settled, but it must be labeled exploratory. Do not compare study yields across runs with different scope, date, language, or eligibility rules.

## Discovery routes and their comparisons

### A. Baseline lexical search

Use one predeclared, intervention-neutral urban-heat concept plus the minimum intervention or observation block needed by the owner-approved question. Do not require outcome or effectiveness terms. Run the same logical concepts in both selected public indexes, translating syntax to each index and recording the translation, searchable fields, filters, date, query URL, parameters, page or result cap, response order, hit count, and failures.

Use a consistent lexical mode within each index. OpenAlex has distinct search parameters: generic search, title/abstract/keyword-scoped search, title-and-abstract search, and semantic search do not have the same field scope. Record the exact parameter. Its normal results sort by relevance; a rerank option changes the top 100 and semantic search is a distinct mode. Keep either mode fixed in A and B, and treat any rerank or semantic experiment as a separately named arm. See S06 and the reviser recheck R01 in [the source index](sources/index.md#s06).

### B. Terminology and locality expansion

Keep the same two indexes and within-index fields, filters, dates, and result caps used in A. Pre-register variant terms such as urban heat island, heat island effect, heatwave/heat wave, extreme heat, overheating, heat exposure, thermal comfort, and the chosen intervention terms. Use separate query rows for terminology expansion and geography aliases so their marginal contributions remain visible.

After jurisdictions and languages are chosen, build a dated alias table from official locality, municipality/metro, district/neighborhood, historical, local-language, transliterated, and common-abbreviation forms. Retain a no-geography-block query: requiring place terms in sparse title/abstract metadata can suppress eligible items. Record the exact term or alias that retrieved each record. Compare A-to-B changes within each index, then compare the index difference within A and within B. This separates vocabulary effects from index-specific missingness; an index-level effect must not be attributed to terminology alone.

### C. Citation and public-repository discovery

Use only a frozen seed set selected before results from A or B are reviewed. Log backward reference checking and forward citation searching as separate operations, with seed ID, direction, index/tool, round, date, returned IDs, screening status, and stopping rule. If a second citation index is available under the approved public-access conditions, record it separately. Citation searching can bridge terminology differences, but it inherits seed bias and is supplementary rather than a stand-alone completeness method. TARCiS offers useful reporting concepts, but its Recommendation 5 has a correction whose precise replacement wording was not verified in these source checks; consult the correction before applying that recommendation (S03–S04).

Search preselected public municipal planning, environment, public-health, resilience, and document portals with the agreed agency, report-series, city, and heat/intervention terms. Keep portal search and general search-engine/site search as distinct operations. Log zero-hit, blocked, unstable, or inaccessible sources instead of treating them as negative evidence. Crossref relation metadata and OpenAlex citation links may generate leads, but deposited or indexed relationships do not ensure local-report coverage or establish study identity (S06–S09).

### D. Manual or expert-curated leads

Before the curator sees A–C results, allocate a fixed period to compile a small dated lead list from existing local knowledge and selected public bibliographies/catalogues. Record who or what supplied every lead, the exact citation/title as received, date, source, and locality/language context. Use collaborator memories only when an actual citation or provenance is supplied. This is a useful test of local naming and repository blind spots, but it is not an independent gold standard: familiarity, geography, language, and professional networks shape the list. If no lead is actually supplied, record that result; do not invent titles or fill the route from the other arms.

## A feasible 60-minute discovery session

Lock eligibility, indexes, query translations, seed IDs, alias table, portal list, route IDs, and capture sheet before starting the clock. Prepare the blank logging template in advance. The schedule gives each route a distinct ten-minute active allocation, includes manual-list preparation in its own route time, and reserves separate time for capture and reconciliation.

| Clock | Activity |
|---|---|
| 00–05 | Confirm the signed scope, two-index pair, seeds, portals, route IDs, query versions, and output location. This is a verification block, not a chance to tune scope after seeing results. |
| 05–15 | Route D. Curator compiles and provenance-checks the small manual/public-bibliography lead list before seeing A–C results. |
| 15–25 | Route A. Run the baseline query for five minutes in each of the two frozen public indexes; save each response and log separately. |
| 25–35 | Route B. Run the preregistered terminology and locality query rows across the same indexes, dividing the ten-minute cap between indexes and rows. Save each row separately; if the cap prevents completion, report the partial run and exact cutoff. |
| 35–45 | Route C. Use five minutes for the frozen-seed citation operations and five minutes for the preselected public portal/search-engine operations. Record each source and failure separately. |
| 45–60 | Reconcile exports and logs, assign immutable record IDs, retain raw files and lawful-file hashes, capture query/version/date details, record route membership, and identify missing fields or incomplete exports. |

Each route receives ten active minutes, including route D's list preparation. The five-minute opening and fifteen-minute closeout are shared overhead and must be reported separately. Capture raw responses as each route runs rather than relying on memory at minute 45. If an operation cannot finish within its allocation, record it as partial; do not extend one arm without changing the protocol. This equal-effort design makes a small pilot comparable on effort, not comprehensive. The route-C suballocation and route-D preparation are explicit and do not overlap.

The 60 minutes are for discovery and capture. Screening and adjudication follow under a separately approved reviewer-time budget. If owners intend the research window to include any screening, they must reduce retrieval time before the run, set an explicit screening block, and apply the same rule to all routes. Never borrow screening time after seeing yields or compare a screened route to an unscreened route.

## Records, reports, studies, and provenance

Treat these as distinct entities:

- A **record** is one row received from an index, portal, citation source, or curator.
- A **report** is one identifiable document or manifestation, including an update, translation, repository copy, preprint, or published version.
- A **study** is the underlying investigation; one study may have several reports, and one report may describe several studies.

Assign an immutable record ID at import and a report ID to each identified document. Keep study-cluster ID nullable until adjudication. Preserve every original row and raw citation. Store the source's stable identifier, source row, original title and language, alternate title, author/agency, report number/series, year/date, DOI or other identifier, locality, issuing organization, version/status, exact URL, route/query row, rank, retrieval time, and lawful raw-file checksum. Normalize values only in separate fields. Keep exact query and alias provenance attached to every row.

Generate candidate links from exact identifiers, explicit publisher/agency version relations, and title/author/year similarity, but do not let software decide study identity. Compare authors/agency, date, site, population, methods, sample, report number, and explicit stated relationship. Label adjudications as identical report copy; distinct report version/translation; separate reports of one study; different studies; related but unresolved; or insufficient evidence. Record reviewer, rationale, evidence URL, date, and status. A common title fragment, city, agency, or nearby year is never enough to merge. A grouped view may present confirmed links, while source records remain intact.

Crossref exposes deposited bibliographic metadata and typed relations such as version, preprint, translation, and replacement; non-DOI identifiers in relations are not verified by Crossref. OpenAlex's indexed records and IDs change over time. Pin dates/snapshots where available, retain raw IDs and responses, and preserve old IDs rather than silently rebinding them (S05–S09). Zotero's documented duplicate detector is a within-library candidate mechanism with false-positive limits, not a study-cluster rule (S10). ASReview v3.0.8 hides some duplicate-title/text rows during screening while allowing them in export; its history includes migration changes, and a user discussion reports a spelling-variant issue. If software is used, pin the version, preserve full input and export, and count hidden rows separately. It must not define retrieval coverage or identity (S11–S13).

## Screening, sampling, outcomes, and uncertainty

After retrieval, freeze written inclusion rules and calibrate screeners on a sample. Use two independent reviewers on a prespecified probability sample stratified by route (including multi-route membership), index, report type, jurisdiction, language, year band, and duplicate risk. Double-screen candidate inclusions, disputed records, and uncertain identity pairs. Include a probability sample of apparent exclusions from every route, so potential missed eligibility and reviewer disagreement can be examined. Oversample near-title pairs, same-agency/series reports, and known version relations for identity adjudication, but report those pair results separately from population estimates.

If the result set exceeds the owner-approved time budget, draw a stratified probability sample rather than screening convenient records. Retain each stratum size, sampling frame, draw method, sample size, and inclusion probability. Resolve disagreements through recorded adjudication. The sample-size calculation depends on scope, capacity, and tolerated error, none of which is supplied; do not invent a number now. Keep screening decisions separate from identity decisions and record title/abstract, full-text, retrieval-failure, reviewer-minute, and adjudication-minute outcomes.

Report, for each route and index:

1. Raw records, exact-copy groups, report manifestations, eligible reports, adjudicated study clusters, and uncertain clusters.
2. Unique eligible study clusters contributed by a route, route-only additions, route overlaps, and marginal eligible studies per active retrieval hour and per screening hour.
3. Screening workload: decisions, full-text retrieval attempts/successes, reviewer minutes, adjudication minutes, and rows hidden by any software.
4. Identity quality: candidate-pair counts, confirmed same-report and same-study links, false-positive links, unresolved pairs, and sampled missed links.
5. Source mix: report versus journal manifestations, localities, languages, agencies, and years, with eligibility definitions and denominators.

Route overlap is agreement among the searched routes, not recall. Discovery coverage is observed yield within the defined search frame, not global coverage. A missed-item estimate is valid only for the explicitly sampled frame and design; it does not become recall for a universe that has no known boundary. For unresolved identity pairs, show confirmed counts separately and two sensitivity bounds: treat unresolved pairs as separate studies for the higher distinct-study count, and as same-study links for the lower count. Neither is recall. A route is promising only if it adds independently eligible clusters or materially improves locality/report diversity at acceptable screening and identity-review cost, without an unacceptable false-merge pattern. Owners must set any decision threshold before results are reviewed.

## What prior strategies and collection implementations must disclose

A prior search or collection can inform this problem only if it reports the scope and inclusion/exclusion rules; jurisdictions, languages, and dates; each database/index/provider and its coverage boundary; exact syntax, fields, filters, platform translations, and search dates; hits by query line; report and grey-literature sources; citation seeds, direction, indexes, rounds, and stopping rule; export date/version/snapshot and stable identifiers; screening and reviewer process; duplicate defaults and versions; report-to-study link rules; manual changes and migrations; exclusions, failures, and known limitations; and how any comparison or benchmark set was chosen and independently checked.

PRISMA-S supplies search-reporting items; PRESS asks reviewers to inspect the exact strategy and hits per line; Cochrane guidance supports varied sources, citation searching, and reports/studies distinctions in an evidence-synthesis setting. These are reporting and methods aids, not proof that a search is complete for municipal urban-heat evidence (S01–S04, S14).

## Implementation history and bounded examples

OpenAlex launched in 2022 as a replacement for the Microsoft Academic Graph data flow and acknowledged inherited data coverage/structure issues. Its later synchronization documentation describes quarterly public snapshots, merges/deletions, and changed merged-ID history after a 2025 cutover. A dated snapshot/API state and preserved raw IDs are therefore necessary for reproducibility; the name of an index alone does not define a stable corpus (S05, S07).

Crossref's public API exposes metadata deposited by members and trusted sources. Its relation types are useful for candidate version links, but deposits and relation coverage are not assured for local government reports, and some non-DOI relation identifiers are unverified (S08–S09). Zotero's library-local heuristic and ASReview's versioned screening behavior show that software defaults affect candidate lists and workload; neither is a study-identity authority (S10–S13). These histories support additive imports, version capture, and human study-level adjudication. They do not identify a winning retrieval route.

Two prior urban-heat review examples are only bounded disclosure examples. The 2026 U.S.-focused review's indexed excerpt describes Web of Science plus backward citation searching and acknowledges database/grey-literature boundaries; its publisher page and supplement were inaccessible. The 2024 urban-heat-island/heat-wave review's indexed methods excerpt describes a Web of Science scope that excludes reports/policy/government documents; its publisher page and full strategy were inaccessible. Do not use either as a coverage benchmark or import its counts/results. Exact strategies and exclusions beyond the observed excerpts remain unverified (S15, S17).

## Actual work and proposed validation

**Actually executed in the supplied research record:** public-web searches and desk inspection of primary search/reporting, metadata, citation-relation, deduplication, and screening-tool documentation; limited public-web searches for prior urban-heat review-method excerpts; the critic's primary documentation checks; and this reviser's direct opening of the official OpenAlex search and Crossref REST API documentation. The reviser recheck found that OpenAlex generic search, scoped search parameters, semantic search, and reranking have distinct conditions, and that Crossref's public REST API searches/filter/samples metadata deposited by members and trusted sources without signup (S06, S08; reviser checks R01–R02). Access timestamps exposed by the web tools are observation windows, not per-request server timestamps.

**Not executed:** no urban-heat intervention query; no scholarly API or database request; no municipal portal or site search; no citation search on a case seed; no case-record export; no screening, duplicate or study adjudication; no coverage comparison; no empirical validation; and no effectiveness analysis. No intervention records, complete reference set, or collaborator report titles were supplied. No recall figure is justified.

**Future validation proposal:** after owners freeze scope and public access routes, preregister the two-index pair, four routes, exact query translations, route/time allocations, seed and portal lists, retrieval/sampling frame, inclusion rules, screening budget, identity codebook, adjudication, and decision thresholds. Run the 60-minute discovery session, preserve all exports and logs, conduct the separately budgeted screen and identity sample, and report sample-bounded uncertainty. Keep every ambiguous record. Do not label planned searches as executed.

## Independent critique dispositions

| Criticism | Disposition | Evidence-based resolution |
|---|---|---|
| C-01: the released plan's multiple-public-index comparison was only optional in the draft | **Accept and amend.** | A and B now require the same logical baseline/expanded concepts in at least two preselected public scholarly indexes. Compare within-index query changes and index differences separately. OpenAlex plus Crossref is a provisional public pair, subject to owner fit/access review before the run; an alternate public index must be selected before results, never after. If the second index cannot be run, record that the plan clause was not completed rather than describing it as satisfied. |
| C-02: the equal-time claim conflicted with a second block of route-C portal work and uncounted route-D preparation | **Accept and amend.** | The timetable now gives D, A, B, and C distinct 10-minute active blocks. D's list preparation is inside its block; C splits its block into five minutes of citation operations and five minutes of portal/search-engine operations. Five minutes of scope verification and fifteen minutes of shared capture/reconciliation make 60 minutes total. Shared overhead is reported separately. |
| C-03: the draft's traceability table marked the multiple-index clause accepted despite no specified index comparison | **Accept and correct.** | The traceability table below records the clause as amended and conditional on actually running both preselected indexes. It is not represented as already completed. |
| C-04: the OpenAlex source record's unqualified “default search” description hid parameter-specific field scope | **Accept and amend.** | S06 retains its original stable identity and history. This final specifies generic search, scoped title/abstract/keyword and title/abstract parameters, semantic search, relevance order, and reranking separately. The direct primary-source recheck is recorded as R01; no field scope is inferred from an unspecified “default.” |
| C-05: prior-review excerpts were not full-text checked | **Retain uncertainty.** | The access failures and excerpt-only use remain explicit. S15 and S17 are disclosure examples only; their complete queries, supplements, and unobserved exclusions are unverified and are not used to benchmark coverage. |

The critic's positive findings are preserved: the record/report/study model, conservative identity handling, uncertainty, provenance, proposed-versus-executed separation, and brief boundaries are retained. The revisions correct the three material alignment/consistency problems without turning the critique into authority for source claims.

## Clause-by-clause coverage of the released design record and original request

This paraphrase preserves the design obligations without reproducing the concealed record as a candidate-facing answer key.

| Clause group | Final disposition and location |
|---|---|
| Original request: use a 60-minute research window to design reproducible discovery, explain retrieval and screening, compare routes, investigate collection implementation history, and deliver a protocol rather than a product or finished review | **Addressed.** Four routes and 60-minute schedule above; screening is separately budgeted; no product/review is proposed. |
| Original requirements: keep discovery coverage, screening workload, and correct study identity distinct; counts alone do not establish improvement | **Addressed.** Separate metrics and record/report/study data model; no yield-only success claim. |
| Original requirements: compare terminology/database changes with citation or repository discovery and a manual/curated alternative | **Addressed and expanded.** A–D routes; A and B now compare at least two public indexes. |
| Original requirements: preserve reports, multiple versions, ambiguous titles, geographic terminology, and uncertainty without similarity-only duplicate decisions | **Addressed.** Alias table, immutable IDs, conservative pair adjudication, and unresolved states. |
| Original requirements: state what prior strategies/implementations must disclose for coverage claims to be informative | **Addressed.** Disclosure checklist and bounded implementation history. |
| Original requirements: auditable sampling, provenance, uncertainty, and separation of executed work from future validation | **Addressed.** Sampling frame/probabilities, provenance fields, uncertainty bounds, and explicit actual/not-executed lists. |
| Original boundaries: no comprehensive-review claim, invented-corpus recall, effectiveness inference, private-account use, restricted scraping, author contact, search product, or deletion of ambiguous records | **Preserved.** Scope/status, public-access boundary, additive records, and no effect analysis. |
| Open scope: intervention/design inclusion, evidence unit, geography, languages, dates, review rules, access, and later-screening time | **Owner decisions.** Listed before any comparative claim; provisional syntax work remains exploratory. |
| Released design opportunity: keep useful-evidence definition, evidence unit, screening capacity, and scope open; scope narrowing may beat indiscriminate expansion | **Preserved.** Decisions are staged; route comparisons do not force broadening or a winner. |
| Released design opportunity: investigate indexing, terminology mismatch, citation connectivity, municipal repository metadata, and document-version versus study identity | **Addressed.** Paired public indexes, separated query expansion, route C, source history, and conservative identity protocol. |
| Released design opportunity: consider revised controlled/free-text vocabulary, multiple public indexes, citation following, repositories, and a small curated exercise without prespecifying a winner | **Addressed.** Routes A–D and a required index factor; source pair is frozen before results, while route success remains undecided. |
| Released design opportunity: remembered municipal reports motivate provenance checks, not a hidden reference set | **Preserved.** Use only supplied, provenance-recorded leads; none were supplied in this task. No answer key or gold corpus is invented. |
| Released design opportunity: inspect public histories and changes while recognizing older methods may have different coverage | **Addressed with limits.** OpenAlex, Crossref, Zotero, ASReview, and bounded review examples are dated/qualified. Unavailable publisher full text remains uncertain. |
| Released validation opportunity: prerecord a provisional scope, sample screened/rejected records, manually adjudicate versions/uncertainty, estimate workload and bounded misses | **Proposed, not executed.** Protocol specifies what to freeze and sample; no case-level checks are claimed. |
| Release boundary: keep brief and plan inputs unchanged; keep proposed versus executed checks distinct; no empirical validation is implied by prepared inputs | **Preserved.** Inputs were read-only; this file distinguishes observed desk checks from all future case searches and pilot validation. |

## Source and execution record

Source IDs are stable and link to the navigable [source index](sources/index.md). Full source identity records, exact URLs, versions/commits where exposed, locators, observed operations, governing conditions, applicability, inherited stage observations, reviser checks, and access-time limits are in [source-map.json](source-map.json). The source map records the release receipt for the exact revealed plan and the input artifact hashes.

Native Goal activation was directly observed with the exact frozen objective, and the binding guard returned ok=true; the guard states that provenance is not independently proved. The exact unmodified activation response and guard response are preserved in source-map.json. Native UTC activation time and independently verified provenance are UNKNOWN; returned native timestamp fields are preserved without assuming their units. The required science artifacts were saved before completing the same Goal. The exact native completion response is preserved separately in native-goal-completion.json.
