# Independent critique — recurring rehearsal calendar distribution

Run: A4-02-control · Stage: critic  
Inputs: the complete brief, frozen investigator discovery and draft, source map/index, revealed plan, and plan-reveal record. The revealed plan is the single-use plan recorded at SHA-256 0588e3e0686b6ccc9b5f3eafc56f3415d8565ac895c12ba6a84f572b46ccfe53.

## Overall assessment

The investigator package is substantively complete against the brief and the exact released plan. It addresses all eight obligations, preserves each owner boundary and negative constraint, retains the one-season snapshot as optional, and gives a coherent pilot-scale recommendation with usable alternatives. Its strongest corrections are the distinction between an imported file and a URL subscription, stable series/instance identity, explicit venue time-zone handling, and truthful separation of research from product validation.

I found no material wrong or material incomplete claim in the proposal. One limited unsupported wording is listed below. It does not change the recommendation. Client behavior, refresh timing beyond published documentation, reminder retention, and the orchestra’s owner decisions remain honestly unresolved.

I independently revisited the governing public sources through the carried source index and checked the relevant primary pages, standards, issue/fix/release history, and tagged source. The Google subscription help page itself returned an internal error on direct reopen; its exact public-calendar and computer-browser route appeared in an official Google Help search result, and the public iCal condition was also confirmed on Google’s directly opened public-calendar page. The dateutil source was fetched as text and read only; no downloaded code was run. No feed was created or fetched, and no product account, import, subscription, member calendar, or live write was used.

## Findings

### C1 — Unsupported — CalDAV account wording

**Draft locator:** “Distribution options and distinctions,” CalDAV with WebDAV collection synchronization row: “Requires a compatible calendar server and client setup/accounts”; also “Import, subscription and server synchronization are not interchangeable,” server-synchronization bullet.

RFC 4791 and RFC 6578 support describing a compatible calendar/WebDAV server and client implementation, with the sync-collection report available only when implemented. They do not establish that every such deployment must use member accounts. “Setup/accounts” is therefore too broad if read as a protocol requirement. The practical point that CalDAV adds server/client configuration is sound; qualify account configuration as common deployment practice or a possible owner choice. **Impact:** minor; the proposal already says the pilot does not establish a need for this richer mechanism. [S07](sources/index.md#s07), [S08](sources/index.md#s08)

### No material correction required

I found no false correction to the revealed plan’s assertions that its own assumptions were unverified. The investigator properly treats Nextcloud and a hosted feed as leads rather than winners, does not present a desktop import as cross-client proof, and does not silently make the optional snapshot mandatory. The broadening from “members who cannot subscribe” to “cannot or do not want to subscribe” remains an optional member path and does not remove or weaken the supported case in the brief.

## Obligation review

| Brief obligation | Independent assessment | Draft location and evidence |
|---|---|---|
| 1. Recurrence, moved/cancelled instances, identity, and time zones | Covered accurately at the standards level: finite weekly series, stable UID, venue-local TZID and VTIMEZONE, original-start RECURRENCE-ID for a move, and EXDATE for a cancellation. Client reconciliation is explicitly unverified. | “Calendar model and update rules”; RFC 5545 identity, recurrence, exception, and time-zone provisions [S01](sources/index.md#s01). |
| 2. Two routes and an analogous mechanism; keep import, subscription, and synchronization distinct | Covered with Google Calendar and Outlook.com as documented routes, CalDAV/WebDAV sync as a distinct server mechanism, plus Apple and Nextcloud as useful alternatives. The file-import, URL-subscription, and server-sync distinctions remain clear. | “Distribution options and distinctions” and following distinction bullets [S02](sources/index.md#s02)–[S09](sources/index.md#s09). |
| 3. Exact operations, versions, and compatibility uncertainty | Covered. The draft names the actual browser/web operations, scopes Microsoft’s refresh timing to Outlook.com, records undisclosed SaaS builds as undisclosed, and leaves recurrence/reminder interoperability to named-client checks. | Product comparison table and source map; source pages and standards [S01](sources/index.md#s01)–[S09](sources/index.md#s09). |
| 4. Released issue/fix chain and season consequence | Covered with dateutil issue #614 → PR #624 → release 2.7.0, correctly scoped to that parser. It flags the issue sample’s invalid TZID-plus-Z form, then relates time-zone-data changes conditionally to the venue/member zones and a season update. | “Released history and season maintenance”; dateutil sources [S10](sources/index.md#s10)–[S13](sources/index.md#s13), RFC 5545 [S01](sources/index.md#s01), and IANA [S14](sources/index.md#s14). |
| 5. Optional one-season snapshot | Preserved as optional, not established as implemented, and not excluded. The conditions cover finite coverage, one-time-import labeling, exceptions, duplicate risk, and the same room-disclosure decision as the feed. | “Optional one-season downloadable snapshot”; Google and Microsoft import evidence [S04](sources/index.md#s04), [S05](sources/index.md#s05). |
| 6. Owner decisions | Preserves secretary ownership of event identity/amendments, manager authority over public room details, and member ownership of reminders. None is falsely reported as decided. | Recommendation, update rules, and owner-input list. |
| 7. Negative constraints | Preserves no member-calendar access, no migration requirement, no blanket immediate-refresh promise, and no conflation of a file import with a maintained URL subscription. | Recommendation and “Import, subscription and server synchronization are not interchangeable.” |
| 8. Complete evidence-backed proposal and validation record | Met. It includes a recommendation, alternatives, version/applicability limits, discoveries, owner inputs, and a validation table distinguishing executed research from product checks that are NOT_RUN. | “Validation record”; no research source or future test is called successful product validation. |

## Exact revealed-plan reconciliation

The draft’s clause-by-clause reconciliation is faithful to the released plan:

1. **Correct:** rejects the plan’s “one calendar file” update assumption and ID regeneration; specifies stable identity and machine-readable recurrence exceptions.
2. **Expand and reframe:** keeps Nextcloud and hosted feed as leads, compares Google and Outlook.com, and adds CalDAV/WebDAV sync with Nextcloud retained as an alternative.
3. **Correct:** replaces floating local wall-clock assumptions and free-text exceptions with explicit time-zone and recurrence identity rules; scopes product operations and unknown versions.
4. **Replace unsupported demo assumption:** rejects one desktop import as cross-client evidence and supplies a bounded released history chain with season-maintenance consequences.
5. **Retain; investigate and condition:** keeps the snapshot optional and sets an evidence-based path to offer, defer, or exclude it.
6. **Retain verbatim as binding authority:** preserves all three stated owner boundaries and identifies decisions not yet obtained.
7. **Retain verbatim as binding exclusions:** preserves each negative constraint.
8. **Replace:** delivers the complete research proposal and separately marks executed research, absent product validation, and proposed future checks.

The dispositions do not trade away a brief obligation or make a proposed test appear completed.

## Honestly unresolved external inputs and compatibility

These remain open for the correct reason: they depend on owner choices or actual target-client behavior not specified by the brief.

- The secretary must confirm the authoritative schedule, venue time zone, season bounds, identity/amendment workflow, and who publishes corrections.
- The orchestra manager must decide what room detail may be public. Until then, the draft appropriately withholds or redacts that content on public artifacts.
- The pilot owner must choose clients and versions, hosting, tolerable refresh delay, urgent-change notice practice, and whether to offer the optional snapshot.
- Member reminder survival, recurrence-exception reconciliation, duplicate behavior when using both routes, and travel/DST rendering remain untested.

These are not grounds to shrink the proposal’s scope. The draft keeps the optional path visible and supplies concrete validation steps rather than asserting compatibility. Its table correctly leaves all product validation NOT_RUN. Priority checks are a bounded anonymous recurrence fixture; feed revision/move/cancellation in the selected clients with UTC observations; local-reminder retention; optional snapshot import and duplicate behavior; and a disclosure review after the manager decides.

## Direct source notes

Stable source IDs are retained as recorded; see the reviewer source map and [navigable source index](sources/index.md). The primary evidence confirms the standards-level model, documented route conditions, Outlook.com’s stated cadence caveat, Nextcloud’s adjustable weekly default, dateutil’s version-specific fix, and the conditional IANA release example. None of those source checks validates an orchestra feed or commercial-client behavior.

No final was written or repaired by this critic. This artifact is an assessment only.