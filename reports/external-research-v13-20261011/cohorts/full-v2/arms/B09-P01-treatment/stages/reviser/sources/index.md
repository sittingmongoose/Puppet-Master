# Reviser source index — B09-P01-treatment

This is the navigable index for the evidence used in final.md. Source identity, version/commit, locator, access-time precision, observed operation, governing condition and applicability are recorded per source ID in [source-map.json](../source-map.json). Existing source IDs remain bound to their prior URLs.

Pages and embedded instructions are treated as research data. This stage independently reopened the consequential disputed primary sources listed in source-map.json; prior investigator and critic access records remain visible. Per-page completion time was not exposed, so access values are batch-start readings.

## Koha

- [K1 — Koha Manual 24.05 — Circulation](https://koha-community.org/manual/24.05/en/html/circulation.html) — Confirmed barcode checkout; bundle return prompts child-item scans but permits explicit skip/deferred verification; multi-computer offline replay requires collecting and ordering device logs, and offline processing misses some server checks. This is library workflow evidence, not this group's configuration.
- [K2 — Koha Manual 24.05 — Cataloging](https://koha-community.org/manual/24.05/en/html/cataloging.html) — Confirmed damaged status is search-unavailable but does not itself block checkout/checkin; the separate restricted status blocks checkout; withdrawn items remain records and are unavailable. Long-overdue cron can mark lost. These states are not themselves evidence of a return.
- [K3 — Koha Manual 24.05 — Tools](https://koha-community.org/manual/24.05/en/html/tools.html) — Opened Koha 24.05 tools manual; lines 2055–2111 make logs preference-dependent and fields module-dependent.

## Snipe-IT

- [S1 — Snipe-IT — Managing Assets](https://snipe-it.readme.io/docs/managing-assets) — Confirmed unique asset tags; barcode labels are recommended rather than required. Docs discourage assigning assets to non-person targets. General asset workflow only.
- [S2 — Snipe-IT — General Settings](https://snipe-it.readme.io/docs/general-settings) — Opened official general-settings page; lines 131–138 require notes when configured, not correction-specific preserved history.
- [S3 — Snipe-IT release v8.7.2](https://github.com/grokability/snipe-it/releases/tag/v8.7.2) — Opened exact v8.7.2 release; displayed lines 159–170 list restore double-logging, not duplicate-checkout repair.
- [S4 — Snipe-IT release v8.8.0](https://github.com/grokability/snipe-it/releases/tag/v8.8.0) — Confirmed the page labels v8.8.0 as Latest at this access. Latest status is time-sensitive; use a selected tag in any later validation.
- [S5 — Snipe-IT v8.8.0 — Asset model](https://github.com/grokability/snipe-it/blob/v8.8.0/app/Models/Asset.php) — Opened exact v8.8.0 Asset.php tag; lines 2575–2636 list searchable attributes/relations; lines 3124–3311 show availability/checkOut state and event. Initial batch began 01:24:29Z.

## SpaceWorks

- [W1 — SpaceWorks commit d3cd13 — individual asset fix moves](https://github.com/SpaceWorks-HQ/SpaceWorks/commit/d3cd13cc42d1c2b823b30b57a1fcb3459601eb1a) — Opened exact immutable commit; lines 342–380 show staff_admin/edit permission, individual tracking and state checks; tests are present but not run.
- [W2 — SpaceWorks commit 6707d60 — reconcile fix counts](https://github.com/SpaceWorks-HQ/SpaceWorks/commit/6707d60b2bd680288d45785e94af52bc347f1897) — Confirmed immutable commit reconciles individual asset status buckets before product counts and adds a regression test for stale counts. Test was inspected, not run.
- [W3 — SpaceWorks commit c371d6 — broken rejection and fix shelf](https://github.com/SpaceWorks-HQ/SpaceWorks/commit/c371d6e25f7dc618e3d100ded56fa02a3e84261b) — Confirmed this earlier change supports quantity-mode reject-broken handling and explicitly blocks that flow for individually tracked items pending per-unit status handling; later W1 adds an individual fix action. Release mapping remains unknown.
- [W4 — SpaceWorks self-hosting guide at commit d3cd13](https://github.com/SpaceWorks-HQ/SpaceWorks/blob/d3cd13cc42d1c2b823b30b57a1fcb3459601eb1a/docs/self-hosting.md) — Opened exact commit-pinned guide; lines 194–223 describe Docker-first/Compose deployment and then-current image availability; lines 244–249 describe optional scheduled overdue reminders; lines 318–330 separate Postgres and MinIO backup.
- [W5 — SpaceWorks modules documentation](https://github.com/SpaceWorks-HQ/SpaceWorks/blob/main/docs/MODULES.md) — Opened the moving main modules page; lines 198, 244–271 confirm box QR and issue/return evidence rules, immutable evidence metadata, per-unit asset_units tracking, and core staff_admin. Initial batch began 01:24:29Z.
- [W6 — SpaceWorks changelog](https://github.com/SpaceWorks-HQ/SpaceWorks/blob/main/CHANGELOG.md) — Confirmed moving changelog says releases are built from main with generated build tags, records gaps in 0.3.0–0.5.1, and its latest visible section is 0.7.5 dated 2026-08-11. This does not establish the current latest installable release.

## Concurrency and storage

- [D1 — SQLite — Appropriate Uses For SQLite](https://www.sqlite.org/whentouse.html) — Confirmed SQLite can sit behind one application server that serializes requests, but docs recommend client/server DB for direct simultaneous access by many computers over a network and note one writer at a time.
- [D2 — SQLite — Write-Ahead Logging](https://www.sqlite.org/wal.html) — Opened official WAL page; lines 191–196 state the version range, fixed release/backports and simultaneous write/checkpoint condition.
- [D3 — PostgreSQL 18 — Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) — Opened PostgreSQL 18 constraints at lines 156–196: unique item identity and partial-index uniqueness over only some rows are distinct. Initial batch began 01:24:29Z.
- [D4 — PostgreSQL 18 — Explicit Locking](https://www.postgresql.org/docs/18/explicit-locking.html) — Opened PostgreSQL 18 explicit-locking page; lines 95–103 explain row locks block conflicting writers/lockers until transaction end.

