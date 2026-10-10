# Reviser evidence index — A1-02-treatment

Bounded, navigable source notes for the reviser stage. Each note paraphrases the observed source; no full source pages are copied. Exact source identities, URLs, versions or commit status, locators, access observations, operations, conditions, and applicability are recorded in [source-map.json](../source-map.json).

| ID | Evidence note | Source | Contribution |
|---|---|---|---|
| S01 | [RFC 5545 — iCalendar](S01.md) | [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html) | Series identity, recurrence algebra, TZID/VTIMEZONE, DST, durations, and value/property distinctions |
| S02 | [RFC 5546 — iTIP](S02.md) | [RFC 5546](https://www.rfc-editor.org/rfc/rfc5546.html) | Organizer-to-attendee CANCEL operation versus local file editing |
| S03 | [Google recurring-event guide](S03.md) | [Google Calendar API v3 guide](https://developers.google.com/workspace/calendar/api/guides/recurringevents) | originalStartTime, instance retrieval/update, and cancellation example |
| S04 | [Microsoft Graph event resource](S04.md) | [Graph event resource](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0) | seriesMasterId, type, UTC originalStart, exception and canceled-instance fields |
| S05 | [Microsoft Graph event cancel](S05.md) | [Graph cancel action](https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0) | Organizer permission, occurrence ID, and attendee message |
| S06 | [Microsoft Graph event update](S06.md) | [Graph update operation](https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0) | PATCH and Graph-specific adjacent-day exception restriction |
| S07 | [Microsoft Graph list instances](S07.md) | [Graph list-instances method](https://learn.microsoft.com/en-us/graph/api/event-list-instances?view=graph-rest-1.0) | Time-range enumeration and response timezone |
| S08 | [caldata 0.17.3](S08.md) | [docs.rs release page](https://docs.rs/crate/caldata/0.17.3) | Pinned Rust parsing/recurrence candidate; raw preservation remains unproven |
| S09 | [pimalaya/ical README](S09.md) | [Repository README](https://github.com/pimalaya/ical) | Unpinned byte-faithful editing and recurrence/time-zone architecture claims |
| S10 | [icalendar 7.3.0 history](S10.md) | [Tagged changelog](https://github.com/collective/icalendar/blob/v7.3.0/CHANGES.rst) | Concrete Python-library round-trip and time-zone fixes as implementation caution |
| S11 | [ical 0.11.0 and archived upstream](S11.md) | [docs.rs crate](https://docs.rs/ical/0.11.0/ical/) · [archived upstream](https://github.com/Peltoche/ical-rs) | Historical parser scope and maintenance status |
| S12 | [RFC Editor Erratum 4271](S12.md) | [Erratum report](https://www.rfc-editor.org/errata/eid4271) · [inline errata rendering](https://www.rfc-editor.org/rfc/inline-errata/rfc5545.html) | Verified correction: generated nonexistent local times follow RFC 5545 §3.3.5 |

These are research-source checks. They do not show that an importer, exporter, parser, provider, or independent calendar reader passed validation.
