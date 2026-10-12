# Critic source index — A-F01-A8

This index retains the investigator's source IDs and exact URLs. See [source-map.json](../source-map.json) for full identity, version/commit, locator, access UTC, observed operation, scope/condition, and applicability records. IDs are not reassigned.

## Independently checked primary evidence

- **S01–S04:** SQLite WAL, atomic commit, Online Backup API, SQLite 3.54.0 release/source identity.
- **S05–S06:** SQLite tagged crash/WAL recovery test sources; treated only as examples for future validation, not as application tests.
- **S08–S10:** CouchDB conflict/revision behavior, replication/deletion/filter conditions, attachment byte-request conditions.
- **S11–S13:** PouchDB replication, conflict, and attachment guides; docs are moving and not falsely pinned to a release.
- **S14–S15:** PouchDB moving integration-test page and open deletion report. Issue #9085 is a scoped user report, not a confirmed defect. The exact cited test case is not independently line-checked here.
- **S16–S18:** Automerge conflict/merge-rule docs and release history; docs are moving and JS release context does not establish a Rust binding version.
- **S19–S21:** RFC 9562, NIST FIPS 180-4, and PouchDB release listing.

## Use boundary

The six SCW records are in [critique.md](../critique.md), with exact scope-bearing excerpts and separate relations for C/C*. No downloaded code was run. No upstream test suite, application validation, benchmark, crash test, or UI test was executed by this critic.
