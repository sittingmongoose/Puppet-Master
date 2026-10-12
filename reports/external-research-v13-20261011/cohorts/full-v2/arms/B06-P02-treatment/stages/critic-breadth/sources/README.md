# Critic-breadth source index

This index navigates [source-map.json](../source-map.json), which records exact URLs, versions/commits where visible, locators, access UTC, inspected operations, governing conditions and applicability. Critic IDs C01–C04 are separate access records and cross-reference, without rebinding, the investigator IDs S01, S05, S07 and S10.

- **Queued mutation and conflict policy:** [C01 PowerSync conflict handling](https://github.com/powersync-ja/powersync-docs/blob/main/handling-writes/handling-update-conflicts.mdx) — upstream S01.
- **Replication branches and app-level merge:** [C02 CouchDB conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html) — upstream S05.
- **Shared database access boundary:** [C03 CouchDB security API](https://docs.couchdb.org/en/stable/api/database/security.html) — upstream S07.
- **CRDT same-field conflicts:** [C04 Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/) — upstream S10.

The complete investigator evidence register is at [investigator/sources/README.md](../investigator/sources/README.md) and [investigator/source-map.json](../investigator/source-map.json).