# Sources index — A-M01-B treatment/research (S07 documentation-portal)

All reads occurred 2026-10-09T18:26Z–18:28Z via `web_search` snippets and `web_fetch` full-page reads.
No case plan, campaign, history, evaluator, or counterpart was read before discovery freeze.
Local brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S07/brief.md`
(sha256 `11201a68…3c3bd7a`, 1426 bytes, per freeze.json).

Canonical locator table is `../source-map.json` (immutable IDs S00–S23, no rebind).
This directory holds bounded transcribed excerpts (facts + governing defaults) for the
deep-dive mechanisms. Full fetched pages were processed through the harness fetcher;
excerpts below preserve the material scope needed for O2/O3 verification.

| ID | File | Upstream |
|----|------|----------|
| S01 | S01-docusaurus-versioning.excerpt.txt | https://docusaurus.io/docs/versioning (v3.10.2) |
| S02 | S02-docusaurus-search.excerpt.txt | https://docusaurus.io/docs/search (v3.10.2) |
| S03 | (no excerpt file; i18n config observed via fetch, quoted in discovery) | https://docusaurus.io/docs/i18n/tutorial (v3.10.2) |
| S04 | S04-pagefind-indexing.excerpt.txt | https://pagefind.app/docs/indexing/ |
| S05 | S05-pagefind-ranking.excerpt.txt | https://pagefind.app/docs/ranking/ |
| S06 | (folded into S05 file, search-config section) | https://pagefind.app/docs/search-config/ |
| S07 | S07-meilisearch-ranking.excerpt.txt | Meilisearch ranking rules doc |
| S08 | S08-meilisearch-typo.excerpt.txt | Meilisearch typo tolerance doc |
| S09 | S09-typesense-search.excerpt.txt | https://typesense.org/docs/latest/api/search.html |
| S10 | S10-antora.excerpt.txt | https://docs.antora.org/antora/latest/content-source-versioning-methods/ |
| S11 | S11-vale.excerpt.txt | https://docs.vale.sh/topics/.vale.ini.md |
| S12 | S12-mike.excerpt.txt | https://github.com/jimporter/mike (README) |
| S13–S23 | (snippet-observed; locators in source-map.json) | issues, releases, secondary comparisons |

Mutable-drift note: vendor `/latest/` and unpinned doc URLs are mutable; pinned versions
(Docusaurus 3.10.2, Pagefind 1.5.0 component-UI note, Typesense v27.0 tag, mike README at
fetch time) are recorded in source-map.json. Re-verify before build.
Usage/billing: unobserved (null) for all sources.
