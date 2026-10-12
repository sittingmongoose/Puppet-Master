# CPython ZIP import component — final proposal

**Status:** design proposal for the requested CPython 3.13.9 target. No importer was implemented or run in this review.

**Decision:** keep general ZIP import. Preview the archive, let the user choose supported text and media members, and create a new project through a validated streaming importer. Build the destination namespace before writing. Reject unsafe names and every ambiguous destination group without silently rewriting names or choosing a winner. Stream selected members into a private staging tree, enforce configured resource limits against actual bytes written, read each selected member to its logical EOF so CPython can check its CRC, and publish the completed tree with one no-replace atomic directory operation. Never merge into an existing project.

The work covers untrusted archive metadata and bytes, Linux and Windows filesystem behavior, nested paths and selected empty directories, cancellation, corruption, unsupported codecs and encryption, failure cleanup, and alternatives. It does not claim that ZIP CRC is authenticity, that a filename proves file type, or that a private staging directory protects against a hostile process with access to the same user account. The Python Software Foundation release page identifies 3.13.9 as a maintenance release dated 14 October 2025; the requested patch version is retained as the governing target. Re-review the implementation against the exact runtime shipped if that changes. [P4]

## Import boundary

Imported members are data. The application does not run, compile, activate, or open them through the operating system. It does not assign executable permissions from ZIP metadata, auto-open imported files, or treat scripts as trusted. If the product allowlist includes scripts as text files, they remain inert inside this flow and visibly untrusted. Preview code must not invoke arbitrary media decoders or shell handlers; any later rendering feature needs its own safe preview boundary.

Invariant: The importer never launches extracted scripts.

## Preview and name decoding

Open the archive for reading only and build the preview from the ordered ZipInfo objects returned by ZipFile.infolist(). Show each decoded member name, inferred file or directory role, declared compressed and uncompressed sizes, compression method, encrypted status, and whether the entry is eligible for selection. Label sizes as archive metadata, not measured output. Build parent folders for nested selections and preserve explicit empty folders when the user selects them. Unsupported, malformed, encrypted, and unsafe entries remain visible with a reason; the interface never silently drops them.

For CPython 3.13.9, member names with the ZIP UTF-8 flag are decoded as UTF-8. Otherwise the default is CP437; ZipFile(metadata_encoding=...) can override legacy metadata decoding for the whole archive, but the UTF-8 flag takes precedence and the override cannot vary by member. Offer a deliberate archive-wide encoding choice only when the preview appears misdecoded. Rebuild the preview and rerun path and collision checks after every change. An invalid flagged UTF-8 name or an unusable selected encoding is a preview error, not a guessed replacement character. [P1, P2, P3]

CPython preserves a decoded name as ZipInfo.orig_filename, then sanitizes ZipInfo.filename: it truncates at the first NUL and normalizes platform separators. Compare those fields and reject an entry when they differ; do not let a NUL suffix disappear from the name shown to the user or from collision analysis. This is a CPython behavior, not a ZIP security guarantee. [P2]

The release docs warn that archives from untrusted sources need prior inspection. zipfile.Path does not sanitize names; it is therefore not the preview security boundary. A future UI may use Path for navigation only after explicit validation, but this design uses ZipInfo records directly so that duplicate records and their metadata remain visible. [P1]

The product needs a maintained allowlist for supported text and media formats. The brief does not define that list, so it must be agreed before implementation. Use names and a bounded signature probe only to classify eligibility; neither extension nor signature is proof that content is safe. Do not decode media during import. Preserve file bytes unchanged. Unknown and unsupported types are disabled or explicitly skipped with a diagnostic.

User feedback rule: Show these failures as import diagnostics rather than silently omitting a member.

## Path policy and collision decisions

Preflight the entire archive namespace before the user can commit a selection. Treat ZIP names as archive-relative names using forward slash separators. Do not pass them through a sanitizer. Reject absolute or rooted paths, drive and UNC forms, any backslash, NUL or control character, empty components, dot or parent components, colon or platform-forbidden characters, components ending in a dot or space, reserved Windows device names, non-NFC names, excessive depth, and paths beyond configured platform length limits. Keep valid nested folders exactly as previewed.

For cross-platform imports, compute a conservative collision key from NFC-normalized, Unicode case-folded path components. Also check file-versus-directory conflicts, duplicate directory records, and a file used as an ancestor of another entry. This can reject some names that coexist on a particular Linux filesystem; the deliberate tradeoff is one portable namespace and no silent overwrite on the common case-insensitive Windows target. Windows and filesystem-specific equivalence still needs real platform testing.

Mark every member in a collision group and every entry beneath a conflicting file ancestor as non-importable. The user may import unrelated, unambiguous entries from the same archive after explicitly reviewing those diagnostics. Do not rename, merge, keep the first, or rely on CRC to choose among colliding entries. If the product later adds rename mapping, require a visible, complete mapping to unique destinations and rerun the same namespace checks before writing.

Reject symbolic links and special-file entries identified by recognized creator metadata. Accept only regular files and directories under the product's declared entry-type rules. Never materialize a link, device, owner, executable bit, or other privileged attribute from the archive. Ignore timestamps or clamp them to a safe range rather than letting invalid metadata fail the entire import.

The path policy is intentionally stricter than CPython extraction. In 3.13.9, ZipFile.extract() and extractall() route through _extract_member(), which removes drive prefixes and empty, dot, and parent components; on Windows it also replaces selected illegal characters and trims trailing dots and spaces. The docs describe those transformations and still warn callers to inspect untrusted archives. The upstream tests exercise common traversal and platform-specific cases. These facts amend the draft's claim that standard extraction performs no path modification. Sanitizing is not the same product policy as rejecting an unsafe or ambiguous original name. [P1, P2, P3]

## Compression, integrity, and resource limits

CPython's ZipFile.open(info) accepts a ZipInfo object, which addresses a duplicate-name record by identity. Keep that capability even though this release blocks colliding destinations before writing. Do not call read(name) or resolve selected members back through the name-to-info dictionary after selection. [P1, P2]

For the first release, accept only ZIP_STORED and ZIP_DEFLATED members. CPython 3.13.9 also supports ZIP_BZIP2 and ZIP_LZMA when the matching modules are present, but its ZIP reader's deflate branch calls the decompressor with an output limit while the other decompression branch has no equivalent max-output argument. Defer BZIP2 and LZMA until the importer has a tested memory bound for them on both target systems. All other methods, missing codec modules, and encrypted members are shown with a specific reason and cannot be selected. This is a product restriction, not a statement that Python cannot read every encrypted archive: CPython can decrypt supported encrypted entries when given a password, but its docs note that decryption is slow; this product deliberately has no password flow and rejects all encrypted entries. [P1, P2]

Set nonzero product limits before shipping: maximum archive bytes, central-directory bytes or an equivalent pre-open bound, member count, name and path length, per-file output, total output, file count, and worker wall time. No values are defined by the brief or CPython docs, so choose and publish them against real project archives before implementation. If a limit is unset, fail closed. Check the archive byte limit while copying the user-selected archive into an importer-owned snapshot, then parse that stable copy. CPython reads the central directory into a byte string while constructing ZipFile, before application code can check the number of ZipInfo entries; a post-open member-count cap alone does not bound that allocation. The archive-size or central-directory bound must therefore be applied before this parse. [P2]

Use a worker with cancellation and a hard process resource limit on each operating system. For each selected member, reject declared sizes above the configured cap early, then call ZipFile.open(info) and copy in bounded chunks to a new exclusive file in staging. Count bytes returned and bytes successfully written; stop before a per-file or aggregate cap can be exceeded. A worker wall-time limit and user cancellation stop decompression; a memory limit bounds parser and codec allocations; disk-full, permission, and write errors abort the transaction. The CRC and size fields are useful checks and preview estimates, not trusted quota controls. CPython's member stream uses metadata file_size as a logical read bound, so validation must be described as validating the bytes CPython exposes for that member, not proving that the ZIP producer intended no other data.

For selected files, consume the member stream to logical EOF and treat BadZipFile, CRC mismatch, decoder errors, size mismatch, or early termination as failure. CPython updates the running CRC and compares it at end of stream; the upstream tests assert that a bad CRC raises BadZipFile on reads, including small reads. Closing a stream early does not establish that the selected member passed integrity checks. The integrity boundary covers selected members actually read; it does not claim that unselected content was decompressed or CRC-checked. CRC is corruption detection, not proof of source authenticity. [P2, P3]

Integrity rule: Reading through EOF is part of detecting CRC mismatch; a filename-based allowlist does not prove content type.

## Staging, publication, and failure behavior

Create an unpredictable, importer-owned staging directory beside the intended new project so publication stays on one filesystem. Apply owner-only access on Linux and an explicit current-user ACL on Windows. Open every output file exclusively, create only validated relative paths, and never open an existing project for writing. Files receive safe ordinary permissions regardless of ZIP mode bits. Keep the staging tree private until validation completes.

The project name must resolve to a new destination inside the browser's managed project root. If any project already occupies it, stop without changing that project. After every selected member has passed its path, type, size, stream, and CRC checks, flush and close staged files, validate the final tree, and publish once using an operating-system atomic directory move with no-replace semantics. If that primitive is unavailable or reports that a destination exists, fail closed; do not fall back to a replacing rename. Do not claim that visibility atomicity also proves power-loss durability. Test the final directory flush and recovery behavior separately on Linux and Windows.

Cancellation is checked while snapshotting the source, between member reads and writes, between entries, before the final tree check, and immediately before publication. Parsing the central directory itself may not be interruptible in-process, which is why parsing runs in a bounded worker that the parent can terminate. Before publication, every failure or cancellation removes only the staging directory created by this import. Cleanup is limited to that directory identity and its ownership marker; never recursively remove a path derived from archive metadata. If cleanup fails, report the owned staging identifier and leave unrelated projects untouched.

The atomic publication is the commit point. Before it, no final project exists. After it succeeds, report success; if a subsequent directory flush reports an error, report “published, durability uncertain” rather than describing a visible project as absent. The importer never modifies an existing project. Stale staging recovery may remove only an inactive, versioned staging directory with a valid importer marker and verified ownership; age alone is not enough.

Record a local import manifest in the new project with the importer version, Python version, archive digest, selected relative member names, measured output byte counts, chosen legacy metadata encoding, and diagnostics. Omit passwords and absolute local source paths. Escape untrusted names in the UI and logs. A digest records which input was used; it does not establish that the archive is trustworthy.

## Alternatives and history

Historical decision carried forward: An earlier one-click direct extraction into an existing project was rejected because cancellation and overwrites could leave mixed state.

Standard extraction into a new private staging tree remains a real alternative. After a strict full namespace preflight, extract(info, stage) can extract individual ZipInfo objects, and its own sanitizer supplies an additional path transformation. It is simpler and maintained by CPython. It is not selected for this release because _extract_member opens each target with wb and copies without an application cancellation checkpoint or actual-output quota at each write. Its silent transformation is also at odds with the preview's reject-and-explain policy. This is a reason to choose controlled streaming for these product constraints, not a ban on the standard API: staged standard extraction remains useful for trusted archives or a future design that supplies equivalent quotas, collision rules, and failure behavior.

The selected validated streaming importer has more code to maintain, but gives the application a place to count actual output, stop between bounded reads, preserve ZipInfo identity, and keep a private all-or-nothing stage. Its scope must stay small: name validation, collision detection, bounded copy, diagnostics, and publication. It should not reimplement ZIP parsing, compression, encryption, or CRC. CPython's zipfile remains the format reader.

Future alternative boundary: A format-specific project package with a manifest is a future alternative; it cannot replace general ZIP import in this brief.

A manifest-based project package may later add stronger semantic validation and provenance, but users still need general ZIP import under this brief. It is not a substitute for this component.

Review and validation status: Inspection of Python docs and extraction code/tests is actual work; adversarial import tests, Windows runs and publication durability checks are proposed, not executed.

## Acceptance criteria and unresolved decisions

Before release, all of these must pass on Linux and Windows using the exact CPython 3.13.9 build:

1. Preview preserves nested structure, selected empty directories, decoded names, duplicate records, compression and encryption status, and explicit diagnostics. Changing the archive-wide legacy encoding rebuilds the preview and collision map. Invalid UTF-8 and NUL-truncated names are rejected visibly.
2. The whole destination namespace rejects absolute, rooted, drive, UNC, backslash, parent, dot, empty, reserved, forbidden, non-NFC, overlong, symlink-like, special-file, duplicate, case-fold-equivalent, and file/directory-prefix conflict cases. No unsafe name is silently sanitized or renamed. Nonconflicting selected entries remain importable only when every collision group is excluded.
3. The importer handles selected ZipInfo records distinctly, streams stored and deflated members with bounded reads, enforces configured actual-byte, file-count, path, memory, disk, and time limits, and detects selected-member CRC failures. Compression methods outside the declared product set and all encrypted entries are not imported and have useful diagnostics.
4. Inject failure or cancellation during snapshot, parse, stream, write, close, validation, and publication. Verify the source archive is not modified, every pre-publication failure removes only its owned stage, and existing project files and hashes are unchanged. Verify a successful import publishes one complete tree, while concurrent imports and a pre-existing destination cannot replace or merge into a project.
5. Exercise disk exhaustion, read-only destinations, long paths, Unicode and case behavior, Windows file locks and antivirus interference, stale-stage recovery, process termination, and power-loss/directory-flush behavior. Confirm the importer never starts a subprocess for imported content, applies no executable bit, and does not invoke an OS file handler.
6. Test central-directory size and entry-count bounds before ZipFile construction, including an archive at each limit and one byte or entry above it. Check ratio bombs, declared-size mismatch, truncated data, unsupported methods, builds without optional codec modules, corrupt headers, and cancellation. Confirm memory and time limits hold for BZIP2/LZMA only if those methods are later added.
7. Confirm only the user's selected content is imported. Report that unselected member payloads were not CRC-checked. Confirm type allowlist behavior with misleading suffixes, valid content, malformed content, and polyglots; the final supported text/media list remains a product decision.

**Release gates still needing owner input:** accepted text/media formats; numeric budgets for the named limits; whether any later release should support BZIP2 or LZMA; the platform-specific no-replace directory primitive and ACL implementation; and the exact visibility and durability promise on each filesystem. No default numbers are invented here because the brief provides no representative archive corpus or expected project sizes. The feature must not ship with unbounded values.

**Evidence and scope:** The cited sources below are CPython 3.13.9 release-tag documentation, implementation, tests, and the PSF release page. Source inspection is not an importer test, a Windows run, a penetration test, or a filesystem durability result. All such product validation remains future work. Reopen the evidence if the shipped Python patch version differs from 3.13.9.

## Primary references

- **P1 — CPython 3.13.9 zipfile documentation:** [tagged documentation source](https://github.com/python/cpython/blob/v3.13.9/Doc/library/zipfile.rst)
- **P2 — CPython 3.13.9 zipfile implementation:** [tagged implementation source](https://github.com/python/cpython/blob/v3.13.9/Lib/zipfile/__init__.py)
- **P3 — CPython 3.13.9 zipfile tests:** [tagged test source](https://github.com/python/cpython/blob/v3.13.9/Lib/test/test_zipfile/test_core.py)
- **P4 — Python 3.13.9 release:** [PSF release page](https://www.python.org/downloads/release/python-3139/)
