# Critic source index — D-R1-P03-treatment

Stable source IDs map to the critic's [source-map.json](../source-map.json). S01–S09 retain the investigator's source meanings. S10–S13 add a current age specification and separate primary pages; no existing ID was silently rebound. Accessed/checked by 2026-10-12T04:27:15Z.

| ID | Primary source | Use and scope |
|---|---|---|
| S01 | [SQLite Online Backup API](https://www.sqlite.org/c3ref/backup_finish.html) | Point-in-time database copy behavior, source locks, retries/fatal errors, destination connection boundary. SQLite only. |
| S02 | [SQLite WAL](https://www.sqlite.org/wal.html) | WAL persistence and the narrow WAL-reset corruption condition/fixed releases. SQLite WAL only. |
| S03 | [SQLite PRAGMA reference](https://www.sqlite.org/pragma.html) | user_version, integrity_check, foreign_key_check, foreign_keys behavior/default. SQLite only. |
| S04 | [Python 3.15 zipfile](https://docs.python.org/3/library/zipfile.html) | testzip CRC/header scope and zipfile.Path sanitization responsibility; Python implementation reference only. |
| S05 | [Rust zip advisory GHSA-94vh-gphv-8pm8](https://github.com/zip-rs/zip2/security/advisories/GHSA-94vh-gphv-8pm8) | Symlink-then-traversal extraction flaw, affected and patched versions. Directly conditional on crate/version; otherwise a regression-test case. |
| S06 | [age format v1.0.0](https://c2sp.org/age@v1.0.0) | The investigator’s pinned versioned reference: scrypt, AEAD chunks, final-chunk and sole-scrypt-stanza rules. The page now labels itself an older edition. |
| S07 | [restic 0.19.1 backup docs](https://restic.readthedocs.io/en/stable/040_backup.html) | Deduplication/snapshot model and incomplete-snapshot exit status for source read errors. Alternative, not selected product. |
| S08 | [Rust std::fs::rename](https://doc.rust-lang.org/std/fs/fn.rename.html) | Same-filesystem requirement and Unix/Windows replacement behavior. Conditional on Rust std and platform. |
| S09 | [NIST FIPS 180-4 Update 1](https://csrc.nist.gov/pubs/fips/180-4/upd1/final) | Standard hash digest purpose; digest alone does not identify a source. |
| S10 | [age format v1.1.0](https://c2sp.org/age@v1.1.0) | Current edition observed from the v1.0 page; independently checked passphrase stanza, header and payload conditions. Adds tagged types; scrypt remains sole stanza when used. |
| S11 | [SQLite ALTER TABLE](https://sqlite.org/lang_altertable.html) | Separate companion page for version-sensitive rename semantics and migration guidance. SQLite only. |
| S12 | [restic 0.19.1 repository checks](https://restic.readthedocs.io/en/stable/045_working_with_repos.html) | Repository structural check versus full --read-data verification. Alternative repository only. |
| S13 | [SQLite VACUUM](https://www.sqlite.org/lang_vacuum.html) | VACUUM INTO yields a consistent DB snapshot but interrupted output may be incomplete/corrupt; durability after completion has stated sync assumptions. SQLite only. |

No source code was downloaded or executed. No archive, application, migration, storage, fault-injection, or user-data check was run by this critic.
