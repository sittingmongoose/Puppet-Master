# Independent primary-evidence index — A4-02 control-v1

These are reviewer retrievals, distinct from the candidate source record. Text line numbers refer to saved normalized text (raw files retain response bytes). The source map carries full scopes and retrieval timestamps. No raw code was executed.

[Source map](../source-map.json) · [Original artifacts and hashes](original-artifacts.md) · [Original retrieval receipts](retrievals.json) · [Supplemental receipts](supplemental-retrievals.json)

## R01 — RFC 5545 — Internet Calendaring and Scheduling Core Object Specification (iCalendar)

[Primary source](https://datatracker.ietf.org/doc/html/rfc5545) · [captured response](S01.html) · [normalized text](S01.txt)

Version: RFC 5545, September 2009. Locator: Sections 3.2.19, 3.3.5, 3.6.5, 3.8.4.4, 3.8.4.7, 3.8.5.1, 3.8.5.3, 3.8.7.4.
Text lines: 1080–1130, 1262–1364, 2438–2593, 4310–4408, 4479–4605, 4667–4720, 5247–5290. Retrieved: 2026-10-10T05:26:51.976284+00:00.
Response SHA-256: `935a26f08daabbfad2c9f062a0ef5ccb8506e1b4c4923c2c6ad32d145b693856`.
Judgment: SUPPORTED. TZID-referenced local times need matching VTIMEZONE coverage for all recurrences. RECURRENCE-ID retains original instance start. Floating time and UTC are distinct; TZID must not be combined with UTC Z. EXDATE excludes recurrence starts. Significant revisions increment SEQUENCE when used. Normative format does not prove named-client display, refresh, reconciliation, reminders or duplicate behavior.

## R02 — Subscribe to someone else’s calendar — Google Calendar Help

[Primary source](https://support.google.com/calendar/answer/37100?hl=en-IN) · [captured response](S02.html) · [normalized text](S02.txt)

Version: Current Google Calendar Help, retrieved 2026-10-10; SaaS build undisclosed. Locator: Use a link to add a public calendar; computer setup preamble; separate Ask to subscribe section.
Text lines: 18–33, 48–55. Retrieved: 2026-10-10T05:26:59.723230+00:00.
Response SHA-256: `b00d665af9d283542a6a4be334ff2d67e2ff09e64579efdb06996c8a670232fd`.
Judgment: SUPPORTED. Public calendar required for link addition. New subscription setup is not supported in the Android/iPhone/iPad Calendar app. Non-Google restriction belongs to the separate access-request workflow. No refresh cadence or recurrence/reminder compatibility guarantee is supplied.

## R03 — Create & manage a public Google calendar — Google Calendar Help

[Primary source](https://support.google.com/calendar/answer/37083?hl=en-CA) · [captured response](S03.html) · [normalized text](S03.txt)

Version: Current Google Calendar Help, retrieved 2026-10-10; SaaS build undisclosed. Locator: How public calendars work; Share your public calendar; Add events to a public calendar.
Text lines: 18–36, 43–60. Retrieved: 2026-10-10T05:26:52.231132+00:00.
Response SHA-256: `809c7a03d97f8c5c850ecab66c3c7e539ee2e1f61b12f52f7c20089e5490b747`.
Judgment: SUPPORTED. Public iCal address works only if calendar is public. Public content may be found outside the orchestra; room disclosure is an owner decision. Four-hour permission propagation is not subscription refresh cadence.

## R04 — Import events to Google Calendar — Computer — Google Calendar Help

[Primary source](https://support.google.com/calendar/answer/37118?hl=en-7) · [captured response](S04.html) · [normalized text](S04.txt)

Version: Current Google Calendar Help, retrieved 2026-10-10; SaaS build undisclosed. Locator: Step 2: Import events into Google Calendar; Create or edit an iCalendar file.
Text lines: 34–51, 104–124. Retrieved: 2026-10-10T05:26:52.269280+00:00.
Response SHA-256: `a4fdbd03ac4f2f0f7bf719b2114eb7939f09672c261b49a5b5742ebbb26cee4c`.
Judgment: SUPPORTED. Import copies events. CSV recurring-event flattening caveat is CSV-specific. .ics import provides a realistic optional-snapshot path, not proof about the proposed artifact. No executed season import, exception, reminder or duplicate witness.

## R05 — Import or subscribe to a calendar in Outlook.com or Outlook on the web — Microsoft Support

[Primary source](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web?kod=h60148d) · [captured response](S05.html) · [normalized text](S05.txt)

Version: Current Microsoft Support; consumer Outlook.com build undisclosed. Locator: Personal-account Subscribe to a calendar, Upload a calendar from a file, and difference section; contrast work/school section.
Text lines: 118–157, 171–199. Retrieved: 2026-10-10T05:26:52.068957+00:00.
Response SHA-256: `7a5ec61b5b557f9eee203edf954f14b6b2b9a4996194accb2798f8363f72a6ad`.
Judgment: SUPPORTED. No immediate/maximum refresh promise. Consumer cadence is not desktop Outlook or all work/school tenants. Imported events do not refresh automatically. Published cadence is documentation, not measured pilot latency or exception reconciliation.

## R06 — Use iCloud calendar subscriptions — Apple Support

[Primary source](https://support.apple.com/en-ie/102301) · [captured response](S06.html) · [normalized text](S06.txt)

Version: Apple Support published 2026-05-27; iOS/iPadOS 26+ and 18-or-earlier flows and Mac; app builds undisclosed. Locator: Add a subscription calendar on iPhone or iPad; Add a subscription calendar on Mac.
Text lines: 15–43. Retrieved: 2026-10-10T05:26:52.476262+00:00.
Response SHA-256: `c7c3510aef1c2172c33b283d6d237d7aba0652e204a696ce391fde0b1620af50`.
Judgment: SUPPORTED. Same Apple Account and iCloud location/account for all-device availability; no account migration is implied. This page states no refresh cadence and proves no personal-reminder/update interoperability.

## R07 — RFC 4791 — Calendaring Extensions to WebDAV (CalDAV)

[Primary source](https://datatracker.ietf.org/doc/rfc4791/) · [captured response](S07.html) · [normalized text](S07.txt)

Version: RFC 4791, March 2007; governing sections read directly. Locator: Sections 2, 3.1, 4.2 and 6.
Text lines: 336–409, 494–532, 1186–1201. Retrieved: 2026-10-10T05:26:52.320003+00:00.
Response SHA-256: `c0df2bbcb3276aaa2f7c4043f6a55b197dbe8e6814c3856501b2d9f3aacf648b`.
Judgment: SUPPORTED_FINAL_CORRECTION. Server/client implementation and WebDAV ACL support are necessary. Collection account provisioning is one path, not a universal member-account rule. No selected deployment determines authentication here. Discovery/draft setup/accounts wording was overbroad; final explicitly qualifies it.

## R08 — RFC 6578 — Collection Synchronization for Web Distributed Authoring and Versioning (WebDAV)

[Primary source](https://datatracker.ietf.org/doc/rfc6578/) · [captured response](S08.html) · [normalized text](S08.txt)

Version: RFC 6578, March 2012. Locator: Sections 3.1–3.5 and synchronization token behavior.
Text lines: 260–352, 360–438. Retrieved: 2026-10-10T05:26:52.344935+00:00.
Response SHA-256: `a2b3112537ccce90df89068deb87e7e46be43ee9ea1ed8feff7c859818cd885c`.
Judgment: SUPPORTED_FINAL_QUALIFICATION. Report must be implemented and advertised on the collection. Expired tokens can require full synchronization. No universal WebDAV support or instantaneous push follows. No server/client deployment or account model was selected or tested.

## R09 — Using the Calendar app — Nextcloud 36 User Manual

[Primary source](https://docs.nextcloud.com/server/latest/user_manual/en/groupware/calendar.html) · [captured response](S09.html) · [normalized text](S09.txt)

Version: Nextcloud 36 User Manual title; mutable /server/latest/ URL; exact build undisclosed. Locator: Publishing a calendar; Subscribe to a Calendar.
Text lines: 151–176. Retrieved: 2026-10-10T05:26:52.405472+00:00.
Response SHA-256: `a917326d30b0cd0e0e42ec713d974899f7867e7029227588de6b54a3f41c67ea`.
Judgment: SUPPORTED_WITH_MINOR_WORDING_LIMIT. Administrators may change incoming subscription refresh. This is not the cadence for native Nextcloud schedule editing or all recipient clients. Final names incoming subscription, but weak-default sentence beside source-host alternative can sound broader. The manual also supports public calendar export; the brief does not require selecting Nextcloud.

## R10 — dateutil issue #614 — TZID is not supported in rrule DTSTART

[Primary source](https://github.com/dateutil/dateutil/issues/614) · [captured response](S10.html) · [normalized text](S10.txt)

Version: dateutil issue #614 opened 2018-01-18, closed through #624 on 2018-03-11. Locator: Original report, maintainer discussion and resolution linkage.
Text lines: 108–170, 198–227, 269–277. Retrieved: 2026-10-10T05:26:53.335005+00:00.
Response SHA-256: `a8e22c7822d5477c65a7062dd2909abfd72b71f98f921db8a480689f72135506`.
Judgment: SUPPORTED. Report sample combines TZID and Z and is not standards-conforming. Maintainer also discusses a valid local-time form and DST behavior. Reporter example is not a production fixture; no evidence about calendar vendor defects.

## R11 — dateutil PR #624 — Support for TZID= in rrulestr

[Primary source](https://github.com/dateutil/dateutil/pull/624) · [captured response](S11.html) · [normalized text](S11.txt)

Version: dateutil PR #624 merged 2018-03-11. Locator: Merge record; fixup of #619, fixes #614; TZID/UTC ambiguity test discussion.
Text lines: 108–135, 159–169, 180–206. Retrieved: 2026-10-10T05:26:53.087105+00:00.
Response SHA-256: `3d076957370ce675764b666c7caaebee602d8889736e5d4f31553b8bf2a5199e`.
Judgment: SUPPORTED. PR separates tzids lookup from parser tzinfos and acknowledges parser leniency. The fix chain is version-specific. PR is history/code evidence, not an executed product test.

## R12 — dateutil version 2.7.0 release

[Primary source](https://github.com/dateutil/dateutil/releases/tag/2.7.0) · [captured response](S12.html) · [normalized text](S12.txt)

Version: dateutil 2.7.0 release, 2018-03-11, tag commit 51bda94. Locator: Release metadata, zoneinfo 2018c and TZID-on-DTSTART note.
Text lines: 108–146, 234–240. Retrieved: 2026-10-10T05:26:52.905829+00:00.
Response SHA-256: `9beca1d4736e3f57df873db90770e0738bfbe1fdd0e976ae7af0e7f50058f7bb`.
Judgment: SUPPORTED. Release directly associates #614/#624 with this parser capability. No current commercial-client or full .ics validator claim follows.

## R13 — dateutil 2.7.0 source: `dateutil/rrule.py`

[Primary source](https://raw.githubusercontent.com/dateutil/dateutil/2.7.0/dateutil/rrule.py) · [captured response](S13.py.txt) · [normalized text](S13.txt)

Version: dateutil/rrule.py at tag 2.7.0; release tag commit 51bda94. Locator: _parse_rfc and surrounding parser branches, original code lines 1430–1654.
Text lines: 1430–1654. Retrieved: 2026-10-10T05:26:52.515521+00:00.
Response SHA-256: `01d13dc3fb62124e5d8c5694177cad5445e98fa7ddde512b8e39ef51bd77dc63`.
Judgment: SUPPORTED_WITH_ORACLE_BOUNDARY. Resolved TZID is attached only to a naive parsed start; a start already having a zone raises multiple-timezones error in that branch. Full VCALENDAR/VTIMEZONE/RECURRENCE-ID input is outside this parser; TZID EXDATE parameters are rejected in this version. Read only. No fetched code was executed. Candidate does not select it as the full-calendar/client-validation oracle.

## R14 — IANA Time Zone Database Releases index

[Primary source](https://www.iana.org/time-zones/releases) · [captured response](S14.html) · [normalized text](S14.txt)

Version: IANA release index retrieved 2026-10-10; 2026e dated 2026-09-29 marked Latest. Locator: Newest release rows.
Text lines: 6–17. Retrieved: 2026-10-10T05:26:52.591305+00:00.
Response SHA-256: `98c394620f9e882b542c7c41f752a26e2667a56aeae42bad821f4d21a2453b02`.
Judgment: SUPPORTED. Applies only to affected venue/display zones/dates. No venue or vendor-adoption version was supplied. Index summary is not a full implemented-transition oracle.

## R15 — IANA Time Zone Database Release 2026e

[Primary source](https://www.iana.org/time-zones/releases/2026e) · [captured response](S15.html) · [normalized text](S15.txt)

Version: IANA Time Zone Database release 2026e, 2026-09-29. Locator: Release Notes / Changes to future timestamps.
Text lines: 7–44. Retrieved: 2026-10-10T05:26:52.578086+00:00.
Response SHA-256: `47ccea45a6068ff8424739bd032058df2b05c8b83c39080e0d112f28bf05f8ec`.
Judgment: SUPPORTED_SUMMARY_WITH_MODEL_LIMIT. Detailed notes disclose a temporary model hack and uncertainty about northwestern Ontario. Final relies on the index legal summary, not exact transition bytes. Candidate direct S15 open failed; independently retrieved successfully here. No actual fixture or deployment uses the summarized transition.

## R16 — Change Google Calendar notifications — Computer

[Primary source](https://support.google.com/calendar/answer/37242?hl=en-7) · [captured response](R16.html) · [normalized text](R16.txt)

Version: Current Google Calendar Help; build undisclosed. Locator: Personal-account settings and specific-calendar ownership condition.
Text lines: 18–28, 48–65. Retrieved: 2026-10-10T05:35:37.955362+00:00.
Response SHA-256: `1e2ee9ac3313af99b67db6dfe711d327d90390ce3fa09e59ce7e4d1ef4b0f343`.
Judgment: SUPPLEMENTAL_SCOPE_CHECK. No one else changes personal settings; calendar-specific workflow is explicitly for owned calendars. Cannot establish exact read-only From URL event configuration or post-refresh persistence.

## R17 — Receive notifications from a shared calendar in Outlook

[Primary source](https://support.microsoft.com/en-us/outlook/sharing/receive-notifications-from-a-shared-calendar-in-outlook) · [captured response](R17.html) · [normalized text](R17.txt)

Version: Current Microsoft Support; Outlook.com and New Outlook for Windows. Locator: Receive calendar updates.
Text lines: 131–139. Retrieved: 2026-10-10T05:35:38.271591+00:00.
Response SHA-256: `32ae450d9718b3e5448fb5659199db1e44cb7d6578fa27f7980630fd7bf66396`.
Judgment: SUPPLEMENTAL_SCOPE_CHECK. Shared-calendar update email is a different operation from subscribed-feed personal event reminders. Cannot be used as a reminder-retention witness for an external-iCal subscription.

## Retrieval diagnostics

The `web-01.json` through `web-08.json` files preserve the browser/search responses and errors, including broader context searches. They are source retrieval evidence, not successful product validation. Redirected Apple guide pages and secondary/community results are not used to decide correctness.
