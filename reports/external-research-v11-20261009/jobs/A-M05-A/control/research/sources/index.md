# sources/ — navigable index

Bounded evidence retained for ER11 case S05 (museum-search), block A-M05-A/control, stage research. Source IDs are immutable and mirrored one-to-one in `../source-map.json`. Negative evidence (failed fetches) is retained as SRC-09.

| ID | Source | Area | Status | Evidence file |
|----|--------|------|--------|---------------|
| SRC-01 | SQLite FTS5 docs | keyword search | retrieved | [SRC-01-sqlite-fts5.md](SRC-01-sqlite-fts5.md) |
| SRC-02 | pgvector CHANGELOG (raw master) | semantic search + O3 release chain | retrieved | [SRC-02-pgvector-changelog.md](SRC-02-pgvector-changelog.md) |
| SRC-03 | Meilisearch typo tolerance docs | keyword search defaults | retrieved | [SRC-03-meilisearch-typo.md](SRC-03-meilisearch-typo.md) |
| SRC-04 | IIIF Image API 3.0 spec | image handling | retrieved | [SRC-04-iiif-image-api.md](SRC-04-iiif-image-api.md) |
| SRC-05 | Mukurtu CMS home | access policy / restricted cultural material | retrieved | [SRC-05-mukurtu-home.md](SRC-05-mukurtu-home.md) |
| SRC-06 | Mukurtu support index | access policy (protocols, TK Labels) | retrieved | [SRC-06-mukurtu-support.md](SRC-06-mukurtu-support.md) |
| SRC-07 | RightsStatements.org data-model repo | rights vocabulary | retrieved (repo only; site 526) | [SRC-07-rightsstatements-data-model.md](SRC-07-rightsstatements-data-model.md) |
| SRC-08 | Typesense docs + llms.txt | keyword/vector search alternative | index only; defaults unverified | [SRC-08-typesense-docs.md](SRC-08-typesense-docs.md) |
| SRC-09 | Failed-fetch log | negative evidence (incl. OpenRefine) | recorded | [SRC-09-failed-fetches.md](SRC-09-failed-fetches.md) |

Reading order for a reviewer: discovery narrative is `../discovery.md`; every factual claim there is graded "verified (SRC-0x)" or "candidate (unverified, SRC-09)".
