# Source index — B06-P02-treatment investigator

Read the structured record [../source-map.json](../source-map.json) for exact URLs, release/version or UNKNOWN, access UTC, locator, inspected operation, operative conditions, and relevance. IDs are stable within this run; no source is silently rebound. This is a bounded text index, not a raw web-page archive.

- **Case scope**: S00.
- **Offline writes, sync queue, idempotency**: S01, S02, S06, S13, S15, S16.
- **Replication/conflicts and access control**: S05–S07, S09–S11, S17.
- **Photo queue/local and remote storage**: S03–S04.
- **Relational arbitration**: S12.
- **Browser durability and background limits**: S13–S14.
- **Version/history/release and issue-to-fix review**: S08–S09, S16.

Primary source shortlist:

1. [PowerSync update conflicts](https://github.com/powersync-ja/powersync-docs/blob/main/handling-writes/handling-update-conflicts.mdx) (S01)
2. [CouchDB 3.5 conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html) and [PouchDB replication](https://pouchdb.com/guides/replication.html) (S05–S06)
3. [Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/) and [sync server](https://github.com/automerge/automerge-repo-sync-server) (S10–S11)
4. [PostgreSQL INSERT](https://www.postgresql.org/docs/current/sql-insert.html) (S12)
5. [MDN storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) and [PWA background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) (S13–S14)

- **SDK repository code and caller report**: S18, S19. The sample inserts mock data, and the old closed issue does not show a closure explanation.
