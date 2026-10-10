# Independent discovery — occurrence-edit adapter for imported iCalendar

Run: `A1-02-control` / fixture `ER12-A1-02-FRESH`. This is pre-plan discovery from the exact synthetic brief only; the concealed plan has not yet been released or read. The request is a one-file import/edit/export adapter for a single weekly rehearsal series, with an existing exception and an opaque property, not a calendar service or provider integration. Source IDs S01–S12 are fixed in [source-map.json](source-map.json), with bounded notes in [sources/index.md](sources/index.md).

Native Goal observation: `create_goal` returned actual goal `threadId=01a123f5-4679-7032-b60a-94ed1149dc3e`, the exact frozen objective, `status=active`, `tokensUsed=0`, `timeUsedSeconds=0`, `createdAt=1791604667`, `updatedAt=1791604667`, `remainingTokens=null`, and no completion budget report. These are the fields actually exposed at creation; terminal status remains pending. Goal activation is observed; a later completion call is still required.

## Recommendation and scope

Build a constrained transformer over the imported VCALENDAR/VEVENT model. Preserve the series master and edit only one selected recurrence slot. Keep import/export as the only boundary; do not add provider accounts, API writes, whole-calendar workflows, mass/future edits, or a UI redesign. An edited file is not proven interoperable until round-trip fixtures are actually run against named implementations.

Use a narrow accepted input profile: exactly one target series master identified by a unique UID; an RFC-valid weekly RRULE with one supported weekly slot (default INTERVAL=1, and any BYDAY must resolve to the same one weekly weekday as DTSTART); one local DATE-TIME DTSTART/DTEND with TZID and a matching VTIMEZONE covering the rule's recurrence horizon; valid same-type RDATE/EXDATE and detached overrides with that UID. Accept only recurrence pieces the importer can represent and round-trip exactly. Reject conflicting/multiple masters, duplicate override identities, invalid/missing timezone definitions, floating or fixed-UTC recurrence where the requested named zone is required, unsupported RRULE parts, EXRULE, RANGE=THISANDFUTURE, malformed/ambiguous recurrence IDs, or any input that cannot be preserved safely. Keep the original input unchanged on rejection and tell staff which component/property needs a different workflow.

## C1 — series and occurrence identity

- Use the RFC UID as series identity, scoped to the one stable local import slot/source. UID is required and persistent by RFC; do not substitute subject, dates, moved start, provider IDs, or SQLite row numbers (S01).
- Use a typed recurrence key: `(source_slot, UID, RECURRENCE-ID value-kind, original date/time value, TZID/reference)`. For generated but unmodified instances, derive the key from the original recurrence slot and DTSTART type/timezone. For a detached exception, UID plus RECURRENCE-ID identifies the same original slot.
- A move changes an exception's actual DTSTART/DTEND, never its RECURRENCE-ID. The RFC example/definition explicitly keeps Friday's RECURRENCE-ID when moving that Friday instance to Thursday (S01). This is also the concept that transfers from Google's `recurringEventId + originalStartTime` and Graph's `seriesMasterId + originalStart` (S02/S03/S05); their opaque IDs and UTC API payloads do not transfer.

## C2 — cancel, move, recurrence/exclusion/override interaction

Compute the master's recurrence set as DTSTART plus RRULE and RDATE inclusions, less EXDATE; exclusions beat rule/date inclusions, duplicate inclusions collapse, and excluding DTSTART does not permit deleting the original DTSTART metadata (S01). Treat one detached VEVENT with matching UID/RECURRENCE-ID as the per-instance override, overlaying changed fields only on that original slot. For a move, create the detached override if absent, otherwise update the existing target override in place; write a new DTSTART/DTEND but retain its RECURRENCE-ID and all unaffected/opaque properties. Do not rewrite the master RRULE or later instances.

For cancellation without a conflicting detached override, add the original slot to master EXDATE; this expresses one file-level exclusion without canceling the series. If a matching detached override is already excluded or otherwise conflicts with EXDATE, refuse the edit without writing: RFC defines EXDATE precedence in the master recurrence set but does not, by itself, settle all parser/client composition behavior for separate detached components. Do not guess whether to drop, retain, or rewrite such an override; preserve opaque data and make the ambiguity visible. `RANGE=THISANDFUTURE` is out of scope: RFC defines it as a range starting at the identified slot, and it would violate the no-future-mass-edit constraint (S01).

Provider operations are not interchangeable with file representation. Google retrieves a selected instance and updates its event resource; its guide models cancellation with `status=cancelled`, and distinguishes cancelled exceptions from deleted events (S02/S03/S04). Graph enumerates instances in a time range, uses the instance ID for PATCH/delete/cancel, and distinguishes cancel (organizer message) from delete; an exception moved across an adjacent-day boundary may be refused (S05–S09). These explain adapter concepts and provider-specific limits, not behavior this file-only product should promise.

## C3 — local wall time, named zone, DST

Keep recurrence as the original local wall time + named TZID/VTIMEZONE + weekly rule. Resolve each generated date through the referenced zone's rules; never add 604,800 seconds repeatedly or rewrite the series as a permanent UTC schedule. RFC says an ambiguous explicit TZID local time selects the first occurrence in the fall-back fold; an explicit nonexistent local DATE-TIME uses the offset before the spring gap, mapping to the post-gap instant. A recurrence-generated nonexistent local time is different: it is ignored and not counted (S01). Document these as separate cases and test them. Require VTIMEZONE coverage for all generated recurrence instances; an IANA-looking TZID alone is not enough to prove the file carries the intended rules (S01). An alternative strict policy of refusing a user-entered ambiguous/nonexistent target can be an owner choice, but the importer must not silently assume a fixed offset.

The current crate evidence is only candidate material: rrule2 0.15.0 documents RFC-style fold/gap treatment and makes explicit that an unsynchronized DTSTART/RRULE result is undefined in RFC while Google has a different behavior; its stated `all` interface has limits and time-zone coverage depends on Chrono-Tz (S10). Do not rely on the library's claim until tested against the exact accepted profile and preserve its version.

## C4 — comparator transfer boundary

| Concern | Google Calendar API v3 | Microsoft Graph v1.0 | Transfers to .ics adapter |
|---|---|---|---|
| Select original occurrence | `events.instances`; instance has parent ID and immutable `originalStartTime` | master `/instances` over a date window; `seriesMasterId`, `type`, UTC `originalStart` | Keep stable series + original-slot identity, not moved start |
| Move one | Retrieve occurrence then PUT update that instance resource | PATCH a selected event ID; certain cross-boundary moves can fail | One detached override with original RECURRENCE-ID and changed DTSTART/DTEND |
| Cancel one | `status=cancelled` on recurring exception; cancellation state can be retained | canceledOccurrence metadata; Cancel and Delete differ, cancel communicates to attendees | An EXDATE is the narrow file exclusion candidate; no API identity, auth, mail notification, or provider retention behavior transfers |
| Time basis | IANA zone required for recurrence expansion | instance listing defaults returned start/end to UTC unless `Prefer: outlook.timezone` | Preserve TZID/local schedule and VTIMEZONE; only make interoperability claims after testing |

No live provider request was made. “Comparator” means operation contract was read, not API behavior reproduced.

## C5 — opaque properties, import idempotence, round-trip risk

RFC 5545 requires preserving unrecognized X-name/IANA `VALUE` data without interpreting it (S01). Store each component's unrecognized property name, parameter list, raw value payload, multiplicity, owning component, and relative position in a retained property bag; include VTIMEZONE and detached VEVENT content, not only the series row. Move edits should patch only known DTSTART/DTEND/status/date fields and preserve all other properties; if the serializer cannot guarantee semantic preservation, block export rather than silently dropping data. Semantic preservation is not byte identity: folding, ordering, parameter quoting, and escaping can normalize and need explicit compatibility tests.

Use a stable local calendar/source slot with a unique key for master `(source_slot, UID)` and detached component `(source_slot, UID, typed original RECURRENCE-ID)`. Upsert in one transaction; do not persist one database row per expanded occurrence. A second import of the same source should update the same series/exception rows, not append duplicates. Deterministic import/export should yield a stable semantic model, although byte-for-byte output is not claimed until proven. Detect same UID/RECURRENCE-ID duplicates rather than merging opaque property bags without a rule.

Implementation history changes the dependency decision: the `ical` 0.11 README describes a useful property/component parser but explicitly says it does not validate field validity; its repository is archived since 2024 (S12). Do not equate successful parse with safe recurrence edits. Current `aimcal-ical` 0.12.1 documents retained calendar-root X/unrecognized properties, but not byte identity or tested component mutation fidelity (S11). `rrule2` 0.15.0 is recent and documents subtle provider divergence and DST fixes, but still requires version-pinned fixtures (S10). This evidence supports keeping the model loss-aware and library choice provisional until behavior is verified.

## C6 — supported, uncertain, unsupported, and verification status

**Supported recommendation:** one validated weekly series in one named zone, one exact original occurrence selected, move via a same-UID exception retaining RECURRENCE-ID, cancel via one EXDATE where no conflicting target exception exists, preserve unknown values/parameters semantically, reimport via deterministic upsert. The UI may show the action and diagnostics; no UI design is proposed.

**Unverified assumptions:** the user's “named time zone” corresponds to one unambiguous VTIMEZONE and a supported ruleset; imported weekly RRULE is aligned with DTSTART and has a recurrence horizon the resolver can cover; an accepted recurrence engine handles generated gap/fold cases exactly as RFC says; selected serializers preserve opaque properties at VEVENT and VTIMEZONE level; external clients interpret moved/cancelled overrides compatibly. These remain questions for the plan owner or tests, not claims.

**Unsupported input policy:** no mutation/export for unsupported recurrence forms, mismatched DTSTART/RRULE, multiple masters/duplicate exceptions, missing/ambiguous timezone definition, floating or UTC-only recurrence under a named-zone requirement, range future edits, conflicting EXDATE+override, or any opaque-property loss risk. Return an actionable reason; retain original bytes and data.

**Executed checks:** none. No implementation, parser, recurrence engine, provider API, or round-trip was run. Literature/doc inspection is evidence gathering, not validation.

## Proposed round-trip validation matrix (not run)

| Fixture/action | Assertions after import → edit → export → reimport |
|---|---|
| Weekly series before/after DST with zone rules | Local weekday/hour remains; UTC offset changes as zone rules say; no permanent UTC schedule |
| Explicit DTSTART in fall fold; explicit DTSTART in spring gap | First fold occurrence and pre-gap offset behavior match RFC; round-trip retains TZID/local value |
| Rule-generated gap occurrence and fold occurrence | Gap instance skipped and not counted; fold occurrence emitted once at earlier instant |
| Move ordinary instance | Same UID; RECURRENCE-ID equals original nominal slot; moved DTSTART/DTEND changes; other instances unchanged |
| Cancel ordinary instance | One EXDATE for original slot; other instances remain; EXDATE precedence over RRULE/RDATE is retained |
| Existing moved exception plus unknown X/IANA property on master/override/timezone | Opaque property payload, params, owner component, multiplicity survive a move and a no-op export; cancellation collision blocks safely |
| Repeat import unchanged file and reimport exported file | Unique-key counts stable; no duplicate overrides; semantic output stable and UI state unchanged |
| Unsupported/range/missing-zone/mismatch/duplicate/conflict input | No partial DB/file mutation; actionable unsupported result; original remains available |
| Named Google/Graph client import/export fixture (only if later authorized) | Compare operation semantics; treat any observed behavior as client/version-specific; do not assert interoperability until actually run |

