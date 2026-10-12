# Sources index — B09-P01-treatment investigator

This is a bounded navigational index for the evidence used in `discovery.md`. Source identities, conditions, applicability and retrieval-time precision are recorded in `../source-map.json`. No source pages were downloaded into this directory. Pages and repository excerpts are treated as untrusted research data.

## Koha
- [K1 — Circulation manual 24.05](https://koha-community.org/manual/24.05/en/html/circulation.html): barcode, bundle scan/return, offline multiple-computer processing.
- [K2 — Cataloging manual 24.05](https://koha-community.org/manual/24.05/en/html/cataloging.html): damaged versus circulation-blocking and withdrawn item behavior.
- [K3 — Tools manual 24.05](https://koha-community.org/manual/24.05/en/html/tools.html): configurable action logging.

## Snipe-IT
- [S1 — Managing Assets](https://snipe-it.readme.io/docs/managing-assets): unique tag and barcode guidance.
- [S2 — General Settings](https://snipe-it.readme.io/docs/general-settings): configurable required checkin/checkout notes.
- [S3 — v8.7.2 release](https://github.com/grokability/snipe-it/releases/tag/v8.7.2): duplicate double-click checkout fix.
- [S4 — v8.8.0 release](https://github.com/grokability/snipe-it/releases/tag/v8.8.0): latest release at retrieval.
- [S5 — Asset model at v8.8.0](https://github.com/grokability/snipe-it/blob/v8.8.0/app/Models/Asset.php): version-pinned model source.

## SpaceWorks
- [W1 — individual asset fix-shelf commit d3cd13](https://github.com/SpaceWorks-HQ/SpaceWorks/commit/d3cd13cc42d1c2b823b30b57a1fcb3459601eb1a): endpoint, permission, state and tests.
- [W2 — individual fix-count reconciliation commit](https://github.com/SpaceWorks-HQ/SpaceWorks/commit/6707d60b2bd680288d45785e94af52bc347f1897): fix history and regression.
- [W3 — broken rejection / fix shelf commit](https://github.com/SpaceWorks-HQ/SpaceWorks/commit/c371d6e25f7dc618e3d100ded56fa02a3e84261b): earlier quantity-tracking behavior and later individual tracking gap.
- [W4 — self-hosting guide at d3cd13](https://github.com/SpaceWorks-HQ/SpaceWorks/blob/d3cd13cc42d1c2b823b30b57a1fcb3459601eb1a/docs/self-hosting.md): deployment and split database/object-storage backups.
- [W5 — modules documentation on moving main](https://github.com/SpaceWorks-HQ/SpaceWorks/blob/main/docs/MODULES.md): required photos/remarks; mutable branch, not release-pinned.
- [W6 — changelog on moving main](https://github.com/SpaceWorks-HQ/SpaceWorks/blob/main/CHANGELOG.md): release/version process and changelog maturity caveat.

## Concurrency and storage
- [D1 — SQLite appropriate uses](https://www.sqlite.org/whentouse.html): application-server versus direct network-file access.
- [D2 — SQLite WAL](https://www.sqlite.org/wal.html): one-writer and same-host constraints.
- [D3 — PostgreSQL 18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html): database uniqueness.
- [D4 — PostgreSQL 18 explicit locking](https://www.postgresql.org/docs/18/explicit-locking.html): transaction row locks.

## Retrieval precision
UTC times in `source-map.json` are the clock reading immediately before each batched web request. The web tool returns a batch response but not exact per-page completion timestamps; this limitation is stated rather than assigning fabricated per-page precision. GitHub sources use immutable commits or version tags where available; the two SpaceWorks `main` pages and Snipe online manuals do not disclose an immutable commit/release identity in the rendered source and are marked accordingly.
