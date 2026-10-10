# Investigator source index

Research boundary: methods, documentation, and collection-tool behavior only. No search of urban-heat intervention records, municipal portals, private services, or study yields was executed. The web evidence below was opened on 2026-10-10; the browser did not expose per-request fetch timestamps. Each source-map record gives the UTC observation checkpoint and the bounded access window.

## Source IDs

### S01 — PRISMA-Search official page
URL: https://www.prisma-statement.org/prisma-search  
Version: PRISMA-S / PRISMA-Search published 2021; current official landing page, accessed 2026-10-10.  
Locator: opening paragraph and Key documents.  
Observed: official page says the search extension includes 16 reporting items, with checklist, explanation paper, and FAQs.  
Use: the pilot should document searches and other information sources in a way another team could reconstruct. PRISMA-S is a reporting aid, not a coverage guarantee.

### S02 — Cochrane Handbook, Chapter 4: Searching for and selecting studies
URL: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04  
Version: current online chapter; page does not expose a release identifier.  
Locator: §4.3.5, lines 248–258; §4.4.8, lines 462–473; citation-search guidance lines 303–305 and 529–531.  
Observed: the handbook identifies grey-literature sources such as reports and recommends varied search approaches, iterative searches, and citation search on key articles. It recommends pre-run peer review of search strategies.  
Use: supports a complementary report/repository route and a second-searcher review; its health-review setting is guidance, not evidence that the same source mix is exhaustive for urban heat.

### S03 — TARCiS citation-searching statement
URL: https://www.bmj.com/content/385/bmj-2023-078384  
Version: BMJ 2024;385:e078384, DOI 10.1136/bmj-2023-078384, published 2024-05-09. The landing page indicates a correction; see S04.  
Locator: Recommendations 1–4 and 7–10; limitation paragraph; article search result/full-text content inspected.  
Observed: backward/forward/iterative citation searching terminology; citation search is supplementary, not a stand-alone completeness method; report seeds, direction, date, rounds, indexes/tools, dedup, and screening. Authors note health-focused evidence and Delphi participants mainly in Australia, Europe, and North America with few from non-English-dominant settings.  
Use: adapt the reporting and seed-tracking scheme; check the corrected Recommendation 5 before operationalizing that specific step. The article’s geographic and health-method context limits direct generalization.

### S04 — TARCiS erratum record
URL: https://pubmed.ncbi.nlm.nih.gov/39510583/  
Version: published erratum for BMJ 2024;385:e078384; PubMed record dates it 2024-11-07, DOI 10.1136/bmj.q2458.  
Locator: Publication types; Comments and corrections.  
Observed: the record confirms an erratum and its link to the original statement. The corrected BMJ PDF search result says a small error in recommendation 5 was corrected. The BMJ PDF could not be opened here (HTTP 403), so the precise corrected wording was not verified.  
Use: do not rely on the original wording of recommendation 5; consult the erratum before a final operational workflow. This does not affect recommendations used here about seed sets, iterative reporting, or standalone limitations.

### S05 — OpenAlex launch history
URL: https://blog.openalex.org/openalex-launch/  
Version: launch post dated 2022-01-06; describes launch on 2022-01-03.  
Locator: “As expected,” “Slight change of plan,” and “Huge exciting news.”  
Observed: OpenAlex was launched as a replacement for the discontinued Microsoft Academic Graph data flow, introduced a REST API and a five-entity model, and explicitly acknowledged coverage/structure issues in inherited data while extending beta.  
Use: collection infrastructure and metadata coverage changed after launch; benchmark any OpenAlex route at a dated, pinned data state rather than treating an index name as a stable corpus.

### S06 — OpenAlex works-search documentation
URL: https://help.openalex.org/api/searching/  
Version: live API documentation as accessed 2026-10-10; document commit/version is not exposed.  
Locator: search scope lines 45–53; defaults and exact search lines 61–67; ranking/rerank lines 143–160; semantic search lines 161–167.  
Observed: default works search can match title, abstract, and keywords; results sort by relevance score, which includes capped citation-count contribution; optional rerank reorders only the top 100 and is held stable for 24 hours. Semantic search is a separate option.  
Use: prefer an explicit lexical query and log exact URL/parameters, returned order and API date; do not turn reranking into an undisclosed retrieval change. Compare semantic/reranked search as a separate arm only if desired.

### S07 — OpenAlex synchronization and change history
URL: https://help.openalex.org/access/sync/  
Version: live help page; last updated 2026-09-24.  
Locator: release cadence lines 37–56; merges/deletions lines 124–162.  
Observed: public snapshots are quarterly and replace the bucket contents; release notes are not itemized per-record. Records can merge or disappear. After the 2025 Walden cutover, older merged-ID mapping stopped being updated; the current docs describe works deletions but no general merged-ID-to-survivor mapping.  
Use: pin snapshot/API date and save raw returned metadata and persistent identifiers; preserve old IDs and retrieval provenance in the local ledger rather than silently rebinding them.

### S08 — Crossref REST API documentation
URL: https://www.crossref.org/documentation/retrieve-metadata/rest-api/  
Version: live REST API documentation; page last updated 2020-04-08.  
Locator: REST API description and endpoints lines 112–154.  
Observed: the API exposes scholarly metadata deposited by Crossref members and trusted sources; no sign-up is required. Member deposits remain the main source of metadata.  
Use: an accessible supplementary metadata/citation route, not a complete index of municipal reports or studies; missing Crossref metadata must not be treated as evidence that a report does not exist.

### S09 — Crossref relationships schema
URL: https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/  
Version: schema documentation page last updated 2020-04-08.  
Locator: relationship kinds lines 122–163; version and preprint rows 135–144; unverified non-DOI identifiers line 163.  
Observed: metadata can carry reference, version, preprint, translation, replacement, and related-object links. Crossref says non-DOI identifiers in typed relations are not verified.  
Use: links are useful duplicate/version candidates, not a study-identity oracle; keep relation type, source, and confirmation status.

### S10 — Zotero duplicate-detection documentation
URL: https://github.com/zotero/zotero-docs/blob/main/content/duplicate_detection.md  
Version: live main-branch documentation; no release/commit shown in the opened page; accessed 2026-10-10.  
Locator: “Finding Duplicates” and “Merging Duplicates,” lines 192–205.  
Observed: the described detector uses title, DOI, ISBN; where matching or absent, it also compares years within one year and author/creator list with one surname plus first initial. It works only inside one library; false positives cannot currently be marked as non-duplicates; merging retains item collections/tags.  
Use: duplicate candidate generation only. A common title or nearby year is unsafe as a study-level merge rule, especially for municipal series, translated reports, and multiple reports of one study.

### S11 — ASReview LAB v3 release history
URL: https://github.com/asreview/asreview/releases  
Version: v3.0.8, commit d3e863c94e1945ace7848b6ca5bcf2fb1eecbdb5; release page displays “18 Jun 21:12” without the year.  
Locator: v3.0.8 release entry; preceding v3.0.5 entry notes a broken decision-change migration fix.  
Observed: the release history contains maintenance fixes as well as screening/data-handling changes; v3.0.5 explicitly fixed a migration bug.  
Use: if active-learning screening is selected, record exact application version and exported project state; do not report its screened count as discovery coverage.

### S12 — ASReview LAB v3 duplicate-hiding behavior
URL: https://github.com/asreview/asreview/blob/d3e863c/README.md  
Version: README at commit d3e863c94e1945ace7848b6ca5bcf2fb1eecbdb5, corresponding to v3.0.8.  
Locator: “What’s New in Version 3,” lines 207–210.  
Observed: records with duplicate titles and texts are automatically hidden during screening but can be included in export.  
Use: screening workload may change even when retrieval does not; preserve and count all input rows and export hidden rows before any identity decisions.

### S13 — ASReview duplicate record discussion
URL: https://github.com/asreview/asreview/discussions/1741  
Version: discussion opened 2024-05-07; maintainer reply 2024-05-28.  
Locator: accepted answer lines 159–175 and follow-up lines 186–199.  
Observed: a user reported a spelling-variant duplicate resurfacing during screening; the maintainer recommended consistent labels for duplicates and said post-start removal would be a useful feature.  
Use: versioned history illustrates that title variation can evade duplicate handling and alter workload. Treat it as an implementation discussion, not a controlled performance study.

### S14 — CADTH PRESS 2015 search-review form
URL: https://www.cadth.ca/sites/default/files/PRESS_Peer_Review_Electronic_Search_Strate/Table_10_PRESS.pdf  
Version: PRESS 2015 guideline assessment form; CADTH publication context 2016.  
Locator: submission form instruction to provide the strategy exactly as run, including hits per line.  
Observed: the peer-review form asks for reproducible query text and per-line result counts.  
Use: have an information specialist review the final database strategy before the pilot and preserve the reviewed version.

## Search and inspection log (methods sources only)

Executed web searches on 2026-10-10 for OpenAlex search/change history; Crossref metadata relations; Zotero duplicate matching; PRISMA-S; Cochrane search methods; citation-searching reporting (TARCiS); ASReview release and duplicate behavior; PRESS search review. Official pages/PDF search records above were opened or inspected. Exact query strings are recorded in source-map.json; exact web fetch timestamps are not exposed, so each source records an exact post-access clock checkpoint and bounded access window.

Not executed: no structured search for urban-heat intervention studies, bibliographic database/API call, municipal repository query, citation search on a case seed, case-record export, screening, title/study match adjudication, or effectiveness assessment. A limited public-web search for prior review-method examples was executed and is documented as S15 and S17.

### S15 — U.S. urban-heat review search and stated limitations
URL: https://doi.org/10.1016/j.scsadv.2026.100077  
Version: published 2026; DOI 10.1016/j.scsadv.2026.100077.  
Locator: publisher search-result excerpt describing methods and limitations.  
Observed: excerpt says the review used Web of Science plus backward citation tracking and limits representation of studies indexed elsewhere, including municipal reports/technical evaluations. The DOI page returned HTTP 403 on open; full text and supplement were not inspected.  
Use: an example of a prior collection stating its database boundaries and known grey-literature gap. It is a disclosure example only, not a coverage benchmark or intervention-effect source.

### S16 — OpenAlex API authentication and basic access
URL: https://help.openalex.org/api/authentication/  
Version: live help page last updated 2026-08-19.  
Locator: Authentication opening; API key and rate-limit sections.  
Observed: basic API requests are available without a key; free key raises daily budget 10x; limits include 100 requests/second and pagination constraints.  
Use: basic anonymous queries can be considered without creating a private account; save API parameters and any rate-limit response.

Post-release method-source search executed 2026-10-10 (after the exact plan had been released): queries for urban-heat review search methods and current OpenAlex authentication. No topic records, municipal portal, or case seed was searched. Direct access attempts to two publisher pages returned HTTP 403.

### S17 — Urban heat island and heat-wave systematic review
URL: https://doi.org/10.1016/j.crm.2024.100603  
Version: published 2024; DOI 10.1016/j.crm.2024.100603.  
Locator: indexed methods excerpt describing source, date, query variants, and exclusion rules.  
Observed: excerpt reports a Web of Science Core Collection search dated 2023-10-19, an urban-heat-island and heatwave/heat wave term set, and exclusion of reports, policy literature, and government documents. Publisher opening returned HTTP 403; full strategy and supplement were not inspected.  
Use: another example showing that apparent systematic scope can deliberately exclude the municipal reports relevant here. It is not a coverage benchmark or intervention-effect source.

Updated post-release search log: added a web search for urban heat-wave review search dates and grey-literature exclusions (2026-10-10, between 06:01:29Z and 06:04:22Z).
