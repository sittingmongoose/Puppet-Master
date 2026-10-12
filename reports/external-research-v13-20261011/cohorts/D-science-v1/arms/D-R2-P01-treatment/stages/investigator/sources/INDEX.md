# Evidence index

This index maps findings in discovery and the later draft to primary sources. The parent ../source-map.json records exact URLs, versions, locators, access date and bounded UTC access window, observed operation, conditions/defaults/exceptions, and applicability. The online current/latest pages are not version pins; re-check the selected deployed release before implementation.

| ID | Source | Locator / relevance |
|---|---|---|
| S01 | [PostgreSQL 18: Text Search Types](https://www.postgresql.org/docs/18/datatype-textsearch.html) | §§8.11, 12; tsvector lexeme normalization and text-query representation; lexical baseline |
| S02 | [PostgreSQL 18: GIN Indexes](https://www.postgresql.org/docs/18/gin.html) | §65.4, GIN Fast Update Technique; pending-list update/search trade-off |
| S03 | [Elastic: Hybrid search](https://www.elastic.co/docs/solutions/search/hybrid-search) | Hybrid search overview; rank fusion and current vendor recommendation |
| S04 | [OpenSearch: Hybrid search](https://docs.opensearch.org/latest/vector-search/ai-search/hybrid-search/) | Intro, configuration and Filtering data; pipeline and pre/post-filter choices |
| S05 | [OpenSearch: Document-level security](https://docs.opensearch.org/latest/security/access-control/document-level-security/) | user field matching, adaptive default, multi-role DLS behavior |
| S06 | [OpenSearch neural-search issue #1490](https://github.com/opensearch-project/neural-search/issues/1490) and [fix PR #1873](https://github.com/opensearch-project/neural-search/pull/1873) | multi-shard DFS hybrid normalization bug; merged guard rejects that search type |
| S07 | [Typesense 28.0: API Keys](https://typesense.org/docs/28.0/api/api-keys.html) | Scoped Search API Keys; filter embedding and parent key revocation |
| S08 | [Azure AI Search: Query-time ACL/RBAC enforcement](https://learn.microsoft.com/en-us/azure/search/search-query-access-control-rbac-enforcement) | security filter, missing token behavior, ACL evaluation and preview history |
| S09 | [Azure AI Search: Push ACL API](https://learn.microsoft.com/en-us/azure/search/search-index-access-control-lists-and-rbac-push-api) | Preview warning, ACL fields/limits, re-ingest freshness and last-updated date |
| S10 | [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | §§4.1, 4.2.4–4.2.5; TimeState, TextQuoteSelector, TextPositionSelector |
| S11 | [Microsoft Graph: driveItemVersion resource](https://learn.microsoft.com/en-us/graph/api/resources/driveitemversion?view=graph-rest-1.0) and [Get driveItemVersion](https://learn.microsoft.com/en-us/graph/api/driveitemversion-get?view=graph-rest-1.0) | version ID/content access and unauthenticated short-lived download URL exception |
| S12 | [Elastic: Document-level and field-level security](https://www.elastic.co/docs/deploy-manage/users-roles/cluster-or-deployment-auth/controlling-access-at-document-field-level) | role-combination caveat, limitations, request cache conditions |
| S13 | [Elastic: Aliases](https://www.elastic.co/docs/manage-data/data-store/aliases) | multiple alias actions are atomic; zero-downtime index swap |
| S14 | [OpenSearch: Optimizing hybrid search](https://docs.opensearch.org/latest/search-plugins/search-relevance/optimize-hybrid-search/) | query set, judgments and configuration; ranking evaluation process |
| S15 | [Git: git-rev-parse](https://git-scm.com/docs/git-rev-parse) | rev:path names the blob/tree in a commit; edition-specific repository locator |
| S16 | [OpenSearch resolver HLD issue #1932](https://github.com/opensearch-project/neural-search/issues/1932) | Open proposal, Aug 4 2026; current composability/pipeline/latency caveats |
| S17 | [Microsoft Graph: List versions](https://learn.microsoft.com/en-us/graph/api/driveitem-list-versions?view=graph-rest-1.0) | Version creation/retention depends on service and admin configuration; finite retention may vary by user/location |
| S18 | [SharePoint: Version history limits FAQ](https://learn.microsoft.com/en-us/sharepoint/faqs-for-versions) | Permanent purge, gradual trimming, legal hold and retention exceptions |
