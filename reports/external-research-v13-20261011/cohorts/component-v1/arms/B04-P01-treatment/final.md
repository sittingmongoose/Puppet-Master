# CPython 3.13.9 desktop media export proposal

**Status:** implementation proposal for Linux and Windows; not deployed and not behavior-tested. The requested runtime is CPython 3.13.9. The inspected CPython sources are pinned to commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0 with the hashes recorded in source-map.json; the exact relationship between that commit and the requested release tag was not independently established.

## Decision

Export by copying a selected regular media file into a uniquely named staging file created in the chosen destination directory. The exporter never moves, renames, truncates, or deletes the source. Copying is done on a worker thread with bounded memory. After data and requested metadata are ready, publish the stage with an explicit no-replace or confirmed-replace operation on the same destination filesystem.

Use chunked streaming as the first-release default because the product needs byte progress and cooperative cancellation. Keep CPython's copy2 / platform fast-copy route as an optional speed-first alternative whose progress is indeterminate and whose speed is not guaranteed. A separate archival-copy backend remains a future option for users who need metadata CPython does not preserve.

The exporter promises successful byte transfer and publication according to the selected policy, subject to the stable-source and tested-destination assumptions below. It does not promise complete archival metadata or universal survival after sudden power loss.

## Contract and scope

- The user selects a file and destination name. If a file already occupies that name, show its identity details and obtain explicit confirmation before replacing it.
- The source is treated as immutable while exporting. Open it read-only once, record available identity and size/time information, and copy from that open handle. Compare the handle's identity and metadata after the transfer, and check whether the selected path still resolves to the same file. Abort and remove the owned stage if a detectable change occurred. This detects common changes; it cannot make an uncooperative writer's changing file into a snapshot.
- Copy bytes only. Do not use a move operation on the original. Reading may update source access time on filesystems that track it; the exporter does not promise that every source metadata field is unchanged.
- Support regular files, including files several GiB in size and sources on another volume. Define source symlink handling explicitly in the UI: resolve and open the selected target once, then copy that handle. Reject destination symlinks/reparse points as conflicts in the first release rather than following them or silently replacing a different path.
- First-release destination certification is limited to tested local filesystems. Network and shared destinations are not certified; report the limitation instead of implying that all network rename, locking, visibility, or durability semantics match local filesystems.

## Copy and metadata path

Run the operation outside the GUI thread. Create a random, destination-local staging file with exclusive creation. Keeping it in the destination directory makes the later publication operation same-filesystem even when the source is on another volume. Never use a system temporary directory for the stage unless it has first been proven to be on the destination filesystem.

The default copy loop uses a bounded buffer, initially benchmarked around 4 MiB, and reads/writes until EOF. Update byte progress at a throttled cadence, report the known source size where available, and check cancellation between I/O chunks. Memory use remains bounded. Buffer size is a tuning choice, not a promised throughput optimization. Cancellation cannot interrupt an I/O call already blocked in the operating system; measure and describe that latency.

Capture source metadata before reading. Preserve the modification time to the supported destination precision and apply useful mode/time metadata where supported. CPython copy2 attempts to copy metadata through copystat, but it does not promise all metadata and does not raise merely because some metadata could not be preserved. The docs specifically warn that ownership and ACLs are lost on POSIX, resource-fork/other metadata is not copied on macOS, and owners, ACLs, and alternate data streams are not copied on Windows. Linux extended attributes are copied where possible. The upstream copy2 test checks selected mode/time/flag behavior; it does not establish archival fidelity. Therefore the UI must not label a copy2 result an archival copy or claim that all metadata was preserved. State the supported metadata scope up front. Do not promise a per-file report of every unsupported field unless the application separately enumerates and verifies those fields.

Because reading can affect source access time, define the required timestamp as the source modification time captured before the read. If access time is also a product requirement, capture it before reading and set it deliberately on the stage; otherwise disclose that access time is best effort. Do not copy creation-time, ACL, owner, alternate-stream, resource-fork, or extended-attribute fidelity into the guarantee without platform-specific inspection and tests.

A speed-first mode may use shutil.copy2. In CPython, copy functions may use platform-specific fast paths: Linux may use sendfile; Windows uses a larger-buffer/memoryview route; the documentation allows fallback to buffered copy when a fast-copy attempt fails before writing data. This gives no universal speed guarantee and no byte-level progress callback. Show an indeterminate transfer phase and more limited cancellation in that mode. Compare measured results with streaming before enabling it by default. A platform-specific archival copier is another candidate if extended metadata matters, but it adds packaging, update, trust, licensing, and per-platform behavior costs; retain it as an investigated alternative rather than an unverified promise.

## Publication, collisions, and races

Do not write directly to the visible final name. It would expose partial bytes during transfer and make cancellation or a mid-copy error leave a misleading result. Do not publish with shutil.move: on a different filesystem it copies to the destination and then removes the source, so it is not a single atomic publication boundary. Although a destination-local stage should be on the same filesystem as the final name, use the selected publication primitive directly and fail safely if it reports a cross-filesystem or unsupported operation.

**No replacement authorized**

1. An initial existence check is only for choosing the prompt and UI state. It is not the collision guarantee.
2. At commit, use an atomic no-clobber primitive. On Linux, use renameat2 with RENAME_NOREPLACE through a reviewed platform adapter on filesystems that support that flag. The Linux manual documents that the flag refuses to overwrite an existing name and that filesystem support is required. If the flag is unavailable or unsupported, fail closed or use a separately tested regular-file hard-link publication path; never fall back to exists-then-overwriting-rename.
3. On Windows, same-volume os.rename is the standard-library no-replace candidate: the pinned Python docs say it raises FileExistsError when the destination exists. Verify it on each certified filesystem. If a name appears during the copy, leave it untouched and report a collision; the user can choose again.
4. A non-replace publication must never replace a file that appeared after the initial check.

**Replacement explicitly confirmed**

1. Before copying, display the existing target and obtain affirmative confirmation. Record the target's available identity (such as volume/device and file identifier), size, and modification time.
2. Recheck the target immediately before publication. If it disappeared or its observed identity changed during the copy, do not replace it; report the conflict and ask for a new decision. The confirmation authorizes the file shown to the user, not an unseen replacement.
3. After that check, use os.replace from the destination-local stage. It replaces an existing file if permissions permit. CPython documents atomic rename as a POSIX requirement; it does not make that promise for every Windows filesystem. Certify visibility behavior separately on each supported local filesystem and disable replacement where the required behavior has not passed.
4. A path-based recheck followed by replace still has a small race against an uncoordinated external writer. A per-destination reservation/lock serializes this application's own exports, not arbitrary programs. The stronger guarantee therefore assumes the user controls the destination directory and no hostile or uncoordinated process changes the target during the short commit window. Portable Python does not provide a compare-and-swap replace conditioned on the exact prior file identity. State this limit instead of claiming the initial exists() check eliminates races.

For a new target, a name created after the prompt is handled by the no-clobber commit and causes a collision. For a confirmed replacement, a detected change causes an abort and re-prompt; a race after the final identity check remains covered by the stated directory/cooperation assumption. Reject a destination directory, symlink, or reparse point unless a later product decision defines and tests those cases.

## Flush, durability, completion, and cleanup

After bytes and metadata have been written, flush any buffered Python writer and call os.fsync on the staged file before publication when the selected durability policy requests it. CPython documents that a buffered file must be flushed before fsync; it maps to fsync on Unix and _commit on Windows. A file sync is not by itself proof that the directory entry created by the later rename will survive power loss.

On POSIX local filesystems that support it, a durability-attempt mode should also sync the destination directory after publication. On Windows, directory-entry persistence needs a separately implemented and tested platform policy; the Python fsync documentation does not establish it. A successful sync call is evidence that the requested OS call returned, not a universal guarantee against device caches, controller behavior, filesystem bugs, remote servers, or sudden power loss. Until per-platform interruption testing and documentation establish more, do not promise power-loss durability.

Use distinct user-visible outcomes:

- **Canceled or failed before publication:** no new final file is published. If replacing, the old target should remain intact on certified atomic-replace filesystems. Report the cause and whether stage cleanup succeeded.
- **Published:** the selected publication call succeeded and the final name refers to the completed staged copy. This is the baseline meaning of “export complete”; it does not mean crash-durable.
- **Published, persistence unconfirmed:** publication succeeded but a requested post-publication sync was unavailable or failed. Do not report a generic failed export that could induce an unsafe blind retry; explain that the file is visible and durability is uncertain.
- **Cleanup incomplete:** remove only the stage owned by this operation. If removal fails, show its exact path and the cleanup error. Never glob-delete by prefix, and never clean up the source or the final name as a side effect.

Cancellation is accepted between copy chunks and before the commit starts. Once publication begins, finish that small critical section and report whether it succeeded; do not pretend a post-commit cancellation rolled back a published file. Permission errors, disk-full errors, source changes, metadata errors according to the chosen policy, sync errors, collision errors, and OS publication errors must remain distinguishable in logs and user-facing messages.

A byte count or digest can verify the bytes written to the stage, but a digest does not prove that the source was a stable snapshot, that metadata is complete, or that the final directory entry is crash-durable. Make read-back hashing an optional integrity cost unless benchmarks and product needs justify it as the default.

## Alternatives and decisions retained

- **Retained:** destination-local staging; cross-volume source support; never alter the source data; explicit replacement confirmation; byte progress and cooperative cancellation; useful timestamps with an honest metadata scope; cleanup limited to the stage owned by the operation.
- **Retained with a condition:** copy2/fast-copy for a speed-first mode, with indeterminate progress and measured platform support. A separate platform archival copy tool remains a possible future backend for ACLs, streams, resource forks, or other extended metadata.
- **Rejected:** copying directly into the visible final file; using shutil.move on the selected original; claiming copy2 preserves all metadata; claiming a move return makes output durable across sudden power loss; assuming an exists() check prevents a later collision.
- **Not certified in v1:** network/shared destinations and filesystems whose same-directory publication, collision, or persistence behavior has not passed the matrix below.

## Validation plan (not executed)

1. **Bytes and source:** compare source and destination hashes and sizes for empty, small, multi-GiB, sparse where supported, and changing-source fixtures. Verify source content is never truncated/deleted. Test same-volume and cross-volume source reads.
2. **Metadata:** verify the promised modification-time precision and mode behavior on Linux and Windows. Include ACL, owner, alternate stream, extended-attribute, resource-fork, and access-time cases to ensure the UI disclosure is accurate. Do not infer complete fidelity from upstream copy2 tests.
3. **Progress and cancellation:** exercise cancel before copying, during slow reads/writes, near EOF, and just before commit. Check worker-thread responsiveness, progress monotonicity, bounded memory, and cleanup failures.
4. **Publication:** test new target/no-replace and confirmed replace on every certified filesystem. Race a second exporter and an external writer into the same name. Replace or remove the observed target during a long copy. Verify no unapproved overwrite, no visible partial final, and behavior with a target symlink/reparse point, directory, read-only file, and open handles (especially on Windows).
5. **Failures:** inject disk full, permission denial, destination removal, source replacement, metadata failure, file fsync failure, rename/replace failure, directory sync failure, process cancellation, and cleanup failure at each stage. Verify error text and that old targets/source remain as promised.
6. **Durability:** run separate process-kill and controlled power-interruption tests on named filesystems and hardware. Process kill is not a power-loss test. Even successful tests cover only that matrix; they cannot justify a universal guarantee for untested filesystems or hardware.
7. **Performance:** benchmark bounded streaming with several buffer sizes against copy2/fast-copy using large files on Linux and Windows, same-volume and cross-volume source reads. Measure throughput, cancellation latency, CPU use, and UI update cost. Do not infer performance from CPython's fast-copy availability alone.

The pinned CPython test file contains selected copy2 metadata assertions and cross-filesystem move tests whose rename operation is mocked. Those tests are useful behavior evidence, but they are not real-mount tests for this application and do not establish Windows behavior, publication races, power-loss durability, or application progress/cancel semantics. No CPython tests or application tests were run for this proposal.

## Provenance and execution route

The public primary-source locators, exact CPython source hashes, governing scopes, and remaining uncertainty are recorded in source-map.json. This work used static source inspection and primary documentation lookup; no executable behavior witness was run.

Requested route: Luna Max Standard. The T3 runtime reported gpt-6-luna with max reasoning effort. The native Goal creation receipt exposes no provider, account, or service-tier field; those remain unknown.
