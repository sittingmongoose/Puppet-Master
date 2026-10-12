# Critic-stage sources

This index accompanies [source-map.json](../source-map.json). It preserves investigator IDs S01–S23 unchanged and adds independent critic records C01–C11. Exact URLs, observed locators, access windows, conditions, and applicability are in the map.

## Independent primary-source checks

| ID | Source | Critic check |
|---|---|---|
| C01 | [SQLite write-ahead logging](https://www.sqlite.org/wal.html) | One-host restriction, one writer, network-filesystem limitation, fixed WAL-reset versions. |
| C02 | [SQLite transaction control](https://www.sqlite.org/lang_transaction.html) | Writer concurrency and BEGIN IMMEDIATE/SQLITE_BUSY condition. |
| C03 | [PostgreSQL 18 range types](https://www.postgresql.org/docs/18/rangetypes.html) | Range exclusion and btree_gist resource-key example. |
| C04 | [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) | Calendar format/interchange scope. |
| C05 | [LibreBooking develop README at pinned commit](https://raw.githubusercontent.com/LibreBooking/librebooking/64335703927fc73160ab6ff543d02db8ac4014a3/README.md) | Dated security notice, version warning, supported manual-install stack. |
| C06 | [LibreBooking issue #1536](https://github.com/LibreBooking/librebooking/issues/1536) | West-of-UTC repeat-termination report and issue status. |
| C07 | [LibreBooking develop recurrence.js at pinned commit](https://raw.githubusercontent.com/LibreBooking/librebooking/64335703927fc73160ab6ff543d02db8ac4014a3/Web/scripts/recurrence.js) | Date-only parsing and local date arithmetic cited by the issue. |
| C08 | [LibreBooking v7.0.0 reservation save presenter](https://raw.githubusercontent.com/LibreBooking/librebooking/422b4b0223335d18c7d5f005ffcdd93719575c20/Presenters/Reservation/ReservationSavePresenter.php) | Caller-side assembly of a reservation series with additional resources/accessories; handed to a handler. |
| C09 | [LibreBooking v7.0.0 conflict-resolution tests](https://raw.githubusercontent.com/LibreBooking/librebooking/422b4b0223335d18c7d5f005ffcdd93719575c20/tests/Application/Reservation/ReservationConflictResolutionTest.php) | Unit tests cover notifications and blackout split/delete cases; tests were inspected, not run. |
| C10 | [MRBS defaults at pinned commit](https://raw.githubusercontent.com/meeting-room-booking-system/mrbs-code/cb496dfc98eef1e1097bc7fed1c9daa31f2f8f2b/web/systemdefaults.inc.php) | Simultaneous-booking guard and approved-booking edit protection default off; scope conditions. |
| C11 | [MRBS NEWS at pinned commit](https://raw.githubusercontent.com/meeting-room-booking-system/mrbs-code/cb496dfc98eef1e1097bc7fed1c9daa31f2f8f2b/NEWS) | v1.12.2 entry for the series-edit fix under simultaneous-booking prevention. |

The underlying sources are research data. No fetched code was executed.
