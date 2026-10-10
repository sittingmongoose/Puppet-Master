# Resolved proposal — one occurrence edit in an imported iCalendar file

Fixture `ER12-A1-02-FRESH`, run `A1-02-control`. This is the complete investigator draft against the released user plan. The product remains a local Rust/SQLite adapter for one trusted imported `.ics` file and an edited-file export. It is not a calendar service. The UI already exists. There is no provider connection, live sync, account/API access, whole-series operation, or server conflict service.

The user sketch should not be implemented literally: an occurrence-start timestamp is not a stable identity after moving; eight-week UTC rows cannot be the authoritative series because the series continues and crosses DST; a moved standalone event with a new UID severs recurrence identity. Keep a master VEVENT and selected original slot; represent the move as an exception attached to that slot. A preview may expand a bounded visible window, but recurrence data remains canonical and timezone-bound.

## Exact per-clause disposition

### C1: Define series and occurrence identity, including how a moved occurrence refers to its original position.

**Disposition — replace timestamp/new-UID sketch.** Series identity is the source file's stable local import slot plus the RFC `UID`; the file model must preserve the persistent UID, not derive identity from title, current date, provider ID, or SQLite insertion order. Occurrence identity is a typed original recurrence slot: `(source_slot, UID, value type, original RECURRENCE-ID date/time, TZID/reference)`. A generated unmodified instance uses its nominal generated slot as the key. A detached VEVENT exception uses the same UID and `RECURRENCE-ID` for that original slot. When Friday moves to Thursday, keep Friday's `RECURRENCE-ID`; change only its actual `DTSTART` and corresponding end/duration fields. This is the RFC rule (S01) and maps conceptually to Google's parent recurringEventId + immutable originalStartTime and Graph's seriesMasterId + originalStart, but those provider IDs/time encodings are not file keys (S02–S05).

### C2: Explain cancellation versus moving an instance, and the relevant interactions between recurrence rules, exclusions, and overrides within the supported subset.

**Disposition — make the two operations separate and narrow.** The master recurrence set includes DTSTART, RRULE and any supported RDATEs; EXDATE removes matching original slots, takes precedence over those inclusions, and duplicate inclusions collapse (S01). Preserve the original DTSTART even when excluded. Restrict the first release to one validated weekly RRULE profile and the exact recurrence forms the parser/editor can round-trip; reject a mismatched DTSTART/RRULE (undefined by RFC), multiple RRULEs (undefined), deprecated EXRULE, unsupported rule parts, duplicate masters, and duplicate `(UID, RECURRENCE-ID)` exceptions. The target must be an actual slot generated or explicitly included by that master.

- **Move:** create a detached exception if none exists, with the same UID and a RECURRENCE-ID equal to the original slot, and write the new actual DTSTART/DTEND. If that slot already has an override, update that component in place, retaining RECURRENCE-ID and all unrelated properties. Do not alter the recurrence rule or subsequent occurrences.
- **Cancel:** for an ordinary target with no conflicting detached override, add exactly that original slot to the master's EXDATE list; retain the UID/master and avoid persisting a deleted generated row. Do not remove other inclusions. If the target already has a detached override that conflicts with EXDATE, fail closed and leave the source unchanged until a tested representation/policy is selected. The RFC states how EXDATE wins in the master recurrence set, but does not settle every client's composition of that exclusion with a separate detached exception; do not drop the existing override or opaque data to make a guessed output.
- **Future edits:** refuse RECURRENCE-ID `RANGE=THISANDFUTURE`; although RFC defines the range, applying it changes this and later instances and violates the brief's no mass future edits (S01).

A moved instance is still one occurrence; it does not become an unrelated event or a whole-series schedule. A move to another date may overlap an existing event; an offline file can carry that result, but the adapter should show an overlap for staff to decide rather than importing Graph's provider-specific cross-boundary restriction as an ICS rule. The app has no server-side conflict resolution.

### C3: Specify local time/time-zone handling across a daylight-saving boundary and disclose ambiguous/nonexistent-time policy rather than assuming a fixed UTC offset.

**Disposition — retain zoned wall time and disclose two different RFC gap cases.** Store the series DTSTART's local wall date/time, TZID and applicable VTIMEZONE rules alongside RRULE. Expand each candidate local date in that zone, then resolve its instant; never add a fixed seven-day UTC duration or convert the source into an enduring fixed-offset schedule. Require the referenced VTIMEZONE to cover the recurring component's instances, or stop and surface unsupported timezone data (S01). A TZID without TZID-bound local values is not sufficient, and a floating time is not an acceptable substitute for the requested named-zone recurrence.

RFC 5545's explicit TZID DATE-TIME policy is: on a fall-back fold, use the first (earlier) occurrence; for an explicit nonexistent spring-gap DATE-TIME, apply the pre-gap UTC offset (the resulting instant displays after the gap). A recurrence rule that generates a nonexistent local time is different: ignore that generated instance and do not count it toward the recurrence set (S01). State these policies in the help/error text and fixture expectations. Apply the same documented policy when an explicit moved DTSTART needs local-time resolution. Do not silently pick an operating-system default or permanent UTC offset.

### C4: Compare at least two provider/analogous mechanisms at the operation level and explain which concepts transfer to file interchange and which do not.

**Disposition — compare operations, not data formats as interchangeable.** The full source identity/conditions and exact endpoints are in S02–S09 and [sources/index.md](sources/index.md).

| Operation | Google Calendar API v3 | Microsoft Graph v1.0 | What transfers to the offline adapter |
|---|---|---|---|
| Find original instance | `GET .../events/{seriesId}/instances`; instance has parent recurringEventId and immutable originalStartTime even after a move. | `GET .../events/{masterId}/instances` with a start/end window; event has seriesMasterId, type and originalStart (UTC). | Select and persist the original slot, not the moved start. Translate to UID + RECURRENCE-ID. |
| Move one | Retrieve occurrence, then PUT the instance resource; the moved start is distinct from originalStartTime. | PATCH the selected occurrence/exception event ID; some moves across adjacent occurrence day boundaries return ErrorOccurrenceCrossingBoundary. | Use one same-UID detached exception and retain RECURRENCE-ID. Do not impose the Graph boundary constraint on ICS without product evidence. |
| Cancel one | Guide uses status=cancelled on one recurring exception; resource docs give cancelled exceptions special fields/lifetime distinct from deleted events. | Cancel occurrence through organizer-only Cancel action; series master exposes cancelledOccurrences; Delete is a different event operation and has different organizer/attendee effects. | EXDATE is a file-level exclusion candidate. API IDs, permissions, attendee mail, cancellation tombstones, and provider retention are not .ics guarantees. |
| Time values | Recurring event start/end timeZone is required and selects expansion zone. | Instance responses default to UTC unless `Prefer: outlook.timezone` is specified. | Preserve named TZID/local schedule and VTIMEZONE in the file; no provider zone conversion has been exercised. |

No Google or Graph API request was made. The evidence supports only a conceptual comparison, not interoperability claims.

### C5: Describe preservation of unknown properties, idempotent repeat import, and round-trip risks; connect a relevant implementation or history detail to the compatibility decision.

**Disposition — preserve opaque values structurally; make the Rust dependency provisional.** RFC 5545 says unknown X-name/IANA value-type data must be preserved without interpretation (S01). Keep opaque property name, parameters, raw value payload, multiplicity, component ownership and ordering/anchor in the imported component model, including the existing detached exception and VTIMEZONE. A move patches known time fields in that component and carries every other property forward. If the parser/serializer cannot retain an opaque value safely, block the export with a specific diagnostic; never silently drop it. Semantic property preservation does not imply byte identity: a serializer may normalize folding, order, escaping or parameter quoting. Record that as an explicit transformation only after it is measured; no current evidence proves a byte-identical writer.

Use a stable source-slot identity for this single import collection. In one transaction, upsert the master by `(source_slot, UID)` and each detached component by `(source_slot, UID, typed original RECURRENCE-ID)`. Generate the UI's preview instances from master/rule/exclusions/overrides on demand instead of inserting one permanent row per future occurrence. Re-importing the same unchanged file must leave series/override cardinality stable; re-importing an edited exported file into the same source slot must update its same identities, not append a new UID or duplicate override. Detect duplicate identities and stop rather than merge opaque properties arbitrarily.

Compatibility decision is evidence-based and still provisional: Peltoche's `ical` 0.11 README describes an AST-like component/property tree but explicitly warns that its parser does not validate field validity; its GitHub repo was archived in 2024 (S12). `aimcal-ical` 0.12.1 (2026-07-10) documents retained X/unrecognized properties at the calendar root, but its docs do not establish byte identity or component-level mutation fidelity (S11). `rrule2` 0.15.0 (2026-09-27) is a current recurrence candidate whose own behavior notes expose subtle divergence between RFC's undefined unsynchronized DTSTART/RRULE and Google's behavior; it documents DST policies but still depends on Chrono-TZ coverage and has iteration limits (S10). Pin versions if selected, test actual component-level property/VTIMEZONE preservation and recurrence outputs, and do not claim any candidate is adequate before that evidence exists.

### C6: Separate supported behavior, unverified assumptions, and proposed-versus-executed validation; state what unsupported inputs do.

**Disposition — use a strict, visible first-release profile.**

- **Supported proposal:** one uniquely identified weekly master in one named TZID with valid covering VTIMEZONE, one exact generated/included original slot, move via same-UID RECURRENCE-ID exception, or cancel via one EXDATE if no conflicting target override exists; preserve opaque component properties; deterministic transactional upsert and reimport. The visible UI may use a bounded expansion window, but the stored series has no eight-week end.
- **Unverified assumptions/owner choices:** the input timezone definition agrees with the intended named zone over all recurrence dates; the fixture's weekly rule is aligned with DTSTART and fits the accepted RRULE profile; a selected recurrence library implements the required edge behavior; selected parser/writer preserves opaque component values through mutation; external clients recognize the exported exception/cancellation representation. Need owner decision on the target-override-plus-EXDATE conflict and whether a stricter IANA/VTIMEZONE equivalence profile is required. No provider testing has occurred.
- **Unsupported inputs:** missing/duplicate master UID, ambiguous duplicate exception key, malformed/unknown temporal type, unaligned DTSTART/RRULE, multiple RRULEs, unsupported recurrence forms or EXRULE, unresolvable/incomplete VTIMEZONE/TZID, floating or fixed-UTC rule where named local time is required, THISANDFUTURE, unresolved exclusion/override conflict, or any opaque value likely to be lost. Return a clear component/property-level reason and make no DB/export mutation; retain the original input.
- **Executed validation:** none. Research was source inspection. No input file has been imported or exported; no Rust parser, recurrence engine, provider, DST fixture, or round trip was run.
- **Proposed validation only:** matrix below. Passing a local parser round trip is not proof of provider compatibility; name a provider/version and run its actual import/export tests before saying the file interoperates.

## Proposed round-trip matrix (not run)

| Fixture/action | Observable invariant |
|---|---|
| Weekly 18:30 rehearsal across a spring and fall clock change in its named zone | Local weekday and 18:30 wall time remain; UTC instants/offsets follow zone rules; series does not become fixed UTC. |
| Explicit ambiguous fall-fold DTSTART/moved DTSTART | First occurrence is chosen and retained on export; no implicit OS-local choice. |
| Explicit nonexistent local DTSTART or moved DTSTART in a spring gap | RFC pre-gap offset policy is applied and disclosed. |
| RRULE-generated nonexistent spring-gap week plus fall-fold week | Gap-generated slot is skipped and not counted; fold recurrence appears once at earlier instant. |
| Move one instance to another date (e.g. Tuesday) | Exported detached VEVENT retains same UID and original Monday RECURRENCE-ID; actual DTSTART/DTEND reflect new date; all other slots/master rule are unchanged. Check/visualize overlap but do not apply Graph's API restriction as an ICS rule. |
| Cancel one ordinary instance | Exactly its original slot is in EXDATE; recurrence set suppresses only that slot, preserves UID/DTSTART/RRULE/RDATE/other EXDATEs, and leaves series intact. |
| Existing override plus opaque X/IANA property on master, override, and/or VTIMEZONE | No-op export and a move preserve unknown value, parameters, multiplicity, ownership and semantic order; known time-field changes do not replace opaque content. Matching override+EXDATE collision fails closed without mutation. |
| Reimport same unchanged file, then reimport edited export in same source slot | Unique master/exception keys and database row counts stay stable; no duplicate exception/new UID; edited original-slot key remains stable. Compare semantic export determinism separately from byte identity. |
| Unsupported rule, duplicate key, missing zone, or THISANDFUTURE | Clear actionable unsupported result; source bytes and database remain untouched; no silent fallback or partial export. |
| Optional named Google/Graph fixtures after separate authorization and setup | Record provider/version-specific import/export result; test IDs/cancellation behavior at operation level. Until run, no interoperability statement. |

## Negative constraints honored

No full calendar application; no accounts or API access; no mass edits of future occurrences; no silent dropping of unknown properties; no fixed-UTC rewriting of a local recurrence; no interoperability claim without a named test. This draft makes no claim that proposed validations passed.

## Native Goal record

The actual tool response at creation reported `threadId=01a123f5-4679-7032-b60a-94ed1149dc3e`, exact objective from `freeze.json`, `status=active`, `tokensUsed=0`, `timeUsedSeconds=0`, `createdAt=1791604667`, `updatedAt=1791604667`, and `remainingTokens=null`. This stage will mark it complete only after required artifacts are saved. No separate provider/source provenance or creation timestamp format was exposed; those remain UNKNOWN rather than inferred.
