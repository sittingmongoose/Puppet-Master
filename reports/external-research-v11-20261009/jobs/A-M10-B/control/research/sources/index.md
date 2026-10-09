# Sources index — S04 maker-inventory (A-M10-B/control/research)

Navigable index for immutable source IDs S01–S18. Bounded fair-use excerpts
only; full pages remain at their URLs. Accessed 2026-10-09 18:28–18:30 UTC.
No executables retained. Usage/billing: unobserved (null in source-map.json).

- <a id="S01"></a>**S01 — Fab-manager** — https://github.com/sleede/fab-manager
  (HEAD, mutable). Open-source fablab/makerspace manager: "resource booking,
  machine management, member subscriptions, training tracking, and event
  organization"; plugins; SSO; Open API. Evidence: web_search + web_fetch.
- <a id="S02"></a>**S02 — Fabman** — https://fabman.io/ (web-current, mutable).
  "All-in-one makerspace management solution"; "Connect your equipment in less
  than 5 minutes"; "Smart bookings & reservations"; "Membership management";
  "Billing & payments"; Bridge/RFID access control; Happylab-scale proof.
  Evidence: web_search + web_fetch.
- <a id="S03"></a>**S03 — MyTurn / tool libraries** —
  https://en.wikipedia.org/wiki/Tool_library (web-current, mutable). "Software
  platforms such as MyTurn have been developed for managing tool and other
  types of lending"; myTurn.com PBC Local Tools; deployments (Lawrence, SHED,
  Cornwall 367+ tools). Evidence: web_search snippets.
- <a id="S04"></a>**S04 — CommonsBooking** —
  https://github.com/wielebenwir/commonsbooking (v2-line/HEAD, mutable).
  "CommonsBooking is an open source Wordpress plugin for sharing items";
  "management and booking of common goods"; GPLv2+. Evidence: web_search +
  web_fetch.
- <a id="S05"></a>**S05 — LibreBooking** —
  https://github.com/LibreBooking/librebooking (HEAD/develop, mutable). "An
  open-source resource scheduling solution"; "flexible, mobile-friendly, and
  extensible"; "fork of Booked Scheduler, based on Booked Scheduler's last
  open-source version released in 2020". Evidence: web_search + web_fetch.
- <a id="S06"></a>**S06 — InvenTree** — https://inventree.org/ (web-current,
  mutable). "Intuitive Inventory Management"; "Organize Parts"; "Manage
  Suppliers"; "Instant Stock Knowledge"; "BOM Management"; REST API + plugins;
  Django/Python + PostgreSQL backend (per ecosystem docs). Evidence:
  web_search + web_fetch.
- <a id="S07"></a>**S07 — Snipe-IT** — https://snipeitapp.com/ (web-current,
  mutable). "Say Goodbye to Spreadsheets"; "Asset Check-in / Check-out";
  "Audit Logs & History Tracking"; "REST API"; "Barcode/QR Code support";
  RBAC; 13 years, 330+ contributors. Evidence: web_search + web_fetch.
- <a id="S08"></a>**S08 — Grocy** — https://grocy.info/ (4.7.1/2026-09-04).
  "ERP beyond your fridge"; "Current version: 4.7.1 (released on 09/04/2026)";
  stock/shopping/chores; REST API; HA add-on; Android/iOS/desktop/Docker.
  Evidence: web_search + web_fetch.
- <a id="S09"></a>**S09 — PowerSync docs** — https://docs.powersync.com/
  (docs-current, mutable). "keeps in-app SQLite synced with your backend";
  "Service replicates ... partitions ... streams real-time updates to
  clients"; SDKs: JS/RN/Node/Flutter/Kotlin/Swift/.NET/Rust; backends:
  Postgres/Mongo/MySQL/SQL Server. Evidence: web_search + web_fetch.
- <a id="S10"></a>**S10 — PostgreSQL constraints** —
  https://www.postgresql.org/docs/current/ddl-constraints.html (PostgreSQL 18,
  stable-versioned). "5.5. Constraints" incl. "5.5.6. Exclusion Constraints";
  EXCLUDE USING gist with operators; booking pattern
  `(resource_id WITH =, tstzrange WITH &&)`. Evidence: web_search + web_fetch.
- <a id="S11"></a>**S11 — Exclusion-constraint booking pattern** —
  https://dev.to/ripazocom/preventing-double-bookings-with-postgresql-exclusion-constraints-5efn
  (web-current). "no two rows can have these column values where this operator
  returns true"; `CREATE EXTENSION btree_gist`; partial predicate on active
  statuses; app maps 23P01. Evidence: web_search snippets + pattern consensus.
- <a id="S12"></a>**S12 — PouchDB/offline** — https://pouchdb.com/
  (web-current). "store data locally using IndexedDB and WebSQL"; "works
  offline by storing the data locally and synchronizing ... when online";
  "live: true ... retry: true"; conflicts need app merge. Evidence: web_search
  snippets (fetch of a deep guide URL 404'd; root retained as protocol ref).
- <a id="S13"></a>**S13 — django-simple-history** —
  https://django-simple-history.readthedocs.io/en/latest/ (latest-docs,
  Django 5.2/6.0/6.1 matrix). "stores Django model state on every
  create/update/delete"; supports Django 5.2 + Python 3.10–3.14, 6.0/6.1 +
  3.12–3.14; `as_of`, `most_recent`, revert. Evidence: web_search + web_fetch.
- <a id="S14"></a>**S14 — Frictionless Data** — https://frictionlessdata.io/
  (web-current, mutable). "Data Software and Standards"; "Packaging Data ...
  Transforming Data ... Pushing and Storing Data"; workflow "upload →
  preflight check → decision → import or review"; uneven rows / missing fields
  / inconsistent values / formula markers. Evidence: web_search + web_fetch.
- <a id="S15"></a>**S15 — LibreBooking fix commit** —
  https://github.com/librebooking/librebooking/commit/7e80933cbc7d194e23db5aa7b5eed9c29b463815
  (commit-pinned 7e80933, 2026-03-19). "correct tall view rendering ...
  could cause conflict detection to miss overlapping reservations"; "isEndApproximate
  flag"; "using res.StartDate/res.EndDate directly"; "Closes: #920";
  `Web/scripts/schedule.js`. Evidence: web_search snippet.
- <a id="S16"></a>**S16 — LibreBooking API gap** —
  https://github.com/librebooking/librebooking/issues/1220 (issue-record).
  'Support for "Skip Conflicting Bookings" in Reservation API'; GUI can skip
  conflicting instances, API cannot; series via API fails wholesale on
  blackout conflict. Evidence: web_search snippet.
- <a id="S17"></a>**S17 — Grocy 4.7.1 changelog** —
  https://github.com/grocy/grocy/blob/HEAD/changelog/83_4.7.1_2026-09-04.md
  (commit-pinned 41206cb, release 4.7.1/2026-09-04). "Fixed that certain fields
  were not copied when copying a product"; "Fixed that the iCal export was
  broken (401 Unauthorized)"; login/filter fixes; follows 4.7.0 AUTH_CLASS
  reorg + session invalidation + /system/config shape change. Evidence:
  web_search + web_fetch.
- <a id="S18"></a>**S18 — InvenTree stock-history PR** —
  https://github.com/inventree/InvenTree/pull/4541 (PR-record). "Augments
  existing stock item history tracking to include sales order information";
  "did not apply retroactively" without migration; companions #4488 (new
  writes), #4631 (pagination), app #320. Evidence: web_search + web_fetch.

## Retention note

Excerpts above are the retained bounded evidence (short factual quotes for
identification). No page HTML is vendored; no binaries, installers, or
credentials were collected. Full text was observed via web_search snippets
and web_fetch processing on 2026-10-09 18:28–18:30 UTC and summarized in
discovery.md. Mutable pages may drift; pinned commits/releases/issues are
stable points.
