# Reviser source index — ER12-D-R1-03-FRESH

Scope: final reviser proposal for run D-R1-03-control. S01–S16 retain the investigator's stable source identities and exact URLs; critic review records are carried forward. S17–S19 are additional comparators from official DSpace documentation and its REST contract. See [source-map.json](../source-map.json) for released version/commit, locator, access UTC, observed operation, conditions, applicability, limitations, and review details. No source ID is silently rebound.

## Preservation standards and relationship models

- [S01 — RFC 8493 / BagIt 1.0](https://www.rfc-editor.org/rfc/rfc8493.html): package-scoped completeness, validity, manifests, opaque payloads.
- [S02 — PREMIS 3.0 Data Dictionary](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf): object, event, agent, relationship, and fixity model.
- [S03 — PBCore instantiationRelationType](https://pbcore.org/elements/instantiationrelationtype.html): parts, generations, derivatives, and version relations.
- [S04 — LOC Broadcast WAVE description](https://loc.gov/preservation/digital/formats/fdd/fdd000356.shtml): BWF fields and version history.

## Characterization and audio candidate tools

- [S05 — ffprobe documentation](https://ffmpeg.org/ffprobe.html): stream/container metadata and interval behavior.
- [S09 — Chromaprint README, pinned release commit](https://github.com/acoustid/chromaprint/blob/aed8eba/README.md): near-identical audio purpose and limits.
- [S10 — Chromaprint v1.6.1 release](https://github.com/acoustid/chromaprint/releases/tag/v1.6.1): frame handling and release history.
- [S11 — Chromaprint issue #160](https://github.com/acoustid/chromaprint/issues/160): limited Test3 short-input report.

## Preservation and migration implementations

- [S06 — Archivematica 1.17.1 technical architecture](https://www.archivematica.org/en/docs/archivematica-1.17/getting-started/overview/technical/): original retention and normalization.
- [S07 — Archivematica 1.16.0 Preservation Planning](https://www.archivematica.org/en/docs/archivematica-1.16/user-manual/preservation/preservation-planning/): local/versioned rules.
- [S08 — Archivematica issue #346](https://github.com/archivematica/Issues/issues/346): duplicate-checksum validator report and milestone.
- [S12 — Archivematica 1.17.1 Preservation Planning](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/preservation/preservation-planning/): replaceable rules, event detail, normalization.
- [S13 — Archivematica 1.17.1 Transfer](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/transfer/transfer/): supplied checksums, file IDs, original-order and structure records.
- [S14 — Archivematica 1.17.1 error handling](https://www.archivematica.org/en/docs/archivematica-1.17/getting-started/troubleshooting/error-handling/): halt, continue, review, redo, reject, and reports.
- [S15 — Archivematica 1.17.1 PREMIS implementation](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/metadata/premis/): conditional events for originals, derivatives, and filename changes.
- [S16 — Archivematica 1.17.1 manual normalization](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/ingest/manual-normalization/): prescribed filename association rules.
- [S17 — DSpace 10.x package import/export documentation](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944826/Importing%2Band%2BExporting%2BContent%2Bvia%2BPackages): restore, skip, rollback, and force-replace modes. Search result was accessible; direct open returned 403.
- [S18 — DSpace REST Contract versioning endpoints](https://github.com/DSpace/RestContract/blob/main/versions.md): new version from older history item to facilitate restore.
- [S19 — DSpace REST Contract workflow-item endpoints](https://github.com/DSpace/RestContract/blob/main/workflowitems.md): current workflow state and reset behavior.

## Prior-stage artifacts retained as source lineage

- [Investigator discovery](../investigator/discovery.md)
- [Investigator proposal](../investigator/draft.md)
- [Investigator source map](../investigator/source-map.json)
- [Independent critique](../critic/critique.md)
- [Critic source map](../critic/source-map.json)
- [Revealed plan](../investigator/revealed-plan.md)
