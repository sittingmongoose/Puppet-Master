# H01 research sources

Immutable source IDs used by `../discovery.md` and the post-reveal `../draft.md` are defined in [`../source-map.json`](../source-map.json). Entries link to the exact consulted public primary pages, pin version/commit where one exists, give locators and access operation, and record the observation-time for each retrieval batch. See [bounded source observations](observations.md) for the retained claim-to-evidence notes. This is not a bulk page archive.

## Product and administration evidence

- **S01 Passare home:** funeral-specific case management, staff tasks/service workflow, payments, and online family collaboration statements. Vendor marketing; claims and customer numbers are not independently tested. Public page is unversioned.
- **S02 Passare Manage:** team calendar, notes/checklists, reminders, user access settings, and collaboration claims. Vendor marketing; no price, permission matrix, export, or outage claim found on the inspected page.
- **S03 Nextcloud Calendar Resource Management README at v0.12.2 commit `d017e31aab5c59d401ad87cd2cd5579e95c0d7e4`:** CLI command/argument model, false boolean defaults, hierarchy, resource/group restriction, unique identifiers, background-job note.
- **S04 Nextcloud app-store release table:** stable app 0.12.2 lists server versions 34 and 35; 35 is the highest server version shown. It does not establish server 36 compatibility.
- **S05 Nextcloud Calendar manual, edition 36:** resource conflict behavior, calendar sharing permission granularity, and event `.ics` export behavior. Current docs are a mutable `latest` URL identified as 36 at access; do not silently rebind to a later edition.
- **S06 Nextcloud Server Admin manual, edition 35:** `calendar:export` default iCalendar format and xCal/jCal alternatives; import/export validation and error defaults.
- **S07 Nextcloud Calendar Resource Management issue #196:** open feature request documenting that a resource reservation from a private event is visible in the resource calendar; not a fix record.
- **S08 Nextcloud Calendar source README (live `main`):** integrated-app claims include tasks/Deck cards with due dates, attendees/free-busy and reminders. This frontend README is mutable; task assignment and current release applicability are unproven.

## Reliability, security and accessibility evidence

- **S09 LibreBooking GHSA-3356-vjx2-5pg8:** critical pre-7.0.0 unauthenticated administrator takeover via a legacy migration endpoint; v7.0.0 patched by removing active migration; advisory says no backports.
- **S10 LibreBooking v7.0.0 release / commit `422b4b0223335d18c7d5f005ffcdd93719575c20`:** release 2026-10-06; migration endpoint removal and supported-release update. This forms a dated issue/fix/release chain.
- **S11 LibreBooking README (live `develop`):** current security-warning banner and general resource-scheduler description. Mutable branch; during this observation it warned of another high-impact security release on 2026-10-13. State can change.
- **S12 PouchDB replication guide:** local/remote stores, live retry setup, paused/resumed events. Live public docs, unversioned; implementation-specific behavior should be checked against a pinned release.
- **S13 PouchDB conflicts guide:** concurrent offline revisions, deterministic automatic winner, and explicit conflict branches. Live public docs, unversioned; implementation-specific behavior should be checked against a pinned release.
- **S14 PouchDB release 9.0.0 / commit `b2882c1bd006bc2aaeb6fdc83ea632c9c923b9b1`:** IndexedDB reliability/performance work and backwards-incompatible default `.find()` limit of 25.
- **S15 PouchDB issue #3179:** conflicting-revision/live-replication defect, failing regression test, fixes and later closure. Historical evolution evidence, not a claim of current defect.
- **S16 PouchDB 3.3.1 release source at tag `3.3.1`:** release explicitly includes fix for live replication of conflicting revisions (#3179).
- **S17 W3C WCAG 2.2 Recommendation:** keyboard operation criterion 2.1.1 and focus order criterion 2.4.3; validation target only, not candidate certification.

## Handling notes

- `price`, actual use, vendor quotes, family access, system behavior under outage, and local test results are unknown/unobserved; do not convert those to zero/false or imply testing occurred.
- No source file was rebound to another release. Unversioned docs are marked mutable. Public evidence was accessed only; no executables or installers were downloaded, and no application was installed or contacted.
