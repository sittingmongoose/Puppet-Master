# Evidence index — investigator stage

Evidence is bounded to the brief’s inventory, lending, returns, identity, concurrency, privacy, deployment, history, and recovery questions. IDs are stable within this stage and match `source-map.json`; citations in `discovery.md` use these IDs. Access timestamps are UTC.

## Koha

- **K01 — current release:** [Koha official news/release list](https://koha-community.org/news/). Version 26.05.04, posted 2026-10-06; release notes date 2026-10-01. Current availability context only.
- **K02 — circulation, kits, corrections, returns:** [Koha Manual 20261011 — Circulation](https://koha-community.org/manual/latest/en/html/circulation.html). Sections Check out, Check in, Claim returned, Bundles, bundle checkin/missing items, and automatic check-in. Conditions/defaults and narrow scope are recorded in source-map.
- **K03 — item identity and cataloging:** [Koha Manual 20261011 — Cataloging](https://koha-community.org/manual/latest/en/html/cataloging.html). Item records, barcode and accompanying material fields.
- **K04 — privacy, holds and status mapping:** [Koha Manual 20261011 — Circulation preferences](https://koha-community.org/manual/latest/en/html/circulationpreferences.html). StoreLastBorrower; UpdateNotForLoanStatusOnCheckin; notification/override conditions.
- **K05 — history retention:** [Koha Manual 20261011 — Tools](https://koha-community.org/manual/latest/en/html/tools.html). Batch anonymization preserves item-level checkout counts but replaces borrower identity; permanent patron deletion differs.
- **K06 — outage/offline boundary:** [Koha Manual 20261011 — Circulation](https://koha-community.org/manual/latest/en/html/circulation.html#offline-circulation). Offline Firefox/Windows tools; merge logs from all computers in transaction order; stale patron/item data caveat.
- **K07 — code, callers, tests (exploratory only):** [Koha Item.pm](https://github.com/Koha-Community/Koha/blob/main/Koha/Item.pm), [item tests](https://github.com/Koha-Community/Koha/blob/main/t/db_dependent/Koha/Item.t), [circulation caller](https://github.com/Koha-Community/Koha/blob/main/circ/circulation.pl), [returns caller](https://github.com/Koha-Community/Koha/blob/main/circ/returns.pl). Main-branch content was inspected, but the commit SHA was not resolved; do not treat it as release-pinned evidence.
- **K09 — damaged versus loan-blocking state:** [Koha Manual 20261011 — Cataloging](https://koha-community.org/manual/latest/en/html/cataloging.html) and [Circulation preferences](https://koha-community.org/manual/latest/en/html/circulationpreferences.html). Damaged status alone does not stop checkin/checkout; not-for-loan override defaults to Allow.
- **K08 — issue-to-release history:** [Koha 23.05.02 release notes](https://koha-community.org/koha-23-05-02-released/), especially bugs 33817 and 33961. Historical warning/context; current manual describes the later-supported offline tools.

## Snipe-IT

- **S11 — self-hosting and operations:** [Snipe-IT Installation](https://snipe-it.readme.io/docs/installation). Hosted service is optional; self-hosting requires database, configuration, dependencies and web server.

- **S01 — release/version:** [Snipe-IT releases](https://github.com/grokability/snipe-it/releases). v8.8.0, commit 2c466fa, released 2026-09-30; PHP 8.2 minimum, 8.4+ recommended. Release page also reports prior duplicate-checkout fix in v8.7.2.
- **S02 — product model:** [Overview](https://snipe-it.readme.io/docs/overview). Assets, components/accessories, and status taxonomy; use to compare item/kit semantics.
- **S03 — durable identity:** [Managing Assets](https://snipe-it.readme.io/docs/managing-assets). Unique tag/barcode and custom fields.
- **S04 — migration:** [Importing History](https://snipe-it.readme.io/docs/importing-history). Existing asset tags/users required; ordered history import.
- **S05 — message settings:** [Notifications](https://snipe-it.readme.io/docs/notifications). Email/Slack depends on category/channel settings; keep disabled pending policy.
- **S06 — backup/restore:** [Backup & Restore](https://snipe-it.readme.io/docs/backups). Database plus media/uploads; restore logs users out and leaves environment configuration outside the restored data.
- **S07 — asset state code:** [Asset.php at v8.8.0](https://github.com/grokability/snipe-it/blob/v8.8.0/app/Models/Asset.php), release commit 2c466fa, `availableForCheckout` and `checkOut`. Availability requires unassigned, undeleted, deployable and not archived; this is not a tested damaged-return workflow.
- **S08 — check-then-write guard:** [AssetImporter.php at v8.8.0](https://github.com/grokability/snipe-it/blob/v8.8.0/app/Importer/AssetImporter.php), release commit 2c466fa, lines around 1528–1578. Importer re-fetches with `lockForUpdate`, rechecks, skips a racing claim; specific to importer path.
- **S09 — issue/advisory:** [GHSA-qffp-xpqv-gqr4](https://github.com/grokability/snipe-it/security/advisories/GHSA-qffp-xpqv-gqr4). API checkout could target soft-deleted records through 8.6.3; patched in 8.7.0.
- **S10 — regression test:** [CheckoutToSoftDeletedTargetTest.php at v8.8.0](https://github.com/grokability/snipe-it/blob/v8.8.0/tests/Feature/Checkouts/Api/CheckoutToSoftDeletedTargetTest.php). Tagged test file for this specific lifecycle case; not a concurrency acceptance test.

- **K10 — self-hosting and operations:** [Koha Manual 20261010 — Installing Koha](https://koha-community.org/manual/latest/en/html/installation.html). GNU/Linux server deployment and specialist operations; manual says no production-ready Docker container currently.

## InvenTree and database architecture

- **I01 — release:** [InvenTree 1.5.7 release](https://github.com/inventree/InvenTree/releases/tag/1.5.7), commit 2ca0d0e, released 2026-10-10.
- **I02 — stock history:** [InvenTree stable Stock Tracking](https://docs.inventree.org/en/stable/stock/tracking/). Item/part event history and retention controls; current stable documentation, not a lending specification.
- **I03 — self-hosting:** [InvenTree Docker Setup](https://docs.inventree.org/en/stable/start/docker/). Multi-service production deployment and persistent data/backup context.
- **I04 — race fix:** [InvenTree PR #12719](https://github.com/inventree/InvenTree/pull/12719), merged 2026-08-27 into 1.5.x as commit 2e77af2, cherry-pick 2dca27f; milestone 1.5.3. Fix concerns `take_stock`, not loan lending.
- **A01 — SQLite boundary:** [SQLite WAL](https://www.sqlite.org/wal.html), paragraphs on shared memory/network filesystem and single writer. Do not place WAL DB on a share accessed by two machines.
- **A02 — transaction lock:** [PostgreSQL 17 Explicit Locking](https://www.postgresql.org/docs/17/explicit-locking.html), §13.3, `SELECT FOR UPDATE`. Row lock serializes conflicting updates until transaction completion; application still needs atomic state validation and constraints.
