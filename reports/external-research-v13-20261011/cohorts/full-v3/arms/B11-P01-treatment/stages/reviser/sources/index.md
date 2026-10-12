# Reviser source index — B11-P01-treatment

Stable IDs from predecessor maps are retained without rebinding. Investigator IDs S01–S20 and critic IDs V01–V11 remain distinct even where they point to the same primary URL. Reviser-checked IDs R01–R03 record independent primary-document review of the material path-identity criticism.

| ID | Source | What it supports |
|---|---|---|
| S01–S02 | [Apple sandbox access and bookmark resolution](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox) | User-granted access, stale bookmarks, document-relative access, offline/missing behavior |
| S03, S18–S20 | [Apple file/volume/document resource identifiers](https://developer.apple.com/documentation/foundation/urlresourcekey/documentidentifierkey) | Different scopes and persistence of file, volume, document, and volume UUID hints |
| S04 | [Windows FILE_ID_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info) | Volume serial plus 128-bit file ID, same-computer scope |
| S05 | [Windows Distributed Link Tracking](https://learn.microsoft.com/en-us/windows/win32/fileio/distributed-link-tracking-and-object-identifiers) | NTFS/service/removable-media constraints |
| S06 | [Linux inode(7)](https://www.man7.org/linux/man-pages/man7/inode.7.html) | Device/inode filesystem scope |
| S07–S08 | [XDG Documents portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.Documents.html), [FileChooser portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.FileChooser.html) | Persistent sandbox permission entries and user-mediated selection |
| S09 | [RFC 8089, The file URI Scheme](https://www.rfc-editor.org/rfc/rfc8089.html) | POSIX-like, DOS, and UNC path URI forms |
| S10–S13 | [Zotero linked/stored attachments](https://www.zotero.org/support/attaching_files), [tagged 6.0.20 implementation](https://github.com/zotero/zotero/blob/6.0.20/chrome/content/zotero/xpcom/attachments.js), [6.0 release history](https://www.zotero.org/support/6.0_changelog), [issue #2084](https://github.com/zotero/zotero/issues/2084) | Link/copy distinction, base-relative records, bounded relink and cross-platform release history |
| S14 | [SQLite transactions](https://www.sqlite.org/lang_transaction.html) | Conditional single-writer persistence example |
| S15–S17 | [Apple FSEvents archive](https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/UsingtheFSEventsFramework/UsingtheFSEventsFramework.html), [Windows ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw), [Linux inotify(7)](https://www.man7.org/linux/man-pages/man7/inotify.7.html) | Watcher loss, overflow, rescan and filesystem limitations |
| V01–V11 | Critic's corresponding primary pages and released Zotero code/history | Independent critique source inspection; details/operations are in source-map.json |
| R01 | [Apple documentIdentifierKey](https://developer.apple.com/documentation/foundation/urlresourcekey/documentidentifierkey?changes=latest_minor&language=o_8) | Same-volume move/restart hint, not copied, unique per volume, not supported everywhere |
| R02 | [Microsoft FILE_ID_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info) | File ID plus volume serial compares handles on one computer |
| R03 | [Linux inode(7)](https://www.man7.org/linux/man-pages/man7/inode.7.html) | Inode uniqueness is scoped to one filesystem |

The source map carries each individual record's exact URL, version/release or living-document description, locator, access UTC, observed operation, governing conditions, and applicability. No source pages or raw captures are mirrored in this stage.
