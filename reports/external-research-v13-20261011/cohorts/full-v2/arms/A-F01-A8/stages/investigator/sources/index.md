# Primary-source index

All sources were opened from official project documentation, upstream repositories, the RFC Editor, or NIST on 2026-10-12 UTC. Exact source IDs, URLs, access times, versions/commits, locators, conditions and applicability are in [source-map.json](../source-map.json).

| ID | Evidence |
|---|---|
| S01–S04 | SQLite WAL limits, crash atomicity, live backup API, and current release/version history |
| S05–S07 | SQLite 3.54.0 release-tag source and crash/WAL implementation tests |
| S08–S10 | CouchDB 3.5 stable conflict, deletion, replication, and attachment behavior |
| S11–S13 | PouchDB sync, conflict, attachment documentation |
| S14–S15 | PouchDB integration tests and an unresolved low-revision-limit deletion report |
| S16–S18 | Automerge conflict semantics, map/list merge rules, stable JS release context |
| S19–S21 | UUID identity standard, SHA-256 integrity standard, and PouchDB release context |

Caveats:
- CouchDB and PouchDB documentation URLs are moving pages. PouchDB's docs and moving test page are not falsely presented as a pinned release; its release card is recorded separately as S21.
- SQLite's GitHub source is an upstream mirror. SQLite's official release page in S04 supplies the release/source ID.
- Automerge's documented JavaScript release does not establish the selected Rust crate version.
- No source test suite was run for this research assignment.
