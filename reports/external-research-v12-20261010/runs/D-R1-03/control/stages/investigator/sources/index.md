# Investigator source index

This index is scoped to the assigned ER12-D-R1-03-FRESH synthetic brief. Exact source identity, version/commit, access UTC, observed operation, conditions, applicability and limitations are in stable IDs in ../source-map.json. IDs must not be silently rebound.

## Preservation and relationship metadata

- [S01 — RFC 8493 / BagIt 1.0](https://www.rfc-editor.org/rfc/rfc8493.html): package manifests, complete/valid definitions, hash defaults, payload/path limits.
- [S02 — PREMIS 3.0 Data Dictionary](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf): object categories, derivation relationships, event evidence and fixity.
- [S03 — PBCore instantiationRelationType](https://pbcore.org/elements/instantiationrelationtype.html): audiovisual parts/derivatives/version relationship vocabulary.
- [S04 — LOC Broadcast WAVE description](https://loc.gov/preservation/digital/formats/fdd/fdd000356.shtml): BWF metadata and version history.

## Characterization and implementation history

- [S05 — ffprobe documentation](https://ffmpeg.org/ffprobe.html): stream/container metadata and read-interval behavior.
- [S06 — Archivematica 1.17.1 technical architecture](https://www.archivematica.org/en/docs/archivematica-1.17/getting-started/overview/technical/): retained originals and normalized derivatives.
- [S07 — Archivematica 1.16.0 Preservation Planning](https://www.archivematica.org/en/docs/archivematica-1.16/user-manual/preservation/preservation-planning/): versioned and locally configurable policies.
- [S08 — Archivematica issue #346](https://github.com/archivematica/Issues/issues/346): duplicate-checksum validator edge case reported against AM 1.7.2.
- [S09 — Chromaprint README at release commit](https://github.com/acoustid/chromaprint/blob/aed8eba/README.md): near-identical audio purpose and stated limits.
- [S10 — Chromaprint v1.6.1 release](https://github.com/acoustid/chromaprint/releases/tag/v1.6.1): release and input-frame history.
- [S11 — Chromaprint issue #160](https://github.com/acoustid/chromaprint/issues/160): reported Test3 short-input behavior with limited applicability.

## Result

- Independent discovery: ../discovery.md

## Archivematica procedure and failure history

- [S12 — Archivematica 1.17.1 Preservation Planning](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/preservation/preservation-planning/): retained originals, rule/version history and output verification conditions.
- [S13 — Archivematica 1.17.1 Transfer](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/transfer/transfer/): external checksum verification, file IDs and original-order records.
- [S14 — Archivematica 1.17.1 Error handling](https://www.archivematica.org/en/docs/archivematica-1.17/getting-started/troubleshooting/error-handling/): fail, continue, redo, and reject behavior.
- [S15 — Archivematica 1.17.1 PREMIS implementation](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/metadata/premis/): event records for originals, derivatives and filename changes.
- [S16 — Archivematica 1.17.1 Manual normalization](https://www.archivematica.org/en/docs/archivematica-1.17/user-manual/ingest/manual-normalization/): product-specific filename association rule and constraints.
