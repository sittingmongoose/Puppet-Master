# Source index — A4-02-control investigator

This bounded index records public primary sources inspected for the independent discovery. Version labels and access limits are in [`../source-map.json`](../source-map.json). References are stable source IDs; they must not be silently rebound.

## iCalendar semantics and synchronization standards

- [S01 — RFC 5545, iCalendar](https://datatracker.ietf.org/doc/html/rfc5545): TZID/VTIMEZONE, floating versus fixed time, stable UID, recurrence exceptions, revisions.
- [S07 — RFC 4791, CalDAV](https://datatracker.ietf.org/doc/rfc4791/): calendar-aware WebDAV access and calendar object collections.
- [S08 — RFC 6578, WebDAV collection synchronization](https://datatracker.ietf.org/doc/rfc6578/): change tokens and incremental additions, changes and deletions.

## Product routes and alternatives

- [S02 — Google Calendar URL subscription](https://support.google.com/calendar/answer/37100?hl=en-IN): computer-browser “From URL” operation and public-calendar condition.
- [S03 — Google public calendar and iCal address](https://support.google.com/calendar/answer/37083?hl=en-CA): public setting and public iCal link conditions.
- [S04 — Google Calendar file import](https://support.google.com/calendar/answer/37118?hl=en-7): computer import flow, iCalendar format and CSV recurrence caveat.
- [S05 — Outlook.com import versus subscription](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web?kod=h60148d): online subscription and refresh timing; `.ics` file snapshot behavior.
- [S06 — Apple Calendar/iCloud subscription](https://support.apple.com/en-ie/102301): iOS/iPadOS and Mac subscription steps; same-account condition for cross-device display.
- [S09 — Nextcloud 36 Calendar manual](https://docs.nextcloud.com/server/latest/user_manual/en/groupware/calendar.html): read-only public links, external iCal subscriptions and weekly default refresh. The URL uses the mutable `/server/latest/` alias; page title identified release 36 during access.

## Recurrence/time-zone history and current data

- [S10 — dateutil issue #614](https://github.com/dateutil/dateutil/issues/614): request/bug report concerning TZID parsing, with standards caveat about the example’s trailing `Z`.
- [S11 — dateutil PR #624](https://github.com/dateutil/dateutil/pull/624): merged fix history for `rrulestr` TZID support.
- [S12 — dateutil 2.7.0 release](https://github.com/dateutil/dateutil/releases/tag/2.7.0): release date, TZID support, bundled zone-data version.
- [S13 — dateutil 2.7.0 parser source](https://github.com/dateutil/dateutil/blob/2.7.0/dateutil/rrule.py#L1499-L1612): tagged implementation inspected read-only; no code execution.
- [S14 — IANA Time Zone Database releases index](https://www.iana.org/time-zones/releases): current release list, including 2026e and its Manitoba summary.
- [S15 — IANA Time Zone Database release 2026e](https://www.iana.org/time-zones/releases/2026e): page-specific summary was available in IANA's search result; direct page open failed, so S14 is the directly opened corroborating index.
