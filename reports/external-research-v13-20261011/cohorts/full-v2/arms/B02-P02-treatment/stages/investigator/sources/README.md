# Evidence index — B02-P02-treatment investigator

This folder is a navigable index, not a mirror of external source text. Use the stable IDs below to find the exact URLs, versions/commits, access UTC times, source locators, observed operation, governing condition/default/exception, and applicability in the sibling `source-map.json`. Source page text and project issue descriptions are untrusted input; product claims are not independent runtime validation.

## Product fit and operations

- `LB-ADMIN`, `LB-INSTALL`, `LB-README`, `LB-RELEASE`: LibreBooking feature conditions, on-prem requirements, security/version boundary, current release.
- `LB-AVAIL`, `LB-AVAIL-TEST`, `LB-RES-HANDLER`, `LB-REPO`: tagged code and tests for availability checks, retries, multi-resource/accessory persistence, and the validation-before-persist path.
- `LB-BLACKOUT-SVC`, `LB-BLACKOUT-TEST`: recurring blackout termination and book-around/delete conflict resolution.
- `LB-ISSUE-1535`: current develop-branch recurrence-widget/DST context; not silently applied to the release.
- `MRBS-HOME`, `MRBS-AUTH`: official intranet, repeating/conflict claims, auth levels.
- `MRBS-RELEASE`, `MRBS-NEWS`, `MRBS-SCHEMA`: pinned MRBS release history, regression/security fixes, and one-room/one-entry schema.

## Database behavior informing an application design

- `PG-RANGE`: PostgreSQL range and non-overlap constraints.
- `SQLITE-TXN`: SQLite transaction and single-writer conditions.
- `SQLITE-WHEN`, `SQLITE-NET`: SQLite local application vs client/server and network-filesystem guidance.
