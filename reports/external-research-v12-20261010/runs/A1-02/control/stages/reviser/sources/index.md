# Bounded source index — A1-02-control reviser

Research snapshot: 2026-10-10 04:27 UTC. IDs S01–S12 carry forward unchanged from the investigator and critic source maps. `source-map.json` records exact URLs, versions, locators, access times, observed operations, governing conditions, applicability, and predecessor lineage. This index is a bounded navigation aid; it does not copy source pages. No downloaded code was run and no provider API was called.

## Governing iCalendar evidence

### S01 — RFC 5545

[Official RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html), September 2009, Standards Track. Rechecked 2026-10-10 at 04:27:04 UTC. See source-map locators for TZID/VTIMEZONE, explicit versus generated DST gaps, recurrence-set inclusion/exclusion, UID/RECURRENCE-ID identity and type compatibility, and unknown VALUE types. Key resolution: generated nonexistent local instances are ignored/not counted (§3.3.10); explicit nonexistent local values use the pre-gap offset (§3.3.5). Unknown value types must be retained (§3.2.20), while unrecognized IANA/X extension properties may generally be ignored (§3.8.8); the adapter follows the brief’s stronger no-silent-drop rule.

## Provider operation comparators — not .ics guarantees

### S02 — Google recurring events guide

[Google Calendar API v3 recurring events](https://developers.google.com/workspace/calendar/api/guides/recurringevents). Retrieve/select/update an instance and use the guide’s cancellation status example; no API call was made.

### S03 — Google Events resource

[Google Calendar API v3 Events resource](https://developers.google.com/workspace/calendar/api/v3/reference/events). `originalStartTime` stays immutable when moved; time-zone and cancelled-exception conditions are detailed in the map.

### S04 — Google instances method

[Google Calendar API v3 events.instances](https://developers.google.com/workspace/calendar/api/v3/reference/events/instances). Enumeration/filtering, `showDeleted` default, and response time-zone behavior; no request was executed.

### S05 — Microsoft Graph event resource v1.0

[Graph event](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0). `seriesMasterId`, event `type`, UTC `originalStart`, and cancellation/exception fields.

### S06 — Microsoft Graph list instances

[Graph list instances](https://learn.microsoft.com/en-us/graph/api/event-list-instances?view=graph-rest-1.0). Bounded start/end window and UTC-by-default response values unless `Prefer: outlook.timezone` is supplied.

### S07 — Microsoft Graph update event

[Graph update](https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0). PATCH one event ID and provider-specific adjacent-occurrence-day restriction.

### S08 — Microsoft Graph cancel event

[Graph cancel](https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0). Organizer-only action, attendee cancellation message, and Deleted Items effect.

### S09 — Microsoft Graph delete event

[Graph delete](https://learn.microsoft.com/en-us/graph/api/event-delete?view=graph-rest-1.0). Delete behavior differs from the Cancel action; neither is an offline EXDATE operation.

## Implementation candidates and history — not qualified

### S10 — rrule2 0.15.0

[docs.rs rrule2](https://docs.rs/crate/rrule2/0.15.0) (versioned URL attempted; docs.rs search/open resolved the latest documentation page, which identified `rrule2 0.15.0`: [version-identified page](https://docs.rs/crate/rrule2/latest)). The package’s docs say occurrences in a nonexistent spring gap use the pre-gap offset, unlike RFC 5545’s rule for recurrence-generated nonexistent times. This is documentation evidence; the implementation was not executed. The candidate remains unqualified.

### S11 — aimcal-ical 0.12.1

[Versioned semantic ICalendar model](https://docs.rs/aimcal-ical/0.12.1/aimcal_ical/semantic/struct.ICalendar.html). Calendar-root retained properties are documented; component-level mutation fidelity and byte identity are not established.

### S12 — Peltoche/ical-rs

[ical-rs repository](https://github.com/Peltoche/ical-rs). README describes `ical` 0.11 and says parsing does not validate field validity; repository archived 2024-08-17. Parse success alone is not safe recurrence-edit evidence.

## Recheck and validation boundary

The independent recheck opened only the governing RFC and docs.rs candidate pages. Google/Graph and other candidate records are carried forward from the complete predecessor source maps with their prior access records. Documentation inspection is not a product validation. No parser, serializer, recurrence engine, provider, or round-trip fixture was executed.
