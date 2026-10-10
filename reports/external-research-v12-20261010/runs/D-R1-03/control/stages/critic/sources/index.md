# Critic source index

This reviewer index preserves the investigator’s source IDs S01–S16 and their original URLs. IDs are not rebound. Exact identity, released version/commit where available, primary locator, governing conditions, applicability, investigator access record, and critic review details are in ../source-map.json.

## Standards and format references

- [S01 — RFC 8493 / BagIt 1.0](https://www.rfc-editor.org/rfc/rfc8493.html): payload/path semantics, manifests, hash requirements, complete and valid.
- [S02 — PREMIS 3.0 Data Dictionary](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf): objects, relations, and Event fields.
- [S03 — PBCore instantiationRelationType](https://pbcore.org/elements/instantiationrelationtype.html): media instantiation relationship vocabulary.
- [S04 — LOC Broadcast WAVE description](https://loc.gov/preservation/digital/formats/fdd/fdd000356.shtml): BWF structure, metadata and version history.

## Characterization and preservation implementations

- [S05 — ffprobe documentation](https://ffmpeg.org/ffprobe.html): stream/container metadata and interval behavior.
- [S06 — Archivematica 1.17.1 technical architecture](https://www.archivematica.org/en/docs/archivematica-1.17/getting-started/overview/technical/): original retention and normalization.
- [S07 — Archivematica 1.16.0 Preservation Planning](https://www.archivematica.org/en/docs/archivematica-1.16/user-manual/preservation/preservation-planning/): local and versioned rules.
- [S08 — Archivematica issue 346](https://github.com/archivematica/Issues/issues/346): duplicate-checksum validator report and issue history.
- [S12 — Archivematica 1.17.1 Preservation Planning](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/preservation/preservation-planning/): normalization, rules and output verification.
- [S13 — Archivematica 1.17.1 Transfer](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/transfer/transfer/): external checksum verification and transfer records.
- [S14 — Archivematica 1.17.1 Error handling](https://www.archivematica.org/en/docs/archivematica-1.17/getting-started/troubleshooting/error-handling/): halt, continue and redo conditions.
- [S15 — Archivematica 1.17.1 PREMIS](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/metadata/premis/): events for originals, derivatives and filename changes.
- [S16 — Archivematica 1.17.1 Manual normalization](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/ingest/manual-normalization/): workflow-specific filename association constraints.

## Audio fingerprinting

- [S09 — Chromaprint README pinned to release commit](https://github.com/acoustid/chromaprint/blob/aed8eba/README.md): near-identical-audio use and limitations.
- [S10 — Chromaprint v1.6.1 release](https://github.com/acoustid/chromaprint/releases/tag/v1.6.1): decoder and partial-frame history.
- [S11 — Chromaprint issue 160](https://github.com/acoustid/chromaprint/issues/160): open Algorithm 3 short-input report with limited applicability.

See also the frozen investigator source index at ../investigator/sources/index.md.
