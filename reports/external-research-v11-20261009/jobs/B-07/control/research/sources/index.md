# Research source index (pre-plan discovery)

Use the immutable IDs in ../source-map.json; do not silently replace a URL or version. The map records URL, version/commit, locator, UTC access-session capture, observed operations, evidence use, and limitations.

## Kitchen-specific product

- [FC-01 — The Food Corridor product overview](https://www.thefoodcorridor.com/): kitchen scheduling, equipment, renter management and onboarding.
- [FC-02 — Signup plan selector](https://app.thefoodcorridor.com/en/signup): observed plan price/client limits/fees and listed included capabilities.
- [FC-03 — Equipment reservation help](https://help.thefoodcorridor.com/en/articles/1414032-how-do-i-reserve-equipment): equipment availability within selected time ranges.
- [FC-04 — Food-business account](https://help.thefoodcorridor.com/en/articles/1812934-what-does-a-food-business-account-look-like): tenant-visible calendar, PIN, reports and Community.
- [FC-05 — Onboarding Flows/checklists](https://help.thefoodcorridor.com/en/articles/8880860-can-i-use-onboarding-flows-for-more-than-new-clients): monthly cleaning/station checklists.
- [FC-06 — Booking approval](https://help.thefoodcorridor.com/en/articles/1413916-how-can-i-approve-bookings): operator approval and client-specific auto-approval.
- [FC-07 — Reporting and export](https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab): manager CSV reports, filters, booking and sign-in/out data.

## General commercial scheduler

- [SK-01 — Buffer time](https://support.skedda.com/en/articles/3653032-buffer-time): minimum granularity, before/after semantics, existing-booking behavior, administrator override.
- [SK-02 — Access and visibility](https://support.skedda.com/en/articles/105728-access-and-visibility): private login, tagged booking rights, default regular-user view, system-user exception.
- [SK-03 — Custom fields](https://support.skedda.com/en/articles/2934389-custom-fields): required/conditional booking fields and holder/admin visibility.
- [SK-04 — Export or print booking data](https://support.skedda.com/en/articles/105786-export-or-print-booking-data): export fields and system-user versus regular-user report access.

## Standards and self-hosted alternative

- [WCAG-01 — WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/): keyboard, pointer target, assistive-technology name/role/value, and status-message criteria.
- [LB-01 — LibreBooking administration guide](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html): self-hosted resource rules and defaults.
- [LB-02 — LibreBooking v7.0.0 release](https://github.com/LibreBooking/librebooking/releases/tag/v7.0.0): pinned version/release record.
- [LB-03 — Buffer ID bug #1008](https://github.com/LibreBooking/librebooking/issues/1008): narrow issue/fix/test/release history.
- [LB-04 — LibreBooking repository](https://github.com/LibreBooking/librebooking): current security notice and deployment prerequisites (mutable; recheck).

## Retained bounded evidence notes

See [evidence-notes.md](evidence-notes.md) for brief paraphrases and short excerpts with locators. These notes retain only the evidence needed for this assignment; they are not full-page copies.

## Access-time audit

- [source-access-log.json](source-access-log.json): post-reveal re-open windows for each exact primary-source URL; request and response observation are bracketed by system-clock timestamps.

- [LB-05 — pinned buffer-ID regression test](https://github.com/LibreBooking/librebooking/blob/v7.0.0/tests/Application/Schedule/ReservationListingTest.php): v7.0.0 test fixture for before/after buffer item IDs.
