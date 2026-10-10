# Investigator source index

This is the bounded evidence index for run `A4-02-treatment`. The structured identity and claim/source comparison is in [`../source-map.json`](../source-map.json). Source IDs below are stable and are cited as written in `discovery.md` and the post-release draft.

All public pages below were reopened for this investigation on 2026-10-10 at approximately 05:04:45 UTC; source records carry the observed access time. No downloaded code was run. For each source, the map records the exact subject/operation, release or version status, relevant locator, conditions, and applicability.

## Standards

### R01 — [RFC 5545: iCalendar](https://www.rfc-editor.org/rfc/rfc5545)

IETF Standards Track, September 2009; RFC Editor page notes later updates. Relevant locations: `TZID` and `VTIMEZONE` (including the requirement for a zone definition for each TZID and coverage of recurrence instances); `RRULE` and the `UNTIL` type/UTC rule; `UID`, `RECURRENCE-ID`, `EXDATE`, `STATUS`, and `VALARM`. Applies to iCalendar structure and recurrence meaning; it does not guarantee every client implements every feature identically or refreshes at any specific rate.

### R02 — [RFC 5546: iTIP](https://www.rfc-editor.org/rfc/rfc5546)

IETF Standards Track, December 2009. `CANCEL` with `RECURRENCE-ID` is an organizer-to-attendee scheduling message for canceling a recurring instance. This is a different operation from replacing a published read-only `.ics` feed.

### R03 — [RFC 4791: CalDAV](https://www.rfc-editor.org/rfc/rfc4791)

IETF Standards Track, March 2007. Covers calendar data access via WebDAV and client caching/synchronization operations. This is a server protocol with calendar object resources, not a simple imported `.ics` file.

### R04 — [RFC 6578: WebDAV Collection Synchronization](https://www.rfc-editor.org/rfc/rfc6578)

IETF Standards Track, March 2012. `DAV:sync-collection` uses a server-provided sync token and reports changed or removed collection members. Applicability is only where the server/client implement this synchronization extension.

## Product and service documentation

### R05 — [Google Calendar: Create and manage a public calendar](https://support.google.com/calendar/answer/37083?hl=en)

Current Google Help page; service build/version is not stated. Public-calendar sharing settings are changed on a computer. Public calendars can be searchable; the owner can choose details or free/busy only. An iCal address is available only if the calendar is public; Workspace administrators may restrict sharing. Applies to Google Calendar's public source-sharing operation, not to all private calendar sharing.

### R06 — [Google Calendar: Subscribe to someone else's calendar](https://support.google.com/calendar/answer/37100?hl=en)

Current Google Help page; service build/version is not stated. Adding a public calendar URL is a computer-browser operation and requires the source calendar to be public. The mobile Google Calendar apps cannot set up a new subscription; after adding, a calendar can appear in the app. This documents setup, not a refresh SLA.

### R07 — [Google Calendar: Import events](https://support.google.com/calendar/answer/37118?hl=en)

Current Google Help page; service build/version is not stated. On a computer, a user imports a selected `.ics` or `.csv` file into a chosen calendar; imported events do not remain in sync. CSV recurring rows may become one-off events. Applies to file import and supports keeping the optional snapshot in `.ics`, not CSV.

### R08 — [Google Calendar API v3: Events resource](https://developers.google.com/workspace/calendar/api/v3/reference/events) and [Recurring events guide](https://developers.google.com/workspace/calendar/api/guides/recurringevents)

Google Calendar API **v3**. For recurring event resources, `start.timeZone`/`end.timeZone` is an IANA zone and the start zone is required to expand recurrence. `originalStartTime` identifies the original occurrence even when moved. A client first retrieves an instance and then updates its instance resource; the documented cancellation example sets that instance's `status` to `cancelled`. The API describes authenticated calendar operations; it does not prove that a public-feed subscriber will expose identical controls.

### R09 — [Microsoft Support: Import or subscribe to an Outlook.com calendar](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web)

Current support page applies to Outlook.com/Outlook on the web; numeric service build is not stated. `Subscribe from web` consumes an online calendar URL; the page says updates may take more than 24 hours, although they should occur approximately every 3 hours. Upload/import of `.ics` is a point-in-time snapshot and does not refresh. The wording provides no guaranteed maximum and is specific to the documented Outlook.com web operation.

### R10 — [Apple Support: Add a read-only subscription calendar on iPhone](https://support.apple.com/guide/iphone/use-multiple-calendars-iph3d1110d4/ios) and [Subscribe/manage alerts and refresh on Mac](https://support.apple.com/en-il/guide/calendar/icl32362/mac)

Current Apple user guides; numeric OS versions are not stated. iPhone describes an external `.ics` subscription as read-only. Mac Calendar lets a user choose an auto-refresh interval and ignore alerts; the provider controls subscription events and the user cannot edit them. No fixed refresh value for every Apple device/client is established by these pages.

### R11 — [Nextcloud 35 User Manual: Calendar](https://docs.nextcloud.com/server/stable/user_manual/en/groupware/calendar.html)

Nextcloud 35 User Manual. Calendar publishing makes a public link read-only to external users; the public page offers a subscription URL and a whole-calendar export. The Calendar app accepts RFC 5545 `.ics`; its own subscriptions refresh weekly by default, and an administrator may change the setting. This is a specific Nextcloud app subscription behavior, not a refresh commitment made to Google/Apple/Outlook clients fetching a Nextcloud-published URL.

### R12 — [Nextcloud 35 Administration Manual: Calendar/CalDAV](https://docs.nextcloud.com/server/stable/admin_manual/groupware/calendar.html)

Nextcloud 35 Administration Manual. This documents Nextcloud's *server-side caching of calendars it subscribes to*: it respects a feed's refresh interval, otherwise the server default is one day and the administrator can change it. This operation is distinct from the Nextcloud 35 user-app subscription default in R11 and from external clients subscribing to a Nextcloud public calendar.

### R13 — [W3C WebSub Recommendation](https://www.w3.org/TR/websub/)

W3C Recommendation dated 2 June 2026. A subscriber registers a callback with a hub; publishers notify hubs when topics change; hubs distribute updates. The protocol includes verification and expiring subscription leases. This is a useful web push/publish-subscribe analogy for change notices, not evidence that common calendar clients consume ICS this way.

## Public recurrence/fix history

### R14 — [Mozilla Bugzilla 1595332: Location not preserved when modifying recurring event in remote calendar](https://bugzilla.mozilla.org/show_bug.cgi?id=1595332)

Reported against Lightning 68.2.0 / Thunderbird 68.2.1 on a remote calendar (the linked report identifies CalDAV). Editing one occurrence and adding a description caused the inherited location to disappear. The issue narrows to recurring occurrence/proxy properties sent to remote servers and `.ics` files. The first landed patch was backed out after recurrence tests failed on `X-MOZ-GENERATION`; a later change was tracked fixed for Thunderbird 91 and uplifted to Thunderbird 91.0b4. Do not generalize this historical defect to other clients or current releases.

### R15 — [Immutable Mozilla changeset 3787e583daf7](https://hg.mozilla.org/comm-central/raw-rev/3787e583daf7)

Mercurial node `3787e583daf7d3026fa6fcc7bf08da03c4fcfb56`, `calendar/base/src/calItemBase.js` and `calendar/test/unit/test_items.js`. The diff changes the proxy property getter behavior and adds recurring-event and recurring-exception inheritance tests, including a parent `LOCATION`. This is the source change for the final fix in R14. The patch/tests were read as text; they were not executed in this investigation.

### R16 — [Google Calendar: Use Google Calendar in different time zones](https://support.google.com/calendar/answer/37064?hl=en)

Current Google Help; service build/version is not stated. Google Calendar describes event display in a viewer's local time while traveling and warns that future/past events may not reflect DST changes, with display adjustment as dates advance and a caveat if zone rules change. Applies to Google Calendar, not other feed consumers.
