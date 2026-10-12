# Reviser source index

The full source identity records, access windows, conditions, applicability, and limits are in [source-map.json](../source-map.json). Source IDs remain tied to their original stage and are not rebound.

## Source groups

- **R01–R02 — reviser primary rechecks:** Current official SQLite WAL and PRAGMA documentation opened 2026-10-12. R01 checks the WAL-reset version gate; R02 checks synchronous-mode power-loss statements.
- **C01–C12 — critic-stage independent checks:** SQLite WAL/synchronous/session/copy behavior; CouchDB conflict and attachment issue/fix/release history; Automerge merge/API and pinned implementation/tests.
- **S01–S21 — investigator-stage research:** SQLite local storage, backup, session, crash-test-source and release material; CouchDB conflict/replication/source/issue/fix evidence; Automerge docs, pinned implementation and tests.
- **P2 attachment navigation:** Use S13 (CouchDB issue #6126) and S14 (fix PR #6129) directly; S12 is the 3.5.3 release note.
- **Automerge version note:** S16 is retained as originally recorded. C10 separately records the mutable conflict API page as v3.5.0; use pinned S19–S20 for v3.4.1 implementation/test claims.

No source-code test, application run, benchmark, crash harness, or user study is claimed as executed here.
