# Sources index — revised B11-P01-control

Each ID remains bound to its original URL/source. The structured [source map](../source-map.json) records the full exact identity, version or commit, locator, access timestamp/window, observed operation, source condition/default/exception, applicability, and critic/reviser review status. The reviewer web tool did not provide per-request timestamps for the reviser batch, so those new records carry the bounded window 2026-10-12T01:36:01Z–2026-10-12T01:36:35Z.

### S01

**Adding Files to your Zotero Library** — [https://www.zotero.org/support/attaching_files](https://www.zotero.org/support/attaching_files)

- Version or commit: Living Zotero support page; page says last updated 2025-09-11; no app release selector.
- Locator: Sections “Stored Files and Linked Files” and “Adding linked files,” rendered lines 72-103; “Accessing Files,” lines 105-109.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the official Zotero support page and read its linked-versus-stored behavior and attach controls.
- Governing condition/default/exception: Stored files are the default and are copied into Zotero storage; linked files keep a link to the original, are not synced or deleted with the library item, and can use a linked attachment base directory for per-computer path differences.
- Applicability: Useful product precedent for explicit copy versus link semantics, portability trade-offs, and UI wording. Its sync/group-library constraints are Zotero-specific.
- Critic recheck: directly_rechecked; Official Zotero page confirms stored-file copy behavior, link-to-original behavior, and per-computer linked base directory; lines 62-76, 91-103.

### S02

**Why can’t Zotero find a linked file?** — [https://www.zotero.org/support/kb/missing_linked_file](https://www.zotero.org/support/kb/missing_linked_file)

- Version or commit: Living Zotero support page; last updated 2019-10-18.
- Locator: “Why can’t Zotero find a linked file?” numbered causes and recovery, rendered lines 54-62.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the official missing-linked-file guidance and read its failure cases and Locate guidance.
- Governing condition/default/exception: The documented causes include external move/delete, incorrectly configured base directory, and a linked file not synced by Zotero; the suggested path recovery is to find it and use Locate.
- Applicability: Evidence for distinct missing, configuration, and transfer causes; supports explicit relink. Page is older and does not specify current implementation internals.
- Critic recheck: directly_rechecked; Official recovery page confirms move/delete, wrong base directory, and unsynced-link causes plus Locate recovery; lines 54-60.

### S03

**Zotero attachment implementation: attachments.js** — [https://github.com/zotero/zotero/blob/44fe83d98bcf9b982b74782dcc5f824c8ab9cb43/chrome/content/zotero/xpcom/attachments.js](https://github.com/zotero/zotero/blob/44fe83d98bcf9b982b74782dcc5f824c8ab9cb43/chrome/content/zotero/xpcom/attachments.js)

- Version or commit: Upstream zotero/zotero main HEAD observed by read-only git ls-remote as commit 44fe83d98bcf9b982b74782dcc5f824c8ab9cb43 at 2026-10-12T01:08:50Z; no release tag asserted.
- Locator: LINK_MODE_* and BASE_PATH_PLACEHOLDER around lines 2232-2245; importFromFile around 2278-2422; linkFromFile around 2491-2545; linkFromFileWithRelativePath around 2566-2636.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the exact commit-pinned source and inspected mode constants, distinct import/link entry points, and relative-path processing. No code was executed.
- Governing condition/default/exception: The code distinguishes imported from linked attachment modes. Relative linked paths are prefixed with attachments: and resolved against a configured base directory; indexing is conditional on the base directory and file being present.
- Applicability: Concrete implementation example for keeping copy/import and reference/link operations distinct and making root-relative paths explicit. It is Zotero's implementation, not a standard.
- Critic recheck: directly_rechecked_partial; Pinned commit confirms imported/linked mode constants and relative-path linked operation requiring configured base directory and existing file; lines 2232-2245 and 2566-2636.

### S04

**Automatically relocate linked files within current base directory (#2084)** — [https://github.com/zotero/zotero/issues/2084](https://github.com/zotero/zotero/issues/2084)

- Version or commit: Issue opened 2021-06-11; closed as completed 2022-10-08; GitHub page reports no linked branch or pull request.
- Locator: Description and proposed search at rendered lines 151-163; status/activity at lines 184-226.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the upstream issue and read its problem statement, proposed filename/ancestor search, user confirmation, and closure activity.
- Governing condition/default/exception: The proposal applies when an absolute linked path fails and the user has a linked attachment base directory; proposed search begins with filename then successive parent folders and offers single/all repairs after showing candidate count.
- Applicability: Real product history supporting bounded root search and confirmation. Closure is not itself proof of the exact shipped implementation; current source/UI is separate evidence.
- Critic recheck: directly_rechecked; Issue confirms proposed filename/parent search under configured base directory, confirmation, and closure as completed; activity shows no branch or pull request.

### S05

**Zotero 7.0 Version History** — [https://github.com/zotero/zotero-docs/blob/main/content/7.0_changelog.md](https://github.com/zotero/zotero-docs/blob/main/content/7.0_changelog.md)

- Version or commit: Version-specific release entries 7.0.8 (2024-10-18) and 7.0.16 (2025-06-21); changelog page itself is living.
- Locator: 7.0.8 bug-fix list at rendered lines 511-520; 7.0.16 fixes at lines 314-321.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the official project changelog and used exact-text search to locate two attachment-path history entries.
- Governing condition/default/exception: 7.0.8 records a fix for a potential auto-relink error; 7.0.16 records ignoring an invalid relative path while changing the linked attachment base directory.
- Applicability: Shows the edge cases that required release fixes. Release notes describe fixes, not the underlying root cause or a guarantee against recurrence.
- Critic recheck: not_rechecked_by_critic; Not needed to decide a material disposition; retained exact upstream version-history identity from investigator map.

### S06

**Zotero linked-attachment user messages in upstream source** — [https://github.com/zotero/zotero/blob/44fe83d98bcf9b982b74782dcc5f824c8ab9cb43/chrome/locale/en-US/zotero/zotero.properties](https://github.com/zotero/zotero/blob/44fe83d98bcf9b982b74782dcc5f824c8ab9cb43/chrome/locale/en-US/zotero/zotero.properties)

- Version or commit: Same upstream commit 44fe83d98bcf9b982b74782dcc5f824c8ab9cb43 as S03; no release tag asserted.
- Locator: File-not-found, auto-relink and manual-locate strings at lines 2865-2893.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the commit-pinned English locale source and inspected the missing and auto-relink messages.
- Governing condition/default/exception: The message describes an exact-path miss plus a same-name file under the configured base directory, then offers Relink, Relink All, and Locate Manually.
- Applicability: UI-source evidence for candidate review and explicit confirmation; strings alone do not establish all search or matching logic.
- Critic recheck: directly_rechecked; Pinned locale source confirms same-name base-directory disclosure and Relink, Relink All, Locate Manually labels; strings do not establish matching implementation.

### S07

**Relink clips to media files in Final Cut Pro for Mac** — [https://support.apple.com/en-euro/guide/final-cut-pro/ver26f5c8c9/mac](https://support.apple.com/en-euro/guide/final-cut-pro/ver26f5c8c9/mac)

- Version or commit: Apple Final Cut Pro for Mac user-guide page with URL token ver26f5c8c9; page does not state an app release number.
- Locator: Relink clips procedure, rendered lines 645-699; filename matching, attribute analysis and explicit Relink Files action at lines 677-699.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the official user-guide procedure for missing/renamed externally linked media.
- Governing condition/default/exception: The user chooses a file/folder; preliminary candidates use filenames and directory proximity; the app analyzes further attributes, lets the user remove bad matches, and commits only when Relink Files is selected. The command is not undoable.
- Applicability: Cross-platform attachment analogy for reviewed, evidence-bearing relink. Media-specific frame-rate/channel criteria should not be copied wholesale.
- Critic recheck: directly_rechecked_partial; Apple user guide confirms filename/directory-proximity candidate generation and a subsequent attribute analysis/review; exact final confirmation control was not fully visible in the opened excerpt.

### S08

**NSURL bookmarks and security-scoped file access** — [https://developer.apple.com/documentation/Foundation/NSURL](https://developer.apple.com/documentation/Foundation/NSURL)

- Version or commit: Current Apple Developer documentation page; bookmark API notes security-scoped bookmarks unavailable before macOS 10.7.3; no current SDK version selector.
- Locator: Sections Bookmarks and Security Scope, Security-Scoped URLs, and Working with Bookmark Data; Apple page search/open content.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Read the official Foundation URL bookmark documentation.
- Governing condition/default/exception: A bookmark usually survives move/rename/relaunch/restart. Sandboxed apps use security-scoped bookmarks for persistent user-granted access; resolved scoped URLs require balanced start/stop access calls. Usually is not an unconditional guarantee.
- Applicability: A strong macOS-specific relocation/access adapter; not a portable project-wide file identifier.
- Critic recheck: directly_rechecked; Apple Foundation documentation confirms bookmark usually survives moves/renames and restart; sandbox access uses security-scoped bookmarks with start/stop access calls.

### S09

**URLResourceKey.fileResourceIdentifierKey** — [https://developer.apple.com/documentation/foundation/urlresourcekey/fileresourceidentifierkey](https://developer.apple.com/documentation/foundation/urlresourcekey/fileresourceidentifierkey)

- Version or commit: Current Apple Developer Foundation API documentation; no OS release selector.
- Locator: Discussion for fileResourceIdentifierKey and related file resource keys.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Read the official Foundation API reference via indexed documentation content.
- Governing condition/default/exception: The resource identifier can compare resources, including same path or paths to the same inode on a filesystem, but the value is not persistent across system restarts.
- Applicability: Evidence against treating this specific Apple resource ID as a durable cross-session key; platform details must be verified for supported OS/filesystem versions.
- Critic recheck: honestly_unresolved_external_input; Apple page required JavaScript; attempted Markdown/API JSON retrieval did not expose this specific API entry. Restart persistence claim remains inherited evidence, not independently confirmed here.
- Reviser recheck: directly_rechecked_by_reviser; Apple Developer's API page was returned and reviewed directly. It says the value can compare same-path or same-inode resources on one filesystem and is not persistent across system restarts.

### S10

**FILE_ID_INFO (winbase.h)** — [https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info)

- Version or commit: Microsoft Learn page last updated 2024-02-22; requirements table lists Windows Server 2012 (desktop apps only).
- Locator: Structure members and uniqueness semantics, rendered lines 24-49.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened Microsoft Learn API reference.
- Governing condition/default/exception: FILE_ID_INFO combines a volume serial number with a 128-bit file ID; Microsoft says the pair identifies a file on one computer and can compare two open handles.
- Applicability: Windows-local identity hint for comparing currently accessible candidates; not a cross-machine identity or a path.
- Critic recheck: directly_rechecked; Microsoft Learn confirms volume serial + 128-bit file ID pair for same-computer comparison of open handles; last-updated date matches inherited map.

### S11

**BY_HANDLE_FILE_INFORMATION (fileapi.h)** — [https://learn.microsoft.com/en-us/windows/win32/api/fileapi/ns-fileapi-by_handle_file_information](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/ns-fileapi-by_handle_file_information)

- Version or commit: Microsoft Learn page last updated 2021-04-02; supported client Windows XP desktop apps and server Windows Server 2003 per page.
- Locator: File ID remarks, filesystem caveats, and time precision, rendered lines 79-93.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the official structure reference and read filesystem-specific ID behavior.
- Governing condition/default/exception: IDs are filesystem-specific, may be reused or change; FAT IDs can change during rename/defragmentation; NTFS keeps an ID until deletion; timestamps differ in availability and precision by filesystem.
- Applicability: Strong evidence that IDs and timestamps need a source-filesystem field and cannot be treated as universal durable identity.
- Critic recheck: directly_rechecked; Microsoft Learn confirms filesystem-specific ID reuse/change and timestamp availability/precision differences.

### S12

**inode(7) Linux manual page** — [https://www.man7.org/linux/man-pages/man7/inode.7.html](https://www.man7.org/linux/man-pages/man7/inode.7.html)

- Version or commit: Linux man-pages 6.19 dated 2026-02-08 in indexed page content.
- Locator: Description entries for stat.st_dev and stat.st_ino; online man page.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Queried and read indexed man-pages content; direct browser open timed out, so the retained evidence is the returned primary-manual page content.
- Governing condition/default/exception: Inode numbers are unique only within one filesystem; device major/minor identify the hosting device for the stat result.
- Applicability: Linux identity hints must include filesystem/device context and remain advisory across copies, mounts, and filesystems.
- Critic recheck: honestly_unresolved_external_input; Direct Linux man-pages fetch timed out twice. Inode/device claim remains inherited evidence, not independently confirmed here.
- Reviser recheck: directly_rechecked_by_reviser; Linux man-pages inode(7) was returned and reviewed directly. It says inode numbers are unique only within a filesystem and identifies st_dev device context.

### S13

**open_by_handle_at(2) Linux manual page** — [https://www.man7.org/linux/man-pages/man2/open_by_handle_at.2.html](https://www.man7.org/linux/man-pages/man2/open_by_handle_at.2.html)

- Version or commit: Current online Linux man-pages entry; page reports Linux history from 2.6.39 / glibc 2.14.
- Locator: name_to_handle_at() and open_by_handle_at() descriptions, NOTES, and VERSIONS.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Read the primary man-page search result describing file-handle support and access conditions.
- Governing condition/default/exception: Some filesystems do not support handle translation/open; handles can become stale; reopening by handle requires CAP_DAC_READ_SEARCH.
- Applicability: A stronger Linux mechanism cannot be a baseline requirement under the brief's no-elevation constraint.
- Critic recheck: honestly_unresolved_external_input; Direct Linux man-pages fetch timed out twice. Filesystem support/stale handle/capability claim remains inherited evidence, not independently confirmed here.
- Reviser recheck: directly_rechecked_by_reviser; Linux man-pages open_by_handle_at(2) was returned and reviewed directly. It documents unsupported filesystem cases, stale handles, and CAP_DAC_READ_SEARCH for opening by handle.

### S14

**RFC 8089: The file URI Scheme** — [https://www.rfc-editor.org/info/rfc8089/](https://www.rfc-editor.org/info/rfc8089/)

- Version or commit: RFC 8089, Standards Track, February 2017.
- Locator: File-system name encoding at RFC pp. 4-5; local and non-local URI forms and Windows drive/UNC cases at pp. 16-18; rendered lines 303-347 and 713-722, 965-1005.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened the RFC Editor text and read the normative syntax and path-encoding discussion.
- Governing condition/default/exception: The URI scheme represents local and non-local locations, with POSIX/Windows variants and encoding concerns; treating non-local URIs as local can be unsafe.
- Applicability: Useful interop syntax evidence only. A file URI does not assert that the target exists, is accessible, or has the same identity.
- Critic recheck: directly_rechecked_partial; RFC 8089 confirms file URI syntax/path variants and warns that filesystem case/encoding/Unicode behavior varies; the distinction between a locator and identity is a design inference, not an RFC guarantee.

### S15

**SQLite Transaction** — [https://www.sqlite.org/lang_transaction.html](https://www.sqlite.org/lang_transaction.html)

- Version or commit: Current SQLite documentation; no specific library build version selected.
- Locator: Transactions, especially implicit and explicit transaction behavior, rendered lines 30-37.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened SQLite's official transaction documentation.
- Governing condition/default/exception: Database reads and writes occur within transactions; commands start implicit transactions when none is active.
- Applicability: A transaction is an implementation option for atomic record edits; it does not define the notebook's project-store format.
- Critic recheck: directly_rechecked; SQLite documentation confirms commands run in transactions and transactions define atomic boundaries; it does not supply stale-window conflict detection.

### S16

**SQLite Write-Ahead Logging** — [https://www.sqlite.org/wal.html](https://www.sqlite.org/wal.html)

- Version or commit: Current SQLite documentation; WAL is documented as available beginning in SQLite 3.7.0 (2010-07-21).
- Locator: Overview/concurrency at rendered lines 61-72 and 97-99; network/same-host restriction at lines 72 and 97.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened SQLite WAL documentation and searched for writer, same-host, and network-filesystem constraints.
- Governing condition/default/exception: Readers and a writer can proceed concurrently, only one writer may append at a time, all processes must share one host, and WAL does not work over a network filesystem.
- Applicability: For two windows on one local host, WAL may support readers alongside a writer; a record revision check is still needed for stale windows. Do not assume it works for projects on network storage.
- Critic recheck: directly_rechecked; SQLite WAL documentation confirms same-host/network-filesystem restriction and one writer at a time with concurrent readers.

### S17

**Naming Files, Paths, and Namespaces** — [https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file)

- Version or commit: Current Microsoft Learn Win32 documentation; no single Windows release selector.
- Locator: Path forms, volume designators, case rules, character/path constraints, rendered lines 37-65 and 99-112.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Opened Microsoft Learn file naming reference.
- Governing condition/default/exception: Windows supports drive-letter and UNC paths; volume letters are case-insensitive; filesystem component rules differ; default case assumptions should be avoided and NTFS can support case sensitivity.
- Applicability: Path parsing/serialization and candidate comparison must be platform/filesystem aware.
- Critic recheck: directly_rechecked; Microsoft Learn confirms paths are location strings, drive-letter/UNC forms, filesystem-specific component rules, and case sensitivity must not be assumed.

### S18

**Apple File System FAQ** — [https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/FAQ/FAQ.html](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/FAQ/FAQ.html)

- Version or commit: Apple APFS archived guide; page is an older guide, not a current OS-version guarantee.
- Locator: APFS case-sensitivity FAQ entry.
- Access UTC: 2026-10-12T01:14:40Z
- Observed operation: Read indexed Apple archive documentation for APFS volume variants.
- Governing condition/default/exception: APFS has case-sensitive and case-insensitive macOS variants; case-insensitive is the usual default on macOS.
- Applicability: Illustrates that even one OS can have different path-comparison semantics; confirm current target matrix before implementation.
- Critic recheck: directly_rechecked; Apple archived APFS FAQ confirms macOS has case-sensitive and case-insensitive variants; older-page and version limits are preserved.

### S19

**URL.resolvingSymlinksInPath** — [https://developer.apple.com/documentation/foundation/nsurl/resolvingsymlinksinpath?changes=_1_8](https://developer.apple.com/documentation/foundation/nsurl/resolvingsymlinksinpath?changes=_1_8)

- Version or commit: Current Apple Foundation API documentation result; no OS release selector.
- Locator: Property discussion for the file URL's symbolic-link resolution and unresolved links.
- Access UTC: 2026-10-12T01:36:01Z–2026-10-12T01:36:35Z
- Observed operation: Searched and reviewed the official Apple Developer page returned by the web tool.
- Governing condition/default/exception: The returned URL points to the same resource without symbolic links when they can be resolved; links that cannot be resolved remain in the result. It applies to file URLs.
- Applicability: Supports an Apple-specific containment check, but does not define how this product should treat Finder alias files or prove one portable containment algorithm.

### S20

**realpath(3) Linux manual page** — [https://www.man7.org/linux/man-pages/man3/realpath.3.html](https://www.man7.org/linux/man-pages/man3/realpath.3.html)

- Version or commit: Linux man-pages 6.19 dated 2026-02-08.
- Locator: Description, return value, and errors for realpath().
- Access UTC: 2026-10-12T01:36:01Z–2026-10-12T01:36:35Z
- Observed operation: Searched and reviewed the primary Linux man-pages result.
- Governing condition/default/exception: When successful, realpath resolves symbolic links and dot/dot-dot components into a canonical absolute path. It can fail for denied access, missing components, loops, I/O errors, or length limits.
- Applicability: Supports Linux-specific containment checks while highlighting why an unresolvable path must remain unknown; not a cross-platform policy.

### S21

**GetFinalPathNameByHandleW function** — [https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew)

- Version or commit: Microsoft Learn page last updated 2023-02-09; requirements list Windows Vista/Server 2008 minimum.
- Locator: Return errors and Remarks, including final-path resolution and SMB normalized-name caveat, rendered lines 103-121.
- Access UTC: 2026-10-12T01:36:01Z–2026-10-12T01:36:35Z
- Observed operation: Opened and read the official Microsoft Learn API reference.
- Governing condition/default/exception: The function retrieves a final path from an open handle and defines a final path as fully resolved; SMB normalized path queries may fail on access-denied components, and drive/volume path forms depend on flags and mount-manager behavior.
- Applicability: Supports a handle-based Windows path-resolution option with explicit SMB and volume-name limits; it does not establish a portable relative-path algorithm.

### S22

**Reparse points** — [https://learn.microsoft.com/en-us/windows/win32/fileio/reparse-points](https://learn.microsoft.com/en-us/windows/win32/fileio/reparse-points)

- Version or commit: Microsoft Learn page last updated 2025-07-09.
- Locator: Overview and reparse-point restrictions, rendered lines 30-47.
- Access UTC: 2026-10-12T01:36:01Z–2026-10-12T01:36:35Z
- Observed operation: Opened and read Microsoft Learn's Win32 reparse-point overview.
- Governing condition/default/exception: Reparse-point data is interpreted through a file-system filter; NTFS links and mounted folders are examples. Opening behavior depends on supported tags/filters and paths have reparse-count limits.
- Applicability: Evidence that Windows path indirection includes more than ordinary path strings; the component must resolve supported cases or treat them as external/unknown.

### S23

**Symbolic links** — [https://learn.microsoft.com/en-us/windows/win32/fileio/symbolic-links](https://learn.microsoft.com/en-us/windows/win32/fileio/symbolic-links)

- Version or commit: Microsoft Learn page last updated 2025-07-08; page says symbolic links are available in NTFS starting with Windows Vista.
- Locator: Definition and supported operating systems, rendered lines 31-47.
- Access UTC: 2026-10-12T01:36:01Z–2026-10-12T01:36:35Z
- Observed operation: Opened and read the official Microsoft Learn symbolic-link overview.
- Governing condition/default/exception: A symbolic link is a filesystem object that points to a target object and is presented transparently to users and applications.
- Applicability: Supports the need to consider the target separately from the selected link path on Windows; does not resolve the product's alias and export policy.
