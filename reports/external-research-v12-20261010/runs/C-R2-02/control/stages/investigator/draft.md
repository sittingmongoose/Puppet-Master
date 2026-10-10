# Draft — Evidence-discovery pilot for missing local urban-heat studies

## Recommendation

Run a bounded discovery-and-identity pilot, not a miniature effectiveness review. Freeze the eligibility and geography decisions first. Compare four routes under equal, logged retrieval time: a baseline scholarly query; a terminology/geography expansion; citation and public municipal-repository discovery; and a separately prepared manual or expert-curated lead list. Keep every record and report, then adjudicate study identity without deleting unresolved rows.

The comparison should answer whether a route adds independently eligible studies at an acceptable retrieval and screening cost, and whether the evidence can be linked to reports and studies without false merges. It cannot estimate recall against a complete corpus: no complete reference set or search export exists. A route union is an observed set, not the universe.

## Decisions needed before a meaningful comparison

The following are owner decisions; this draft does not silently choose them:

1. **Question and intervention scope:** which urban heat interventions qualify (for example, shade/trees, cool roofs or pavements, cooling centers, heat warning/outreach, or broader adaptation); whether the target is intervention implementation, measured local exposure, observational evaluation, or all empirical observations; and whether simulation-only work qualifies.
2. **Evidence unit and eligibility:** define observational, local, empirical, and study; say how to treat municipal technical reports with no abstract or unclear methods, multi-study reports, reviews, conference papers, theses, and reports that only point to a primary study.
3. **Geography:** eligible countries/jurisdictions, urban boundary, municipality versus metro/neighborhood level, and whether cross-jurisdiction or non-urban comparison data qualify.
4. **Language and dates:** language set, whether translation is feasible, date limits, and treatment of undated or revised web reports.
5. **Access and platforms:** sources already available through public access or institutional entitlements, portal list, export/access limits, and lawful full-text routes. Do not create a private account or use restricted scraping for the pilot.
6. **Later screening capacity:** minutes or reviewer-hours available after retrieval, number of independent screeners, calibration/adjudication time, and acceptable uncertainty/error tolerances.

A provisional search can test query syntax and locality aliases before all decisions are final, but it must be labelled exploratory. Do not compare route coverage across runs with different inclusion rules, dates, languages, or geographic boundaries.

## What each discovery route can reveal

| Route | How it works | Likely contribution here | Important limitation |
|---|---|---|---|
| A. Baseline lexical search | Search the already-accessible scholarly index/database using an intervention-neutral urban-heat concept plus a minimal intervention or observation block. Preserve the exact platform-specific query and run date. | Establish a repeatable baseline and reveal whether current vocabulary misses differently indexed local observational papers. | General reviews can dominate, and reports absent from scholarly indexes remain invisible. |
| B. Terminology and geography expansion | In a distinct arm, add prelisted variants for urban heat island, heat island effect, heatwave/heat wave, extreme heat, overheating, heat exposure, thermal comfort, and the chosen intervention terms. Add official locality, municipality/metro, neighborhood, historical, local-language, transliterated, and common-abbreviation forms. Search title/abstract and broader fields as separate arms. | Tests vocabulary and indexing mismatch; geography terms can surface local studies whose place is not named in a title. | A mandatory geography block may suppress studies with sparse metadata. Keep a no-geography-block query and record which alias retrieved each result. |
| C. Citation plus public repository discovery | From eligible seed studies, check cited references and citing works, record each seed/direction/index/round, and examine public municipal planning, environment, public-health, resilience, and document portals. Query portal and search-engine routes separately. | Citation links can bridge changing terminology; municipal portals can surface technical reports and local titles missed by article indexes. | Citation search inherits seed bias and is not a stand-alone completeness method. Portals differ by jurisdiction and may lack searchable or stable metadata. |
| D. Manual or curated leads | Before seeing route results, ask an information specialist or project collaborator to make a dated list from existing knowledge, public bibliographies, and municipal catalogues. Treat remembered titles as leads when supplied, with their provenance. | Can expose local naming practices and repositories that other routes overlook. | The list reflects the curator’s language, city, network, and memory; it is neither a hidden answer key nor an unbiased reference corpus. No remembered titles were supplied in this task. |

A useful prior urban-heat search example illustrates why the method must match the question. An indexed methods excerpt for a 2026 U.S.-focused review reports Web of Science plus backward citation tracking and acknowledges that a single index can underrepresent other indexes and grey literature such as municipal reports. The publisher page was not accessible here, so this is a disclosure example only; its complete strategy and results were not verified and are not imported as evidence of coverage or effectiveness [S15](https://doi.org/10.1016/j.scsadv.2026.100077). An older urban heat island/heat-wave review describes a Web of Science-only, peer-reviewed scope and excludes reports/policy literature in its indexed methods excerpt, another example of a deliberate boundary rather than a coverage benchmark [S17](https://doi.org/10.1016/j.crm.2024.100603).

## 60-minute discovery pass and subsequent screening

Before the clock starts, freeze decisions above, prepare the alias table and portal list, select the seed set, and save the protocol version. The following is a proposed equal-time retrieval session, not work executed in this stage:

| Clock | Planned activity |
|---|---|
| 00–05 min | Confirm locked scope, seed set, route IDs, date/time, reviewer and export destinations. This is a verification step; it is not time to change eligibility after seeing hits. |
| 05–17 min | Route A baseline query on the selected public/authorized scholarly platform(s). Export every row and query log. |
| 17–29 min | Route B terminology/geography variant on the same platform(s), keeping filters and platform constant. |
| 29–41 min | Route C backward/forward citation search using the prespecified seeds and accessible indexes; begin only the portal targets that were selected in advance. |
| 41–53 min | Complete route C portal/manual search and independently capture route D curated leads. |
| 53–60 min | Save raw exports, source/date/query ledger, per-line hit counts, access failures, versions, and hashes; check that every row has a route ID and immutable record ID. |

If the owner intends the 60 minutes to include screening, reduce the route retrieval allotment before the run and reserve an explicit screening block. Do not borrow screening time post hoc or compare a fully screened route against an unscreened one. A meaningful workload comparison needs an agreed screening budget after the discovery session.

For citation searching, start with all eligible records from the primary search when feasible. Record backward reference-list checking and forward citation searching as different methods; name the index and tool, seed records, UTC date, round, result counts, dedup procedure, and stopping rule. Consider a second index only if it is available under the agreed access conditions. Iterate according to the preregistered rule, commonly until a round adds no eligible study; if stopping while a round still adds eligible records, report that reason. TARCiS emphasizes that citation searching is supplementary and specifies what to report; its Recommendation 5 has an erratum whose exact wording was not verified here, so consult the correction before applying that recommendation [S03](https://www.bmj.com/content/385/bmj-2023-078384), [S04](https://pubmed.ncbi.nlm.nih.gov/39510583/).

### Screening and sampling plan

Screening follows retrieval and is a separate phase. Use written eligibility rules and a calibration sample before full screening. Two reviewers independently screen a preselected sample; double-screen all candidate inclusions, disputed records, and uncertain identity pairs. Include a probability sample of apparent exclusions from every route so missed eligibility and reviewer disagreement can be examined. If the result set exceeds the prespecified reviewer-time cap, use a random stratified sample rather than convenience screening; retain each stratum size, draw method, sample size, and inclusion probability. The exact sample size depends on the owner-approved time budget and cannot be justified from the current brief alone.

Stratify by route (including multi-route membership), publication/report type, jurisdiction, language, year band, and duplicate-risk class. Oversample likely version and ambiguous-title pairs for adjudication, then report those pair results separately from population estimates. Record screening time and full-text retrieval time by route. Screening labels do not determine whether two reports describe the same study.

## Record, report, and study identity

Keep three linked but distinct entities:

- **Record:** one row as received from a database, citation index, portal, or curator.
- **Report:** one identifiable document or manifestation, including version, translation, update, or repository copy.
- **Study:** the underlying investigation, which may have multiple reports or be described in a report alongside other studies.

Assign immutable record and report IDs at import. Use a nullable study-cluster ID until adjudication. Keep original title, title language, alternate title, agency/author, report number/series, date, DOI/other identifier, locality, issuing organization, version/status, URL, query/route, rank, and import timestamp. Save the unmodified export and, where lawful, the exact document and SHA-256; store normalized values only in separate fields.

Use high-confidence identifiers and explicit agency or publisher links to propose candidate relationships, then inspect title, authors, methods, sampled population, sites, date, sample, and the stated relation. Label a pair as: identical report copy; distinct report version/translation; separate reports of the same study; different studies; related but unresolved; or insufficient evidence. Keep exact source URLs and the rationale, reviewer, date, and adjudication status. A shared city, title fragment, issuing agency, or nearby year is not enough to merge. Preserve every row; a “canonical” view may group proven links without deleting source records.

Crossref documents preprint, version, translation, replacement, and reference relations, but those links are deposited metadata and some non-DOI identifiers are unverified [S08](https://www.crossref.org/documentation/retrieve-metadata/rest-api/), [S09](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/). OpenAlex offers citation neighborhoods and searchable work records; its index and entities evolve, so save the raw response, request URL, snapshot/as-of date, and old IDs [S06](https://help.openalex.org/api/searching/), [S07](https://help.openalex.org/access/sync/). Basic OpenAlex API requests are currently available without a key; avoid creating an account solely for this pilot [S16](https://help.openalex.org/api/authentication/).

Zotero’s documented duplicate detector uses title/DOI/ISBN plus publication year and partial author-name conditions within one library and currently provides no false-positive opt-out. It is a possible candidate generator, not a study-linking policy [S10](https://github.com/zotero/zotero-docs/blob/main/content/duplicate_detection.md). ASReview v3.0.8 documents hiding duplicate-title/text rows during screening while retaining them in export; its release history includes a migration fix, and an earlier user discussion reports spelling-variant duplicates resurfacing during screening [S11](https://github.com/asreview/asreview/releases), [S12](https://github.com/asreview/asreview/blob/d3e863c/README.md), [S13](https://github.com/asreview/asreview/discussions/1741). If active learning is later used to prioritize screening, pin the version, save the full project/export, and report hidden rows separately. It must not silently define retrieval coverage or study identity. For a small collection, manual dual screening may be simpler.

## Comparison, outcomes, and uncertainty

Report route membership and results at each level rather than a single count:

1. Raw retrieved records, records after exact-copy grouping (with no deletion), distinct report manifestations, eligible reports, adjudicated study clusters, and uncertain clusters.
2. Unique eligible study clusters contributed by each route and found only through that route; route overlap and marginal eligible studies per retrieval hour and per screening hour. Overlap describes agreement among routes, not recall.
3. Screening workload: title/abstract decisions, full-text retrieval attempts/success, reviewer minutes, adjudication minutes, and records hidden by any software.
4. Identity quality: candidate-pair counts, confirmed same-report/same-study links, false-positive links, unresolved pairs, and sampled missed links. State the sampled frame and pair-sampling probabilities.
5. Source diversity: reports versus journal articles, localities, languages, agencies, and years, with the denominator and eligibility definition for every percentage.

Use at least two sensitivity views for uncertain pairs: treat unresolved pairs as separate studies for an upper bound on distinct-study count, then as same-study clusters for a lower bound. Report confirmed counts separately. Do not call either bound recall. A route is promising only if it adds eligible study clusters or materially improves local/report diversity at acceptable screening and identity-review cost, with no unacceptable false merge pattern. Any decision threshold must be approved before results are seen.

A prior search strategy or collection implementation is informative for this case only when it discloses: scope and inclusion/exclusion rules; jurisdiction, language and date limits; each database/provider/platform and its coverage boundary; exact query syntax/fields/filters and translation by platform; search date and hit counts by query line; report and grey-literature sources; seed references, citation direction/index/rounds/stopping rule; export date/version/snapshot and record identifiers; screening/reviewer process; duplicate defaults, version and study-link rules; all manual changes, migrations, and known limitations; exclusions and access failures; and how any benchmark set was selected and independently checked. PRISMA-S identifies search reporting items, Cochrane recommends peer review and varied sources, and the PRESS form requests the exact strategy and hits per line [S01](https://www.prisma-statement.org/prisma-search), [S02](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04), [S14](https://www.cadth.ca/sites/default/files/PRESS_Peer_Review_Electronic_Search_Strate/Table_10_PRESS.pdf).

## Implementation history and applicability

OpenAlex launched in January 2022 as a replacement for the Microsoft Academic Graph data flow, announced a REST API and five-entity model, and acknowledged inherited coverage/structure issues while extending beta [S05](https://blog.openalex.org/openalex-launch/). Its current documentation describes quarterly public snapshots and changes to merge/deletion history after a 2025 cutover [S07](https://help.openalex.org/access/sync/). A historical or current OpenAlex result set therefore needs a dated data state; “OpenAlex” alone is not a reproducible source specification.

Crossref's API exposes member- and trusted-source-deposited metadata, not every scholarly or municipal document [S08](https://www.crossref.org/documentation/retrieve-metadata/rest-api/). Its relations help distinguish versions but do not enforce a complete identity graph [S09](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/). Zotero's stated rules are library-local and heuristic [S10](https://github.com/zotero/zotero-docs/blob/main/content/duplicate_detection.md). ASReview's tagged releases show changes to migrations and data handling; version 3 adds title/text duplicate hiding, not a study-identity adjudicator [S11](https://github.com/asreview/asreview/releases), [S12](https://github.com/asreview/asreview/blob/d3e863c/README.md). Its discussion history gives a user-reported spelling-variant failure mode, not a controlled performance estimate [S13](https://github.com/asreview/asreview/discussions/1741).

These histories argue for preserving raw rows, export/version metadata, and crosswalks. They do not identify a winning route or establish urban-heat retrieval coverage. TARCiS was developed mainly in health evidence-synthesis settings and has a correction; adapt it cautiously and verify corrected text before operational use [S03](https://www.bmj.com/content/385/bmj-2023-078384), [S04](https://pubmed.ncbi.nlm.nih.gov/39510583/).

## Corrections, optional improvements, decisions, and rejected shortcuts

### Corrections to claims or implementation

- No correction to the original request is needed. The proposed work remains an evidence-discovery study, not an intervention-effectiveness review.
- Do not equate hit count with coverage, the union of routes with a complete corpus, citation yield with recall, an identifier relation with verified study identity, or an automated duplicate flag with a safe merge.
- Do not apply the uncorrected wording of TARCiS Recommendation 5; the exact corrected text was not retrievable in this research window.
- The 2026 U.S. review source is used only as an example of disclosed database/grey-literature boundaries. Its publisher page was inaccessible, so the article's full strategy and results remain unverified here.

### Optional improvements to the brief's study design

- Adopt the record/report/study data model and explicit unresolved-pair codes.
- Have a librarian/information specialist peer-review platform translations and geography aliases before execution.
- Preserve route-specific raw exports, hashes, and the manual lead list before any merge or screening.
- Add a preselected, blinded random sample of screening negatives and noncandidate identity pairs; this makes missed judgments visible without claiming corpus recall.
- Report lower/upper distinct-study bounds for unresolved identity clusters.

### Owner decisions required

The six groups in “Decisions needed” above are still open: intervention/design eligibility; report/study inclusion; jurisdictions/urban level; languages/date limits; access/platform list; later screening budget and error thresholds. These control the denominator and feasibility. They should be resolved before the primary comparison. Scope narrowing may be more informative than adding sources indiscriminately.

### Rejected or unsupported shortcuts

- Reject automatic deletion or irreversible merging of ambiguous records.
- Reject a hand-curated list, a citation chain, a database snapshot, or a set of prior reviews as an invented gold standard.
- Reject unrestricted title-only deduplication for reports with common agency/city titles.
- Reject a screening comparison with unequal reviewer time or different eligibility rules.
- Reject an effectiveness conclusion from search yield or retrieved study count.

## Traceability and exact clause disposition

Dispositions are relative to the released plan and exact original brief. “Accepted” means the draft fulfills the clause; “decision needed” means the brief leaves a parameter open; “rejected” identifies a shortcut explicitly barred or unsupported; “uncertain” identifies evidence not verified.

| Clause | Disposition | Where handled |
|---|---|---|
| Original request: use the research window to propose a reproducible evidence-discovery study, compare routes, explain retrieval/screening, and investigate implementation history; no product or finished review | Accepted | Recommendation; route table; 60-minute pass; implementation history |
| Requirement: distinguish coverage, workload, and identity; counts alone are insufficient | Accepted | Three-unit model; comparison outcomes |
| Requirement: compare query/vocabulary changes with citation/repository routes and a manual/curated alternative | Accepted | Four-route table and equal-time protocol |
| Requirement: address reports, versions, ambiguous titles, and geography without similar-title auto-merges | Accepted | Alias table decision; identity model and conservative link rules |
| Requirement: explain what a prior strategy or collection implementation must disclose | Accepted | Disclosure checklist and implementation history |
| Requirement: auditable sampling, provenance, uncertainty, and executed-versus-proposed work | Accepted | Screening sample, provenance schema, uncertainty bounds, work log |
| Boundary: no comprehensive-review claim, invented-corpus recall, or effect inference | Accepted | Scope statement, outcomes, rejected shortcuts |
| Boundary: no restricted scraping, private accounts, author contact, or search product | Accepted | Access conditions; no case search or account use |
| Boundary: do not delete ambiguous records | Accepted | Additive import and rejected shortcuts |
| Unresolved intervention scope and observational criteria | Decision needed | Decision group 1–2 |
| Unresolved languages and translation policy | Decision needed | Decision group 4 |
| Unresolved jurisdictions and urban definitions | Decision needed | Decision group 3 |
| Unresolved date limits and inclusion rules | Decision needed | Decision groups 1–4 |
| Unresolved access routes/platforms | Decision needed | Decision group 5 |
| Unresolved screening time | Decision needed | Decision group 6; do not make a workload claim before it is fixed |
| Released-plan clause: keep the evidence unit, useful-evidence definition, screening capacity, and scope open until owners decide them | Accepted; parameters staged as decisions | Decisions needed before comparison |
| Released-plan clause: use a motivating question without assuming a complete corpus | Accepted | Scope statement; no recall estimate |
| Released-plan clause: compare query changes, multiple public indexes, citation following, repositories, and curated sources without prespecifying a winner | Accepted | Routes A–D; thresholds set before results |
| Released-plan clause: assess indexing, term mismatch, citation connectivity, repository metadata, and document/study identity | Accepted | Route rationale; identity protocol |
| Released-plan clause: inspect public histories and report dates, boundaries, inclusion rules, versions, and changes | Accepted with uncertainty | S05–S14 and S15–S17; two blocked publisher sources and method-report limits disclosed |
| Released-plan clause: use remembered reports as future leads, not a hidden reference set | Accepted | Manual route; no titles supplied; no gold set invented |
| Released-plan clause: keep proposed validation separate from executed searching | Accepted | Work performed/not performed below and source index |
| Released-plan clause: fit the study to the 60-minute window while acknowledging scope gaps | Accepted provisionally | Timed pass; follow-on screening requires owner-approved budget |
| Released-plan clause: keep the concealed design record outside the candidate-facing proposal | Accepted | This draft does not reproduce the released plan text; it only records clause dispositions |
| Released-plan clause: preserve the input/release boundary and leave sealed C inputs untouched | Accepted | Only assignment, input map, original brief, and released plan were read; no supplied input was edited |

## Actual work and proposed validation

**Actually executed:** public web searches and desk inspection of search-method, metadata, citation-relation, duplicate-detection, and screening-tool documentation. A search-result excerpt for a 2026 urban-heat review was inspected as a methodology-boundary example; the publisher page returned HTTP 403. OpenAlex authentication documentation was inspected. Exact URLs, versions, locators, conditions, source IDs, and access-time limitations are in sources/index.md and source-map.json.

**Not executed:** no structured search for urban-heat intervention studies, scholarly API or database query, municipal repository search, citation search on a case seed, case-record export, screening, duplicate/study adjudication, or outcome analysis. A limited public-web search for prior review-method examples is documented as S15 and S17. No intervention records or collaborator report titles were supplied. No empirical validation, coverage comparison, screening-workload measurement, or recall calculation has been performed.

**Future validation proposal:** after owners freeze scope and access, preregister the four arms, route times, search strings, date/version capture, sampling frame and probabilities, screening budget, inclusion rules, identity codebook, adjudication procedure, and decision thresholds. Run the 60-minute discovery pass; preserve all exports; complete the separately budgeted screening and identity sample; report only sample-bounded estimates and uncertainty. The union of retrieved routes is not a complete reference set.
