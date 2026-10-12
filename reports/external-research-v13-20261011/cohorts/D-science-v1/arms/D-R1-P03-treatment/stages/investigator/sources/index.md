# Source index — D-R1-P03-treatment investigator

Source IDs are stable references in `../source-map.json`; do not silently reassign an ID when a URL changes. The locator field in that file records the exact passage/operation and its limits. Accessed 2026-10-12 UTC.

| ID | Primary source | Use in discovery |
|---|---|---|
| S01 | [SQLite Online Backup API](https://www.sqlite.org/c3ref/backup_finish.html) | Live consistent DB snapshot, lock/retry/fatal behavior |
| S02 | [SQLite WAL](https://www.sqlite.org/wal.html) | WAL sidecar semantics and dated WAL-reset fix/conditions |
| S03 | [SQLite PRAGMA reference](https://www.sqlite.org/pragma.html); [ALTER TABLE](https://sqlite.org/lang_altertable.html) | App schema marker, distinct integrity/FK checks, defaults and migration compatibility |
| S04 | [Python 3.15 zipfile](https://docs.python.org/3/library/zipfile.html) | ZIP CRC/header check, names, path-sanitization obligation |
| S05 | [Rust zip security advisory GHSA-94vh-gphv-8pm8](https://github.com/zip-rs/zip2/security/advisories/GHSA-94vh-gphv-8pm8) | Public extraction bug, applicable condition and patched release |
| S06 | [age v1.0.0 format spec](https://c2sp.org/age@v1.0.0) | Passphrase KDF, authenticated streaming and one-recipient constraints |
| S07 | [restic 0.19.1 backup docs](https://restic.readthedocs.io/en/stable/040_backup.html); [repository checks](https://restic.readthedocs.io/en/stable/045_working_with_repos.html) | Incremental/deduplicated alternative, partial read-error and check levels |
| S08 | [Rust std::fs::rename](https://doc.rust-lang.org/std/fs/fn.rename.html) | Same-volume publication and platform-specific rename limits |
| S09 | [NIST FIPS 180-4 Update 1](https://csrc.nist.gov/pubs/fips/180-4/upd1/final) | SHA-256 digest role and distinction from authenticated integrity |

No raw source code was downloaded or executed. No synthetic archive, application, migration, or user-data check was run.
