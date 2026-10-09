# Sources index — A-M07-B control/critic (navigable)

Evidence root: `sources/` (this directory). Map: `../source-map.json`
(ID → URL/version/locator/timestamp/operations). IDs immutable (C01–C08);
predecessor S01–S15 live in `../../research/` under their own map and are
cited, never re-mapped or rebound here.

| ID | File | Source |
|----|------|--------|
| C01 | C01-powersync-update-conflicts.md | PowerSync PUT/PATCH/DELETE, idempotency, simplest-backend LWW, deletes-win |
| C02 | C02-pocketbase-files.md | PocketBase file defaults (~5MB, ~10-char suffix) |
| C03 | C03-pocketbase-intro.md | PocketBase pre-1.0 production warning |
| C04 | C04-pouchdb-conflicts.md | PouchDB 409 contract + upsert pattern |
| C05 | C05-couchdb-conflicts.md | CouchDB deterministic (non-LWW) winner, hidden losers |
| C06 | C06-w3c-forms.md | W3C forms tutorial index (7 subpages; rules not fetched) |
| C07 | C07-odk-entities-central.md | ODK Entities/Central nav + ODK Cloud managed banner |
| C08 | C08-powersync-attachments.md | Attachments deprecation + metadata/provider pattern |

Not independently re-fetched in this window (rely on predecessor capture, flagged
where load-bearing): PowerSync custom-resolution CrudEntry shape (S07, truncated
capture), PocketBase production/systemd runbook (S11), ODK home/offline-maps detail
(S01/S04), PocketBase changelog (S15, chrome-dominated). Usage/billing: null everywhere.
No witness executed (no qualified sandbox); checks proposed honestly in critique.md.
