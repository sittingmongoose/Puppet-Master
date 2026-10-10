# Reviser source index — A4-02-control

This index preserves the investigator’s stable source IDs and exact source bindings. Full release/version, URL, locator, access UTC, observed operation, conditions and applicability are in [`source-map.json`](../source-map.json). Reviser source checks add notes to S07 and S08 without rebinding them.

## iCalendar and synchronization standards

- [S01 — RFC 5545, iCalendar](https://datatracker.ietf.org/doc/html/rfc5545): recurrence, stable identity, exceptions and time-zone semantics.
- [S07 — RFC 4791, CalDAV](https://datatracker.ietf.org/doc/rfc4791/): calendar-aware WebDAV model. Reviser reopened §§3.1, 4.2 and 6 for collection provisioning and access control.
- [S08 — RFC 6578, WebDAV collection synchronization](https://datatracker.ietf.org/doc/rfc6578/): conditional `DAV:sync-collection` support and token-based changes/removals; reviser reopened §§3.2, 3.4–3.5 and 4.

## Distribution routes and alternatives

- [S02 — Google Calendar URL subscription](https://support.google.com/calendar/answer/37100?hl=en-IN): computer-browser “From URL” route and public-calendar condition.
- [S03 — Google public calendar and iCal address](https://support.google.com/calendar/answer/37083?hl=en-CA): public setting and public iCal link conditions.
- [S04 — Google Calendar file import](https://support.google.com/calendar/answer/37118?hl=en-7): computer import flow and CSV recurrence caveat.
- [S05 — Outlook.com import versus subscription](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web?kod=h60148d): subscription refresh caveat and static `.ics` snapshot.
- [S06 — Apple Calendar/iCloud subscription](https://support.apple.com/en-ie/102301): iOS/iPadOS and Mac subscription steps; cross-device condition.
- [S09 — Nextcloud 36 Calendar manual](https://docs.nextcloud.com/server/latest/user_manual/en/groupware/calendar.html): read-only links and adjustable weekly default for incoming subscriptions; URL is a mutable `/server/latest/` alias.

## Released parser history and time-zone data

- [S10 — dateutil issue #614](https://github.com/dateutil/dateutil/issues/614): TZID parsing issue and standards caveat about its Z-suffixed example.
- [S11 — dateutil PR #624](https://github.com/dateutil/dateutil/pull/624): merged fix history for `rrulestr` TZID support.
- [S12 — dateutil 2.7.0 release](https://github.com/dateutil/dateutil/releases/tag/2.7.0): release date, tagged commit and release note.
- [S13 — dateutil 2.7.0 source](https://github.com/dateutil/dateutil/blob/2.7.0/dateutil/rrule.py#L1499-L1612): tagged code read-only; not executed.
- [S14 — IANA Time Zone Database releases](https://www.iana.org/time-zones/releases): release index and conditional 2026e summary.
- [S15 — IANA release 2026e](https://www.iana.org/time-zones/releases/2026e): page-specific release context, with S14 as the directly opened corroborating index.
