# Investigator discovery — B11-P01-control

**Input boundary:** Discovered from the released brief alone. The exact plan has not been requested or read yet. Source IDs below point to the bounded index in [sources/index.md](sources/index.md); structured identities and applicability are in [source-map.json](source-map.json).

## Problem model

The feature should record a user's reference to an existing local file while keeping the notebook's reference record, the file's current location, and any evidence about the file's identity as separate concepts. A stable notebook reference ID is an app-level identity; it cannot itself locate a file. A path is a locator, not proof that the file at that path is still the same target. A file ID or content digest can add evidence, but neither is a portable location and each has platform/filesystem or cost limits.

Candidate record patterns worth comparing:

- **Simple locator:** keep the original absolute path for external files and a project-relative path for a file that is already within the project's folder tree. Relative paths can survive moving that tree when its internal structure stays intact; they do not make an unrelated external file move with the project. Keep the user-facing display name separate from the locator.
- **Mapped root:** store a relative suffix under a named base/root and let each user choose the root on their machine. Zotero's Linked Attachment Base Directory is a real example; its documentation warns that an incorrect root or an unsynced linked file leaves a link unresolved [S01, S02]. This trades simplicity for explicit per-machine setup.
- **Native resource aid:** on macOS, a bookmark can usually resolve after rename/move and a security-scoped bookmark can preserve user-granted access in a sandbox, with stale-bookmark refresh and balanced access calls [S08]. Apple's file resource identifier is explicitly not persistent across restarts [S09]. Windows exposes file ID plus volume serial, but filesystem rules and reuse matter [S10, S11]. Linux inode/device pairs are filesystem-scoped; opaque file handles have support and privilege limits [S12, S13]. These mechanisms could help confirm or recover a target locally, but they are not a single cross-platform project identity.
- **Content check:** a full hash can answer whether candidate bytes currently match a previously measured file, while saying nothing by itself about which filesystem object the user intended. Hashing large, offline, unreadable, or frequently changing files has cost and privacy implications. Treat it as a deliberate check, not an always-on requirement.

RFC 8089 defines the file URI syntax for local and non-local paths, including different POSIX and Windows forms; it is a transport representation for a locator, not a file identity scheme [S14]. Filesystem name encodings and path rules vary. Windows has drive-letter and UNC forms, component/length restrictions, and case behavior that is usually insensitive but can be configured per directory; APFS may be case-sensitive or case-insensitive [S17, S18]. Do not compare paths using one universal case-folding or Unicode-normalization rule, or assume drive letters, volume labels, mount points, timestamps, or filenames are globally stable.

## Candidate discovery and user control

A practical recovery flow can first re-check the saved locator and report what the OS actually observed. Distinguish at least: available at the saved location; path absent on an available volume; volume/device unavailable; access denied; and a path that exists but whose current identity signal differs from the one recorded. A disconnected drive is unresolved, not evidence that its file was deleted. Permission failures should not be translated into “missing.”

When the saved path no longer resolves, allow explicit user selection of a replacement and, if the user chooses, a bounded search under roots or volumes they selected. Filename, relative suffix, file kind, size and timestamps can rank candidates, but they are hints; duplicate names and file replacement make a filename match unsafe as an automatic rebinding rule. An optional content hash or native ID can strengthen a candidate report and must explain its limitations. Show old and proposed locations and relevant match evidence; require the user to confirm before changing the record. Keep the last-known locator for recovery/audit. This avoids a promise to search the whole disk and supports the brief's limits on background indexing and privileges.

Product precedent is mixed and useful: Zotero separates linked original files from managed copies, supports a per-machine base directory, and provides a manual Locate flow [S01, S02]. Its 2021 issue proposed searching the selected base directory from filename upward and offering single-file or batch repair; it was marked completed in 2022 [S04]. Current source has linked and imported paths as distinct modes, a relative-base placeholder, and a confirmation-oriented auto-relink UI [S03, S06]. Its 7.0.8 and 7.0.16 release notes record fixes for auto-relink errors and invalid relative paths while changing the base directory [S05]. Final Cut Pro offers a richer manual alternative: it initially suggests filename matches, analyzes additional attributes, lets the user remove a bad match, then requires an explicit Relink action [S07]. The locator can search more than one selected reference, but the user still gets a review step.

## Project lifecycle and integration

Project-contained references can use safe, project-relative paths when the target is actually below the project root. External references need an explicit external locator/root policy; moving a project alone cannot move those targets. A move/export preview should count external links and clearly state that they are references only. Any workflow that also packages file bytes belongs behind an explicit higher-level include/copy choice, separate from linking. The export must not imply that every target was included or available; product owners should decide whether external path details are redacted from recipient-facing manifests.

Keep attachment records in the project's existing persistence owner and expose narrow operations such as add, inspect, open, choose replacement, and enumerate export status. The filesystem adapter should own native path parsing, permission-scoped access, availability checks, identity hints, and platform error classification. It should not scan outside a user-chosen scope or copy a file as a side effect of attaching it.

Two editor windows need record-level concurrency protection. Persist edits atomically and include a record revision/expected revision so a stale window cannot silently overwrite a newer relink or deletion. Notify/reload the other window after committed edits and present a conflict when both changed the same reference. SQLite documentation confirms transaction boundaries and WAL's same-host/read-write concurrency, but WAL permits only one writer and does not itself prevent stale UI state from winning; it also cannot be used across hosts over a network filesystem [S15, S16]. The existing project storage format and cross-process synchronization contract remain unknown.

## Open decisions for the owner

1. What project persistence format and revision/locking mechanism already exists, including whether projects are shared over network filesystems?
2. Is the target desktop build sandboxed on macOS, and which minimum OS/filesystem versions must be supported?
3. Which external roots may users explicitly search, and should removable/network volumes have separately named mappings?
4. Which candidate evidence should be collected by default (path only, native identity hints, metadata, optional full hash), and what file sizes/privacy limits apply?
5. Does export only report linked targets, or may a separate owner-level export action explicitly include selected files? Should recipients ever receive external paths?

## Work performed and limits

Primary documentation, official API references, upstream source at an identified commit, and release/issue history were read. No application code, downloaded code, or executable witness was run; no product was built or deployed. The exact plan remains unread at this phase. These are discovery options and conditions, not per-clause dispositions.
