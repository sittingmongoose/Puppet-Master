# Source index — investigator stage

Source IDs are stable and point to records in the sibling source-map.json. Do not rebind an ID to a different URL or version.

| ID | Source | What it supports |
|---|---|---|
| S01 | [Apple macOS App Sandbox access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox) | Persisted user-granted access; document-relative bookmarks |
| S02 | [Apple bookmark resolution](https://developer.apple.com/documentation/foundation/nsurl/urlbyresolvingbookmarkdata:options:relativetourl:bookmarkdataisstale:error:) | Stale, missing, and unmountable bookmark behavior |
| S03 | [Apple file resource identifier](https://developer.apple.com/documentation/foundation/urlresourcekey/fileresourceidentifierkey) | Same-filesystem equality hint; nonpersistent across restart |
| S04 | [Windows FILE_ID_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info) | Volume + 128-bit file ID equality for open handles |
| S05 | [Windows Distributed Link Tracking](https://learn.microsoft.com/en-us/windows/win32/fileio/distributed-link-tracking-and-object-identifiers) | NTFS/service/volume/removable-media conditions |
| S06 | [Linux inode(7)](https://www.man7.org/linux/man-pages/man7/inode.7.html) | Device/inode scoping |
| S07 | [XDG Documents portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.Documents.html) | Persistent sandbox grant and permission entry |
| S08 | [XDG FileChooser portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.FileChooser.html) | User-mediated selection and file URI result |
| S09 | [RFC 8089](https://www.rfc-editor.org/rfc/rfc8089.html) | File URI syntax across POSIX, drive-letter, and UNC roots |
| S10 | [Zotero linked-file documentation](https://www.zotero.org/support/attaching_files) | Link/copy distinction and linked-base-directory portability |
| S11 | [Zotero attachments.js, release tag 6.0.20](https://github.com/zotero/zotero/blob/6.0.20/chrome/content/zotero/xpcom/attachments.js) | Concrete linked and relative-path implementation |
| S12 | [Zotero 6.0 changelog](https://www.zotero.org/support/6.0_changelog) | Shipped bounded relink and later cross-platform fix |
| S13 | [Zotero issue #2084](https://github.com/zotero/zotero/issues/2084) | Maintainer proposal and motivating user failure |
| S14 | [SQLite transactions](https://www.sqlite.org/lang_transaction.html) | Conditional concurrent-window storage behavior |

Primary-source observation only. Page copies are not mirrored here; URLs, release conditions, locators, and access metadata are in source-map.json.

## Post-plan source checks

| ID | Source | What it supports |
|---|---|---|
| S15 | [Apple File System Events guide](https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/UsingtheFSEventsFramework/UsingtheFSEventsFramework.html) | Coalescing, dropped events, rescans, root moves |
| S16 | [Windows ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw) | Buffer loss and required re-enumeration |
| S17 | [Linux inotify(7)](https://www.man7.org/linux/man-pages/man7/inotify.7.html) | Nonrecursive watches, racy renames, overflow, remote-FS limits |

| ID | Source | What it supports |
|---|---|---|
| S18 | [Apple volume identifier](https://developer.apple.com/documentation/foundation/urlresourcekey/volumeidentifierkey) | Same-volume comparison; transient across restart |
| S19 | [Apple document identifier](https://developer.apple.com/documentation/foundation/urlresourcekey/documentidentifierkey) | Same-volume ID persists and follows moves, not copies |
| S20 | [Apple volume UUID](https://developer.apple.com/documentation/foundation/urlresourcekey/volumeuuidstringkey) | Persistent UUID when available |
