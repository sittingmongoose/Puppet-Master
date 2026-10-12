# Durable references to local project attachments

**Run/stage:** B11-P01-treatment / reviser  
**Plan reviewed:** one-shot plan released at 2026-10-12T01:09:41.364Z; SHA-256 8fb50111ed44f6ff62a1041cfb9f2fb39d9787599ad24efcadaa3d45e02e8353 (1,683 bytes).  
**Recommendation status:** research-backed component proposal; no application implementation or runtime behavior is claimed.

## Recommendation and scope

Build a project-owned attachment-reference component that records a user's deliberate link to an existing local file. Keep the project record, a locator to the file, and optional observations about the file as separate concepts. A record ID remains stable when the locator is deliberately changed. A path answers “where should the app look?”; a path or file-system ID does not universally prove “is this the same object?” or “is this the file the user meant?”

Use a project-relative locator for a file inside the project tree when it is expected to move with it. Offer a configured local base-root plus relative suffix for external attachment trees whose layout is deliberately shared across machines. Keep a clearly machine-local absolute locator as an honest fallback and last-known path. Preserve enough platform-native path information to round-trip it; do not normalize one operating system's paths as if all systems shared the same roots. File URIs encode several different root forms and are interchange syntax, not identity [S09].

The common user flow should be consistent across desktop systems, while platform adapters handle chooser results, permission grants, path syntax, and optional identity observations. Linking must not copy, move, rename, delete, index globally, upload, or change the source file. Do not require elevated privileges, an always-running whole-disk index, or a cloud account. The component is not a general file manager and does not promise recovery of every reference.

**Recommended reference semantics:** a reference is path-following: it opens the current target at its active locator, and does not promise an immutable object identity across copies, file systems, machines, or unsupported APIs. When a supported stored object identifier positively conflicts with the current target, mark an identity mismatch, do not silently open or rewrite the locator, and ask before opening the current path once or explicitly relinking. When a comparison identifier is unavailable, show “identity unverified”; path resolution can proceed, but the UI must not claim same-object verification. Owners should confirm whether they want this path-following default or a stricter same-object mode.

## Component proposal

### Reference record and locator

Keep a stable reference UUID, display label, link mode, locator kind, anchor/root ID, relative suffix or native absolute path, last-known display path, status and last-check time, and a revision token in the project's persistence model. Preserve limited old-locator history for undo/audit after confirmed relink. Keep size, modification time, digest, and OS file/volume identifiers as optional, time-stamped observations with their algorithm/API and scope; none replaces the locator. A digest is optional candidate evidence, not identity: it can cost substantial I/O, go stale after edits, and match byte-identical copies.

Resolve the active locator using its anchor, obtain the required user-granted access, then check file-openability and any applicable identity observation. Resolve project-relative locators against the current project root and configured-root locators against the user's selected mapping. An absolute path is machine-local. Keep the last-known locator when resolution fails. A file picker or drag/drop supplies a deliberate selection; expose separate “Link existing file” and any managed-copy action.

### Open, failure, and repair behavior

Present recoverable states rather than collapsing everything into “missing”: available, missing, volume unavailable, access denied, identity mismatch, identity unverified, candidate found, ambiguous candidates, and relinked. An offline removable volume is not evidence of deletion. Keep its record and last-known path, offer retry when it returns, and distinguish a missing path from access denial where the platform allows. Failed or stale bookmarks and revoked portal grants should offer a new user-mediated selection, not erase the reference [S01–S02, S07–S08].

A path that resolves to an object whose available identifier conflicts with the stored observation produces a visible mismatch. Do not silently open it, relink it, or describe it as the same file; require an explicit one-time “Open this current target” choice or a separate confirmed relink. If no comparable identifier exists, label identity unverified and follow the path-following contract above. This is not a guarantee against path reuse on systems that cannot expose a comparable identifier; the unresolved risk belongs in product help and owner policy.

Only search after the user asks to locate or repair a reference, and only the project tree and roots the user explicitly configured or selected. A picker-selected folder can bound a one-time search. Make searches cancelable and bounded. Rank candidates with explainable evidence such as path suffix, name, type, size, timestamps, and optional digest or scoped object ID. Present candidate paths and reasons, show ambiguity, and let the user choose. Neither a matching name, size, digest, “newest” timestamp, nor a platform hint authorizes automatic rebinding. Persist a confirmed choice as one revision-checked update and retain the previous locator for undo.

### Platform and file-system adapters

- **Portable paths:** Project-relative paths work when the project and file move together. Configured root mappings suit deliberately matching external trees but require local configuration and can be wrong. Absolute paths are simple exact-open fallbacks but usually fail after a move or on another machine. Preserve native path form and be explicit about UNC/network roots and case behavior [S09].
- **macOS:** In sandboxed distribution, security-scoped bookmarks can preserve user-granted access; resolve them, handle stale data by replacing it, and start/stop access as required. Document-relative bookmarks can be stored with an owning project [S01–S02, V01]. Consider a same-volume documentIdentifier as a stronger candidate-comparison hint: Apple documents that it survives restart and same-volume moves, is not transferred on copy, is unique only within one volume, and is unsupported on some volumes. Pair it with a persistent volume UUID only when available. Neither is a path resolver or cross-platform identity [S19–S20, V02–V03, R01].
- **Windows:** FILE_ID_INFO combines volume serial and a 128-bit file ID to compare open handles on one computer; use it as a scoped comparison hint [S04, V04, R02]. Distributed Link Tracking is an optional Windows alternative, not a core: it depends on NTFS 3.0+ and system services, FAT loses tracking, removable-media links are not maintained, and timing/domain conditions apply [S05, V10].
- **Linux:** Device plus inode can corroborate a currently mounted file-system object, but inode numbers are unique only within a file system [S06, R03]. In sandboxed deployments, the XDG Documents portal can hold persistent per-user access grants and the FileChooser portal mediates selection; a portal document ID represents an access entry, not portable file identity. Access entries can be removed without deleting the original [S07–S08].
- **File-system watchers:** Treat watchers as optional, short-lived refresh hints only. Apple FSEvents can coalesce or drop events and requires rescans; the cited guide is archived and its current SDK/OS details need rechecking before implementation [S15, V11]. Windows ReadDirectoryChangesW can discard its notification buffer on overflow, requiring enumeration [S16, V05]. Linux inotify is nonrecursive, can overflow, has racy rename pairing, does not report remote file-system changes, and loses watches on unmount [S17, V06]. Reconciliation can refresh status or offer repair; no event alone authorizes a durable locator rewrite.

### Two windows, persistence, and export

Route edits from both editor windows through one project persistence boundary. Use per-reference mutations in transactions with a monotonic project/reference revision or compare-and-swap check. Merge disjoint reference edits; surface a conflict when both windows change the same reference. Do not let stale windows replace a whole table. SQLite is one conditional storage option: it allows multiple readers but only one simultaneous write transaction; the application still must define conflict and retry behavior [S14, V09]. If a plain project file is used, re-read under a lock/revision check before atomic replacement; atomic replacement alone does not prevent lost updates.

Project move/export includes stable record IDs and a readable reference list, and clearly says that linked originals remain external unless separately included. A portable relative locator is not evidence that the original traveled. If copy-on-export is supported, make it a separate explicit operation with a preview and per-item copied/missing/denied/omitted result. Do not modify or delete originals. Avoid exposing local usernames, private folder/share names, volume labels, or opaque access tokens by default. Recommended export default: include project-relative locators when useful, redact machine-local absolute/last-known paths, and omit platform access tokens and local volume hints. Ask owners to approve the final privacy and compatibility policy before export format is fixed.

### Integration boundaries

Keep the component to the link-existing-file entry point; project-owned reference records; path/access resolver; status and retry; bounded candidate discovery; explicit relink; open action; and export disclosure. Integrate with the notebook's existing project persistence and UI routing once those contracts are known. Do not add general filesystem management, background global indexing, sync, automatic upload, source mutation, silent copy, or a recovery guarantee.

## Disposition of every released-plan clause

| ID and exact plan clause | Disposition and evidence-based result |
|---|---|
| **C1.** “one project-local attachment table: record ID, display name, absolute path, size, modification time, and a digest computed when first linked” | **Retain the table, stable ID, and display name; change the locator and observations.** Use typed/anchored locators, not an absolute path as the only portable value. Size/time are observations. Make a versioned, time-stamped digest optional rather than mandatory identity: it may be costly, stale after edits, and equal for copies [S03–S06, S09–S11]. |
| **C2.** “Opening a reference tries the saved path first.” | **Retain and define.** Resolve the active locator first, then the applicable access grant; distinguish missing, denied, offline volume, identity mismatch, and unverified identity. Do not rewrite the locator on a failed or temporary resolution [S01–S04, S07–S09]. If a supported ID conflicts, prompt before opening the current target; if no ID is available, follow explicit path-following semantics and disclose uncertainty [R01–R03]. |
| **C3.** “If it fails, scan the project folder and recently chosen attachment folders for a file whose size and digest match; choose the newest match automatically.” | **Reject automatic selection; retain bounded search only as user-requested repair.** Search the project tree and user-approved roots, allow cancel, explain candidate ranking, show ambiguity, and require confirmation. Size, digest, name, timestamp, or “newest” cannot prove intent. Zotero offers bounded base-directory search and user relink; its release history also records a cross-platform relinking correction [S10–S13, V07–V08]. |
| **C4.** “A removable drive is stored by its current mount path.” | **Reject as the sole durable locator.** Retain mount path as last-known local path, plus a volume-relative suffix and scoped volume/object hints when available. Mark an absent volume unavailable. Reuse of a path with a known conflicting ID triggers a prompt; unavailable identity is visibly unverified, never claimed as same-object [S03–S06, S18–S20, R01–R03]. |
| **C5.** “We will watch the listed folders while a notebook window is open and rewrite paths after rename events.” | **Make watching optional and status-only. Reject watcher-driven durable rewrites.** Coalescing, overflow, rename races, remote file-system limits, and unmounts mean event streams require reconciliation and are not identity proof or user authorization [S15–S17, V05–V06, V11]. |
| **C6.** “Each editor window keeps the table in memory and replaces the table file when the user changes a reference.” | **Reject.** Use a shared revision-aware store, per-record transactional writes, disjoint-edit merge, and explicit same-record conflicts. SQLite can serialize writes, but it does not define the application's conflict policy. A lock/re-read/revision check is needed for a flat file [S14, V09]. |
| **C7.** “Export includes the table and a readable list of attachments, with an optional explicit copy operation.” | **Retain with precise omission, privacy, and copy semantics.** Say linked originals are external; list per-item status. Include files only in a separate previewed action. Default to redacting machine paths and omitting local access tokens/volume hints until owners approve the privacy contract. |
| **C8.** “The UI shows available or missing, plus a Browse button for manual repair.” | **Retain and expand.** Add volume unavailable, access denied, identity mismatch/unverified, candidate found, ambiguous, and relinked. Browse/Locate is cancelable; show the candidate and require an explicit relink. Removing a reference removes only the project record, never the source. |
| **C9.** “We expect this approach to work similarly on all supported desktop systems; platform-specific identity features can be added later if they justify their complexity.” | **Reject the same-filesystem-behavior assumption; retain one conceptual flow with platform adapters.** Path roots, access grants, identifier scope, removable media, and watcher behavior differ materially across macOS, Windows, and Linux [S01–S09, S15–S20, R01–R03]. |
| **C10.** “Keep references local, preserve record IDs in project exports, and do not introduce privileged services or silent copying.” | **Retain as hard constraints.** Also exclude automatic upload, broad indexing, source mutation, and cloud dependence. Preserve record IDs without implying external bytes or permission grants were exported. |
| **C11.** “This is a proposal to examine, not implementation evidence.” | **Retain.** This is a research-backed proposal. No application implementation, deployment, runtime validation, or filesystem simulation is claimed. |

## Independent critique: explicit dispositions

| Criticism | Disposition | Resolution |
|---|---|---|
| **M1 — Material: a saved path may now resolve to a different file, and the draft did not define open behavior.** | **Accept and amend.** | Define the recommended path-following reference semantics and explicit behavior above. A positive scoped-ID conflict becomes a visible mismatch; do not silently open or relink; ask before opening the current target or offer separate confirmed repair. If comparison is unavailable, label identity unverified, follow path semantics without claiming sameness, and retain the owner decision about a stricter mode. Independent primary-document checks confirm the limits: Apple's document ID is same-volume and unsupported on some volumes; Windows FILE_ID_INFO compares handles on one computer; Linux inode uniqueness is file-system scoped [R01–R03]. |
| **m2 — Minor: readable export can leak private paths and should decide token/digest/volume-hint handling.** | **Accept and amend.** | Add path and identifier privacy to owner decisions. Recommended default is project-relative paths only where useful, redacted machine paths, and no opaque tokens or local volume hints in export. Make broader disclosure explicit. |
| **m3 — Minor: Apple watcher evidence is archived.** | **Accept.** | Identify the FSEvents guide as an archived source. Its cited loss/coalescing points support only the conservative status-hint recommendation. Verify current SDK and supported OS behavior if watchers are implemented [S15, V11]. |

## Alternatives and trade-offs

| Mechanism | Useful when | Limits and recommendation |
|---|---|---|
| Project-relative path | Project and file move together | Simple and portable within that tree; use as the core locator for in-project files. |
| Configured base-root mapping | An external tree has a deliberately stable relative layout across machines | Requires local configuration and confirmation of the mapping; support as an opt-in locator. |
| Machine-local absolute path | Exact open on the originating machine | Honest fallback and last-known path, but not portable; label it. |
| macOS bookmark and document ID | Sandboxed access or candidate corroboration on a supported volume | Bookmark is permission/access data; document ID is a scoped comparison hint. Handle stale data and unsupported volumes. Never make either the cross-platform core. |
| Windows FILE_ID_INFO and Distributed Link Tracking | Local handle comparison or optional Windows recovery | File ID is single-computer scoped. DLT has NTFS/service/removable-media limits; do not require it. |
| Linux inode/device and XDG portal | Local mounted-object comparison or sandbox access | Inode is filesystem scoped; portal document IDs represent grants. Neither is portable identity. |
| Content digest | Candidate ranking or explicitly requested byte comparison | Costs I/O, can become stale, and identical copies match. Keep optional and never auto-relink from it. |
| Watchers | Refreshing current status while selected roots are open | Lossy and platform-dependent; optional hint followed by reconciliation only. |
| Managed copy/import | An owner deliberately wants self-contained project data | Duplicates bytes and changes storage/ownership semantics; keep separate from linking. |

Zotero is a real, versioned implementation/history comparison: its documentation distinguishes stored copies from linked originals; release-tagged 6.0.20 source has linked and base-relative record paths; the 6.0.16 release offered bounded auto-location under a configured base and 6.0.20 later fixed a macOS/Linux-to-Windows relink issue [S10–S12, V07–V08]. This is evidence that bounded relink and cross-platform path bugs occur in shipped software, not proof that its algorithm fits this notebook. Issue #2084 records motivating proposal/history rather than shipped behavior [S13]. The XDG Documents portal and Windows DLT are useful alternatives only within their stated access and filesystem conditions [S05, S07–S08].

## Owner decisions still needed

1. Supported OS versions, distributions, sandbox/package model, entitlements, and minimum filesystem support—including macOS bookmark/document-ID availability.
2. Whether the product adopts path-following as the default reference meaning or offers an object-following mode; how confirmed mismatch and unverified identity should be phrased.
3. Whether files may be outside the project tree; how external roots are named, selected, mapped, and carried in exports.
4. Project storage format and whether independent processes as well as two windows can edit the same project.
5. Whether network filesystems are supported and how their path, watcher, and identity limitations affect status.
6. Export privacy policy for absolute/last-known paths, display names, volume labels, digests, object hints, and opaque platform access tokens. Decide redaction and whether local-only state is kept outside project files.
7. Whether digests are opt-in, deferred, or omitted; define algorithm, timing, and behavior if a file changes while hashing.
8. Whether copy-on-export is supported, and how the UI reports copied, missing, denied, and omitted files.
9. Whether removing a reference is soft deletion/history or permanent record removal. In either case, the source file remains untouched.

## Validation plan (proposed, not run)

- Move a project tree with linked files; verify relative locators resolve, and external absolute paths remain labeled machine-local without silent changes.
- Rename/move a target within an approved base, move it outside, and duplicate it; verify only explicit relink updates the record.
- Test same-name/same-size files, byte-identical copies, changed contents, and newer duplicates; ensure all choices remain visible and none is auto-accepted.
- Reuse a path after replacing its file or volume. On platforms with comparable IDs, verify mismatch prompts block silent open/relink; on platforms without them, verify the “identity unverified” disclosure and the chosen path semantics.
- Disconnect/reconnect removable storage, change mount point/drive letter, revoke access, use unreadable targets and stale bookmarks, and test portal grant removal. Confirm records persist and offer recovery.
- Test spaces, Unicode, reserved characters, case differences, symlinks, relative/absolute paths, UNC roots, and each supported network filesystem.
- If watchers ship, test rename, cross-directory move, unmount, dropped/overflow events, and remote changes; verify reconciliation does not silently rewrite locators.
- Open one project in two windows/processes; verify disjoint edits survive, same-record conflicts surface, and interrupted saves leave a readable current record table.
- Export links-only and with any explicit include-files action; inspect wording, per-file result, privacy redaction, token policy, stable IDs, and that source files remain unchanged.
- If digests ship, benchmark representative large files and change a file during hashing; do not report a stable digest when calculation was interrupted or content changed.

These are future checks. None was run as part of this stage.

## Executed research and validation status

**Executed:** read the full brief, frozen investigator discovery/draft/source map/revealed plan/reveal metadata/source index, complete independent critique and its source map/index; checked every plan clause and each criticism against that material. Rechecked the material path-identity issue in governing primary documentation for Apple documentIdentifierKey, Microsoft FILE_ID_INFO, and Linux inode(7); the reviser records those observations as R01–R03. The predecessor research includes platform documentation, RFC 8089, Zotero documentation/source/release history, SQLite transaction documentation, and watcher/portal alternatives; its source records and limitations are preserved in the accompanying map. The cited Zotero source was inspected, not executed.

**Not executed:** no notebook code, downloaded code, executable witness, runtime, filesystem simulation, automated test, or deployment was run. The validation list is proposed work, not a result. No product-specific OS matrix, packaging model, project schema, or export privacy choice was assumed settled.

## Source navigation

See [sources/index.md](sources/index.md) for a navigable index and [source-map.json](source-map.json) for source identity, version/release, locator, access operation/time, conditions, and applicability. Stable investigator IDs S01–S20, critic IDs V01–V11, and reviser checks R01–R03 remain separately identified.
