# Final recommendation — occurrence edit adapter

Fixture: ER12-A1-02-FRESH · Run: A1-02-treatment · Stage: reviser

## Decision

Build the first release as an offline adapter for one trusted iCalendar file. It imports and exports one weekly recurring rehearsal in a named time zone and edits or cancels one occurrence while retaining the recurring master. The existing UI remains the presentation layer. An eight-week expansion is a preview window only; it does not become or shorten the series rule.

Use the master VEVENT’s UID to identify the series within the imported source document. Address an occurrence by the original, typed RECURRENCE-ID. A move updates or creates a detached VEVENT with the same UID and that original RECURRENCE-ID; its DTSTART and end describe the new time. A cancellation excludes the original slot from the master recurrence set. Do not use the current moved start as identity, create a new UID for a move, or store a fixed-UTC list as the schedule.

This is a proposal for review, not an implemented or tested contract. Do not make an interoperability claim until the selected file representation and implementation have been tested.

## Scope and original-plan disposition

The finalized brief asks for a community arts center’s offline edit of one rehearsal occurrence in an imported calendar file. The initial release has a fictional Rust importer and local SQLite database, imports one trusted .ics file, exports an edited file, has no live provider connection, and already has a UI. It supports one weekly series in a named time zone across a daylight-saving transition. It must account for an existing exception and an opaque property. It is not a whole calendar service and does not cover every recurrence form.

The released user plan’s hypotheses and requests resolve as follows:

| Plan point | Disposition |
|---|---|
| Key the occurrence by the current start timestamp | Rejected. It changes when a slot is moved. Use the typed original RECURRENCE-ID with the series UID. |
| Expand eight weeks to UTC rows and treat them as the schedule | Rejected. The rolling eight weeks may drive a preview. Keep DTSTART, RRULE, exceptions, and time-zone data as the durable schedule. |
| Cancel by deleting a visible row and adding an exclusion | Amended. The visible row is derived from the recurrence set; persist an EXDATE for its original slot and retain the master. |
| Move by adding a standalone event with a new UID | Rejected. Update or create one detached exception with the master UID and original RECURRENCE-ID. |
| Keep local 18:30 through clock changes | Accepted. Preserve local wall time with its TZID and the corresponding VTIMEZONE. Do not turn the series into a fixed UTC schedule. |
| Keep the eight-week horizon as a UI convenience | Accepted. It must never truncate or replace the recurrence rule. |
| Resolve identity, existing exceptions, and repeat import | Accepted. The rules below define stable identity, in-place exception edits, conflicts, and idempotence. |
| Compare provider instance operations | Accepted as documentation-only comparators. Provider IDs, permissions, and messaging do not become file semantics. |
| Consider an existing Rust library | Accepted as an evaluation request. No library is selected until subset-specific recurrence, zone, and opaque-content checks pass. |
| Preserve opaque properties, disclose transformations, and reject unsupported forms | Accepted as a product requirement. Never silently drop or normalize untouched opaque data. |
| No server sync or conflict-resolution service | Accepted. A changed source that collides with local edits is surfaced locally as a conflict. |
| Proposed fixtures for transitions, cancel, move, exception, repeat import, unknown property, and unsupported rules | Retained and expanded below. No such implementation validation has been executed. |

## C1 — Series and occurrence identity

RFC 5545 defines UID as the persistent global identifier for a calendar component. In this single-file database, scope the local series key to the imported source-document record plus the master UID, while preserving the original UID in exported components. Detect duplicate master UIDs or duplicate detached exceptions for the same recurrence identifier and stop with a conflict; do not pick a row arbitrarily.

The occurrence key is the series key plus a typed original RECURRENCE-ID. Preserve whether its value is DATE or DATE-TIME and, for local DATE-TIME, preserve the original TZID context. RFC 5545 defines RECURRENCE-ID as the original DTSTART value for that slot; when an occurrence is rescheduled, the recurrence ID remains at the original day and time. Retain SEQUENCE as revision metadata. It is not a substitute for the stable original-slot key or the current DTSTART.

For a move, keep the master and UID. Update the existing detached VEVENT at that UID and RECURRENCE-ID, or create one if none exists. Change only the supported start/end fields and any required revision fields. Do not add an EXDATE for an otherwise valid moved override, create a second UID, change the master weekday, or move later instances. Preserve unrelated properties on an existing exception in their original component.

A minimal SQLite sketch is:

- Series: source_document_id, UID, raw master component, typed DTSTART, RRULE, TZID/VTIMEZONE, source hash, latest export hash, and revision metadata.
- OccurrenceOverride: source_document_id, UID, typed RECURRENCE-ID including value form and zone context, raw component/property bag, and local state such as active or tombstoned.

This is an identity and storage proposal, not a schema already implemented.

## C2 — Cancellation, movement, and recurrence interactions

For the RFC recurrence set, consider DTSTART with RRULE and RDATE inclusions, then exclude EXDATE values. EXDATE takes precedence over included starts, duplicate included instances collapse, and a DTSTART that does not match its RRULE pattern has undefined result. If DTSTART itself is excluded, retain it as the series anchor because other properties such as RECURRENCE-ID depend on it.

- **Move one slot:** Keep the original slot as RECURRENCE-ID and write the new local DTSTART/end on its detached exception. If an override already exists at that key, update it in place. Keep other exceptions and opaque values associated with their original components. If the slot is already excluded, or duplicate/contradictory overrides make its effective value unclear, fail without editing.
- **Cancel one ordinary slot:** Add one EXDATE corresponding to the original slot, using compatible value type and zone semantics. Keep the master and all unaffected exceptions. Repeating the same cancellation should yield one exclusion and one unchanged result. Do not delete a projected row as if it were the schedule.
- **Cancel an already moved slot:** The current proposal adds EXDATE and removes the detached component from active export, while retaining its full raw component in a local SQLite tombstone and reporting the intentional omission. This is a local product choice, not a cross-reader result established by RFC 5545. See the retained uncertainty below.
- **No range edits:** Do not emit RANGE=THISANDFUTURE, split or truncate the master, or change later occurrences. The brief excludes mass future edits. RDATE is rejected in the proposed first-release subset; a later optional RDATE capability would need full inclusion, duplicate, exclusion-precedence, and value-form handling before adoption.

RFC 5546 defines METHOD:CANCEL as an organizer-to-attendee scheduling message. An individual instance cancellation identifies the instance with RECURRENCE-ID and has attendee and SEQUENCE obligations. This local snapshot editor must not add METHOD:CANCEL or imply that it sent a notification. Provider cancel actions are also messaging operations, not substitutes for editing an offline file.

## C3 — Local time, time zones, DST, and duration

Keep the weekly start as a local wall time with its TZID and matching embedded VTIMEZONE. RFC 5545 requires one VTIMEZONE definition for each referenced TZID and valid zone information for all instances of a recurring component. Preserve the VTIMEZONE from the file and fail closed if it is missing, duplicated, conflicting, or insufficient to resolve the supported recurrence. Do not silently substitute the machine’s local zone or an arbitrary UTC offset. Choosing embedded rules over a separately updated IANA/tzdb policy is an owner decision because the two may differ as laws change.

An eight-week view is a query horizon; keep the recurrence rule beyond it. RFC 5545 §3.3.5 selects the first instant for an ambiguous local time and interprets an explicit nonexistent local DATE-TIME using the pre-gap offset. Erratum 4271 is verified and corrects §3.3.10: a recurrence-rule-generated nonexistent local time is handled under §3.3.5, not ignored and omitted from the count. Therefore, do not promise that a generated spring-gap slot is skipped. Apply the same fold/gap interpretation to imported values and verify the resolved instant and COUNT behavior.

For a newly entered move destination in a spring-forward gap, the proposed product policy is to reject the move before writing and explain the gap. That is a safety choice for new input, not an RFC requirement. For an ambiguous fall-back destination, disclose and use the RFC first-occurrence interpretation unless the owner chooses an explicit user-selection policy.

A move is not a duration edit. Preserve the existing exception’s explicit duration if it has one; otherwise inherit the master’s duration semantics:

- With master DTEND, RFC 5545 applies the same exact duration to each recurrence. Set the moved exception’s end so its elapsed duration remains the same under the source VTIMEZONE. If that cannot be represented safely, reject the move instead of changing the duration silently.
- With master DURATION, RFC 5545 applies the same nominal duration, whose elapsed time can vary across zone transitions. Keep that nominal DURATION on the moved exception rather than converting it to a wall-clock DTEND that changes semantics.
- If the existing exception carries its own DTEND or DURATION, preserve that form and meaning unless the operation explicitly changes duration; duration editing is outside this one-occurrence move proposal.

Test each form with moves on both sides of DST. The brief does not specify the imported duration form, so it cannot be assumed.

## C4 — Provider mechanisms compared at the operation level

| Comparator | Documented operation | Concept useful to the adapter | Provider behavior that does not transfer |
|---|---|---|---|
| Google Calendar API v3 | Retrieve instances, identify one, then send an authorized update. Its guide says originalStartTime remains the recurrence slot even if start differs after rescheduling. Its cancellation example updates that instance with status=cancelled. | Select by original slot; model move and cancel as distinct single-instance actions. | Event IDs, auth, JSON status, and server-side update behavior do not define .ics syntax. |
| Microsoft Graph REST v1.0 | List instances/exceptions over a date range. The event resource uses seriesMasterId, type, and UTC originalStart. PATCH updates one event object. POST /cancel is organizer-only and sends a cancellation message; it may target an occurrence event ID. | Keep master, exception, original time, and cancellation as distinct concepts. | Graph IDs, UTC field shape, permissions, notifications, range query, and its documented adjacent-day move restriction are Graph/Outlook behavior, not iCalendar rules. |

The mapping is conceptual: provider master to master VEVENT; provider original slot to UID plus RECURRENCE-ID; moved provider exception to detached VEVENT. There is no universal mapping for IDs, API status, or notifications. No provider account, API, or client was accessed or exercised. These documents support operation-level comparison only, not interoperability.

## C5 — Unknown properties, idempotence, and round-trip risk

The user’s no-silent-drop rule is the product contract. RFC 5545 §3.2.20 specifically requires preservation of unrecognized value data for unknown value-type tokens; it does not require general preservation of every unknown property name, parameter, content line, or its raw byte spelling. Sections 3.8.8.1–.2 allow IANA and X-name properties and allow generic consumers to ignore them. Do not overstate that standard rule.

For this adapter, retain the input bytes or an ordered raw property bag per component: property name, parameters, encoded value, multiplicity, folding, and component ownership. Patch only the targeted typed fields. Do not copy an opaque master property onto a detached exception whose property scope is unknown. If an opaque value cannot be retained through an edit, refuse the edit or report the exact transformation before output; never silently drop it. A canceled override may be intentionally absent from active export only under the tombstone policy above, with its raw source component retained locally and the omission disclosed.

Upsert rather than append on repeat import. A stable local key is source_document_id plus UID and, for detached components, typed RECURRENCE-ID. Preserve source and export hashes. Re-importing the identical source/export twice should not produce duplicate series, exceptions, or exclusions. If a changed incoming file collides with local edits at the same key, surface a conflict instead of silently overwriting either side. Preserve SEQUENCE and other source revision data.

Treat byte identity and semantic round-trip as separate claims. A semantic comparison may preserve meaning while line folding or escaping changes; assert byte identity only if the chosen raw-preserving implementation proves it.

Library evaluation:

- caldata 0.17.3 is a pinned Rust parser and recurrence candidate with strict parsing, typed date-times, and recurrence expansion. Its package metadata and owner notes do not establish opaque-property or raw-byte round-trip behavior. Evaluate it with the exact weekly grammar, VTIMEZONE, DST-gap, duration, and opaque-line fixtures before selection.
- pimalaya/ical advertises a byte-faithful syntax-tree editor, recurrence, and calendar-owned time-zone resolution. The inspected README is an unpinned repository page, not a released artifact or independent test result; treat it as an architecture lead only.
- ical 0.11.0 is a historical parser option whose docs describe content parsing without validity checking; its upstream repository is archived. It is not by itself evidence of the required recurrence, time-zone, or preservation contract.

The tagged Python icalendar 7.3.0 changelog records changed escaping of unrecognized and X-property values during parse/serialize/jCal round trips, later fixed to preserve values verbatim. It also records a TZID resolution issue and a TZID/RDATE offset correction. This is implementation history in a different language and library, not evidence that a Rust candidate has those defects. It is a concrete reason to test opaque data, parameters, folds, and zone transitions before selecting a Rust release.

## Critique dispositions

| Critique | Disposition | Evidence-based result |
|---|---|---|
| F1 — generated local times in DST gaps were said to be skipped and not counted | Accept and amend | Verified Erratum 4271 removes nonexistent local time from the ignore/not-count sentence and directs it to §3.3.5. Apply the pre-gap-offset interpretation; update the proposed fixture and do not skip it. |
| F2 — RFC 5545 was said to require preservation of all unknown properties | Accept and amend | §3.2.20 covers unknown value-type tokens; §3.8.8 permits IANA/X-name properties that generic readers may ignore. Preserve all opaque properties because the brief requires it, not because the RFC imposes that general rule. |
| F3 — move representation left DTEND versus DURATION semantics unclear | Accept and amend | Preserve an exception’s own duration form; otherwise retain the master’s exact DTEND duration or nominal DURATION semantics. Reject if exact-duration preservation cannot be resolved. Add transition-crossing tests for both. |
| F4 — weekly UNTIL envelope omitted type/time-zone constraints | Accept and amend | With this local TZID DTSTART, an accepted UNTIL must be UTC DATE-TIME. COUNT and UNTIL are mutually exclusive; COUNT includes DTSTART. Reject malformed forms. |
| U1 — canceling an existing detached exception lacks independent reader evidence | Retain uncertainty | EXDATE plus removing the active exception and keeping a local tombstone is a reasonable local proposal, but neither the checked RFC sections nor provider documents prove cross-reader behavior. If verified interoperability is required before release, defer that cancellation case or test the exact representation with permitted independent readers first. |

Critic agreement is not itself authority. F1–F4 were independently checked against the RFC Editor’s RFC 5545 and verified inline erratum; provider and implementation-history observations were also reopened at their cited primary pages. U1 remains unresolved for lack of consumer evidence.

## C6 — Proposed support envelope, unsupported inputs, and decisions

### Proposed first-release subset

Pending owner approval, accept one trusted .ics file containing one unambiguous VEVENT master with one UID, local DATE-TIME DTSTART and exactly one resolvable TZID/VTIMEZONE. The proposed weekly grammar is FREQ=WEEKLY with positive INTERVAL defaulting to 1, and at most one BYDAY matching DTSTART. Support neither RDATE nor multiple RRULEs in this first subset. If COUNT or UNTIL is supported, permit one or the other, never both; COUNT is positive and includes DTSTART; for this local TZID DTSTART, UNTIL is UTC DATE-TIME. An RRULE without COUNT/UNTIL is unbounded; the preview does not bound it.

Allow zero or more unambiguous detached single-instance exceptions with matching UID and original RECURRENCE-ID, and same-type/same-zone EXDATE values. Preserve each source component’s unknown fields. Permit one user action at a time. Keep duration form and semantics. This is a proposed contract for owner review; it has not been accepted or implemented.

### Fail-closed cases

Return a specific unsupported or conflict result, make no partial database/export write, and keep the original file available for other frequencies; multi-day weekly patterns not separately accepted; RDATE; multiple RRULEs; unknown RRULE parts or parameters; RANGE=THISANDFUTURE; both COUNT and UNTIL; non-UTC or wrong-type UNTIL for the supported local TZID DTSTART; floating, UTC, DATE, or otherwise unsupported DTSTART forms; incompatible EXDATE/RECURRENCE-ID value type or zone; absent, duplicate, conflicting, or inadequate VTIMEZONE; DTSTART/RRULE mismatch; duplicate master UID or detached RECURRENCE-ID; malformed values; an exclusion/override collision; changed incoming data that conflicts with local edits; a provider/API operation; or any transformation that cannot retain opaque data.

### Owner decisions and remaining assumptions

1. Approve the exact weekly RRULE grammar, including INTERVAL, BYDAY, COUNT, UNTIL, and whether any extension is needed. RDATE or multi-day BYDAY are optional future capabilities, not silently accepted inputs.
2. Decide whether the embedded VTIMEZONE is authoritative for every supported recurrence or whether the product will separately version IANA/tzdb rules. The current proposal preserves and uses the embedded definition.
3. Decide whether EXDATE plus a local tombstone is sufficient for canceling a previously moved exception before cross-reader evidence exists. The safer alternative is to reject that particular export until the chosen representation is tested.
4. Approve the product display/rejection policy for user-entered ambiguous or nonexistent move times. The proposal uses the first RFC fold occurrence and rejects a new gap destination.
5. Select a Rust library only after the full preservation, duration, identity, RRULE, and DST fixture set passes on a pinned release. No dependency is selected now.
6. Define a policy for changed upstream files that conflict with stored local edits. The proposal surfaces a local conflict and never overwrites silently.

Assumptions still unverified include the actual weekly rule matching the proposed grammar, the embedded VTIMEZONE covering every occurrence, chosen Rust library behavior on opaque lines/folds, consumer behavior for an excluded RID that also has a detached exception, and changed-source conflict UX.

## Proposed validation matrix — not run

| Fixture | Observable invariant |
|---|---|
| Weekly 18:30 named-zone rehearsal before and after spring and fall transitions; eight-week preview | Local wall time remains 18:30; offset/instant follows the embedded VTIMEZONE; RRULE survives beyond preview. |
| Move one instance to another date, including an adjacent date | UID and original typed RECURRENCE-ID stay fixed; exactly one detached exception exists; only that occurrence changes. |
| Cancel an ordinary slot and repeat the cancel | Exactly one original slot is excluded; master and neighbors remain; repeat is idempotent. |
| Move an already-overridden target; preserve another existing exception | The same override key is updated; unrelated exception data remains attached to its original component. |
| Cancel a previously moved target | No active override remains beside the exclusion; raw exception survives in a SQLite tombstone; omission is reported. Test the exported representation in independent file consumers before claiming interoperability. |
| Fold and spring-gap recurrence candidates; new move into gap | Fold resolves to first occurrence; generated gap resolves under §3.3.5 rather than being skipped; verify resolved instant and COUNT; newly entered gap destination is refused before write. |
| Move an instance across a DST transition with master DTEND, then with master DURATION; include an override with its own duration | Exact DTEND duration stays exact; nominal DURATION stays nominal; an exception’s explicit duration is preserved; no silent duration change. |
| Master and exception with unknown IANA/X-name properties, unknown parameters, repeated lines, and folded lines | Untouched values, parameters, multiplicity, and component ownership survive. Assert byte identity only if the implementation preserves it. |
| Import same source twice; export and re-import twice; changed source collides with an edit | No duplicate series, override, or EXDATE; effective output is stable; changed collision is shown as a conflict. |
| RDATE, other FREQ, unknown RRULE part, malformed identity, mismatched DTSTART/RRULE, missing/unsupported zone | Clear unsupported/conflict result; no partial database or file write; original source remains available. |
| Candidate crate fixtures at the exact selected release | Run parser/exporter round trips for each invariant before library selection; crate documentation alone is not a pass. |

These are proposed validations only. None was run against an importer, exporter, parser, SQLite store, provider, or independent calendar reader in this stage. The research-source checks below are not implementation tests.

## Work actually performed and constraint check

The frozen input hashes listed in input-map.json matched the corresponding assignment, brief, predecessor discovery/draft/source maps, released plan, plan-reveal record, and critique/source-map files. RFC 5545, RFC 5546, the official erratum rendering, Google and Graph operation documentation, and the cited crate/repository/history pages were reopened. The direct RFC erratum endpoint returned an internal error; the official search result and inline-errata rendering identify EID 4271 as Verified and show its correction. No direct-open receipt is claimed.

No importer/exporter was implemented or tested; no code, recurrence fixture, parser round-trip, database write, provider account, API request, or cross-client test was used. No downloaded code was run. No claim of interoperability is made.

The scope keeps the UI, single-file import/export, one weekly series, and one occurrence action. It does not add a full calendar service, account or API access, server synchronization, mass future edits, fixed-UTC recurrence storage, silent loss of unknown properties, or unsupported-rule fallback.

## Evidence index and source identities

The navigable evidence index is [sources/README.md](sources/README.md). It links bounded, paraphrased notes for S01–S12 and retains the source IDs, exact URLs, version/commit status, locators, access observation, governing conditions, and applicability in [source-map.json](source-map.json). S01–S11 retain their established meanings; S12 remains RFC Editor Erratum 4271. No source ID was rebound.

