# Independent primary evidence — A4-02 treatment-v1

Reviewer retrievals, separate from original authored maps and retained freeze. Hashes identify bytes; governing text establishes meaning. Source reading executed, product tests not run. [Structured source map](../source-map.json).

<a id="r01"></a>
## R01 — RFC 5545 September 2009

[Primary source](https://www.rfc-editor.org/rfc/rfc5545) · [Saved raw evidence](R01.html) · [Readable text](R01.text.txt)

Access UTC 2026-10-10T05:50:36.300582+00:00; SHA-256 `de43294251e878a814fbc3e8985bece6418491ff0b1f8b192f6c7a6d86bcd4c2`.

Locator: §§3.2.19,3.3.5,3.3.10,3.6.5,3.8.4.4,3.8.4.7,3.8.5.1,3.8.5.3.

Serialized VEVENT recurrence, original UID/instance identity, floating versus venue-zoned time, UTC UNTIL for TZID DTSTART and EXDATE exclusion. VTIMEZONE covers every recurrence instance. This proves format meaning, not client conformance or refresh.

Review: SUPPORTED.

<a id="r02"></a>
## R02 — RFC 5546 December 2009

[Primary source](https://www.rfc-editor.org/rfc/rfc5546) · [Saved raw evidence](R02.html) · [Readable text](R02.text.txt)

Access UTC 2026-10-10T05:50:36.302351+00:00; SHA-256 `8f927a79f695f80fdb70807e30ff2af975dafa73fd0a140cea5b7da385c41aee`.

Locator: §3.2.5 CANCEL.

Organizer sends affected attendees a cancellation notice. Single-instance cancellation needs RECURRENCE-ID; whole-series cancellation omits it. This is a scheduling message, distinct from passive feed replacement.

Review: SUPPORTED.

<a id="r03"></a>
## R03 — RFC 4791 March 2007

[Primary source](https://www.rfc-editor.org/rfc/rfc4791) · [Saved raw evidence](R03.html) · [Readable text](R03.text.txt)

Access UTC 2026-10-10T05:50:36.303707+00:00; SHA-256 `d8b97679de10acff40d5dc6c59ec76ebaed7329bc079a823a1100538588a9dbf`.

Locator: §8.2 especially §8.2.1.3.

CalDAV clients cache URI/ETag/data, compare server resources and fetch changes. CalDAV servers support ETags; client/server synchronization is a separate route from file/feed.

Review: SUPPORTED.

<a id="r04"></a>
## R04 — RFC 6578 March 2012

[Primary source](https://www.rfc-editor.org/rfc/rfc6578) · [Saved raw evidence](R04.html) · [Readable text](R04.text.txt)

Access UTC 2026-10-10T05:50:36.304982+00:00; SHA-256 `b6af08a68ed7b8bc5e5e98360773a66b9145f26fa03c3b8db46a2d57d756a908`.

Locator: §§3.5.1–3.5.2,6.1; Appendix A.

DAV sync tokens under a supported extension report changed/remapped/removed members. Empty-token initial sync requests current members. Token validity, collection level and access conditions apply.

Review: SUPPORTED.

<a id="r05"></a>
## R05 — Current Google Calendar web Help; numeric service build UNKNOWN

[Primary source](https://support.google.com/calendar/answer/37083?hl=en) · [Saved raw evidence](R05.html) · [Readable text](R05.text.txt)

Access UTC 2026-10-10T05:50:36.305949+00:00; SHA-256 `973b719cc91641a83dc18ca8f9ff1d40fb2ae3ad70af6536bb13a8ccc40b687f`.

Locator: How public calendars work; Mark public; Share a link.

Public calendar can be searchable if its containing site is searchable; details/free-busy and Workspace restrictions apply. Public iCal address works only for a public calendar. Publication/privacy choice is conditional.

Review: SUPPORTED.

<a id="r06"></a>
## R06 — Current Google Calendar Computer Help; numeric service build UNKNOWN

[Primary source](https://support.google.com/calendar/answer/37100?hl=en) · [Saved raw evidence](R06.html) · [Readable text](R06.text.txt)

Access UTC 2026-10-10T05:50:36.306642+00:00; SHA-256 `e3068f98a1fece711b169a1fbb25c6024b4b0469748ad92e5fa813c71d3e1734`.

Locator: Opening setup note; Use a link to add a public calendar.

New subscription setup requires a computer browser; From URL requires public source. The non-Google restriction is attached to a separate email/request Subscribe-to-calendar operation, not the From URL flow. Page supplies no refresh SLA.

Review: SUPPORTED.

<a id="r07"></a>
## R07 — Current Google Calendar Computer Help; numeric service build UNKNOWN

[Primary source](https://support.google.com/calendar/answer/37118?hl=en) · [Saved raw evidence](R07.html) · [Readable text](R07.text.txt)

Access UTC 2026-10-10T05:50:36.730925+00:00; SHA-256 `41f418ff9599666892bf9b3b78a3741cf8112a7468dd976a0dedaeec13685539`.

Locator: Step 1 imported-sync tip; Step 2 file import; CSV repeat warning.

ICS/CSV imports are static; default target is primary unless another chosen. CSV repeats may flatten into one-time events. This supports investigating an ICS snapshot, not universal mobile direct import or duplicate-free replacement.

Review: SUPPORTED.

<a id="r08"></a>
## R08 — Google Calendar API v3 Events resource

[Primary source](https://developers.google.com/workspace/calendar/api/v3/reference/events) · [Saved raw evidence](R08.html) · [Readable text](R08.text.txt)

Access UTC 2026-10-10T05:50:36.866646+00:00; SHA-256 `796efe08a8920d70369f13cf0134f8a9f315bc5172cb4562db530f259d90d06f`.

Locator: start.timeZone;originalStartTime;recurringEventId;status;reminders.

Recurring expansion requires IANA zone. Original start identifies a moved instance immutably. Cancelled recurring exceptions differ from deletions: list/get visibility and guaranteed identity fields have conditions. Reminders concern authenticated user. Not downstream feed proof.

Review: SUPPORTED.

<a id="r08b"></a>
## R08b — Google Calendar API v3 recurring events guide; updated2026-09-17 UTC

[Primary source](https://developers.google.com/workspace/calendar/api/guides/recurringevents) · [Saved raw evidence](R08b.html) · [Readable text](R08b.text.txt)

Access UTC 2026-10-10T05:50:36.936174+00:00; SHA-256 `5292a266b91171e12f8e894705f58cd89e1b2b087faa05b988b595c7ab0e4186`.

Locator: Access instances; Modify or delete instances.

Retrieve instance then authorized PUT/update of its instance resource; status=cancelled cancels it. Bulk series changes should not become many individual exceptions. Examples were read, not executed.

Review: SUPPORTED.

<a id="r09"></a>
## R09 — Current Microsoft Support; service build UNKNOWN

[Primary source](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web) · [Saved raw evidence](R09.html) · [Readable text](R09.text.txt)

Access UTC 2026-10-10T05:50:36.970581+00:00; SHA-256 `a52d26d09ccc814556ddc24309621da8e375e078e0176fcb0efa3c381d549497`.

Locator: Personal account Subscribe/import distinction; Work/school corresponding sections.

Outlook.com approximately3 hours; Outlook on the web approximately6 hours; both allow >24 hours. Import/upload is non-refreshing snapshot. Neither cadence is a maximum, universal-client rule or SLA.

Review: F1 VALID IN DRAFT; FINAL REPAIRED.

<a id="r10"></a>
## R10 — Current iPhone User Guide; selector includes iOS27/26/18; installed build UNKNOWN

[Primary source](https://support.apple.com/guide/iphone/use-multiple-calendars-iph3d1110d4/ios) · [Saved raw evidence](R10.html) · [Readable text](R10.text.txt)

Access UTC 2026-10-10T05:50:37.109872+00:00; SHA-256 `7631fd7f514506a4dcc7f77544d5710a8922c76756a88e1a9bf161b11574a791`.

Locator: Set up a calendar; Turn on calendar event alerts.

External ICS subscription is read-only. Created/subscribed calendar has Event Alerts on/off. Calendar-level control does not prove custom per-event reminders or direct snapshot import.

Review: F2 VALID; FINAL SUPPLEMENTED; EDITION LIMIT L2.

<a id="r10b"></a>
## R10b — Current Mac Calendar Guide; selector includes macOS27 Golden Gate/Tahoe26; installed build UNKNOWN

[Primary source](https://support.apple.com/en-il/guide/calendar/icl32362/mac) · [Saved raw evidence](R10b.html) · [Readable text](R10b.text.txt)

Access UTC 2026-10-10T05:50:37.226864+00:00; SHA-256 `b5ac115d74ebda42065906feae0f08dc6551f556e753c4619b51142a4a8c8485`.

Locator: Subscribe to calendars.

Account/On My Mac, Remove options, Auto-refresh and Ignore alerts controls; provider controls uneditable subscribed events. No fixed universal-device cadence is specified.

Review: SUPPORTED; EDITION LIMIT L2.

<a id="r11"></a>
## R11 — Nextcloud Server35 User Manual edition; exact Calendar app release UNKNOWN

[Primary source](https://docs.nextcloud.com/server/stable/user_manual/en/groupware/calendar.html) · [Saved raw evidence](R11.html) · [Readable text](R11.text.txt)

Access UTC 2026-10-10T05:50:37.244073+00:00; SHA-256 `600ae175ea04823367d060b806cb8c964ec4c77c724a698e4b892ddb09b1e626`.

Locator: Publishing a calendar; Subscribe to a Calendar; Set up reminders.

Public read-only calendar has subscription/export links. Internal upstream feed subscription says weekly default/admin override. Notifications go to owners/write-sharees. No outside consumer interval follows.

Review: PUBLISH/EXPORT SUPPORTED; DEFAULT/OPERATION LIMIT L1.

<a id="r12"></a>
## R12 — Nextcloud Server35 Administration Manual edition

[Primary source](https://docs.nextcloud.com/server/stable/admin_manual/groupware/calendar.html) · [Saved raw evidence](R12.html) · [Readable text](R12.text.txt)

Access UTC 2026-10-10T05:50:37.383614+00:00; SHA-256 `f455fdae8ff36afafbc538d066a46733f99faa382f9ce2d2c2046843ba3ff51e`.

Locator: Subscriptions / Refresh rate.

Server caches internal subscriptions, respects source interval, otherwise says one-day default, configurable dav calendarSubscriptionRefreshRate DateInterval. Manual viewpoint alone does not establish distinct user-app refresh operation.

Review: DOC CONDITION SUPPORTED; DISTINCT-OPERATION CLAIM UNESTABLISHED.

<a id="r13"></a>
## R13 — W3C WebSub Recommendation2026-06-02; dated URL https://www.w3.org/TR/2026/REC-websub-20260602/

[Primary source](https://www.w3.org/TR/websub/) · [Saved raw evidence](R13.html) · [Readable text](R13.text.txt)

Access UTC 2026-10-10T05:50:37.405135+00:00; SHA-256 `75ccd70af4323efa197503c4d923b7d553b949e42992531ca7ca476820dedaef`.

Locator: §§2,5.1–5.3,6,7.

Publisher notifies hub, verified reachable callback receives topic content; leases expire and require renewal. A protocol definition is no calendar-client adoption evidence.

Review: BOUNDED ANALOGY SUPPORTED.

<a id="r14"></a>
## R14 — Mozilla Bug1595332; TB68.2.1/Lightning68.2.0 report; TB91 fixed

[Primary source](https://bugzilla.mozilla.org/show_bug.cgi?id=1595332) · [Saved raw evidence](R14.html) · [Readable text](R14.text.txt)

Access UTC 2026-10-10T05:50:37.448624+00:00; SHA-256 `6e9b1dc6846e9501e4414eb393dee4ac38867754d1cd638526f782069f4c4fc7`.

Locator: Reproduction;comments3/4/6;first landing/backout;later landing;91.0b4 uplift.

Remote recurring description edit lost inherited LOCATION. Storage calendar exception after bug1664731; localICS also discussed. Initial fix failed recurrence/X-MOZ-GENERATION tests and was backed out; later fix/uplift recorded. No current-other-client generalization.

Review: HISTORY SUPPORTED.

<a id="r15"></a>
## R15 — Requested immutable node3787e583daf7d3026fa6fcc7bf08da03c4fcfb56

[Primary source](https://hg.mozilla.org/comm-central/raw-rev/3787e583daf7) · [Saved raw evidence](R15.html) · [Readable text](R15.text.txt)

Access UTC 2026-10-10T05:50:37.510344+00:00; SHA-256 `32ed63159c77e21ee19ca1b9aa3213ccf0218eb59539560b132a8e68ef0e18ea`.

Locator: Long-node raw-rev fetch.

HTTP200 returned client-challenge HTML, not source. This response is not semantic source evidence. Short-node R15c returned the actual immutable node; identity is not silently rebound.

Review: RETRIEVAL BLOCKED; USE R15c.

<a id="r16"></a>
## R16 — Current Google Calendar Computer Help; numeric build UNKNOWN

[Primary source](https://support.google.com/calendar/answer/37064?hl=en) · [Saved raw evidence](R16.html) · [Readable text](R16.text.txt)

Access UTC 2026-10-10T05:50:37.571715+00:00; SHA-256 `a8d1a01f3bf26c9509b41f5bcf56f00df59a6ebeb78a396dbe070d15e71cc1d4`.

Locator: How Calendar uses time zones; Understand daylight saving time.

Travel viewer sees local zone; past/future DST displays and civil-zone-rule updates have explicit caveats. This applies to Google Calendar, not all feed consumers.

Review: SUPPORTED.

<a id="r15a"></a>
## R15a — Mozilla Phabricator D120122 via Bugzilla attachment9231671

[Primary source](https://bugzilla.mozilla.org/attachment.cgi?id=9231671) · [Saved raw evidence](R15a.html)

Access UTC 2026-10-10T05:51:37.095185+00:00; SHA-256 `aac073c16a5e4cdc254cd01df69bd4519c51ce46808279807579ba1018cba652`.

Locator: Attachment redirect / review page.

Saved HTML is a linked source review page, not raw patch; relevant bug/fix identity only.

Review: RELATED PRIMARY HISTORY.

<a id="r15b"></a>
## R15b — Mozilla Phabricator D120122 raw diff

[Primary source](https://phabricator.services.mozilla.com/D120122?download=true) · [Saved raw evidence](R15b.patch)

Access UTC 2026-10-10T05:52:18.403822+00:00; SHA-256 `f6d39a380b518cc46ab0d04792504975f852928425f6fef74fc85a5bf14e6f01`.

Locator: Download Raw Diff; calItemBase.js;test_items.js;test_recur.js.

Removes overriding properties accessor; adds proxy parameter fallback/inheritance tests. Exact immutable identity separately checked by R15c. Tests not run.

Review: SUPPORTING DIFF.

<a id="n01"></a>
## N01 — Nextcloud Server v35.0.0 source tag

[Primary source](https://raw.githubusercontent.com/nextcloud/server/v35.0.0/apps/dav/lib/BackgroundJob/RefreshWebcalJob.php) · [Saved raw evidence](N01.php.txt) · [Readable text](N01.php.txt)

Access UTC 2026-10-10T05:52:52.971169+00:00; SHA-256 `f8bd4e1c7eadea8c143c01ba58b4f4a2a95fff678be59f2816d78f87cd79e88a`.

Locator: RefreshWebcalJob::start/run.

Internal subscription job calls cache service. Config fallback dav calendarSubscriptionRefreshRate=P1D; stored refreshrate can override; parse-duration/time gate applies. Not actual deployment setting or delivery maximum.

Review: VERSIONED DEFAULT/CALLER CHECKED.

<a id="n02"></a>
## N02 — Nextcloud Server v35.0.0 source tag

[Primary source](https://raw.githubusercontent.com/nextcloud/server/v35.0.0/apps/dav/lib/CalDAV/WebcalCaching/RefreshWebcalService.php) · [Saved raw evidence](N02.php.txt) · [Readable text](N02.php.txt)

Access UTC 2026-10-10T05:52:52.973131+00:00; SHA-256 `3c09863d5edf81fd3b7fdd46bae2be4025ee1af657cf828bd908df19047f0f7c`.

Locator: RefreshWebcalService::refreshSubscription/getSubscription/updateRefreshRate.

Queries upstream feed, imports by UID/etag/removes missing cache items; respects stored override; adopts valid REFRESH-INTERVAL/X-PUBLISHED-TTL only if none stored. Default alarm stripping concerns this cache route, not outside consumers.

Review: GOVERNING SERVICE/CONDITIONS CHECKED.

<a id="r15c"></a>
## R15c — Immutable HG node3787e583daf7d3026fa6fcc7bf08da03c4fcfb56, parent2665c70f83edb41eb7cca3df6cbcd8c8160db508

[Primary source](https://hg.mozilla.org/comm-central/raw-rev/3787e583daf7) · [Saved raw evidence](R15c.raw.txt)

Access UTC 2026-10-10T05:54:16.861105+00:00; SHA-256 `fb21a4c4d751b6fdada33a980466d54fcf58ff1777be2fe65fc04d5ed03c1b95`.

Locator: Changeset header; calItemBase.js;test_items.js;test_recur.js.

Actual immutable patch. doPropertiesTest compares inheritance, skips DTSTART/DTEND and checks explicit DESCRIPTION override with LOCATION in fixtures. Cannot be universal recurrence/DST oracle. No execution.

Review: IMMUTABLE FIX AND ORACLE SUPPORTED.

<a id="r15d"></a>
## R15d — Immutable beta uplift node3ed31b89f582 (linked in Bug1595332)

[Primary source](https://hg.mozilla.org/releases/comm-beta/raw-rev/3ed31b89f582) · [Saved raw evidence](R15d.raw.txt)

Access UTC 2026-10-10T05:54:16.862656+00:00; SHA-256 `d7bd1f08c8ee5c76d739544a0a1b263fe6f476e66e3175310bcbd4b7992f6ffc`.

Locator: Changeset header / beta release-path patch.

Separate beta changeset linked from bug91.0b4 comment. This is released-history path evidence, not current implementation validation.

Review: UPLIFT CHAIN SUPPORTED.

<a id="r15e"></a>
## R15e — calItemBase.js at immutable node3787e583daf7

[Primary source](https://hg.mozilla.org/comm-central/raw-file/3787e583daf7/calendar/base/src/calItemBase.js) · [Saved raw evidence](R15e-calItemBase.js.txt) · [Readable text](R15e-calItemBase.js.txt)

Access UTC 2026-10-10T05:54:26.390660+00:00; SHA-256 `903d5b95212cecc6b3572dc2b65cbd97e40b3782d2ffb71d0e59571b8e48d121`.

Locator: lines445–468,551–560; surrounding removed accessor.

properties getter for mIsProxy merges parent then own Map (explicit overrides win). getProperty resolves local then parent; getParameterNames can fall back to parent. Tests call item.properties; removed overriding accessor unmasks real getter.

Review: GOVERNING DEFINITION/CALLER SUPPORTED.
