# Critic source index

This index preserves investigator IDs S01–S21 and their original primary URLs. The critic reopened all URLs in one batch at **2026-10-12 01:22:19 UTC**. Per-page fetch timestamps were not exposed. Full identity, version/commit, observed operation, condition and applicability are in `../source-map.json`.

| ID | Primary source | Critic locator and use |
|---|---|---|
| S01 | [SQLite Online Backup API](https://www.sqlite.org/backup.html) | Overview; §§3.1–3.2. Snapshot is database-only; concurrent writes may restart backup and sustained restarts may prevent completion. |
| S02 | [SQLite Isolation](https://www.sqlite.org/isolation.html) | Read transaction; shared-cache plus `read_uncommitted` exception. |
| S03 | [SQLite WAL](https://www.sqlite.org/wal.html) | Reader snapshots; one-host/network-filesystem limitation. |
| S04 | [rusqlite Backup API 0.40.2](https://docs.rs/rusqlite/0.40.2/rusqlite/backup/struct.Backup.html) | Optional `backup` feature; `step` and completion API. |
| S05 | [rusqlite source at e88f112](https://github.com/rusqlite/rusqlite/blob/e88f112bef7899234a497baed5cc3c3d553deeb8/src/backup.rs) | Version-pinned step and Busy/Locked behavior. |
| S06 | [PKWARE ZIP APPNOTE 6.3.10](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT) | §§4.3.5–4.3.16; descriptors, central directory/end records, ZIP64. |
| S07 | [zip-rs writer source v8.6.0](https://github.com/zip-rs/zip2/blob/v8.6.0/src/write.rs) ([raw rendering inspected](https://raw.githubusercontent.com/zip-rs/zip2/v8.6.0/src/write.rs)) | `new_stream`, `finish`, abort limitations; source-map records condition. |
| S08 | [zip-rs issue #715](https://github.com/zip-rs/zip2/issues/715) | Configuration-specific 8.2.0 ZIP64/Deflate regression. |
| S09 | [zip-rs PR #717](https://github.com/zip-rs/zip2/pull/717) | Fix details and issue linkage. |
| S10 | [zip-rs v8.3.0 release](https://github.com/zip-rs/zip2/releases/tag/v8.3.0) | Release notes for ZIP64 fix. |
| S11 | [BagIt RFC 8493](https://www.rfc-editor.org/rfc/rfc8493.html) | Payload/tag manifests and completeness/fixity, not domain schema. |
| S12 | [Frictionless Data Package v1](https://specs.frictionlessdata.io/data-package/) | Resource URL/path option; offline profile must bundle. |
| S13 | [JSON RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html) | §§4, 6, 8.1; duplicate names, number range, UTF-8. |
| S14 | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html) | §5.6 date-time requires date, time and offset. |
| S15 | [RFC 9557](https://www.rfc-editor.org/rfc/rfc9557.html) | §§2–4 zone annotation; changing IANA rules. |
| S16 | [UUID RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html) | §6.5 name-based UUID caveat. |
| S17 | [JSON Schema Core 2020-12](https://json-schema.org/draft/2020-12/json-schema-core) | Dialect identification, references and bundling. |
| S18 | [JSON Schema Validation 2020-12](https://json-schema.org/draft/2020-12/json-schema-validation) | §7.2: format assertion is optional and disabled by default. |
| S19 | [JSON Schema 2020-12 release notes](https://json-schema.org/draft/2020-12/release-notes) | Format vocabulary change, cross-check only. |
| S20 | [GitLab project export docs](https://docs.gitlab.com/user/project/settings/import_export/) | Items vary by version; NDJSON; two-minor compatibility; user mapping. **No “unreliable backup” statement found on the cited page.** |
| S21 | [GHSA-94vh-gphv-8pm8](https://github.com/advisories/GHSA-94vh-gphv-8pm8) | Affected/patched extraction versions and path traversal condition. |

## Independent evidence relevant to findings

- **F1 (repo/callers/tests):** The brief itself requires relevant repository code and caller/test exploration. The frozen package’s source map contains external documentation and dependency code, but identifies no tracker repository, product call site, or project test. The critic assignment does not provide a repository path, so product-specific absence or irrelevance cannot be independently resolved here.
- **F2 (GitLab attribution):** On the cited page, the export section says not all items are exported and item coverage varies by GitLab version; compatibility says project files are NDJSON and import is supported up to two minor versions behind. Its only “backup” reference located is a separate GitLab repository-performance link. The cited page does not substantiate the draft’s explicit “not a reliable backup” wording.
- **F3 (SQLite backup completion):** SQLite Online Backup API §§3.1–3.2 says external writes may restart backup work and sufficiently frequent restarts may prevent completion. The draft proposes concurrency tests but no restart bound/time limit for this candidate.
- **F4 (manifest protocol):** The proposal calls for a manifest containing member hashes and for validating exact package/member consistency, but does not say whether the manifest hashes itself or is explicitly excluded. A package contract should state that rule to avoid a circular digest interpretation.

No application code, project tests, export, build, filesystem simulation, or importer was run by this critic.
