# S10 — icalendar 7.3.0 implementation history

- URL: https://github.com/collective/icalendar/blob/v7.3.0/CHANGES.rst
- Version: icalendar 7.3.0, dated 2026-08-19.
- Access observation: 2026-10-10T04:00:20Z.
- Locator: release bug fixes around unknown properties, TZID vendor prefixes and parameter round-trip.

**Observed history.** The release notes say previously unrecognized and `X-` property values were changed by escaping during parse/serialize and conversion to/from jCal; the fix preserves these values verbatim. They also record a vendor-prefixed TZID treated as naive until a fix resolved its Olson identifier, and an earlier parameter loss on jCal round-trip.

**Applicability.** This is Python library history, not a defect report for Rust. It establishes that opaque-field and zone round-trip errors have occurred in real implementations. Therefore test value, parameter, timezone, and component preservation in the exact selected Rust versions.
