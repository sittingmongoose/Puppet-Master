# Evidence index — B02-P02-treatment critic

This is a navigable index, not a mirror of source text. The critic’s source-map.json preserves every investigator source ID, URL, version/commit, locator, original access record, observed operation, governing condition, and applicability without rebinding IDs. Its critic_review object records which primary sources were independently checked, the review window, source limitations, and verification notes. Retrieved pages and issue descriptions were treated as untrusted research data; no downloaded code or test suite was executed.

## Product fit and operations

- LB-ADMIN, LB-INSTALL, LB-README, LB-RELEASE — LibreBooking resource, blackout, privacy, installation, security and release conditions.
- LB-AVAIL, LB-AVAIL-TEST, LB-RES-HANDLER, LB-REPO — tagged availability rule, caller/persistence path, tests, compound resource/accessory writes and concurrency limits.
- LB-BLACKOUT-SVC, LB-BLACKOUT-TEST — bounded recurrence and delete/book-around behavior.
- LB-CHANGELOG — release history for recurring blackout termination.
- LB-ISSUE-1535, LB-ISSUE-1536, LB-ISSUE-1416 — branch/version-specific recurrence reports; not silently applied to v7.0.0.
- MRBS-HOME, MRBS-AUTH — official intranet/resource-booking and authentication documentation.
- MRBS-RELEASE, MRBS-NEWS, MRBS-SCHEMA — pinned release history, fixes/security updates and one-room schema.

## Database design

- PG-RANGE — PostgreSQL range overlap/exclusion constraints.
- SQLITE-TXN — SQLite transaction and single-writer conditions.
- SQLITE-WHEN, SQLITE-NET — local application vs client/server choice and network-filesystem limits.

## Independent critic review

The review checked every source ID listed above through official pages, pinned repository pages or official database documentation. Source-specific original access timestamps remain in each source record. The critic_review field states the bounded independent review window; the web tool did not expose exact per-request timestamps for the individual pages.