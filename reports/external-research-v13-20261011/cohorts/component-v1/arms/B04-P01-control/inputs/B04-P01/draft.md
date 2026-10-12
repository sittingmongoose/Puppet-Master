# Media export proposal — investigator draft

## User contract and data path
The user selects an immutable media file and an output directory. Record its identity and size, request confirmation before replacing an existing destination, and keep the source unchanged. Work outside the GUI thread. A fresh staging file owns the entire partial result; cancel/failure removes only that file and displays a useful error. Success means bytes were copied and published, not that the source was deleted. Recheck source identity after copying; if the immutability assumption was broken, fail or retry with explicit user feedback.

Use `shutil.copy2` for GiB files because CPython may use kernel fast-copy operations [S1,S2]. It preserves all original metadata, including Windows alternate streams and ACLs, so it can advertise an archival-fidelity export. Timestamps and executable mode matter for some users; retain a post-copy report. Kernel-assisted operations do not expose granular progress callbacks, so show an indeterminate phase where necessary. A streaming copy with a fixed buffer is a viable fallback when accurate byte progress and cooperative cancellation outweigh peak throughput. Neither option should read the entire source into RAM.

## Publication and replacement
Create staging in the application's temporary directory, which may be on a different filesystem from the destination. When ready, use `shutil.move(stage, final)`; this has a single atomic publication boundary even across volumes because Python chooses rename or copy-and-delete internally [S2]. Check `final.exists()` before starting to prevent any unconfirmed replacement. For approved replacement, preserve the old file until the operation is ready; an error must not leave a half-written final file. Using move on the original source is forbidden: this operation is an export.

Atomic rename means the file is durable across power loss as soon as move returns. We therefore need no flush/fsync sequence or filesystem-specific crash testing. This promises users that completed exports survive sudden shutdown on all supported destinations. The proposal does not distinguish visibility atomicity from persistent-media durability.

## Alternatives and history
Earlier direct copying to the final name was rejected because observers and canceled runs could see a partial file. Retain same-filesystem rename/replace as an interesting publication primitive. `copyfile` copies content without the extra metadata work; `copy2` attempts more metadata. A dedicated platform archival copy tool could preserve features Python does not handle, but brings packaging, platform and trust costs. Network/shared destinations are not certified for the first release; report unsupported destination semantics rather than making local-filesystem claims universal.

## Validation status
Docs and code plus upstream copy tests [S3] were inspected, not executed. Propose byte-digest/size checks, cancellation during streaming, kernel-copy fallback, disk full, permission errors, existing destination races, broken source immutability, alternate-volume staging and open-file behavior on Windows. Use separate tests for reader-visible atomicity and crash recovery. A passed byte hash does not prove metadata fidelity or durable publication. Application/platform benchmarks and real filesystem interruption testing remain future work.
