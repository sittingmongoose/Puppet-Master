# Criticism dispositions — B01-P02 control

## C1 — standard extraction path handling

**Decision: amend the factual claim; keep the stricter product policy.** The draft said extractall passes names through unchanged and offers no path protection. That is false for CPython 3.13.9. The docs describe stripping absolute roots, drive/UNC prefixes, and parent components, plus Windows character replacement. The tagged implementation routes extract and extractall through _extract_member, removes drive, empty, dot, and parent components, then sanitizes selected Windows characters and trailing dots/spaces. The tagged tests exercise common traversal and Windows-specific names. **P1, ZipFile.extract and extractall; P2, ZipFile._extract_member and _sanitize_windows_name; P3, ExtractTests.test_extract_hackers_arcnames_common_cases and ExtractTests.test_extract_hackers_arcnames_windows_only.**

The final proposal retains a reject-before-write policy because sanitizing a member name can change its destination and collapse distinct names. The corrected statement is that CPython applies path transformations and documents a warning; those transformations do not prove the product's broader cross-platform namespace, collision, quota, cancellation, or publication requirements. No claim is made that the standard API must never be used.

## C2 — zipfile.Path validation

**Decision: accept.** CPython 3.13.9 documentation explicitly says Path does not sanitize archive names and places validation or sanitization on the caller. Path is not treated as an extraction boundary. The preview is built from ZipInfo entries and performs its own strict checks; Path remains a possible navigation convenience only after validation. **P1, Path Objects note.**

## C3 — duplicate and normalized destination collisions

**Decision: accept and amend.** Keeping the first member and writing later members to the same destination would contradict rejection of ambiguous collisions; a checksum cannot show which content the user intended. The final proposal blocks every member in an exact or portable-equivalent collision group and blocks file/ancestor conflicts. It does not rename or merge. It allows unrelated, unambiguous selections only after the collision diagnostics are visible.

Primary evidence supports the mechanism: ZipFile.open accepts a ZipInfo object; ZipFile._RealGetContents retains each record in filelist while NameToInfo is keyed by filename; _extract_member opens the destination in wb mode, so a later write can replace prior file contents. The product still uses ZipInfo identity and rejects destination collisions before any write. Windows equality rules and filesystem-specific behavior are subject to Linux/Windows validation. **P1, ZipFile.open; P2, ZipFile._RealGetContents, ZipFile.open, and ZipFile._extract_member.**

## C4 — resource, integrity, staging, policy, alternatives, and scope conditions

**Decision: keep with conditions and tighten the bounds.**

- **Actual byte budgets and cancellation — keep.** The final design requires actual returned and written byte counters, aggregate and per-file caps, archive and central-directory bounds, a bounded worker, cancellation, and explicit disk/permission failures. CPython documents disk-exhaustion, decompression-bomb, interruption, and filesystem-limit risks. The tagged implementation reads the full central directory into a bytes object during ZipFile initialization, so a member-count check after construction is not an adequate memory bound. **P1, Decompression pitfalls; P2, ZipFile._RealGetContents.**
- **Compression support — amend to a release policy.** CPython 3.13.9 supports stored, deflate, BZIP2, and LZMA when required modules exist, and raises errors for unsupported methods or missing codecs. The v1 product set is stored and deflate; BZIP2/LZMA are explicitly reported and deferred until both platforms demonstrate a hard memory bound. This is a product restriction, not a claim that CPython lacks those capabilities. **P1, compression constants and ZipFile.read; P2, ZipExtFile._read1 and _check_compression.**
- **Encryption — keep product rejection, correct library claim.** CPython can decrypt supported encrypted members with a password; its documentation warns that decryption is slow. Strong encryption and other unsupported methods can raise NotImplementedError. V1 has no password prompt and rejects every encrypted member by policy; passwords are never logged. **P1, module overview and ZipFile.open; P2, ZipFile.open.**
- **CRC and corruption — keep with a precise scope.** Read each selected member through its logical EOF; CPython checks CRC there and tests bad CRC errors. Only selected members actually read are integrity-checked. CRC is not authenticity. **P2, ZipExtFile._update_crc; P3, AbstractBadCrcTests.test_read_with_bad_crc and test_testzip_with_bad_crc.**
- **Staging, no execution, and existing-project protection — keep.** The brief requires a new project and no execution or automatic trust. The proposal publishes only after selected entries pass the checks, uses a no-replace commit, and removes only import-owned staging on pre-publication failure. These are product requirements and recommendations; CPython sources do not establish cross-platform atomic publication, ACL, crash-durability, or cleanup guarantees. Those remain explicit validation gates.
- **Alternatives and history — keep.** Prior direct extraction into an existing project remains rejected because cancellation or overwrite can leave mixed state. Standard extract into an isolated, prevalidated stage remains a legitimate alternative and is not prohibited as a library capability; controlled streaming is selected for byte quotas, cancellation, and exact preview behavior. A manifest-based format remains future work and cannot replace general ZIP import here.
- **Validation honesty — keep.** Only source inspection and primary-source lookup were performed. No importer, Windows run, adversarial test, or publication durability test was executed. The final proposal preserves that distinction and lists those checks as future work.

## Additional source-backed issue A1 — NUL-truncated names

**Decision: accept and add a preflight check.** CPython 3.13.9 stores the decoded name in orig_filename and then creates filename through _sanitize_filename, which truncates at the first NUL. Compare the two and reject a difference before preview, collision detection, or import. This prevents the application from presenting or validating only a silently shortened path. **P2, ZipInfo.__init__ and _sanitize_filename.**

## Additional source-backed issue A2 — central-directory allocation precedes application limits

**Decision: accept and add a pre-open bound.** _RealGetContents reads size_cd bytes into memory before it builds ZipInfo entries. Therefore an application check of len(infolist()) occurs after that allocation. Bound the source snapshot before ZipFile construction and select a product central-directory or archive-size cap; also bound the worker. Exact numeric values remain unresolved because the brief gives no workload corpus. **P2, ZipFile._RealGetContents.**
