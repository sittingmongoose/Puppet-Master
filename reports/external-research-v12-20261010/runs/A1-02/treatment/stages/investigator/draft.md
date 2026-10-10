# Occurrence edit adapter — investigator draft

Fixture: `ER12-A1-02-FRESH` · run: `A1-02-treatment` · stage: investigator.

## Disposition

Do not implement the initial sketch as written. Keep the recurring master and make one local file-level edit using the original recurrence slot as the identity. A short expansion horizon may drive a visible preview; it must not replace or truncate the series rule. A moved instance remains part of its series with the same UID and a detached override keyed by RECURRENCE-ID. A cancelled slot is excluded from the master recurrence set. Use local TZID/VTIMEZONE semantics, preserve unknown content, and refuse inputs the selected weekly subset cannot expand safely. The code changes are offline only; no calendar account, service, sync, or invitation notification is implied.

The source IDs below resolve through `sources/README.md` and `source-map.json`; they are stable and not rebound. Standards define format behavior; provider and crate pages are comparators/candidates, not interoperability test results.

## Exact plan and clause dispositions

### C1 — series and occurrence identity

**Required correction to initial sketch:** Do not key an occurrence by its current start timestamp. In the single imported-file model, use a stable source-document record plus the master's `UID` as the series key, and the original, typed `RECURRENCE-ID` as the occurrence key. Preserve its DATE versus DATE-TIME form and original zone context. The master `DTSTART`/`RRULE` identify the recurring pattern; `SEQUENCE` is preserved revision metadata, not a substitute for RECURRENCE-ID. If malformed input contains duplicate UID masters or duplicate RIDs, stop the edit and show a conflict rather than choosing one. RFC 5545 defines UID as persistent/global and RID as the slot inside that series; a moved instance still carries the original slot in RID (S01). Google `originalStartTime` confirms the useful distinction; Graph uses `seriesMasterId` and UTC `originalStart`, with provider-specific identity (S03–S04).

**Concrete moved-instance representation:** Retain the same UID; emit/update one detached VEVENT with `RECURRENCE-ID` equal to the original slot and `DTSTART`/`DTEND` equal to the new local time/end. Preserve the existing exception component if it has that RID, changing only the intended supported fields. A move across a date boundary still changes one original slot; it does not create a new event UID or move later occurrences. Keep exception UID/RID unique within the imported source record.

### C2 — cancel/move and recurrence interactions

**Required correction to initial sketch:** Never delete a projected row as if it were the schedule, and never model a move as a standalone UID. Compute the visible instance from the master; persist only recurrence semantics and exceptions. The RFC recurrence set is DTSTART plus RRULE plus RDATE, minus EXDATE; exclusions win over inclusions and duplicate inclusions collapse. A DTSTART not synchronized with RRULE has undefined result. Keep DTSTART even if it is itself excluded, since it remains the series anchor and is referenced by RID (S01).

- **Move:** The matching detached override replaces the occurrence identified by original UID/RID and receives the new DTSTART/end. Do not change the master's weekday/rule, add a second UID, or add EXDATE for a valid moved override. If the input already excludes that RID or contains contradictory/duplicate overrides for it, return an unsupported/conflict result without editing.
- **Cancel:** Add the original slot as `EXDATE` to the master, using a value/type/zone compatible with DTSTART. Repeating the same cancel is idempotent. Keep the master and all unaffected exceptions. If a detached exception already exists at the canceled RID, it must not remain active in the exported calendar: retain its full raw component/property bag in an explicit local SQLite tombstone for history/undo, remove it from active export, and disclose that cancellation intentionally omits that canceled component. Preserve all other unknown lines. This resolves cancellation without silently losing its stored data; the exact canceled-tombstone interchange convention still needs the proposed cross-reader test.
- **Scope:** Do not emit `RANGE=THISANDFUTURE`, truncate RRULE, split the master, or change all later occurrences. Those operations affect a range, not this one instance. In the proposed v1 subset below, RDATE is not accepted; if it is encountered, fail closed rather than disregard it. If product ownership later elects to support RDATE, its inclusion and EXDATE-precedence behavior must be implemented and tested first (S01).

`METHOD:CANCEL` is an iTIP organizer-to-attendee transaction. RFC 5545 says a snapshot without METHOD is not a scheduling transaction; RFC 5546 CANCEL carries organizer, attendee, sequence, and per-instance messaging semantics. Do not add METHOD:CANCEL to this local export or claim an invitation was sent (S01–S02).

### C3 — local time, named zone and DST

**Required correction to initial sketch:** Keep recurrence inputs as a local wall time with the calendar's TZID and matching VTIMEZONE; derive absolute instants only for display/ordering. Do not save an eight-week list of UTC rows as the schedule and do not use the machine's local zone as a fallback. The eight-week interval is a query/preview horizon; preserve the original RRULE beyond it. RFC 5545 requires a VTIMEZONE for each referenced TZID and valid timezone information for recurrence instances (S01).

**Proposed disclosed policy:** A repeated ambiguous fall-back wall time uses the first occurrence, as RFC 5545 specifies. A nonexistent wall time generated by RRULE is skipped and is not counted. For a user-entered move destination in a spring-forward gap, reject the proposed move before writing and explain the gap; this is a product safety choice. An already-imported explicit RFC DATE-TIME in a gap is interpreted using the RFC's pre-gap offset rule, with its original literal/TZID retained and the resolved result surfaced; never silently rewrite it. A slot that the recurrence rule skipped has no occurrence identity to edit. Resolve TZID against exactly one valid VTIMEZONE; preserve that component. Missing, conflicting, unsupported, or too-short timezone definitions are unsupported inputs, not permission to substitute a fixed offset or host tzdata. If the user specifically wants an IANA-name-to-current-tzdb policy instead of embedded rules, that is an owner decision, since future legal timezone changes can diverge from the file's definition.

When computing a moved exception's end, retain the source's duration semantics. RFC 5545 applies the same exact duration to all instances when master uses DTEND; DURATION instead expresses the same nominal duration, whose exact elapsed time can vary across a zone transition. An override may explicitly modify its own duration (S01). Preserve the original end/duration form where feasible and test an exception on each side of DST; do not silently turn a local event into a fixed UTC offset.

### C4 — providers compared at operation level

| Comparator | Observed operation | Concept that transfers | Provider-only behavior |
|---|---|---|---|
| Google Calendar API v3 (S03) | Retrieve an instance, then update its instance resource. A cancellation example sets that instance's status to `cancelled`. Instance has parent recurringEventId and originalStartTime even when actual start differs. | Select the instance by original slot; treat move and cancel as distinct single-instance operations. | Authenticated event resources/IDs, API status field, server update semantics. No Google request will be made. |
| Microsoft Graph REST v1.0 (S04–S07) | List occurrences/exceptions by a date range; PATCH one event ID to update; POST the occurrence ID's `/cancel` action to send an organizer message. | Master/occurrence/exception/cancelled state is a useful comparator; current start and original start are distinct. | seriesMasterId/event IDs, UTC originalStart, auth, organizer-only cancel/attendee notification, range-list query, and Graph's adjacent-day move rejection. Its boundary restriction is not an RFC rule. |

Conceptual mapping: master ↔ series VEVENT; provider original slot ↔ UID + RECURRENCE-ID; moved provider exception ↔ detached VEVENT. There is no universal mapping from provider ID/status/notifications to file syntax. Documentation supports these API statements only; neither comparator was exercised against an account or file fixture, so no interoperability claim follows.

### C5 — opaque properties, repeat import and round trip

**Required behavior:** Keep the imported source bytes/hash and a component-ordered raw property bag in SQLite alongside decoded fields for the fields being edited. Preserve unknown property name, parameters, raw value/escaping, multiplicity, folding and owning component. RFC 5545 explicitly requires unknown IANA/X-name value data to be preserved without interpretation; a property on the master does not imply safe copying to an exception (S01). For a move, update the existing matching exception in place or create a new exception with only known/master-required fields; do not duplicate opaque master properties onto it. A cancellation may intentionally remove the target component from exported active data, but first retain its exact raw component in a local tombstone and report the change. Never drop or normalize unrelated opaque properties silently.

**Idempotence:** Persist a DB `source_document_id`, the original input hash and latest export hash. Upsert master and detached components on `(source_document_id, UID, typed RECURRENCE-ID)`; reject duplicate keys. A second import of the same input/export updates the same records and emits one master, one active exception at most, and one exclusion at most. A changed upstream file that collides with local edits is a local conflict, not an automatic overwrite; no network conflict service is required. Preserve SEQUENCE/source revision data but do not use it instead of the occurrence key.

**Round-trip risk and implementation choice:** “Semantic round-trip” (same property/value meaning after canonical folding) and byte-identical preservation are separate claims. Prefer a parser/editor with a raw syntax tree or keep untouched raw content lines and patch only targeted typed lines. `caldata` 0.17.3 is a pinned Rust parser/recurrence candidate, but its inspected metadata does not prove unknown-field preservation; evaluate it in the subset before adoption (S08). `pimalaya/ical` describes a promising byte-faithful Rust architecture, but the inspected repository page was unpinned `main`, so it is a research lead only (S09). The older `ical` 0.11 parser docs warn they do not validate fields, and its upstream is archived (S11). A Python `icalendar` 7.3.0 history entry records an actual unknown/X-property escaping round-trip bug and fix, plus timezone identity/offset fixes; this is not evidence of a Rust defect, but it makes preservation and DST regression tests mandatory before selecting any Rust release (S10).

**Optional improvement:** Record a SHA-256 for original and exported files and keep an undo/tombstone blob. This makes provenance and intentional removal inspectable; it does not itself prove semantic correctness.

### C6 — supported behavior, assumptions and validation status

**Proposed v1 support envelope (owner to accept):** One trusted `.ics`; one unambiguous master VEVENT with one UID; one DTSTART using local DATE-TIME and exactly one resolvable VTIMEZONE/TZID; one synchronized weekly RRULE (`FREQ=WEEKLY`, positive INTERVAL defaulting to 1, one weekday matching DTSTART; optional COUNT or UNTIL only if the expander supports their counting/end semantics); same-form/same-zone EXDATE values; zero or more unambiguous detached single-instance exceptions with matching UID and original RECURRENCE-ID. One user action edits or cancels one occurrence. Maintain master/exception field duration semantics. The renderer may expand a rolling eight-week preview but stores the recurrence rule, never the preview as the schedule.

**Explicitly unsupported/fail closed:** Other FREQs; multi-day weekly patterns until separately accepted/tested; RDATE; multiple RRULEs; unknown RRULE parts or parameters; `RANGE=THISANDFUTURE`; floating or UTC DTSTART for this local-time feature; differing value type/TZID in EXDATE/RID/override; absent, duplicate, conflicting, or insufficient VTIMEZONE; unsynchronized DTSTART/RRULE; duplicate UID masters or RID overrides; ambiguous existing exclusion/override conflicts; malformed time values; any provider/API action; and any case where raw unknown content cannot be retained. Show the reason and do not write a modified file or partially update the DB. Keep original file available.

**Assumptions not verified:** the actual imported weekly rule uses only the proposed grammar; the embedded VTIMEZONE is authoritative and covers the recurring series; target cancellation with an existing override is best represented by EXDATE plus local tombstone; Rust candidate library behavior on unknown lines/folds matches its docs; consumers apply detached RID overrides and EXDATE as expected; DST behavior of any chosen Rust crate follows RFC semantics.

**Owner decisions:** approve the exact weekly RRULE grammar; decide whether RDATE/complex weekly BYDAY are needed in v1; choose the product's embedded-VTIMEZONE versus separately versioned IANA-zone policy; approve local tombstone semantics for canceled existing exceptions; decide whether an imported explicit gap time is displayed with its RFC-resolved instant or rejected for this product despite being parseable. Until decided, implement none of these as silent fallback.

**Proposed validation only — not executed:**

| Fixture | Required observable invariant |
|---|---|
| Weekly named-zone series before/after spring and fall changes | Same intended local rehearsal hour; correct zone-specific instant/offset; master RRULE remains intact. |
| Move one instance to a different date, including across adjacent calendar date | UID and original RID unchanged; only one detached override; new local DTSTART/end used; no duplicate at original slot or changes to later instances. |
| Cancel one ordinary instance | Exactly one original RID excluded; series master and neighbors survive; repeat cancel is idempotent. |
| Move an already-overridden occurrence | Update same RID exception; opaque exception properties stay associated and unchanged; no second exception. |
| Cancel a previously moved override | It is no longer active in exported result; exact source component is retained in DB tombstone; output's omission is reported; independent readers are checked before any compatibility claim. |
| EXDATE/RRULE and override collision, duplicate UID/RID, DTSTART/RRULE mismatch | Import/edit refuses to write and gives specific reason; does not choose or partially expand. |
| DST fold, gap, and gap-target move | Fold selects first occurrence; rule-generated gap is skipped/not counted; new move into gap is rejected; explicit imported gap retains its literal and follows pre-gap-offset interpretation. |
| Master and exception with unknown X-/IANA property, unknown parameters, duplicate/repeated lines and folded lines | All untouched opaque values, parameters, multiplicity and ownership survive export; byte identity is asserted only if raw-preserving strategy proves it. |
| Import same input twice; import own exported result twice; changed incoming file conflicts with local edit | No duplicate series/override/exclusion; stable effective output; changed collision is surfaced. |
| RDATE, other FREQ, unknown rule part, unsupported zone | Clear unsupported result; source and DB remain unmodified; no recurrence subset is silently applied. |

No importer, export, parser round-trip, unit test, provider call, or cross-client test was run in this investigator stage. These are proposals, not executed validation. The source pages and project README/changelog are research evidence only.

## Triaged plan points: already covered, rejected, unresolved

**Already covered by the released plan and retained:** the author is asking for a single-file offline edit adapter; local 18:30 must survive zone changes; the eight-week horizon is a view convenience, not the series end; only one occurrence is edited; an existing exception and opaque property may be present; provider mechanisms are comparators, not an API integration; importing the same export twice and unsupported recurrence are part of proposed validation; a local parser round-trip alone cannot establish live-provider compatibility. The proposed draft keeps all of these and adds concrete invariants.

**Rejected initial hypotheses:** current occurrence start as identity; eight weeks of materialized UTC rows as schedule; deleting the recurring row to cancel; a moved occurrence with a new UID; treating a provider instance ID, API `cancel`, or attendee notification as iCalendar semantics; silently interpreting only the RRULE fields a parser happens to understand; and claiming compatibility from a local parser round-trip or documentation. These conflict with the stable original-slot model, the file-only scope, or the negative constraints (S01–S07).

**Unresolved/uncertain rather than silently assumed:** the exact v1 RRULE grammar beyond `FREQ=WEEKLY`; whether common multi-day BYDAY or RDATE support is necessary; how the actual imported VTIMEZONE compares with system IANA rules and covers the full recurrence; cross-consumer treatment when an existing exception shares an excluded RID; whether the chosen Rust crate preserves unknown content-line details at a pinned version; how the UI explains an imported gap time; and policy for changed upstream data colliding with local edits. Recommendations and fail-closed defaults above are for review; the enumerated owner decisions need confirmation before implementation claims.

## Negative-constraint check

- No full calendar application: this draft is one file adapter for one weekly-series subset.
- No account/API access: Google and Graph were documentation-only comparators.
- No future/range editing: no RANGE=THISANDFUTURE, series split, or mass change.
- No silent unknown-property drop: retain raw owning component, and disclose/retain an intentionally canceled exception as a tombstone.
- No fixed UTC recurring schedule: preserve TZID/VTIMEZONE and RRULE; use UTC only as derived display/comparison instant.
- No interoperability claim without tests: cross-reader matrix remains proposed and unrun.
