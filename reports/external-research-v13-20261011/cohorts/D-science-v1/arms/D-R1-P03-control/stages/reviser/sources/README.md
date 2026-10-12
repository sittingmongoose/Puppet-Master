# Source index — D-P03 reviser

This is the navigational index for the complete source records in [../source-map.json](../source-map.json). The investigator's source IDs and records are preserved; the SQLite PRAGMA source from the critic map is added under its existing ID. Reviser rechecks, access UTC, conditions, applicability, and limitations are recorded in the JSON map. No ID has been silently rebound.

| ID | Source | Primary URL |
|---|---|---|
| SRC-PY-ZIP | Python zipfile documentation | [https://docs.python.org/3.14/library/zipfile.html](https://docs.python.org/3.14/library/zipfile.html) |
| SRC-SQL-BACKUP | SQLite Online Backup API | [https://sqlite.org/backup.html](https://sqlite.org/backup.html) |
| SRC-SQL-WAL | SQLite Write-Ahead Logging | [https://sqlite.org/wal.html](https://sqlite.org/wal.html) |
| SRC-SQL-ATOMIC | Atomic Commit In SQLite | [https://sqlite.org/atomiccommit.html](https://sqlite.org/atomiccommit.html) |
| SRC-SQL-FK | SQLite Foreign Key Support | [https://sqlite.org/foreignkeys.html](https://sqlite.org/foreignkeys.html) |
| SRC-RESTIC-BACKUP | Backing up — restic | [https://restic.readthedocs.io/en/stable/040_backup.html](https://restic.readthedocs.io/en/stable/040_backup.html) |
| SRC-RESTIC-RESTORE | Restoring from backup — restic | [https://restic.readthedocs.io/en/stable/050_restore.html](https://restic.readthedocs.io/en/stable/050_restore.html) |
| SRC-RESTIC-CHECK | Troubleshooting — restic | [https://restic.readthedocs.io/en/stable/077_troubleshooting.html](https://restic.readthedocs.io/en/stable/077_troubleshooting.html) |
| SRC-RESTIC-INTERRUPT | Save an interrupted snapshot when backup is interrupted by SIGINT — restic issue #2960 | [https://github.com/restic/restic/issues/2960](https://github.com/restic/restic/issues/2960) |
| SRC-JOP-IMPORT-EXPORT | Joplin import/export documentation | [https://github.com/laurent22/joplin/blob/dev/readme/apps/import_export.md](https://github.com/laurent22/joplin/blob/dev/readme/apps/import_export.md) |
| SRC-JOP-JEX-IMPORT-DUP | Make it clear that importing a jex backup can duplicate your notes — Joplin issue #14791 | [https://github.com/laurent22/joplin/issues/14791](https://github.com/laurent22/joplin/issues/14791) |
| SRC-JOP-JEX-UNICODE | JEX export corrupts notes on Joplin for Android — issue #9069 | [https://github.com/laurent22/joplin/issues/9069](https://github.com/laurent22/joplin/issues/9069) |
| SRC-JOP-ABS-PATH | Joplin absolute resource path and missing JEX image report — issue #6211 | [https://github.com/laurent22/joplin/issues/6211](https://github.com/laurent22/joplin/issues/6211) |
| SRC-JOP-PATH-FIX | Desktop fix for files without extension — issue #12049 and PR #12974 | [https://github.com/laurent22/joplin/pull/12974](https://github.com/laurent22/joplin/pull/12974) |
| SRC-AGE-SPEC | age file format specification | [https://github.com/C2SP/C2SP/blob/main/age.md](https://github.com/C2SP/C2SP/blob/main/age.md) |
| SRC-AGE-CLI | age project README and CLI usage | [https://github.com/FiloSottile/age](https://github.com/FiloSottile/age) |
| SRC-JOP-ABS-PATH-FIX | Narrow fix for an absolute image path pasted between Joplin editors — PR #6865 | [https://github.com/laurent22/joplin/pull/6865](https://github.com/laurent22/joplin/pull/6865) |
| SRC-JOP-PATH-ISSUE | Files without extension are not imported properly — Joplin issue #12049 | [https://github.com/laurent22/joplin/issues/12049](https://github.com/laurent22/joplin/issues/12049) |
| CRIT-SQLITE-PRAGMA-INTEGRITY | Pragma statements supported by SQLite | [https://www.sqlite.org/pragma.html](https://www.sqlite.org/pragma.html) |

For criticism dispositions, independent source observations, exact locators, version/commit notes, and validation status, see the reviser_rechecks, critic_findings_disposition, and validation_status fields in the source map.
