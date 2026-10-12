# Source index — reviser stage

This report preserves the investigator's S01–S19 and critic's C01–C17 IDs without reassigning them. Their complete identity records, including URL, version/commit, locator, access time, observed operation, governing condition/default/exception, and applicability, are carried in [source-map.json](../source-map.json). The new independent rechecks use R01–R03.

## Reviser primary-source rechecks

- **R01** [OpenSearch 3.8 Document-level security](https://docs.opensearch.org/3.8/security/access-control/document-level-security/) — retired documentation version; read the multiple-role composition and plugins.security.dfm_empty_overrides_all sections with surrounding examples.
- **R02** [Current OpenSearch Document-level security](https://docs.opensearch.org/latest/security/access-control/document-level-security/) — current unversioned route; corroborates the same role-composition behavior, but does not identify a pinned software release.
- **R03** [pgvector issue #719](https://github.com/pgvector/pgvector/issues/719) — bounded issue history: recommendation to try v0.8.0/B-tree, reporter's v0.8.0/PostgreSQL 17 follow-up, maintainer request for ANALYZE/EXPLAIN, and later closure discussion. It is a report thread, not a benchmark or validated general defect.

## Inherited source indexes

- [Investigator source index](../investigator/sources/index.md) — S01–S19.
- [Independent critic source index](../critic/sources/index.md) — C01–C17.

## Recheck conclusions and limits

The OpenSearch docs support the critic's missing role-composition detail: DLS queries combine with OR; a DLS role plus a role without DLS remains filtered by the DLS role unless the documented plugins.security.dfm_empty_overrides_all override is enabled. The inspected 3.8 page is marked no longer maintained; the current route is unpinned. The inspected passage did not state the setting default, so this report does not claim one. Verify the selected supported release and actual role configuration.

The pgvector thread supports adding the reporter's follow-up that the report persisted after upgrading to v0.8.0 on PostgreSQL 17, along with the maintainer's request for ANALYZE and EXPLAIN. Later comments and closure do not establish universal behavior or a universal fix.

No synthetic search corpus, production corpus, authorization harness, or search implementation was run. Toy-corpus ranking/citation checks, authorization/revocation/cache tests, and owner decisions remain proposed, not executed.
