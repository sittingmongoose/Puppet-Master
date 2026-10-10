# Critic evidence index — A4-02-treatment

Stable source IDs are inherited from the investigator map and are not rebound. The full bounded source catalogue, with exact URLs, versions, locators, original UTC access records, operations, governing conditions and applicability, remains available in the [investigator's source index](../../investigator/sources/index.md). This critic's unchanged identity records and claim/source comparison are copied into [source-map.json](../source-map.json).

Independent primary-source review occurred during the UTC window 2026-10-10 05:19–05:25. Exact per-request timestamps were not captured; inherited access_utc values remain the original retrieval records, and the recheck window is recorded separately in the critic map.

## Independently checked sources

- **R01 — RFC 5545 iCalendar:** [RFC Editor](https://www.rfc-editor.org/rfc/rfc5545), §§3.2.19, 3.3.10, 3.6.1, 3.8.4.4–3.8.4.5, 3.8.5.1–3.8.5.3, 3.8.3.1, 3.6.5. Checked type/UTC requirement for UNTIL, original instance semantics of RECURRENCE-ID, and recurrence/time-zone structure.
- **R02 — RFC 5546 iTIP:** [RFC Editor](https://www.rfc-editor.org/rfc/rfc5546), METHOD:CANCEL provisions and scheduling examples. Checked distinction from passive feed replacement.
- **R03 — RFC 4791 CalDAV:** [RFC Editor](https://www.rfc-editor.org/rfc/rfc4791), calendar object and ETag resource examples.
- **R04 — RFC 6578 WebDAV Collection Synchronization:** [RFC Editor](https://www.rfc-editor.org/rfc/rfc6578), §§3.5–3.5.2. Checked valid-token reporting of changed or removed members and initial empty-token behavior.
- **R05 — Google public calendar:** [Google Calendar Help](https://support.google.com/calendar/answer/37083?hl=en), public visibility, searchable-site condition, free/busy option and public iCal URL.
- **R06 — Google subscribe by URL:** [Google Calendar Help](https://support.google.com/calendar/answer/37100?hl=en), public URL setup by computer browser and mobile setup limitation.
- **R07 — Google import:** [Google Calendar Help](https://support.google.com/calendar/answer/37118?hl=en), computer .ics/CSV import, no sync, CSV recurrence caveat.
- **R08 — Google Calendar API v3:** [Events resource](https://developers.google.com/workspace/calendar/api/v3/reference/events) and [recurring events guide](https://developers.google.com/workspace/calendar/api/guides/recurringevents), originalStartTime, IANA recurrence zone, and instance status cancellation.
- **R09 — Microsoft Outlook.com / Outlook on the web:** [Microsoft Support](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web), separate Subscribe from web sections and file-upload operation. Checked the distinct approximately 3-hour Outlook.com and 6-hour Outlook on the web statements (each also says updates can take more than 24 hours).
- **R10 — Apple Calendar:** [iPhone guide](https://support.apple.com/guide/iphone/use-multiple-calendars-iph3d1110d4/ios) §§Set up a calendar, Turn on calendar event alerts; [Mac guide](https://support.apple.com/en-il/guide/calendar/icl32362/mac) subscription auto-refresh and Ignore alerts controls.
- **R11 — Nextcloud 35 User Manual:** [Calendar](https://docs.nextcloud.com/server/stable/user_manual/en/groupware/calendar.html), §§Publishing a calendar, Subscribe to a Calendar; public read-only link and weekly Calendar-app refresh default.
- **R12 — Nextcloud 35 Administration Manual:** [Calendar / CalDAV](https://docs.nextcloud.com/server/stable/admin_manual/groupware/calendar.html), §Refresh rate; server-side cache and one-day default absent source refresh interval.
- **R13 — W3C WebSub Recommendation:** [W3C](https://www.w3.org/TR/websub/), published 2026-06-02, §§5–7; callback verification, leases, publisher notification and hub distribution.
- **R14 — Mozilla Bugzilla 1595332:** [Bug record](https://bugzilla.mozilla.org/show_bug.cgi?id=1595332), reproduction, remote recurrence proxy-property diagnosis, failed first patch/backout, fixed and uplifted status.
- **R15 — Mozilla immutable changeset:** [Raw changeset](https://hg.mozilla.org/comm-central/raw-rev/3787e583daf7d3026fa6fcc7bf08da03c4fcfb56), node 3787e583daf7d3026fa6fcc7bf08da03c4fcfb56. Read the JavaScript change and tests for recurring-event and exception property inheritance, including LOCATION; not executed.
- **R16 — Google time zones:** [Google Calendar Help](https://support.google.com/calendar/answer/37064?hl=en), viewer/travel zone display and DST/zone-rule caveats.

## Scope and status

Public primary documentation and source history were checked as research. No account, calendar client, member data, live feed, deployment or product operation was used. Proposed client tests remain NOT_RUN.
