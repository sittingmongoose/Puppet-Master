# Sources index — B11-P01-control investigator discovery

Discovery access batch: 2026-10-12T01:14:40Z. Upstream Zotero main was separately resolved read-only to commit 44fe83d98bcf9b982b74782dcc5f824c8ab9cb43 at 2026-10-12T01:08:50Z; see S03 and S06. Each entry names the exact URL, release/version/commit context, locator, access time, operation, conditions, and applicability. This index is limited to sources actually consulted. No downloaded source code was executed.

## Product patterns and implementation history

- [S01 — Zotero linked versus stored files](https://www.zotero.org/support/attaching_files): linked entries point to originals; stored entries copy into managed storage. Current page updated 2025-09-11; exact sections/lines and limits in source-map.
- [S02 — Zotero missing linked-file recovery](https://www.zotero.org/support/kb/missing_linked_file): move/delete, base-directory misconfiguration, external-sync lag; Locate flow. Last updated 2019-10-18.
- [S03 — Zotero attachment code at pinned commit](https://github.com/zotero/zotero/blob/44fe83d98bcf9b982b74782dcc5f824c8ab9cb43/chrome/content/zotero/xpcom/attachments.js): separate imported/linked operations and base-relative attachments: path.
- [S04 — Zotero issue #2084](https://github.com/zotero/zotero/issues/2084): bounded search/confirmation proposal, opened 2021-06-11 and closed as completed 2022-10-08; no linked PR shown.
- [S05 — Zotero 7.0 version history](https://github.com/zotero/zotero-docs/blob/main/content/7.0_changelog.md): 7.0.8 auto-relink bug fix; 7.0.16 invalid relative-path fix on base-directory change.
- [S06 — Zotero relink UI strings at pinned commit](https://github.com/zotero/zotero/blob/44fe83d98bcf9b982b74782dcc5f824c8ab9cb43/chrome/locale/en-US/zotero/zotero.properties): same-name candidate disclosure and Relink / Relink All / Locate Manually choices.
- [S07 — Final Cut Pro relink workflow](https://support.apple.com/en-euro/guide/final-cut-pro/ver26f5c8c9/mac): filename suggestions, attribute analysis, user removal of wrong match, explicit non-undoable Relink Files operation.

## Operating-system and file-identity references

- [S08 — Apple NSURL bookmarks and security scope](https://developer.apple.com/documentation/Foundation/NSURL): bookmark move/rename continuity is described as usual, with security-scoped access management requirements.
- [S09 — Apple fileResourceIdentifierKey](https://developer.apple.com/documentation/foundation/urlresourcekey/fileresourceidentifierkey): resource identifier is usable for comparisons but not persistent across restarts.
- [S10 — Windows FILE_ID_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info): 128-bit file ID + volume serial for same-computer comparison.
- [S11 — Windows BY_HANDLE_FILE_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/ns-fileapi-by_handle_file_information): IDs vary/reuse by filesystem; FAT/NTFS behaviors and timestamp precision caveats.
- [S12 — Linux inode(7)](https://www.man7.org/linux/man-pages/man7/inode.7.html): device and inode information; inode numbers unique only within a filesystem.
- [S13 — Linux open_by_handle_at(2)](https://www.man7.org/linux/man-pages/man2/open_by_handle_at.2.html): filesystem support, stale handles, and capability requirement.
- [S14 — RFC 8089 file URI scheme](https://www.rfc-editor.org/info/rfc8089/): local/non-local locator forms and POSIX/Windows encoding/path differences; no identity guarantee.
- [S17 — Microsoft path and naming rules](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file): drive letters, UNC, filesystem-specific component rules, and case behavior.
- [S18 — Apple APFS FAQ](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/FAQ/FAQ.html): case-sensitive and case-insensitive APFS variants.

## Persistence and concurrency references

- [S15 — SQLite transactions](https://www.sqlite.org/lang_transaction.html): transaction boundaries.
- [S16 — SQLite WAL](https://www.sqlite.org/wal.html): reader/writer behavior, one writer, same-host requirement, and network-filesystem limitation.

For the full source identity, evidence condition, and applicability record for each ID, see [source-map.json](../source-map.json).
