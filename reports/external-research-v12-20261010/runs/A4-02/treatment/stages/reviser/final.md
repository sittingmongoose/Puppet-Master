# Complete research proposal — recurring rehearsal calendar distribution

Run: A4-02-treatment / stage: reviser  
Released plan reviewed: revealed-plan.md, SHA-256 0588e3e0686b6ccc9b5f3eafc56f3415d8565ac895c12ba6a84f572b46ccfe53.  
Discovery SHA frozen by the one-time release helper: 46807c16ec3d360b4af0ec58d21123a7466f933cf4902136ab754b1a62ecdb68.  
Source IDs R01–R16, exact identities, operation boundaries, access timestamps, and reviser rechecks are recorded in [source-map.json](source-map.json) and the [navigable source index](sources/index.md).

## Independent critique dispositions and source rechecks

The critic's findings are dispositions to evaluate, not authority. I independently rechecked the consequential claims below in the cited primary pages and retained the predecessor source IDs.

| Critic finding | Disposition | Evidence-based reason and change in this complete proposal |
|---|---|---|
| **F1 — Outlook refresh guidance combines two operations** | **ACCEPT; amend Clauses 2 and 3 and the validation matrix.** | The current Microsoft Support page has distinct Outlook.com and Outlook on the web “Subscribe from web” sections. Outlook.com guidance is approximately every 3 hours; Outlook on the web guidance is approximately every 6 hours. Each may take more than 24 hours, so neither is a maximum or promise. The final keeps each route separate and calls for separate tests if both are in the member matrix [R09]. |
| **F2 — iPhone reminder evidence omits its subscription-calendar control** | **ACCEPT; amend Clause 6 and reminder validation.** | Apple's iPhone User Guide documents a calendar-level Event Alerts on/off control for calendars created or subscribed to. This supports a member-facing notification control, but does not establish custom per-event timing or uniform alert behavior. The final adds that limit alongside the Mac controls [R10]. |
| **C-NEXTCLOUD — refresh discrepancy** | **RETAIN; no claim change.** | Nextcloud 35's Calendar user manual says its own feed subscriptions refresh weekly by default; its administration manual says server-cached upstream subscriptions honor a source refresh interval or default to one day. These are documented as different operations; no runtime check resolved the apparent discrepancy [R11, R12]. |
| **C-MOZILLA — historical recurrence-property issue/fix chain** | **RETAIN; no claim change.** | The Bugzilla record scopes the loss to recurring occurrence edits in the historical Thunderbird/Lightning path, records a first patch backout after recurrence tests failed, then the later fix and Thunderbird 91.0b4 uplift. The immutable changeset changes proxy-property access and adds inheritance tests including LOCATION. The patch was read as text only; tests were not run [R14, R15]. |

The critic's adequacy assessments for clauses 1, 2, 4, 5, 6, 7, and 8 are retained, with the specific F1/F2 amendments above. Product/client validation remains NOT_RUN.

## Recommendation

Maintain one secretary-controlled source calendar for the season and publish it read-only as an iCalendar (.ics) URL if the orchestra manager approves the event details that would be visible. Keep a stable series UID, encode the venue's named time zone and its applicable VTIMEZONE, and represent a one-off move/cancellation as a structured recurrence exception. Avoid a fixed UTC weekly time and avoid floating local timestamps. A feed subscription is the preferred live route only after the target client operations and refresh have been checked; no client is guaranteed to refresh immediately.

Do not select Google Calendar or Nextcloud as the source until the secretary confirms what they can maintain and the manager decides whether room details may be public. Google Calendar offers a public iCal address but public calendars can be searchable. Nextcloud 35 documents a public, read-only link and a download/export route, but it adds hosting and administration. If an existing platform already meets the source, privacy, and maintenance needs, use that for the pilot. If rooms cannot be public, select a permissioned route only if its sign-in/access requirements do not force member account migration.

Retain a downloadable, one-season .ics snapshot as an authorized optional path for members who cannot subscribe. Generate it from the same source, label the season end and publication time, and explain that an import is a snapshot. Do not promote it to a required feature or claim it works across all mobile clients before testing. Keep publisher policy alarms out of the calendar; validate how members can keep their own reminders in each chosen client.

Evidence labels below separate **Observed** documentation/history, **Inference**, **Proposed local choice**, **Owner input**, and **NOT_RUN** validation. Product documentation, issue records and source code were examined; none of those activities is an executed product validation.

## Exact clause dispositions

### Clause 1 — series, moved/cancelled instances, stable identity, time zones

**Disposition: Correct the released plan's import and identity assumptions; recommend structured recurrence.** The plan says every import keeps receiving edits and suggests rebuilding event identifiers when dates change. Both assumptions are rejected. Microsoft Outlook.com and Google Calendar documentation describe .ics file import as a point-in-time copy that does not refresh; a URL subscription is a separate operation [R07, R09]. A series identity must remain stable across amendments.

**Observed.** RFC 5545 defines the recurrence set using DTSTART, RRULE, RDATE and EXDATE. A zoned local date-time uses TZID tied to a VTIMEZONE definition; a definition used by a recurring event must cover all instances. A recurring rule in a zone keeps its local clock time across zone-offset changes. If a series uses zoned DTSTART, RRULE:UNTIL must use a UTC date-time; the bound is therefore not an arbitrary local string [R01]. UID names the series. RECURRENCE-ID names an instance by its original scheduled date/time, even if the instance moves. A single canceled date can be excluded from the recurrence set using EXDATE [R01]. Google's Calendar API v3 further documents an immutable originalStartTime for a moved instance and a cancellation update to an individual recurring instance [R08].

**Inference.** Rehearsal time is naturally anchored to the venue, not to UTC or to whichever zone a traveling member currently occupies. For example, a recurring rehearsal specified at 19:00 in the venue's time zone should remain at 19:00 there across DST; a traveler may see the corresponding time in their current zone. Google Calendar's help says the viewer sees calendar events in local time when traveling, but it also warns that some future/past events may not reflect DST changes and that events created before an area's zone rules change may be wrong [R16]. That is Google-specific documentation, not proof about every app.

**Proposed local choice.** Use a named venue TZID, a matching VTIMEZONE, and one weekly rule for the series. Keep its UID for the season. For a moved instance, publish a structured exception keyed to the original occurrence, with changed start/end and location only when authorized. For a canceled date, remove the recurrence through the chosen feed serializer (for example, EXDATE) or use the source product's documented instance-cancel action. Do not send an iTIP CANCEL message unless the orchestra has chosen to schedule invitations; RFC 5546 describes that as an organizer-to-attendee message, not a passive feed refresh [R02]. Validate the selected serialization on target clients before deciding which representation to standardize.

### Clause 2 — two distribution routes and an analogous publish/subscribe mechanism

**Disposition: Keep Nextcloud as an investigation lead, compare it with Google Calendar, and add WebSub as a bounded analogy. Do not treat either lead as a chosen winner.**

| Route/mechanism | Observed operation and conditions | Fit and tradeoff for the pilot |
|---|---|---|
| **Google Calendar public source + iCal URL** | The owner publishes a calendar, optionally exposing event details or only free/busy. Public calendars may be findable/searchable. A public iCal address is available only when the calendar is public; workspace administrators may restrict sharing. A member adds the URL from a computer browser; the mobile Google Calendar app cannot establish a new subscription by itself [R05, R06]. | Low setup if the secretary already maintains Google Calendar; interoperable iCal address may be used in other apps. Public visibility/search and the room decision are material. The help pages do not state a subscription refresh interval. |
| **Nextcloud Calendar 35 public route** | Calendar 35 documents a public link that is read-only to external users; its public page offers a subscription link and whole-calendar export [R11]. | Useful hosted alternative that can expose a public calendar and downloadable copy. It requires instance hosting, updates and administration. Its own feed-subscription refresh documentation is internally inconsistent: the user manual says weekly by default while the admin manual says one day if the source has no refresh interval [R11, R12]. Record that as unresolved rather than choosing the more favorable value. Neither value governs a member's external Google/Outlook/Apple client fetching the public link. |
| **Analog: W3C WebSub** | A publisher informs a hub when a topic changes; the hub pushes updates to registered callback URLs. Subscriber intent is verified and subscriptions have expiring leases [R13]. | A useful push model for a separate web change-notice feed, not demonstrated as a format calendar clients use to update .ics. Do not build it for the one-season calendar pilot. |

**Client and protocol boundaries.** An .ics **file import** is a snapshot: Google says imported events do not remain in sync and recommends ICS/CSV import on a computer; CSV recurring rows may become individual events [R07]. Outlook.com likewise says file upload does not refresh imported events [R09]. An **ICS URL subscription** gives the client a feed address and asks that product/service to refresh it. Microsoft documents two distinct “Subscribe from web” operations. For Outlook.com, updates may take more than 24 hours although they should occur approximately every 3 hours. For Outlook on the web, the page says updates may take more than 24 hours and should occur approximately every 6 hours. Neither is a maximum or promise; the page publishes no numeric service build. File upload remains a static snapshot [R09]. Apple calls the iPhone external .ics subscription read-only; its Mac Calendar UI lets the user choose an auto-refresh frequency and ignore alerts, but the documentation does not specify one interval for all Apple devices [R10].

**Server synchronization** is different: CalDAV/WebDAV synchronizes calendar objects, and WebDAV sync tokens can report changed or removed collection members when supported [R03, R04]. It may be useful if members already use compatible accounts, but it introduces server accounts, permissions and client/server support. It is more than publishing a read-only calendar URL and should not be described as a file import or a URL feed.

### Clause 3 — bind recurrence/refresh to exact operations and versions

**Disposition: Reject “clients infer the intended zone” and free-text exception notes; bind each claim to the operation and disclose gaps.**

| Claim | Exact subject/operation and evidence | Version / condition / applicability |
|---|---|---|
| A recurring event can be anchored to venue local time. | iCalendar VEVENT recurrence serialization; RFC 5545 TZID, VTIMEZONE, DTSTART, RRULE and UNTIL [R01]. Google Calendar API v3 event resource start.timeZone for recurrence expansion [R08]. | RFC 5545 is a September 2009 standards-track specification with later amendments noted by the RFC Editor; Google API v3 is explicitly versioned. The named-zone/VTIMEZONE requirement governs the data, but actual consumer parsing remains to test. Google Calendar's event and travel display claim is from its current help, whose numeric service build is unpublished [R16]. |
| A moved/canceled instance has identifiable series context. | RFC 5545 UID + original RECURRENCE-ID and recurrence-set exclusion [R01]; Google API v3 originalStartTime, recurringEventId, instance retrieval/update and status=cancelled [R08]. | API behavior applies to authorized Google Calendar API operations, not the downstream behavior of a different product importing a feed. No target client build was operated. |
| Google Calendar members can add a public feed. | Current Google Calendar computer-browser “From URL” flow [R06]. | Source calendar must be public; setup is not available from the mobile app. The page establishes no refresh timing. Google service build is not published. |
| Outlook.com web “Subscribe from web” refreshes an online URL. | Current Microsoft Support page, Outlook.com web operation [R09]. | Updates may take more than 24 hours although they should occur approximately every 3 hours; neither is a maximum or promise. Numeric service build is not stated. |
| Outlook on the web “Subscribe from web” refreshes an online URL. | The separate Outlook on the web section of the same current Microsoft Support page [R09]. | Updates may take more than 24 hours and should occur approximately every 6 hours; neither is a maximum or promise. Numeric service build is not stated. File “Upload from file” is a separate static snapshot operation. |
| Apple can subscribe to an external calendar. | Current iPhone/Mac Calendar guides describe an external .ics read-only subscription and Mac refresh/alert controls [R10]. | No numeric iOS/macOS build or universal refresh interval is stated. Direct one-season file import on iPhone is not established by these guides. |
| Nextcloud can publish a public link. | Nextcloud 35 Calendar user manual and admin manual [R11, R12]. | Public link is read-only externally. Weekly vs one-day refresh defaults conflict in the docs for internal subscriptions; exact runtime setting is unknown. Neither default binds an outside client's poll schedule. |

These pages do not provide a cross-client recurrence conformance matrix. A proposal can name RFC 5545 as its file format and Google API v3 as a particular service behavior, but it must label all other client parsing, reminder and refresh behavior as unverified until tested against named releases.

### Clause 4 — recurrence/time-zone issue/fix chain and season-update consequence

**Disposition: Correct the plan's claim that no released history exists; replace the universal desktop-import demo with a scoped regression check.**

**Observed history.** Mozilla Bugzilla 1595332 reports that on remote calendars Thunderbird 68.2.1 / Lightning 68.2.0 lost inherited LOCATION when a user edited one occurrence of a recurring event and added a description. The discussion describes a recurring occurrence/proxy property path that sent only some properties to remote servers and .ics files. The first patch was backed out after recurrence tests failed on X-MOZ-GENERATION; a later change was fixed for Thunderbird 91 and uplifted to Thunderbird 91.0b4 [R14]. The immutable changeset adds tests covering recurring event and exception property inheritance, including LOCATION, and changes the proxy-property behavior [R15]. The changeset and added tests were read; they were not executed here.

**Inference and proposed consequence.** A small instance edit may damage a field inherited from the series, so a season update should verify that a room-only exception retains the other series properties, and that a moved occurrence retains its original recurrence identity while later rehearsals remain unchanged. Also exercise a week across DST and inspect the event in each target client. This historical defect justifies a regression scenario for the pilot; it does not show that current Thunderbird, Google, Outlook or Apple have the same issue.

### Clause 5 — optional one-season downloadable snapshot

**Disposition: Retain exactly as optional and owner-authorized; add test conditions; do not claim it has already been demonstrated.** The released plan properly states that this option is supported scope because the brief explicitly authorizes it, while technical capability remains to be investigated. Preserve that distinction.

**Observed.** Google imports .ics on a computer and says the imported items do not stay synchronized. Outlook.com uploads .ics and treats it as a snapshot [R07, R09]. Google warns that CSV repeating events may turn into one-off events, so use ICS for a recurrence-bearing snapshot [R07]. Nextcloud 35's public calendar page can export the whole calendar [R11]. Apple sources reviewed establish URL subscription, not direct one-season file import on iPhone [R10].

**Proposed local choice.** If the secretary can generate it from the canonical calendar, offer a single .ics through the season end with a visible “as of” timestamp and season range. The file must include the same structured recurrence, location scope, and exception data as the live route. State plainly that it cannot receive later corrections. Suggest importing into a dedicated season calendar and intentionally replacing the previous copy after a change; do not tell members to repeatedly import updates into a primary calendar. Test duplicate handling and any member-set reminders on replacement. No evidence-based exclusion is identified yet; direct import on each target mobile app remains uncertain, so preserve the option while testing.

### Clause 6 — owner decisions

**Disposition: Retain the released plan's exact authority boundary; do not make these decisions for the owners.**

- **Owner input — secretary:** The secretary owns event identity and amendments. The secretary must confirm the process that preserves a series UID and maps the original occurrence date when an event moves or is canceled.
- **Owner input — orchestra manager:** The orchestra manager decides whether room details are public. Until that decision, do not include a room name in the public test fixture or proposed production feed. A public Google calendar can expose event details and may be searchable [R05].
- **Policy constraint — members:** Local reminders belong to members and must not be overwritten by policy. Do not add a mandatory feed-level VALARM or standard reminder interval. Apple's iPhone guide provides a calendar-level Event Alerts on/off control for subscribed calendars; the Mac guide provides “Ignore alerts” and a user-selected auto-refresh interval. These controls do not establish custom per-event timing or guarantee that a personal alert can be attached to every provider-controlled read-only event. Google's API describes reminders in an authenticated-user context; Nextcloud documents notifications for calendar owners/write-sharees and notes that synced third-party clients may also show them [R01, R08, R10, R11]. Validate the selected clients and give members a local method where supported; do not promise uniform reminders before this check.

### Clause 7 — negative constraints

**Disposition: Preserve all exclusions as binding.** The proposal accesses no member calendar, does not require account migration, makes no promise of immediate refresh on every client, and keeps static file import separate from live feed subscription. Public documentation was retrieved without an account or production write. If a candidate path requires a new account or a privacy choice the owner has not made, treat it as an unresolved route condition; do not make that requirement for members. A public link's refresh belongs to each host/client operation, not to the fact that a URL exists.

### Clause 8 — coherent evidence-backed proposal and validation reporting

**Disposition: Replace the incomplete/unverified plan draft with this scoped evidence-backed proposal.** The plan's two leads remain candidates, not winners. The proposal preserves all eight obligations, gives primary source/version applicability, identifies a useful feed-publishing alternative and WebSub analogy, records owner inputs and marks research/validation separately. Clause-level corrections and retained options above are the requested disposition, not a patch list alone.

## Validation table

| Check | Status | Evidence/input or intended result |
|---|---|---|
| Public primary docs, standards, product help, issue history and immutable source patch reviewed | **EXECUTED — research only** | The investigator/critic package reviewed R01–R16; this reviser directly rechecked R01, R08–R12, R14, and R15, including the disputed R09/R10 claims. Exact access times and operations are in source-map.json and sources/index.md. Retrieval and source-code reading do not prove product operation. |
| Operated Google Calendar, Outlook.com, Apple Calendar, Nextcloud or any live feed; imported or subscribed a test calendar | **NOT_RUN** | No accounts, installs or live writes were used. No client result or refresh time is claimed. |
| Confirmed venue IANA zone and manager's public-room decision | **NOT_RUN — owner input required** | Venue zone and publication scope are not specified in the brief. |
| Generate a disposable RFC 5545 season fixture spanning a DST transition, one moved time/room instance, one cancellation, stable UID and season end | **PROPOSED / NOT_RUN** | Check recurrence dates, local start times before/after DST, VTIMEZONE, UNTIL encoding, moved RECURRENCE-ID, cancellation representation, and unchanged later events. |
| Subscribe in exact target releases and record publication/update/visible times | **PROPOSED / NOT_RUN** | Candidate matrix: Google Calendar web plus app after computer setup; Outlook.com web; Outlook on the web as a separate operation if members use it; Apple Calendar iPhone and Mac; Nextcloud only if selected. Record service, OS/browser/app version, source operation, publication time, change type and observed refresh. Verify delete/cancel and moved events; do not infer a guaranteed maximum from docs. |
| Verify reminder ownership in subscription and snapshot paths | **PROPOSED / NOT_RUN** | Use test accounts only; confirm no feed alarm forces a policy reminder, local alert configuration remains member-controlled, and document client limitations. |
| Exercise one-season snapshot import and replacement in the supported clients | **PROPOSED / NOT_RUN** | Compare ICS import with subscription behavior, check recurrence fidelity, cancellation, duplicates on replacement and direct iPhone import support. Keep this feature optional. |
| Review data visibility and access route | **PROPOSED / NOT_RUN** | After manager decision, inspect the exact public fields/link exposure using a synthetic schedule; ensure no member data or unapproved room details. |

## Prioritized remaining inputs

1. The secretary identifies an existing source calendar (if any) and confirms the season dates and venue time zone used by the schedule.
2. The orchestra manager decides whether room details may be published. This determines whether a public URL is permissible or a restricted route is needed.
3. The pilot owner names the minimum supported desktop and mobile clients already used by members, without requiring anyone to migrate accounts; tests then use synthetic data and those clients' exact releases.
4. Only after the above, select and configure the host, document its refresh expectations, publish the read-only URL and optionally offer the one-season snapshot. Keep the host maintenance owner explicit.

## Disposition of released plan assumptions

- **Rejected/corrected:** importing one .ics file does not inherently keep receiving edits; only a live subscription is intended to retrieve later changes, subject to client refresh. Rebuilding identifiers after a date change risks losing series/instance identity.
- **Retained as leads, not conclusions:** Nextcloud Calendar and a hosted read-only feed are valid investigation candidates; evidence does not select a winner.
- **Rejected/corrected:** clients should not be expected to infer a venue zone from an unzoned wall-clock string; define and test TZID/VTIMEZONE. A free-text note is not an adequate recurrence exception representation.
- **Rejected/corrected:** one desktop import demonstration cannot establish recurrence, timezone, refresh or reminder behavior for other clients; the Thunderbird history makes exception-property regression testing especially relevant.
- **Retained:** downloadable one-season snapshot remains optional, authorized scope. It is neither mandatory nor technically validated.
- **Retained exactly:** the secretary owns event identity/amendments; the orchestra manager decides room-publicity; local reminders remain member-owned.
- **Retained exactly:** no member-calendar access, no required account migration, no immediate-refresh promise, no import/subscription conflation.
- **Validation status corrected from the pre-release draft:** documentation and source-history review was executed during the investigator/critic stages, and this reviser directly rechecked the disputed and consequential claims listed in the source map. Product operation, implementation and client compatibility validation remain NOT_RUN.
