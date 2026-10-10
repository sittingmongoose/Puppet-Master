# Critic evidence index — A1-02-treatment

Bounded, navigable evidence notes. S01–S11 retain the investigator package’s source identities and URLs; S12 adds the official RFC Editor erratum discovered during review. Source records are in [../source-map.json](../source-map.json). Evidence is paraphrased; no full source text is copied here.

| ID | Evidence note | Primary source | Contribution |
|---|---|---|---|
| S01 | [RFC 5545 — iCalendar](S01.md) | [RFC 5545 — iCalendar](https://www.rfc-editor.org/rfc/rfc5545.html) | Identity, recurrence set, TZID, DST, duration, and extension-property rules |
| S02 | [RFC 5546 — iTIP](S02.md) | [RFC 5546 — iTIP](https://www.rfc-editor.org/rfc/rfc5546.html) | iTIP cancellation versus local snapshot editing |
| S03 | [Google Calendar API — Recurring events](S03.md) | [Google Calendar API — Recurring events](https://developers.google.com/workspace/calendar/api/guides/recurringevents) | Instance retrieval, originalStartTime, update and cancel |
| S04 | [Microsoft Graph — event resource](S04.md) | [Microsoft Graph — event resource](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0) | Series master, exception/cancelled collections, UTC originalStart |
| S05 | [Microsoft Graph — event: cancel](S05.md) | [Microsoft Graph — event: cancel](https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0) | Organizer-only occurrence cancellation and attendee message |
| S06 | [Microsoft Graph — update event](S06.md) | [Microsoft Graph — update event](https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0) | PATCH and Graph-only occurrence boundary condition |
| S07 | [Microsoft Graph — list instances](S07.md) | [Microsoft Graph — list instances](https://learn.microsoft.com/en-us/graph/api/event-list-instances?view=graph-rest-1.0) | Range-bound instance list and response timezone |
| S08 | [caldata Rust crate](S08.md) | [caldata Rust crate](https://docs.rs/crate/caldata/0.17.3) | Pinned Rust parser/recurrence candidate; no opaque round-trip proof |
| S09 | [pimalaya/ical Rust repository README](S09.md) | [pimalaya/ical Rust repository README](https://github.com/pimalaya/ical) | Unpinned byte-faithful architecture lead |
| S10 | [collective/icalendar 7.3.0 implementation history](S10.md) | [collective/icalendar 7.3.0 implementation history](https://github.com/collective/icalendar/blob/v7.3.0/CHANGES.rst) | Python implementation history for unknown values and time zones |
| S11 | [Peltoche ical Rust parser documentation and archived repository](S11.md) | [Peltoche ical Rust parser documentation and archived repository](https://docs.rs/ical/0.11.0/ical/) | Parser scope and upstream archive status |
| S12 | [RFC Editor — RFC 5545 Erratum 4271](S12.md) | [RFC Editor — RFC 5545 Erratum 4271](https://www.rfc-editor.org/errata/eid4271) | Verified correction: generated local gap times follow RFC 5545 §3.3.5 |

Access times, exact locators, versions, observed operations, governing conditions, and applicability are in ../source-map.json. These research checks did not execute importer/exporter validation or provider calls.
