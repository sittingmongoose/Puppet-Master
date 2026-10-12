# Source index — investigator stage

Sources were accessed read-only on 2026-10-12 UTC. The source IDs below are stable references used in ../discovery.md; their URLs are pinned in ../source-map.json. Source-map records carry version/commit, exact locator, access time, operation, condition/default/exception, and applicability. No source excerpt is copied into this index.

## Retrieval and ranking

- **S01** PostgreSQL 18 FTS controls: https://www.postgresql.org/docs/18/textsearch-controls.html — §§12.3.1–12.3.3; configuration/dictionaries, weighted title/body vectors, application-specific ranking.
- **S02** PostgreSQL 18 GIN: https://www.postgresql.org/docs/18/gin.html — §65.4 and gin_fuzzy_search_limit; inverted index and nonzero soft-limit caveat.
- **S04** pgvector v0.8.7 README: https://github.com/pgvector/pgvector/blob/v0.8.7/README.md — filtering, multitenancy, iterative index scans.
- **S08** OpenSearch 3.8 RRF docs: https://docs.opensearch.org/3.8/vector-search/ai-search/hybrid-search/rrf/ — introduced version, score fusion, defaults and cautions.
- **S10** OpenSearch 3.8 vector filtering: https://docs.opensearch.org/3.8/vector-search/filter-search-knn/index/ — in-query vs post-filter vs exact filtered search.
- **S11** OpenSearch 3.8 methods/engines: https://docs.opensearch.org/3.8/mappings/supported-field-types/knn-methods-engines/ — HNSW/IVF engine alternatives and vendor guidance.

## Authorization, caches, and indexing

- **S03** PostgreSQL 18 RLS: https://www.postgresql.org/docs/18/ddl-rowsecurity.html — default deny, owner/superuser exceptions, policy composition.
- **S09** OpenSearch 3.8 DLS: https://docs.opensearch.org/3.8/security/access-control/document-level-security/ — read scope, adaptive default, role combinations, exact identifier mapping.
- **S12** OpenSearch 3.8 aliases: https://docs.opensearch.org/3.8/im-plugin/index-alias/ — reindex cutover and atomic alias update.
- **S14** Elasticsearch DLS limitations: https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/controlling-access-at-document-field-level — aggregate leakage caveat and conditional request-cache behavior; Elastic-specific.
- **S15** Elasticsearch node query cache: https://www.elastic.co/docs/reference/elasticsearch/configuration-reference/node-query-cache-settings — shared node cache scope/defaults; Elastic-specific.

## Durable references and failure/release history

- **S13** W3C Web Annotation: https://www.w3.org/TR/annotation-model/ — canonical identity, TextQuoteSelector, brittle position selectors/state.
- **S05** pgvector v0.8.7 changelog: https://github.com/pgvector/pgvector/blob/v0.8.7/CHANGELOG.md — release and HNSW/IVFFlat maintenance fixes.
- **S06** pgvector issue #719: https://github.com/pgvector/pgvector/issues/719 — 0.7.0 filtered HNSW report and maintainer’s 0.8.0/B-tree guidance.
- **S07** pgvector issue #785: https://github.com/pgvector/pgvector/issues/785 — 0.8.0 filtered underfill/latency report and closure context; closure is not treated as a fix.

The OpenSearch 3.8 documentation pages displayed a “no longer maintained” banner at access. Recheck each mechanism against the selected supported release before implementation. PostgreSQL docs identified version 18 as current stable and 19 as development/beta. The brief does not select either product or release.

## Current OpenSearch documentation cross-checks

These records use the unversioned latest route, read at 2026-10-12T04:28:06Z. The pages did not identify an exact release/build number; pin and recheck the selected supported release.

- **S16** Current DLS docs: https://docs.opensearch.org/latest/security/access-control/document-level-security/ — confirms DLS scope/default and exact identifier mapping cautions.
- **S17** Current vector filters: https://docs.opensearch.org/latest/vector-search/filter-search-knn/index/ — confirms filter placement and engine/version support conditions.
- **S18** Current index aliases: https://docs.opensearch.org/latest/im-plugin/index-alias/ — confirms atomic generation cutover.
- **S19** Current RRF docs: https://docs.opensearch.org/latest/vector-search/ai-search/hybrid-search/rrf/ — current fusion mechanics; release pin still required.
