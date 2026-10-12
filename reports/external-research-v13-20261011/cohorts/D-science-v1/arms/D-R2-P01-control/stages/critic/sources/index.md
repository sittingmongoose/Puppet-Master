# Critic source index — D-R2-P01-control

New critic-side IDs use the C prefix. They do not replace or rebind investigator IDs S01–S19; the cross-reference field in source-map.json records corresponding carried IDs where applicable. These are bounded primary-source checks read for this critique. No private document data was accessed.

## Retrieval and indexing
- **C01** PostgreSQL 18 text search controls: https://www.postgresql.org/docs/18/textsearch-controls.html — configuration, normalization, weighting, ranking.
- **C02** PostgreSQL 18 GIN indexes: https://www.postgresql.org/docs/18/gin.html — inverted lookup and optional random soft result limit.
- **C04** pgvector v0.8.7 README: https://github.com/pgvector/pgvector/blob/v0.8.7/README.md — filtered approximate search and iterative scan caveats.
- **C05** pgvector v0.8.7 changelog: https://github.com/pgvector/pgvector/blob/v0.8.7/CHANGELOG.md — tagged release date and 0.8.7 build fix.
- **C08** OpenSearch 3.8 RRF: https://docs.opensearch.org/3.8/vector-search/ai-search/hybrid-search/rrf/ — rank fusion, version, score caveats.
- **C10** OpenSearch 3.8 k-NN filters: https://docs.opensearch.org/3.8/vector-search/filter-search-knn/index/ — filter modes and trade-offs.
- **C15** Current OpenSearch RRF: https://docs.opensearch.org/latest/vector-search/ai-search/hybrid-search/rrf/ — current corroboration, no pinned release.
- **C16** Current OpenSearch aliases: https://docs.opensearch.org/latest/im-plugin/index-alias/ — atomic switch, not ACL freshness.

## Authorization and caches
- **C03** PostgreSQL 18 row security: https://www.postgresql.org/docs/18/ddl-rowsecurity.html — enablement, default deny, bypass and policy composition.
- **C09** OpenSearch 3.8 DLS: https://docs.opensearch.org/3.8/security/access-control/document-level-security/ — retired docs version, identifier mapping and role composition.
- **C12** Elasticsearch document/field security: https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/controlling-access-at-document-field-level — Elastic-specific aggregate and request-cache caveats.
- **C13** Elasticsearch node query cache: https://www.elastic.co/docs/reference/elasticsearch/configuration-reference/node-query-cache-settings — Elastic-specific shared cache and segment invalidation.
- **C14** Current OpenSearch DLS: https://docs.opensearch.org/latest/security/access-control/document-level-security/ — current corroboration, no pinned release.

## Passage identity and failure history
- **C06** pgvector issue #719: https://github.com/pgvector/pgvector/issues/719 — versioned report, maintainer advice, and reported persistence after attempted 0.8.0 upgrade.
- **C07** pgvector issue #785: https://github.com/pgvector/pgvector/issues/785 — versioned underfill/latency report; closure did not document a code fix.
- **C11** W3C Web Annotation: https://www.w3.org/TR/annotation-model/ — quote/position selectors and representation state.
- **C17** Current OpenSearch vector filters: https://docs.opensearch.org/latest/vector-search/filter-search-knn/index/ — current filter corroboration, release pin required.
