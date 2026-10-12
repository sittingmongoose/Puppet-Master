# Critic source index

Reviewer-created IDs V01–V11 identify the exact primary pages and released code inspected by this critic. These IDs are local to the critic source map and do not rebind investigator IDs S01–S20. Browser retrieval or indexed text is documented per record, including direct-fetch limits.

| ID | Source and locator | Supports |
|---|---|---|
| V01 | [Apple macOS App Sandbox access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox?changes=_4), bookmark and document-relative bookmark sections | Persistent user-granted access; scope, stale refresh, and project-relative permission handling |
| V02 | [Apple documentIdentifierKey](https://developer.apple.com/documentation/foundation/urlresourcekey/documentidentifierkey?changes=latest_minor&language=o_8), Discussion | Same-volume move/restart hint; copy, volume, and support limits |
| V03 | [Apple volumeUUIDStringKey](https://developer.apple.com/documentation/foundation/urlresourcekey/volumeuuidstringkey?changes=_7), definition | Persistent volume UUID only when available |
| V04 | [Windows FILE_ID_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info), Members | Same-computer volume plus 128-bit file ID comparison |
| V05 | [Windows ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw), Parameters and Remarks | Watch subtree choice; buffer loss and enumeration recovery |
| V06 | [Linux inotify(7)](https://www.man7.org/linux/man-pages/man7/inotify.7.html), DESCRIPTION and limitations | Watch/event model; search-indexed text inspected after direct fetch timed out |
| V07 | [Zotero attachments.js, release 6.0.20](https://github.com/zotero/zotero/blob/6.0.20/chrome/content/zotero/xpcom/attachments.js), linkFromFile and linkFromFileWithRelativePath | Version-pinned linked and base-relative implementation |
| V08 | [Zotero 6.0 Version History](https://www.zotero.org/support/6.0_changelog), releases 6.0.16 and 6.0.20 | Shipped bounded relink offer and cross-platform correction |
| V09 | [SQLite Transactions](https://www.sqlite.org/lang_transaction.html), §§2.1–2.2 | Single-writer/read-snapshot semantics and conditional storage example |
| V10 | [Windows Distributed Link Tracking](https://learn.microsoft.com/en-us/windows/win32/fileio/distributed-link-tracking-and-object-identifiers), Link Tracking Limitations | NTFS/service scope and removable-media limitation |
| V11 | [Apple File System Events guide](https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/UsingtheFSEventsFramework/UsingtheFSEventsFramework.html), event handling and snapshot sections | Coalescing, loss, rescans; archived document, updated 2012 |

Full URL, version/release, access time, observed operation, governing condition, and applicability are in the sibling source-map.json.