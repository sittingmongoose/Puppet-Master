# S11 — archived Rust ical parser

- URL: https://docs.rs/ical/0.11.0/ical/
- Related repository: https://github.com/Peltoche/ical-rs
- Version/state: crate `ical` 0.11.0; upstream repository archived 2024-08-17.
- Access observation: 2026-10-10T04:00:34Z.
- Locator: crate overview/parser warning; repository archive status.

**Observed approach and limitation.** The crate exposes line, property and component parsing. Its documentation warns that the parsers parse content and uppercase case-insensitive fields but do not check field validity. Upstream is archived/read-only.

**Applicability.** An alternative syntax parser only if wrapped with validation and recurrence/time-zone logic. Not suitable alone for the required occurrence adapter; caldata notes it is a hard fork with substantial divergence.
