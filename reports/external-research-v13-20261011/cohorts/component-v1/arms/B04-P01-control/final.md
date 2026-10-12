# CPython 3.13.9 media export proposal — final

## Status and scope

This is an implementation proposal for a Linux and Windows desktop media organizer. It is not deployed code. No application implementation, benchmark, platform test, crash test, or executable witness was run for this review. The admitted CPython sources are pinned to commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0; the task targets CPython 3.13.9, but the mapping of that commit to that exact patch release was not independently verified. Exact public URLs, source locators, hashes, and uncertainties are in [source-map.json](source-map.json).

The requested route was Luna Max Standard. The native Goal receipt contains no provider, model, or service-tier fields. The T3 runtime identifies this session as gpt-6-luna with max reasoning; the service tier and whether it matches the requested Standard route are unknown.

## User contract

The user selects one regular media file and an output directory. The default output name is the source basename. Export copies the source’s primary data stream and never moves, deletes, truncates, or edits the source. The source is assumed immutable during export. A completed export means the copy operation passed its configured checks and the destination publication operation returned successfully; it does not mean every platform metadata field was copied or that a sudden power loss cannot undo the result.

If the final path already exists, the UI shows that path and asks before replacing it. If the path was absent and a competing process creates it during export, export fails with a collision rather than replacing it. A declined confirmation, copy error, cancellation before publication, or collision leaves the existing destination untouched. The UI reports the operation and whether a completed destination is already visible.

## Proposed data path

### Preflight and authorization

Run preflight off the UI thread. Resolve the chosen source and reject directories, devices, and other non-regular inputs. Reject a source and destination that identify the same file. Record a source identity snapshot before copying: platform file identity where available, size, and high-resolution modification time.

If the destination exists, require explicit confirmation for that named path and record its identity. Recheck the identity just before publication; if it changed or disappeared unexpectedly, stop and ask again. If the destination was absent, use the no-replace branch regardless of any earlier existence check. An existence check alone is never authorization to replace.

A named-path check followed by replacement cannot guarantee that an uncooperative writer did not swap the entry in the interval before the publication call. V1 replacement should be scoped to user-controlled local directories and state this limitation. Do not claim identity-conditional replacement in a shared or hostile directory. Where that threat matters, disable replacement until a platform-specific conditional operation is implemented and tested.

### Destination-local staging

Create a unique staging file inside the selected destination directory using exclusive creation, for example tempfile.mkstemp(dir=destination_dir, prefix=...). Keep its file identity and treat only that file as owned cleanup material. This puts staging on the destination filesystem, even when the source is on another volume, and prevents cross-volume publication. An application temporary directory is unsuitable because it may be on another filesystem.

Do not write bytes directly to the final name. The final path stays absent or retains its old file while the stage is incomplete. Budget space for the staged copy while the old destination is still present. If free space is insufficient or writing fails, remove only the owned stage; if cleanup fails, report the exact leftover path.

### Copy modes, progress, and cancellation

Offer two explicit modes:

- **Responsive copy (default):** copy in a worker using a fixed-size buffer, for example 1 MiB. Keep memory bounded, count bytes written, publish progress and an estimated remaining time, and check cancellation between chunks. Cancellation is cooperative at chunk boundaries. After copying, apply the selected metadata policy and flush the stage before publication.
- **Fast copy (optional):** use shutil.copy2(source, stage). CPython may use a platform fast-copy operation; it is not guaranteed to do so or to be faster on every source/destination pair. It has no per-chunk progress callback, so show an indeterminate phase and elapsed time. A cancel request in this mode is pending until the call returns; then remove the stage before publication. The UI must say this plainly.

The documented fast-copy paths include kernel-assisted operations on some systems and buffered fallback in particular failure cases. This makes copy2 a practical throughput option, not a universal performance guarantee. There is no benchmark evidence yet; benchmark both modes before choosing whether fast copy should become the default.

Use clear phases: Preparing, Copying, Applying metadata, Verifying (if enabled), Publishing, Complete, and Failed. Do not show a precise percentage in fast mode. After publication succeeds, cancellation is too late; report completion rather than pretending the job was canceled.

### Bytes, source stability, and metadata

Define byte preservation as equality of the source’s primary data stream and the exported primary data stream. A successful copy plus matching expected size is a useful check, not independent proof of byte equality. Optional digest verification can compare source and staged contents, but adds I/O for multi-GiB files and should be an explicit integrity option. The validation suite must compare hashes.

After copying, recheck source identity, size, and modification time. If the snapshot changed, do not publish; remove the stage and report that the immutability assumption was broken. This detects many changes but is not a snapshot or lock: a writer could alter bytes while restoring size and timestamps. If consistent source contents are required, use a filesystem snapshot or a tested platform-specific exclusion mechanism. Do not silently retry from a source that may still be changing.

Keep copy2 as a practical metadata attempt. CPython documents that copy2 attempts preservation and does not fail just because some metadata could not be copied. Its copystat path covers permission bits and timestamps, flags, and Linux extended attributes where possible. This is not archival fidelity. CPython explicitly warns that owner/group and ACLs may be lost on POSIX, Mac resource forks and other metadata are not used, and Windows owners, ACLs, and alternate data streams are not copied. The upstream copy2 test checks selected mode/time attributes, optional flags, and a separate conditional xattr case; it does not prove full metadata equality.

Expose a metadata report with three labels: **attempted/best effort**, **not copied by this path**, and **unknown on this platform/filesystem**. At minimum, say that the primary data stream is copied; timestamps and mode/flags are attempted subject to platform support and timestamp precision; Linux extended attributes are best effort; owner/group, ACLs, Mac resource forks, and Windows alternate streams are not promised by copy2. Do not infer complete preservation from a successful return. On Windows, verify the chosen replacement API’s effect on destination ACLs and streams before describing the resulting metadata; until then label it unknown. A separate platform archival tool remains an option only if full fidelity becomes an explicit product requirement.

### Flush, publication, and truthful durability

Flush buffered Python writes and call os.fsync(stage_fd) after copying and applying metadata, before publication, while the responsive writer still holds its descriptor. For the fast path, reopen the completed stage with the access required by the platform before requesting fsync; if a writable sync handle cannot be obtained, report that the sync step was unavailable instead of implying it succeeded. CPython documents that buffered file objects must be flushed before fsync; on Windows this maps to _commit, and on Unix to fsync. A successful call is a durability request, not a universal power-loss guarantee.

Publish with a same-filesystem operation selected by authorization:

- **No prior destination or no replace confirmation:** use a no-replace primitive. On Linux, use renameat2(..., RENAME_NOREPLACE) where the filesystem supports it; if unavailable, fail closed instead of falling back to check-then-os.replace. The Linux manual says this flag fails if the destination exists and requires filesystem support. On Windows, same-volume os.rename(stage, final) is suitable for the no-replace branch: CPython documents that it always raises FileExistsError when the destination exists on Windows.
- **Confirmed existing destination:** recheck the recorded target identity, then use the replace operation for the platform. On POSIX, os.replace(stage, final) may replace a file on the same filesystem and CPython documents successful rename as atomic under the POSIX requirement. On Windows, use a same-volume replacement call only when explicit confirmation authorizes it; the native MoveFileExW API exposes MOVEFILE_REPLACE_EXISTING. Keep cross-volume copy flags off because staging is already local to the destination. The Windows documentation does not give the same broad POSIX atomicity statement. Treat reader-visible atomicity on Windows as a release criterion to prove on supported local filesystems, not as a universal guarantee.
- Never use shutil.move to publish the stage. CPython uses rename on the same filesystem, but on another filesystem it copies to the destination and then removes the source. That fallback can expose a partial final file and is not one atomic publication boundary. Destination-local staging preserves cross-volume-source support without relying on that fallback.

For Linux, after successful replacement, fsync the containing directory where supported to request persistence of its entry. The Linux fsync manual says syncing a file does not necessarily sync its directory entry; that requires fsync on a descriptor for the directory. If that post-publication sync fails, the new path is already visible: report “published; crash persistence could not be confirmed,” and do not report a simple failure or remove the final file. For Windows, ReplaceFileW documents that REPLACEFILE_WRITE_THROUGH is unsupported; it also merges documented attributes and named streams from the replaced destination, so it is an alternative only if that metadata policy is intended. This proposal instead selects a same-volume MoveFileExW replacement call after explicit confirmation, but its visibility and failure behavior still require platform tests. MoveFileExW documents write-through for a copy-and-delete move, which this design avoids. Do not advertise a Windows power-loss guarantee from the rename/replace call. Test any platform-specific sync strategy separately.

A successful publication means the destination path was switched by the selected operation and the configured pre-publication checks passed. It does not mean “durable on every filesystem.” Network/shared destinations are not certified for the first release; reject them or clearly label them unsupported until collision, visibility, and durability behavior is tested.

### Errors and cleanup

Before publication, any read, write, metadata, verification, flush, or cancellation error leaves the old destination in place and removes only the owned stage. Report the path, operation, and operating-system error in user-readable form. Do not claim the source was deleted or altered.

If publication returns an error, inspect the relevant paths and recorded identities before cleanup. Never delete an entry merely because it has the staging name; verify it is the stage created by this job. If platform behavior leaves an ambiguous state, preserve recoverable files and explain where they are rather than risking user data. A successful publication followed by cleanup or directory-sync trouble is a distinct “published with cleanup/durability warning” status.

## Preserved choices, alternatives, and history

- Keep rejection of direct copying to the final path: readers could see partial bytes, and cancellation/error behavior is harder to explain.
- Keep the rule against moving the original source. Export is a copy; success never means source deletion.
- Keep copyfile as a bytes-only alternative and copy2 as best-effort metadata copying. Neither promises archive fidelity.
- Keep same-filesystem rename/replace as the publication primitive where platform semantics support it. Replace only after explicit authorization.
- Keep kernel-assisted copy as an optional performance path with indeterminate progress; keep bounded streaming as the progress/cancellation path.
- A dedicated native archival tool can be evaluated if ACLs, alternate streams, resource forks, or other platform metadata become a requirement. Packaging, trust, platform, and test costs make it unsuitable as the v1 default.
- Keep network/shared destinations explicitly uncertified for v1, while preserving ordinary cross-volume source-to-local-destination exports.

## Future validation plan (not run)

1. Compare source and exported hashes and sizes for empty, small, sparse, and multi-GiB files in both copy modes. Confirm bounded memory and no GUI-thread blocking.
2. Cancel during streaming and immediately before publication; confirm no final file appears and only the owned stage is removed. In fast mode, confirm the UI communicates delayed cancellation.
3. Inject read/write errors, disk-full conditions, metadata failures, permission errors, source changes, and same-file selections. Confirm the prior destination and source remain intact.
4. Test no-replace with an existing destination and when another process creates it during copying. Test confirmed replacement, user decline, target disappearance, and target identity change before publication. Include uncooperative writers to document the remaining replace-mode race.
5. Run true cross-volume source-to-destination tests on Linux and Windows. The destination-local stage must be on the destination volume. CPython’s mocked-rename upstream tests are not real cross-volume or durability tests.
6. On each supported local filesystem, run concurrent-reader tests during publication and fault-injection around replace. Cover Windows open-handle behavior, ACL permissions, and metadata inheritance. Test recovery and cleanup without deleting ambiguous files.
7. Check metadata field by field, including timestamp precision and optional xattrs. Verify the user-facing report never claims owner/group, ACL, resource-fork, or alternate-stream fidelity without a separately validated implementation.
8. Test sync behavior and abrupt VM power interruption at copy, file-sync, publication, and directory-sync boundaries on each supported platform/filesystem. These are future tests; hashes and a returned rename call do not establish crash durability.
9. Benchmark both copy modes on representative source/destination volumes before changing the default or making throughput claims.

No application tests, benchmarks, Windows tests, cross-volume filesystem tests, or crash tests have been executed in this review.