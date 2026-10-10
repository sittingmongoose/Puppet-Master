# S05 — PREMIS Data Dictionary for Preservation Metadata v3.0

- Official page: https://www.loc.gov/standards/premis/v3/index.html
- Full document: https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf
- Released version: PREMIS v3.0; Library of Congress page identifies the full data dictionary as updated November 2015.
- Accessed: 2026-10-10T04:14:49Z.
- Locators: data model overview; PDF §1.5.2 (fixity; pp. 58–60), event entity (§2; pp. 137–157), agent relationships and event outcomes; around PDF lines 2160–2190 and 4092–4210, 4261–4306.
- Observed operation: Read official LOC page and PDF; no PREMIS serialization or validator was run.

## Evidence and applicability

PREMIS defines Objects, Events, Rights, and Agents. It treats a file's digest algorithm/value as fixity information; a later digest comparison can detect whether bytes changed since the earlier calculation. It says a fixity check and its date are recorded as an Event and its result as eventOutcome. Event records have mandatory identifier, type, and datetime, and relate to one or more Objects and optionally one or more Agents. The guidance also says some backup-copy actions may be recorded in system logs or audit trails rather than as PREMIS Event entities.

A small gallery can borrow these distinctions in a readable CSV copy/restore log, without claiming the file is PREMIS-conformant or implementing an archival metadata system. This yields a record of who did what to which asset/version/copy and the result, while a checksum only reports bit-level equality against a reference.
