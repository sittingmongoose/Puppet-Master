# Source index and bounded evidence

The source IDs are stable across `discovery.md`, `draft.md`, and final delivery. Times are UTC. Official specs/releases are pinned by published identifier where one exists; rolling documentation is marked as rolling. The web retrieval interface exposes batch-level rather than per-page retrieval timestamps, recorded in `source-map.json`. Notes below paraphrase the located evidence and keep the cited condition with each finding.

| ID | Source | Locator | Use in this investigation |
|---|---|---|---|
| S01 | [SQLite Online Backup API](https://www.sqlite.org/backup.html) | Overview; step API | Database-only snapshot and incremental copy behavior. |
| S02 | [SQLite Isolation](https://www.sqlite.org/isolation.html) | Read transactions; dirty-read exception | Stable read view and exception conditions. |
| S03 | [SQLite WAL](https://www.sqlite.org/wal.html) | Concurrency/limitations | WAL reader snapshots and same-machine constraint. |
| S04 | [rusqlite Backup API 0.40.2](https://docs.rs/rusqlite/0.40.2/rusqlite/backup/struct.Backup.html) | `step`, completion helper | Candidate implementation API and chunking. |
| S05 | [rusqlite source at e88f112](https://github.com/rusqlite/rusqlite/blob/e88f112bef7899234a497baed5cc3c3d553deeb8/src/backup.rs) | `step`, helper | Version-pinned behavior details. |
| S06 | [PKWARE ZIP APPNOTE 6.3.10](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT) | §§4.1.11, 4.3.5–.9, 4.3.12–.16, 4.5.3 | Streaming, close records, ZIP64 and profile limits. |
| S07 | [zip-rs writer source v8.6.0](https://github.com/zip-rs/zip2/blob/v8.6.0/src/write.rs) | stream constructor; finish/abort | Candidate Rust implementation mechanics. |
| S08 | [zip-rs issue #715](https://github.com/zip-rs/zip2/issues/715) | Regression report | Specific ZIP64 streaming regression. |
| S09 | [zip-rs PR #717](https://github.com/zip-rs/zip2/pull/717) | Fix and tests | Correction lineage. |
| S10 | [zip-rs v8.3.0](https://github.com/zip-rs/zip2/releases/tag/v8.3.0) | Release notes | Released fix evidence. |
| S11 | [BagIt RFC 8493](https://www.rfc-editor.org/rfc/rfc8493.html) | §§1, 2.1.3, 2.2.1, 3 | Manifest-based package integrity pattern and its boundary. |
| S12 | [Frictionless Data Package v1](https://specs.frictionlessdata.io/data-package/) | Descriptor/resources/schema | Offline resource descriptor inspiration. |
| S13 | [JSON RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html) | §§4, 6, 8.1 | UTF-8, duplicate keys, large numeric IDs. |
| S14 | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html) | §§4–5 | Instant representation boundary. |
| S15 | [RFC 9557](https://www.rfc-editor.org/rfc/rfc9557.html) | §§2–4 | Time-zone annotated instants and limits. |
| S16 | [UUID RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html) | §§4, 6.5 | UUID identity and mutable-name caveat. |
| S17 | [JSON Schema Core 2020-12](https://json-schema.org/draft/2020-12/json-schema-core) | Dialect/vocabulary/references | Schema pinning and self-containment. |
| S18 | [JSON Schema Validation 2020-12](https://json-schema.org/draft/2020-12/json-schema-validation) | §7 format vocabularies | Format assertion is not automatic. |
| S19 | [2020-12 release notes](https://json-schema.org/draft/2020-12/release-notes) | Format changes | Cross-check of dialect behavior. |
| S20 | [GitLab project export docs](https://docs.gitlab.com/user/project/settings/import_export/) | Included/excluded items, compatibility, user mapping | Product precedent and limits. |
| S21 | [GHSA-94vh-gphv-8pm8](https://github.com/advisories/GHSA-94vh-gphv-8pm8) | Affected/patched versions and impact | Import extraction boundary. |

## Bounded findings by source ID

- **S01–S03 — snapshot semantics.** SQLite can provide a consistent view of database pages/rows, and a WAL reader retains its start-time snapshot while later writes commit elsewhere. Shared-cache plus `read_uncommitted` is a specific dirty-read exception; default behavior does not permit it. These claims say nothing about separate files.
- **S04–S05 — Rust implementation candidate.** rusqlite exposes chunked backup steps and progress helpers. Chunk size/sleep gives a lock-duration/performance tradeoff; a single all-page step may hold a read lock longer. Pin SQLite/rusqlite versions and still coordinate external attachments independently.
- **S06–S10 — container format and implementation history.** ZIP supports streaming through data descriptors, then writes its central directory/end records at the end; ZIP64 covers sizes/offsets/counts beyond classic limits. A concrete `zip` 8.2.0 ZIP64/Deflate streaming regression was fixed and released in 8.3.0, so exercise large-file paths using the exact locked version. A working writer API does not prove every OS archive utility accepts every ZIP64/data-descriptor combination.
- **S11–S12 — package metadata patterns.** BagIt provides checksummed payload manifests and validity/completeness concepts but not a tracker schema or authenticity. Data Package describes resources/schemas but permits URL references; offline use must bundle resources and schemas and disallow network fetches.
- **S13–S19 — representation.** Use UTF-8; unique JSON object keys; string identifiers where numeric ranges might exceed interoperable precision. RFC 3339 represents instants with offsets, while date-only and floating local values need distinct types. RFC 9557’s time-zone annotation does not make future local wall times immutable. JSON Schema 2020-12 separates format annotation from optional assertion; pin dialect, bundle schemas, and add semantic checks. UUIDs are available but do not replace original IDs by default.
- **S20 — omission honesty.** GitLab gives a practical offline package precedent while warning exports are not backups, with supported items depending on exact product version and user mapping dependent on destination/account conditions. Treat the specific include/exclude list as versioned contract, not universal coverage.
- **S21 — import trust.** A crafted archive can exploit unsafe extraction paths in affected Rust zip versions. A future importer must validate normalized member paths, links, duplicate names, expansion limits, and schemas before extracting or importing. This is not an export-writer defect claim.
