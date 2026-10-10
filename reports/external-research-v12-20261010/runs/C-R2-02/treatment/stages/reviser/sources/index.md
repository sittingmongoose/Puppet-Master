# Reviser source index — C-R2-02-treatment

This bounded index links primary evidence used in the reviser. The complete investigator and critic maps, including source IDs and original UTC observations, are nested intact in ../source-map.json. R001–R009 are separate reviser checks; source IDs are stage-scoped and are not rebound.

## Reviser primary-source checks

- [R001 — OpenAlex works search](https://help.openalex.org/api/searching/): searchable fields, ranking factors, semantic search.
- [R002 — OpenAlex work attributes](https://help.openalex.org/data/works/attributes/): per-work downloadable-content flags.
- [R003 — Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/): registered Crossref work records.
- [R004 — Crossref filters](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/): type and date conditions.
- [R005 — Zotero duplicate detection](https://github.com/zotero/zotero-docs/blob/main/content/duplicate_detection.md): matching conditions and one-library limit.
- [R006 — INSPQ 2021 Update](https://www.inspq.qc.ca/sites/default/files/publications/3327-urban-heat-island-mitigation.pdf): Appendix 1 strategy and stream-specific counts.
- [R007 — INSPQ 2009 English report](https://www.inspq.qc.ca/sites/default/files/publications/1513_urbanheatislandmitigationstrategies.pdf): search method, source list, criteria, bilingual keywords.
- [R008 — INSPQ English catalogue](https://www.inspq.qc.ca/en/publications/1513): listed publication date and ISBN.
- [R009 — INSPQ French catalogue](https://www.inspq.qc.ca/publications/988): listed date and correction notes.

## Carried method and implementation sources

- [S001 — PRISMA-S](https://doi.org/10.1186/s13643-020-01542-z): search-reporting checklist, adapted only.
- [S002 — Cochrane Handbook Chapter 4](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04): stopping-rule caution and adequacy checks.
- [S003 — Cochrane Technical Supplement](https://training.cochrane.org/chapter04-tech-supplonlinepdfv65270924): source types and tailored grey-literature route.
- [S004 — INSPQ 2021 report](https://www.inspq.qc.ca/sites/default/files/publications/3327-urban-heat-island-mitigation.pdf): carried ID; reviser check R006.
- [S005 — OpenAlex search](https://help.openalex.org/api/searching/): carried ID; reviser check R001.
- [S006–S007 — Crossref API and filters](https://www.crossref.org/documentation/retrieve-metadata/rest-api/): reviser checks R003–R004.
- [S008 — Zotero duplicate detection](https://github.com/zotero/zotero-docs/blob/main/content/duplicate_detection.md): reviser check R005.
- [S009 — ASReview LAB progress/export](https://asreview.readthedocs.io/en/stable/lab/progress.html): optional post-retrieval screening aid.
- [S010 — ASReview release history](https://github.com/asreview/asreview/releases): carried release summary.
- [S011 — OpenAlex Works attributes](https://help.openalex.org/data/works/attributes/): per-work content indicators.
- [S012 — OpenAlex Fulltext](https://help.openalex.org/access/fulltext/): cached-content scope and access conditions.
- [S013 — OpenAlex open access for Works](https://help.openalex.org/data/works/open-access/): OA definition and corpus context.
- [S014 — ASReview v3.0.8](https://github.com/asreview/asreview/releases/tag/v3.0.8): saved-ranking record identifier fix.
- [S015 — ASReview v3.0.5](https://github.com/asreview/asreview/releases/tag/v3.0.5): decision migration/import/export fixes.
- [S016 — ASReview v3.0.6](https://github.com/asreview/asreview/releases/tag/v3.0.6): database-locking fix.
- [S017 — ASReview v3.0.7](https://github.com/asreview/asreview/releases/tag/v3.0.7): ranking-table persistence fix.
- [S018 — earlier INSPQ predecessor URL](https://www.inspq.qc.ca/pdf/publications/1513_UrbanHeatIslandMitigationStrategies.pdf): carried 404 observation retained unchanged; accessible alternate official path is R007.

## Local case records

- C001: released brief; path and SHA-256 in ../source-map.json.
- C002: released plan; SHA-256 05b07646a51d90cfe102deabf5b52dab894ce633469a62455d3f70a351abe374.
- C003: investigator search log; path and SHA-256 in ../source-map.json.
- All source locators, operation notes, governing conditions, applicability, and access UTC are in ../source-map.json.
