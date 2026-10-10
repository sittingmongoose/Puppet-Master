# Evidence index

Each source ID is stable and maps to complete identity/condition/applicability fields in `../source-map.json`. This index is a navigation aid; sources are public first-party documentation, official repository issue/fix/release pages, and one explicitly qualified official indexed help result. All retrieval was read-only. No product, API, or importer/exporter was run. Access timestamps and observed-operation limits are recorded in the map.

| IDs | Topic | Sources |
|---|---|---|
| S01–S07 | Zotero identifier intake, duplicates, version/item types, import/export, bibliography and exporter options | [Adding items](https://www.zotero.org/support/adding_items_to_zotero); [duplicates](https://www.zotero.org/support/duplicate_detection); [item types](https://www.zotero.org/support/kb/item_types_and_fields); [standard import](https://www.zotero.org/support/kb/importing_standardized_formats); [export](https://www.zotero.org/support/kb/exporting); [bibliographies](https://www.zotero.org/support/creating_bibliographies); [translators](https://www.zotero.org/support/dev/translators) |
| S08–S12 | Paperpile import, duplicate handling, export, search, metadata update | [RIS/BibTeX import](https://cdn.paperpile.com/h/import-ris-bibtex/); [duplicates](https://paperpile.com/h/duplicates-explained/); [export](https://paperpile.com/h/export-library-data/); [online search](https://paperpile.com/h/search-online/); [metadata update](https://www.api.paperpile.com/h/update-metadata-automatically/) |
| S13–S15 | OpenRefine reconciliation and clustering analogy | [Reconciliation](https://openrefine.org/docs/manual/reconciling); [API](https://openrefine.org/docs/technical-reference/reconciliation-api); [clustering](https://openrefine.org/docs/manual/cellediting#clustering) |
| S16–S21 | Crossref lookup and relationships; DataCite versioning | [Crossref Simple Text Query](https://www.crossref.org/documentation/retrieve-metadata/simple-text-query/); [metadata](https://www.crossref.org/documentation/retrieve-metadata/); [API access](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/); [relations](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/); [DataCite versioning](https://support.datacite.org/docs/versioning); [preprint versions](https://support.datacite.org/docs/preprints-post-prints-and-author-manuscripts) |
| S22–S24 | Released importer/exporter defect, fix, and affected release | [Issue #15106](https://github.com/JabRef/jabref/issues/15106); [PR #15315](https://github.com/JabRef/jabref/pull/15315); [v6.0-alpha.6 release](https://github.com/JabRef/jabref/releases/tag/v6.0-alpha.6) |

## Evidence handling notes

- Source map records exact URLs, document/release version cues, locators, access UTC, operation, conditions/defaults/exceptions, and applicability.
- Zotero duplicate-detection rules come from a page last updated in 2017; treat those details as stale until checked against a selected build.
- Paperpile’s metadata-update page was read from the official indexed result at 04:35:10Z; direct open timed out/returned 502 twice. Do not treat its interface as independently verified.
- JabRef #15106 → #15315 → `v6.0-alpha.6` is the narrow released defect chain. The issue reporter's configuration is not an independently reproduced environment in this stage.
- All software behavior checks, imports, exports, API calls, metadata corrections, and round-trip tests are **NOT_RUN**. Discovery is research evidence, not product validation.
