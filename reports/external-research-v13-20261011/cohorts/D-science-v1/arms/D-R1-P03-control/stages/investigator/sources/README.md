# Source index — D-P03

Source IDs are stable within this stage and referenced from `../discovery.md` and the later `../draft.md`. URLs are kept exact. Mutable documentation/repository branches are identified as mutable in `../source-map.json`; no source ID may be rebound to a newer page silently. The access time for each source is recorded as UTC in the map.

| ID | Topic | Reviewed source |
|---|---|---|
| SRC-PY-ZIP | ZIP member CRC/header check, duplicate members, path and compression caveats | [Python 3.14.8 zipfile docs](https://docs.python.org/3.14/library/zipfile.html) |
| SRC-SQL-BACKUP | Online snapshot behavior and live-write restarts | [SQLite Online Backup API](https://sqlite.org/backup.html) |
| SRC-SQL-WAL | WAL companion file is part of persistent DB state | [SQLite WAL](https://sqlite.org/wal.html) |
| SRC-SQL-ATOMIC | Database transaction/crash atomicity scope | [SQLite Atomic Commit](https://sqlite.org/atomiccommit.html) |
| SRC-SQL-FK | Foreign-key enforcement defaults and connection scope | [SQLite Foreign Key Support](https://sqlite.org/foreignkeys.html) |
| SRC-RESTIC-BACKUP | Content deduplication and file change-detection conditions | [restic 0.19.1 backup docs](https://restic.readthedocs.io/en/stable/040_backup.html) |
| SRC-RESTIC-RESTORE | Restore overwrite defaults and interruption caveat | [restic 0.19.1 restore docs](https://restic.readthedocs.io/en/stable/050_restore.html) |
| SRC-RESTIC-CHECK | Metadata/data checks and repair sequence | [restic 0.19.1 troubleshooting](https://restic.readthedocs.io/en/stable/077_troubleshooting.html) |
| SRC-RESTIC-INTERRUPT | Interrupted backup may leave no visible snapshot (historical issue) | [restic issue #2960](https://github.com/restic/restic/issues/2960) |
| SRC-JOP-IMPORT-EXPORT | JEX/TAR and import/export semantics | [Joplin import/export docs, dev](https://github.com/laurent22/joplin/blob/dev/readme/apps/import_export.md) |
| SRC-JOP-JEX-IMPORT-DUP | JEX import can duplicate data; warning issue | [Joplin issue #14791](https://github.com/laurent22/joplin/issues/14791) |
| SRC-JOP-JEX-UNICODE | Android JEX Unicode corruption report and linked PR not inspected | [Joplin issue #9069](https://github.com/laurent22/joplin/issues/9069) |
| SRC-JOP-ABS-PATH | Absolute attachment URL and missing JEX member report | [Joplin issue #6211](https://github.com/laurent22/joplin/issues/6211) |
| SRC-JOP-ABS-PATH-FIX | Narrow fix for pasting an absolute image path between editors | [Joplin PR #6865](https://github.com/laurent22/joplin/pull/6865) |
| SRC-JOP-PATH-ISSUE | Missing-extension import failure report | [Joplin issue #12049](https://github.com/laurent22/joplin/issues/12049) |
| SRC-JOP-PATH-FIX | Merged importer path fix | [Joplin PR #12974](https://github.com/laurent22/joplin/pull/12974) |
| SRC-AGE-SPEC | Passphrase envelope: scrypt and AEAD wrapping | [age v1 format spec](https://github.com/C2SP/C2SP/blob/main/age.md) |
| SRC-AGE-CLI | Interactive passphrase and recipient/identity workflow | [age project README](https://github.com/FiloSottile/age) |

No executable archive, application, migration, or fault-injection checks were run. All validation items in the discovery and draft are proposals unless explicitly labeled otherwise.
