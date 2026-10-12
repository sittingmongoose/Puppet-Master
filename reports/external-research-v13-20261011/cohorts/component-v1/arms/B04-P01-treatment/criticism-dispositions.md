# Criticism dispositions — B04-P01 treatment

This resolves the full F1–F4 set in the compact actionable critique. Decisions below preserve the criticism's counterevidence, keeps, conditions, uncertainty, history, and obligation mapping.

## F1 — copy2 metadata and archival-fidelity claim

**Decision: ACCEPT the correction; KEEP copy2 as a best-effort metadata option.**

- The draft's statement that copy2 preserves all metadata, Windows alternate streams, and ACLs is rejected. CPython's pinned shutil docs explicitly say higher-level copy functions cannot copy all metadata; they name POSIX owner/group/ACL losses and Windows owner/ACL/alternate-data-stream losses. The copy2 entry says it attempts metadata, preserves what it can, and does not raise solely because metadata could not be preserved. Linux extended attributes are copied only where possible. Primary evidence: [pinned shutil warning](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/shutil.rst#L23-L32), [copy2 and copystat contract](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/shutil.rst#L118-L125), [copy2 contract](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/shutil.rst#L197-L213).
- The pinned copy2 test checks selected mode, access/modification time (with possible time truncation), and flags when available. It does not demonstrate complete metadata fidelity. Primary evidence: [pinned test_copy2](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_shutil.py#L1392-L1406).
- Keep copy2 because it can preserve useful timestamps and metadata on supported platforms. Amend the user-facing contract to state a bounded guarantee: copied bytes, modification time at supported precision, and explicitly selected metadata where supported. Do not label the result archival or claim a per-file list of silent metadata omissions.
- Keep a conditional archival-tool alternative for users who require ACLs, streams, resource forks, ownership, or extended attributes. That backend needs its own upstream evidence and platform tests before it can make such claims.
- Preserve the useful timestamp requirement. The proposal captures source modification time before reading so access-time updates during read do not silently change which modification time is promised. Access time remains best effort unless made an explicit requirement.

## F2 — cross-volume move, publication atomicity, and destination races

**Decision: ACCEPT the publication correction; KEEP cross-volume source support, unchanged source, and explicit replacement.**

- Reject shutil.move(stage, final) as the publication contract. CPython docs say same-filesystem move uses rename, while cross-filesystem move copies to the destination and then removes its source. Therefore move is not a single atomic publication boundary across filesystems. The exporter instead stages in the destination directory and invokes a selected same-filesystem publication primitive. Primary evidence: [pinned shutil.move semantics](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/shutil.rst#L372-L395), [pinned implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/shutil.py#L814-L860).
- Accept the criticism that exists() before copying cannot authorize a later overwrite. For no-replace, Linux uses a supported renameat2 RENAME_NOREPLACE path; the Linux man page says it refuses an existing target and requires filesystem support. Windows os.rename is the standard-library candidate because the pinned Python docs say an existing destination raises FileExistsError there. Unsupported or untested filesystems fail closed. Evidence: [Linux renameat2 RENAME_NOREPLACE](https://man7.org/linux/man-pages/man2/renameat2.2.html), [pinned os.rename contract](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/os.rst#L2678-L2697).
- Keep optional replacement only after explicit confirmation. The draft's blanket move/atomicity claims are amended to an os.replace operation from destination-local staging, with identity recheck immediately before commit. CPython documents replacing an existing file if permitted and states atomic rename as a POSIX requirement. Primary evidence: [pinned os.replace contract](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/os.rst#L2726-L2735).
- Keep the source untouched and keep support for a source on another volume; the source-to-stage copy can cross volumes while stage-to-final publication remains local to the destination.
- Keep the old destination until publication. On certified filesystems, a pre-publication error must leave it intact. Test this explicitly, including permission errors and open-target behavior.
- Condition exact replacement authorization on a controlled destination directory and cooperative writers during the commit window. A final stat/recheck reduces stale-confirmation risk but is not atomic compare-and-swap. App-owned reservations serialize app instances only. The portable path-based API does not eliminate an external race after the recheck. Treat a changed observed identity as a conflict and re-prompt; disclose the residual assumption.
- Preserve cleanup ownership: remove only the staging file created by this operation, and report its path if cleanup fails.

## F3 — flush/fsync and crash durability

**Decision: ACCEPT the correction; KEEP a sync attempt as a separate policy; mark power-loss guarantees UNCERTAIN.**

- Reject “atomic rename means durable when move returns” and the claim that no fsync or crash test is needed. The CPython os.replace docs describe atomic rename as a POSIX requirement; that addresses namespace visibility, not persistence after power failure. They do not grant a cross-platform durability guarantee. Primary evidence: [pinned os.replace docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/os.rst#L2726-L2735).
- Keep the plan to flush buffered output and call fsync on the staged file before publication when requested. CPython docs explicitly require flush before fsync for a buffered Python file and describe Unix fsync / Windows _commit. Primary evidence: [pinned os.fsync docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/os.rst#L1086-L1095).
- Amend completion semantics: “published” means the publication call succeeded; it does not mean crash-durable. A post-publication directory-sync failure becomes “published, persistence unconfirmed,” not a generic failure that could prompt an unsafe blind retry.
- Keep separate interruption tests for process termination and power loss. Uncertainty remains for filesystem, hardware, caches, Windows directory-entry persistence, and network/server semantics. No such tests were run.

## F4 — source, progress, cancellation, cleanup, performance, and history

**Decision: KEEP these requirements; CONDITION the copy backend; mark platform results UNCERTAIN.**

- Keep the immutable-source assumption, open-handle identity checks, GiB-scale bounded memory, worker-thread I/O, progress, cancellation, useful errors, and owned-stage-only cleanup. These are product requirements from the brief; no source evidence can replace application tests. Identity/size/time rechecks catch common changes but do not promise a filesystem snapshot against a concurrent writer.
- Keep streaming as the default because progress and cancellation matter. CPython documents chunked copyfileobj buffering and may use fast-copy paths; its documentation describes Linux sendfile, a Windows larger-buffer/memoryview path, and buffered fallback when a fast-copy attempt fails before writing. This supports the alternative but not a universal speed claim or a granular progress callback. Primary evidence: [chunked copyfileobj behavior](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/shutil.rst#L40-L48), [fast-copy documentation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/shutil.rst#L515-L538), [pinned copyfile implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/shutil.py#L230-L283).
- Keep copy2/fast-copy as a speed-first alternative with indeterminate progress, constrained cancellation, and measured rather than assumed throughput. Keep the external/platform archival-tool path as conditional.
- Preserve original history: reject direct-to-final copying because a partial destination could be visible; reject moving the original because export must retain source; retain copyfile for content-only copies and copy2 for best-effort metadata; retain same-filesystem rename/replace as a publication primitive; reject shutil.move for final publication because its cross-filesystem path copies and deletes; keep network/shared targets uncertified for v1.
- Upstream test_move_file_other_fs and test_move_file_to_dir_other_fs are decorated with mock_rename and delegate to common move tests. This is useful evidence of fallback logic, not a real-volume atomicity or durability test. Primary evidence: [pinned cross-filesystem move tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_shutil.py#L2755-L2763).
- The application/platform performance, cancellation latency, replacement races, Windows open-file behavior, metadata behavior, and durability results remain UNCERTAIN until the validation plan is executed. No behavior tests were run for this treatment.

## Preserved coverage and history

The provided obligation map is retained exactly: O1 = F2, F4; O2 = F2, F4; O3 = F2; O4 = F1; O5 = F3, F4; O6 = F1, F4.

The complete proposal preserves the original cross-volume and metadata requirements, negative constraints, useful alternatives, rejection history, immutable-source assumption, uncertainty, and future validation work. Detailed public primary locators and scope are in source-map.json.
