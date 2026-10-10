# S08 — caldata Rust crate

- URL: https://docs.rs/crate/caldata/0.17.3
- Version: caldata 0.17.3, release listed as 2026-09-20.
- Access observation: 2026-10-10T04:00:20Z.
- Locators: package version/dependency list; owner note on fork; crate module docs at https://docs.rs/caldata/0.17.3/caldata/.

**Observed approach.** Rust iCalendar parser with recurrence module; project describes the fork as adding stricter RFC enforcement, typed date-times, accessors, and recurrence expansion. Owner note says it diverged significantly from archived `ical-rs` and contains a slightly modified, mostly copied `rust-rrule` to do local-timezone calculations in UTC. Package docs report 17.74% item coverage at inspection.

**Applicability.** Useful pinned candidate to prototype for typed parsing/weekly expansion. The inspected public metadata does not prove it preserves every unknown property's value, parameters, order, folds, or bytes. Do not select it for round-trip editing without scoped compatibility tests.
