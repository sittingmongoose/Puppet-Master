# Reviser source index

Run: C-R2-02-control. Stage: reviser. This is a navigable index to stable source records in [source-map.json](../source-map.json). Access UTC windows, versions, locators, conditions, applicability, and upstream observations are recorded there. Exact per-request fetch times were not exposed by the web tool. No case-study or intervention-record search was run by the reviser.

| ID | Source and direct link | Use and limit |
|---|---|---|
| <a id="s01"></a>S01 | [PRISMA-Search official page](https://www.prisma-statement.org/prisma-search) | 16-item search reporting aid; not a coverage guarantee. |
| <a id="s02"></a>S02 | [Cochrane Handbook, Chapter 4](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04) | Reports/studies, varied sources, citations, grey literature, and search-review guidance; health-review context. |
| <a id="s03"></a>S03 | [TARCiS citation-searching statement](https://www.bmj.com/content/385/bmj-2023-078384) | Publisher page was inaccessible in critic check; Recommendation 5 not independently verified. |
| <a id="s04"></a>S04 | [TARCiS erratum record](https://pubmed.ncbi.nlm.nih.gov/39510583/) | Erratum is recorded; exact corrected Recommendation 5 wording remains unverified. |
| <a id="s05"></a>S05 | [OpenAlex launch history](https://blog.openalex.org/openalex-launch/) | 2022 launch/replacement history and acknowledged inherited coverage/structure issues. |
| <a id="s06"></a>S06 | [OpenAlex Works search documentation](https://help.openalex.org/api/searching/) | Parameter-specific fields, lexical/relevance behavior, rerank and semantic modes; see reviser recheck R01. |
| <a id="s07"></a>S07 | [OpenAlex synchronization/change history](https://help.openalex.org/access/sync/) | Snapshot cadence, changing entities, and merged/deleted ID history. |
| <a id="s08"></a>S08 | [Crossref REST API documentation](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) | Public search/filter/sample API for member/trusted-source deposits; not a complete municipal-report index; see R02. |
| <a id="s09"></a>S09 | [Crossref relationship schema](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/) | Typed version/preprint/translation/replacement candidates; non-DOI relation identifiers are unverified. |
| <a id="s10"></a>S10 | [Zotero duplicate-detection documentation](https://github.com/zotero/zotero-docs/blob/main/content/duplicate_detection.md) | Within-library duplicate candidate rules and false-positive limits. |
| <a id="s11"></a>S11 | [ASReview LAB release history](https://github.com/asreview/asreview/releases) | Versioned implementation and migration history; pin releases if used. |
| <a id="s12"></a>S12 | [ASReview v3.0.8 README at pinned commit](https://github.com/asreview/asreview/blob/d3e863c/README.md) | Duplicate-title/text hiding during screening and export behavior. |
| <a id="s13"></a>S13 | [ASReview duplicate discussion](https://github.com/asreview/asreview/discussions/1741) | User/maintainer discussion of spelling-variant behavior; not a controlled evaluation. |
| <a id="s14"></a>S14 | [CADTH PRESS search-review form](https://www.cadth.ca/sites/default/files/PRESS_Peer_Review_Electronic_Search_Strate/Table_10_PRESS.pdf) | Exact strategy and hits-per-line submission guidance. |
| <a id="s15"></a>S15 | [2026 U.S. urban-heat review](https://doi.org/10.1016/j.scsadv.2026.100077) | Indexed methods excerpt only; publisher page and supplement inaccessible; disclosure example only. |
| <a id="s16"></a>S16 | [OpenAlex API authentication/access](https://help.openalex.org/api/authentication/) | Basic access and rate-limit conditions; source record from upstream investigator search. |
| <a id="s17"></a>S17 | [2024 urban-heat island/heat-wave review](https://doi.org/10.1016/j.crm.2024.100603) | Indexed methods excerpt only; publisher page inaccessible; disclosure example only. |

## Reviser primary-source rechecks

- **R01 → S06:** Directly opened the official OpenAlex documentation. It distinguishes generic search (title, abstract, full text, and keyword matching), scoped title/abstract/keyword and title-and-abstract parameters, default relevance ordering, top-100 reranking, and separate semantic search. The exact parameter determines field scope; the word “default” alone is not reproducible. Full observation details and UTC window are in source-map.json.
- **R02 → S08:** Directly opened the official Crossref REST API documentation. It describes a public JSON API for searching/filtering/sampling metadata deposited by members and trusted sources, with no signup required. This supports a provisional public index comparison while imposing a clear deposit-coverage boundary. Full observation details and UTC window are in source-map.json.

The upstream source maps and search logs are carried as provenance in source-map.json. They report methods/tool documentation and limited prior-review excerpt searches, but explicitly report no intervention-topic query, municipal portal search, case-seed citation search, case export, screening, identity adjudication, or effectiveness analysis.
