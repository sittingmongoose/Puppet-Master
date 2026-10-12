# Criticism dispositions — B04-P01 control

These dispositions resolve the conventional full critique against the complete proposal in [final.md](final.md). Source keys and exact public locators are in [source-map.json](source-map.json). Admitted copied files and listed neighborhood captures matched their input-map SHA-256 values.

## F1 — Metadata promise and copy choice

- **F1.1 — Accept:** Remove the claim that copy2 preserves all metadata or provides archival fidelity. CPython warns that even higher-level copy functions cannot copy all metadata. Documented losses include POSIX owner/group and ACLs, Mac resource forks and other metadata, and Windows owner/ACL/alternate streams. Evidence: S1-N1.
- **F1.2 — Keep:** Retain copy2 as a useful copy choice. CPython says copy2 attempts metadata preservation, uses copystat, and does not raise merely because some metadata could not be copied. This does not justify rejecting useful timestamps, mode/flags, or Linux xattrs where supported. Evidence: S1-N2; S2 lines 432–470.
- **F1.3 — Amend:** Promise primary data-stream bytes plus best-effort timestamps/metadata, with an attempted/not-copied/unknown report. The upstream copy2 test checks selected mode/time attributes and optional flags; xattr coverage is conditional, not proof of full fidelity. Evidence: S3 lines 1392–1454.
- **F1.4 — Keep:** A platform archival tool remains an option only if full fidelity becomes an explicit requirement. Evidence: metadata gaps in S1-N1. Tool choice and capabilities remain future work.

## F2 — Cross-volume publication and destination races

- **F2.1 — Accept:** Stage in a unique file in the destination directory. This keeps partial bytes off the final name and puts publication on the destination filesystem, while preserving exports whose source is on another volume.
- **F2.2 — Accept:** Do not use shutil.move to publish. CPython tries rename, then on failure copies to the destination and removes the stage; that is copy-and-delete, not one atomic final-name publication. Evidence: S1-N3; S2 lines 814–878.
- **F2.3 — Accept:** A check-then-replace sequence is not a no-replace guarantee. The no-confirmation branch now uses a no-replace operation and fails closed when the Linux filesystem lacks it. CPython documents Windows os.rename as failing if the destination exists; Linux RENAME_NOREPLACE fails on an existing name and requires filesystem support. Evidence: S4 lines 2676–2692; W3.
- **F2.4 — Amend:** Replace only after explicit confirmation; recheck target identity before publication. The proposal states the remaining race after that check and scopes v1 replacement to user-controlled local directories. It does not claim protection from a hostile, uncooperative writer. Evidence: S4 lines 2726–2732; W2.
- **F2.5 — Keep:** Source remains untouched; errors clean only the job-owned stage; ambiguous publication states are preserved and reported rather than blindly deleted.
- **F2.6 — Uncertain:** Windows reader-visible atomicity and exact behavior on each filesystem remain release-test questions. CPython documents atomicity as a POSIX requirement; Microsoft documents Windows replacement flags but not a universal POSIX-equivalent guarantee. Evidence: S4 lines 2676–2732; W2. No such tests ran.

## F3 — Visibility and crash durability

- **F3.1 — Accept:** Separate publication visibility from crash durability. Remove the draft’s claim that rename return guarantees power-loss durability. CPython describes successful replace/rename atomicity under the POSIX requirement, not a general durability guarantee. Evidence: S4 lines 2726–2732.
- **F3.2 — Amend:** Flush buffered writes before os.fsync, sync the completed stage before publication, and request a containing-directory sync after POSIX publication where supported. If post-publication sync fails, report that the output is visible but crash persistence is unconfirmed. Evidence: S4 lines 1086–1095; W4.
- **F3.3 — Accept:** Do not describe a successful hash or rename as proof of durable media. A hash checks bytes; it does not test power-loss ordering or device caches.
- **F3.4 — Uncertain:** Actual crash behavior on Linux/Windows filesystems and hardware is unresolved because no interruption test ran. Microsoft documents REPLACEFILE_WRITE_THROUGH as unsupported and limits MOVEFILE_WRITE_THROUGH to copy/delete moves, which this proposal avoids. Evidence: W1 lines 84–92; W2 lines 90–95.

## F4 — Preserved requirements, alternatives, and uncertainty

- **F4.1 — Keep:** Preserve the immutable-source assumption, multi-GiB bounded memory, explicit authorization, original-source preservation, worker-thread execution, progress/cancel, owned cleanup, and useful diagnostics.
- **F4.2 — Keep:** Retain copy2 as a fast-copy option with indeterminate progress and bounded streaming as the granular progress/cancellation alternative. CPython says fast-copy may be used, not that it is always used or universally faster. Evidence: S1-N4; S2-N1.
- **F4.3 — Reject:** Reject the unconditional rationale “copy2 because it is faster.” The source supports “may use fast-copy”; no application benchmark ran. Keep fast copy optional pending measurement. Evidence: S1-N4.
- **F4.4 — Keep:** Keep direct-to-final copying rejected and moving the original forbidden.
- **F4.5 — Keep:** Keep network/shared destinations uncertified for v1, while preserving ordinary cross-volume source-to-local-destination exports through destination-local staging.
- **F4.6 — Keep:** Keep upstream source inspection separate from executed application evidence. Docs, implementation, and upstream tests were inspected; no application tests or benchmarks ran.
- **F4.7 — Uncertain:** Windows replace semantics, destination metadata behavior, cross-volume filesystem behavior, fast-copy performance, and crash durability remain uncertain pending platform-specific validation. The final does not claim those tests ran.

## Overall disposition

The proposal adopts F1–F3’s core corrections, preserves legitimate capabilities and constraints from F4, and marks platform-specific atomicity, metadata, performance, and power-loss behavior as uncertain where the primary evidence does not settle them. No material criticism is silently dropped.