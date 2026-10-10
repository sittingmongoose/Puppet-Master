# Critic source index — A4-02-control

Source IDs are preserved from the investigator source map and are not rebound. The critic source map retains each original URL, version, locator, access record, observed operation, governing condition, and applicability; it adds this stage’s independent review notes. Per-request timestamps from the web tool were unavailable, so critic-side per-source access times are UNKNOWN. The review window and each source’s original access time are recorded in source-map.json.

## iCalendar and synchronization standards

- ### S01 — RFC 5545, iCalendar
  [Exact source](https://datatracker.ietf.org/doc/html/rfc5545) · RFC 5545, Standards Track, September 2009. Directly reopened; checked floating/TZID time, VTIMEZONE coverage, UID, RECURRENCE-ID, EXDATE, RRULE, and SEQUENCE.
- ### S07 — RFC 4791, CalDAV
  [Exact source](https://datatracker.ietf.org/doc/rfc4791/) · RFC 4791, March 2007. Directly reopened; checked the calendar-aware WebDAV access model.
- ### S08 — RFC 6578, WebDAV collection synchronization
  [Exact source](https://datatracker.ietf.org/doc/rfc6578/) · RFC 6578, March 2012. Directly reopened; checked sync-collection’s conditional support and token-based changes.

## Distribution routes

- ### S02 — Google Calendar URL subscription
  [Exact source](https://support.google.com/calendar/answer/37100?hl=en-IN) · Current Help; SaaS build undisclosed. Direct reopen errored; the official Google Help result showed the public-only computer-browser route. S03 independently confirms the public iCal condition.
- ### S03 — Google public calendar and iCal address
  [Exact source](https://support.google.com/calendar/answer/37083?hl=en-CA) · Current Help; SaaS build undisclosed. Directly reopened; public iCal availability and disclosure conditions checked.
- ### S04 — Google Calendar file import
  [Exact source](https://support.google.com/calendar/answer/37118?hl=en-7) · Current Help; SaaS build undisclosed. Directly reopened; computer ICS import and CSV recurrence caveat checked.
- ### S05 — Outlook.com import versus subscription
  [Exact source](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web?kod=h60148d) · Current Support page; consumer service build undisclosed. Directly reopened; consumer web subscription, file snapshot, and refresh caveat checked.
- ### S06 — Apple Calendar/iCloud subscription
  [Exact source](https://support.apple.com/en-ie/102301) · Current Support page published May 27, 2026; exact app build undisclosed. Directly reopened; device/version branches and cross-device condition checked.
- ### S09 — Nextcloud 36 Calendar manual
  [Exact source](https://docs.nextcloud.com/server/latest/user_manual/en/groupware/calendar.html) · Page title identifies Nextcloud 36; mutable latest alias, exact server build undisclosed. Directly reopened; weekly default and administrator exception checked.

## Released history and time-zone data

- ### S10 — dateutil issue #614
  [Exact source](https://github.com/dateutil/dateutil/issues/614) · Opened January 18, 2018. Directly reopened; issue text and invalid TZID-plus-Z example checked.
- ### S11 — dateutil PR #624
  [Exact source](https://github.com/dateutil/dateutil/pull/624) · Merged March 11, 2018; merge commit 66bc55d. Directly reopened; issue linkage and merge date checked.
- ### S12 — dateutil 2.7.0 release
  [Exact source](https://github.com/dateutil/dateutil/releases/tag/2.7.0) · Released March 11, 2018; tag commit 51bda94. Directly reopened; release-note claim checked.
- ### S13 — dateutil 2.7.0 rrule.py source
  [Exact source](https://github.com/dateutil/dateutil/blob/2.7.0/dateutil/rrule.py#L1499-L1612) · Tag 2.7.0 at 51bda94. Raw tagged text fetched and read only; no execution.
- ### S14 — IANA Time Zone Database releases
  [Exact source](https://www.iana.org/time-zones/releases) · Index observed October 10, 2026; lists 2026e dated September 29, 2026. Directly reopened; Manitoba summary checked.
- ### S15 — IANA release 2026e
  [Exact source](https://www.iana.org/time-zones/releases/2026e) · 2026e, September 29, 2026. The original source record reports direct open failure; this critic did not reopen it. The relevant release statement was checked on S14, the directly opened official index.
