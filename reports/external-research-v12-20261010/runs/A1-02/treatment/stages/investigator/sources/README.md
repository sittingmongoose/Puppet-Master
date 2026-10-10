# Bounded source index — A1-02-treatment investigator

This is a navigable index, not a raw evidence dump. The durable IDs below are the keys in `../source-map.json`; do not silently rebind them. Retrieval/recording times and full source locators, versions, conditions, and applicability are in that map. Research was read directly; no accounts or provider APIs were used.

| ID | Evidence note | Primary source | Contribution |
|---|---|---|---|
| S01 | [RFC 5545](S01-rfc5545.md) | [RFC Editor](https://www.rfc-editor.org/rfc/rfc5545.html) | iCalendar identity, recurrence-set algebra, unknown value preservation, timezone and DST rules |
| S02 | [RFC 5546](S02-rfc5546.md) | [RFC Editor](https://www.rfc-editor.org/rfc/rfc5546.html) | Difference between a local snapshot edit and iTIP cancellation notice |
| S03 | [Google recurring events](S03-google.md) | [Google Calendar API v3](https://developers.google.com/workspace/calendar/api/guides/recurringevents) | Instance retrieval/update/cancel and originalStartTime identity |
| S04 | [Graph event model](S04-graph-event.md) | [Microsoft Graph v1.0](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0) | Master/occurrence/exception/cancelled model and originalStart |
| S05 | [Graph cancellation](S05-graph-cancel.md) | [Microsoft Graph v1.0](https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0) | Organizer-only attendee-notifying cancel operation |
| S06 | [Graph update](S06-graph-update.md) | [Microsoft Graph v1.0](https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0) | PATCH operation and provider-specific moved-exception boundary condition |
| S07 | [Graph instance listing](S07-graph-instances.md) | [Microsoft Graph v1.0](https://learn.microsoft.com/en-us/graph/api/event-list-instances?view=graph-rest-1.0) | Range-bound listing and response time-zone behavior |
| S08 | [caldata Rust crate](S08-caldata.md) | [docs.rs 0.17.3](https://docs.rs/crate/caldata/0.17.3) | Pinned candidate for Rust parser and recurrence expansion |
| S09 | [pimalaya/ical](S09-pimalaya-ical.md) | [GitHub repository](https://github.com/pimalaya/ical) | Unpinned byte-preserving syntax-tree architecture lead |
| S10 | [icalendar 7.3.0 history](S10-icalendar-history.md) | [Tagged changelog](https://github.com/collective/icalendar/blob/v7.3.0/CHANGES.rst) | Real unknown-property and timezone round-trip bug/fix history |
| S11 | [Archived Rust ical parser](S11-archived-rust-parser.md) | [docs.rs 0.11.0](https://docs.rs/ical/0.11.0/ical/) | Alternative with parser-only validation limits; archived upstream |

## Evidence handling

Only short factual notes and locators are retained. Source text is paraphrased. Every claim in `discovery.md` and later `draft.md` should retain these IDs. Proposed validation is not an executed check; no interoperability claim follows from provider documentation or crate README claims.
