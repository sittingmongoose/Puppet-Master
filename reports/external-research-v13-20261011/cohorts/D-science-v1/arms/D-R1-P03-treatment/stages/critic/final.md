# D-P03 backup and restore — critic-finalized proposal

## Recommendation

Deliver a portable, self-contained whole-workspace archive first, with an application-owned versioned manifest, a coordinated capture boundary, a read-only restore preview, and an isolated staged restore. Do not choose a container, storage engine, or encryption library before compatibility and failure tests establish the supported behavior. Keep the live workspace and last verified archive intact until their replacements pass their respective checks.

A closed or parseable archive is not proof of a coherent capture. A verified container is not proof of successful extraction. Successful extraction is not proof of schema, reference, or application validity. Only an application-level open/read/use check supports describing the staged result as usable. Show the highest completed level and its limitations.

## Capture and archive contract

Create one logical generation spanning records, attachment bytes, and preferences. The application must either quiesce writes for the capture or use engine-specific snapshots plus immutable/versioned attachment capture and a generation check. A database snapshot alone does not make independently stored preferences and attachment files atomic. If an attachment or preference changes during capture, use a stable version, detect the change and retry, or fail the backup. Never claim a coherent point-in-time workspace when the implementation cannot prove one.

Keep archive-format version, application data/schema version, and encryption-envelope version separate. The manifest should record at least:

- generation ID and capture time;
- producer application build/version if available, separately from schema version;
- archive/container and app-schema versions;
- stable record and attachment IDs, serialized record data, and explicit attachment references;
- expected member path or safe generated member ID, byte size, and SHA-256 of the bytes;
- an exact included-member inventory and an excluded-item inventory with a reason for every exclusion.

Attachment names are display metadata, not identity. Use safe generated IDs or content-addressed member names; preserve the original name as data. Avoid original local paths in any publicly visible envelope. When protection is enabled, put the manifest and other sensitive metadata inside the encrypted payload. With an unencrypted archive, a manifest digest detects a changed member only when the manifest itself is trusted; a digest stored beside mutable data is not a signature or source-authentication mechanism.

A conservative ZIP/ZIP64 subset and tar plus a selected compressor are both candidates. Keep the application manifest independent of container-specific metadata. Before selecting an implementation, test duplicate entries, duplicate normalized paths, UTF-8 and long names, ZIP64 and large files, path traversal, symlink ordering, file-count/size limits, compression ratios, special files, and interrupted reads/writes. These are choices to qualify; the proposal does not select ZIP, tar, or a library.

## Snapshot and publication

Write to a unique temporary output on the destination volume. Complete and close the container, perform supported flush/sync operations, reopen it, verify the expected member set and every member’s size and hash, compare the actual inventory with the manifest, and run applicable semantic checks. Publish a completed archive name or marker only after these gates pass and the engine-specific capture reports success. Use platform-tested same-volume publication; record platform and removable-filesystem durability limitations.

Cancellation, source read failure, excluded or missing required data, disk-full, unplugged removable media, interrupted finalization, failed validation, or failed publication must not create a “current complete protection” status. Retain the last verified archive. A partial diagnostic artifact may be retained only if clearly labeled incomplete and never promoted as the current backup.

If SQLite is selected, do not copy a live WAL database’s main file by itself: committed transactions can still be in the WAL. The Online Backup API copies a database consistently while locking the source only during individual steps; BUSY and LOCKED may be retried, while IOERR, NOMEM, and READONLY are fatal. The destination connection must remain unused during the backup handle’s lifetime [S01, S02]. VACUUM INTO is another live-database snapshot option, but SQLite documents that interruption or power loss during the command can leave its output incomplete and corrupt. Keep that output private, and require command completion plus independent verification before promotion; test this interruption path if selected [S13]. Neither SQLite option captures separate files/preferences as one application transaction.

The current SQLite WAL-reset notice is a conditional engine-qualification issue, not a general statement that backups corrupt databases. SQLite lists likely affected versions from 3.7.0 through 3.51.2, fixes in 3.51.3+ and backports 3.44.6/3.50.7, and a narrow condition involving two connections in separate threads/processes writing or checkpointing at the same time [S02]. If SQLite/WAL is chosen, pin and test the bundled engine and relevant concurrency pattern.

## Restore preflight, migration, and preview

Treat every archive as untrusted input. Before writing outside private staging, reject absolute, parent, drive/UNC, symlink/hardlink escape, duplicate-normalized-path, and special-file entries; enforce member count, uncompressed size, and other resource limits. Detect case-folding and Unicode-normalization collisions across the supported platform matrix. Default to not restoring symlinks or special files. If the Rust zip crate is chosen, qualify a fixed supported release and retain a regression for the advisory’s earlier-symlink/later-file escape; the advisory lists affected versions >=1.3.0 and patch 2.3.0 [S05].

If encrypted, decrypt into private staging and require full authentication, including the valid final chunk, before treating plaintext as trusted or running inner archive logic. The age format is a candidate, not a selection: the cited v1.0.0 page is an older edition and v1.1.0 is the current edition checked here. Both require a sole scrypt stanza for passphrase wrapping and authenticated 64 KiB payload chunks with a valid final chunk [S06, S10]. Evaluate the chosen implementation’s version support, interoperability, work-factor bounds, error behavior, and resource limits before adoption.

Then verify the container, exact manifest inventory, member CRC/header checks where provided, and manifest hashes. A ZIP CRC is useful for accidental corruption but does not authenticate the member list. SHA-256 is a standardized digest for detecting changes; it does not identify who supplied the digest [S04, S09]. Where unencrypted adversarial modification matters, a separately designed signature or trusted digest channel would be needed. None is selected by this proposal.

Build a candidate workspace in a fresh staging location, apply known migrations there, validate its record and attachment relationships, and only then compare it with live state. A newer unsupported schema is a preview blocker; never guess a downgrade. Keep the archive-format version independent from the application schema. If SQLite is chosen, user_version is only an application-owned integer; integrity_check and foreign_key_check are separate, and foreign-key enforcement must be explicitly set as required rather than relying on defaults [S03]. Engine integrity checks do not establish attachment existence or application invariants. Test migrations in order from every supported prior schema on isolated copies, with engine-version differences qualified [S11].

The preview is read-only and enumerates exact proposed effects rather than only totals. For each record and attachment, show create, identical/no-op, update candidate, same-ID/different-content conflict, missing attachment, unsupported schema, invalid data, and any proposed reference remap. Show exclusions and unresolved references separately. The user must see the IDs, relevant values, and which local items would change before confirming apply.

Records and attachment objects have separate stable IDs. Resolve references by attachment ID, never by filename. Two IDs may share a displayed filename while holding different bytes. A missing payload remains a visible broken reference; it must not be replaced by a plausible same-named file. Offer explicit per-conflict policies such as keep live, replace with the archived version, or import as a new entity with a new ID and complete reference remapping. Do not silently overwrite, and do not use title or filename matching as identity.

## Restore and apply boundaries

For a new empty workspace, decrypt/verify, safely extract to a fresh candidate, migrate, validate schema and cross-resource relationships, and perform an application-level open/read/use smoke check. Keep the existing empty/live workspace until candidate promotion succeeds; preserve a rollback copy or recovery journal.

For merge into an existing workspace, apply preview decisions to a candidate copy, never to live data during preview. Before apply, require explicit confirmation and a workspace quiescence/lock boundary. A database transaction alone cannot atomically commit separately stored attachments and preferences. Use a transaction journal with startup recovery or a staged workspace swap with a tested rollback path. Directory rename is same-filesystem and platform-dependent; Rust’s rename contract does not establish power-loss durability or an atomic multi-file transaction [S08]. Test interruption at each transition and retain the pre-restore workspace until the candidate has passed its usability check.

## Passphrase protection, diagnosis, and recovery limits

Offer unprotected and passphrase-protected export only as an explicit owner/product decision. Whole-package encryption can conceal inner filenames, manifest, and payload, while outer version or envelope metadata may remain visible. Document precisely what is exposed. Do not put passphrases, keys, source paths, or secret-bearing values in logs or public headers.

Age v1.0.0/v1.1.0 illustrates a passphrase option using scrypt and ChaCha20-Poly1305. Its authenticated payload is streamed in chunks and a valid final chunk is required. Its scrypt stanza must be the only recipient stanza, so that format does not silently provide a second recovery recipient [S06, S10]. A library and release must still be selected and qualified. Offer an explicit warning and optionally a generated high-entropy phrase. In a passphrase-only design, a forgotten phrase has no recovery unless a separate recovery design is explicitly approved, implemented, and tested. Do not invent account reset, provider recovery, escrow, upload, or key retention.

Use honest stage-aware errors:

1. A parse failure or unknown public envelope/version marker is an **unverified visible marker**, not authenticated proof of a genuine format.
2. Failure to unwrap/decrypt/authenticate must say the passphrase may be wrong or the archive may be damaged or truncated; do not claim to know which.
3. Only after complete decryption/authentication may the application distinguish inner container/version failure, missing member, hash mismatch, migration failure, unresolved reference, or app-validation failure.
4. A successful decryption or integrity check still does not prove that the source workspace was valid, that the creator was a particular person, or that the restored application can use the data.

Authenticated encryption gives keyed integrity against changes by parties without the key; it is not a digital signature, does not prove archive authorship, and cannot validate the source workspace. If provenance is a real requirement, define a separate signature/trust design and key-management policy.

## Whole versus incremental, and package options

Start with self-contained full snapshots. They use more space and write time but can travel on removable media and restore without a parent chain. A delta or deduplicated repository can reduce repeated bytes, but it adds parent dependencies, ordering, retention/pruning, missing-base failure, repository metadata, and key-management requirements. A restore point is portable only when every dependency travels with it or exists in a verified repository.

Restic 0.19.1 is useful for comparison, not a selected product: it demonstrates snapshot deduplication, may create an incomplete snapshot with exit status 3 when source files cannot be read, and distinguishes structural repository checks from a full --read-data pass [S07, S12]. It does not provide this application’s coordinated logical snapshot, conflict preview, or schema migration. Benchmark such an alternative only if observed archive size or restore-time needs justify its added dependencies.

## Exact released-plan clause dispositions

| Released-plan clause | Disposition | Required treatment |
|---|---|---|
| “The draft exports records and preferences to structured text, copies attachments into an archive, and includes a manifest of member digests.” | Retain and specify the contract. | Deterministic serialization; independent container/schema versions; stable record/attachment IDs; generation ID; member ID/path, size, and byte digest; exact included/excluded inventory and reasons; expected set compared with actual members. Keep sensitive manifest data encrypted when protection is enabled. |
| “A backup marker would become current after the archive is closed and its manifest can be read back.” | Correction required. | Closure/readback is insufficient. Require a consistent capture, finalized output, inventory and digest verification, semantic gates, and supported sync/publication checks before marking complete/current. |
| “The draft assumes this establishes consistency between records and attachments even while users edit the workspace; investigate snapshot boundaries and concurrency rather than accepting archive closure as proof.” | Reject the assumption. | Use one coordinated generation or detect/retry/fail. Qualify engine snapshots and concurrent attachment/preferences capture. SQLite guidance applies only if SQLite is selected. |
| “Restore would extract to a temporary directory, verify listed digests, and show a preview of record counts and attachment conflicts.” | Retain and strengthen. | Use isolated private staging, safe extraction, exact-member checks, complete authenticated decryption where applicable, migrations, semantic checks, and per-entity preview effects. Counts alone are inadequate. |
| “A new workspace could then replace its empty store.” | Correction required. | Build and validate the candidate, perform app-level open/read/use, retain the old workspace through promotion, and test platform-specific recovery. |
| “A merge would use record identifiers and attachment filenames to choose updates, retaining conflicting items under renamed paths.” | Retain record IDs; reject filename identity and silent overwrite. | Use separate stable attachment IDs and content checks; resolve references by IDs; require explicit keep/replace/import-as-new choices and remapping. |
| “The implications for references, identifier collisions, and migration order need explicit review.” | Make these requirements. | Migrate staged data before merge simulation; compare equal/different content by stable ID; surface missing references and collisions; block unknown newer schema. |
| “For protected archives, the draft adds passphrase-based encryption around the complete package and stores its format version in an outer header.” | Retain as an option, not a package selection. | Encrypt the full inner archive and sensitive manifest; document visible envelope fields; version envelope, archive, and app schema separately; qualify selected implementation. |
| “It proposes one corruption message for any failed opening attempt.” | Reject. | Distinguish an unverified public marker, decryption/authentication failure with ambiguous cause, authenticated inner-format failures, migration failures, and application-validation failures. |
| “Compare protection and usability choices using governing mechanisms, distinguishing wrong credentials, damage, unsupported versions, and metadata exposure where possible without promising impossible diagnosis.” | Retain with honest limits. | Do not assert wrong password where damage is equally possible; do not call a public version marker authenticated; describe keyed integrity without implying author identity or workspace validity. |
| “Give evidence-backed dispositions for consistency, publication, integrity, migration, and merge rules.” | Covered by this proposal. | Use the source conditions and release qualifications below; do not generalize engine- or library-specific behavior. |
| “Compare direct restore with staged restoration and incremental with whole-workspace approaches.” | Recommend staging and full archives for v1; preserve alternatives. | Keep a rollback/journal boundary for merge apply. Reconsider repository/delta strategies after measured size and restore-time results. |
| “Propose witnesses for interruption during backup, missing members, duplicated names, schema changes, failed merge, and passphrase loss.” | Covered, with conditional additions. | Include cancellation, termination, disk-full, media removal, archive damage, path attacks, collisions, migrations, partial apply and restart recovery, incorrect/lost passphrase, and app usability. Add VACUUM INTO interrupted-output case if selected. |
| “Label any checks actually executed and avoid claiming our future application or real user archive has been restored.” | Retain. | Report documentation review and static plan-hash comparison as the actual work; all application/archive/storage/user-data witnesses remain proposed. |

## Owner decisions and unresolved applicability

Before implementation, owners must decide and document:

- Which record store, preference store, and attachment layout exist; whether they can be captured under one lock/version or need a generation/retry protocol.
- The supported OS/removable-filesystem matrix, container and library, maximum archive size, ZIP64/Unicode/metadata rules, and the durability level promised.
- Which archive and application schema versions remain supported, their migration order, and who owns conflict semantics.
- Whether passphrase protection is optional or default, which maintained crypto implementation is supported, what visible envelope metadata is accepted, and whether any separate recovery credential is approved.
- What “usable” means for a restored workspace and which safe app-open/read/use witness gates publication.
- Whether merge supports import-as-new and exactly how all references are remapped.

No storage engine, container, crypto package, key-recovery path, or migration policy is selected here. SQLite, age, Rust rename, Python zipfile, and restic are conditional references with the applicability boundaries stated above.

## Validation plan — proposed; none of these product checks were executed

| Area | Proposed witness and acceptance boundary |
|---|---|
| Capture consistency | Concurrently update a record, preference, and attachment. Accept one coherent generation or detect/retry/fail; no mixed generation becomes current. If SQLite/WAL is selected, exercise Online Backup API or VACUUM INTO under controlled writers. Inject interruption into VACUUM INTO if selected and verify its incomplete output is never promoted. |
| Completeness/publication | Inject cancellation, process termination, disk full, read denial, and removable-device disconnect during source capture, container write, finalization, verification, sync, and publish. The existing verified archive remains available; partial state never becomes current. Test the exact platform/filesystem publication contract. |
| Inventory/integrity | Remove, add, reorder, truncate, or alter members; separately alter the manifest digest; test bad CRC/header, SHA mismatch, missing expected payload, exclusions, duplicate entries, and well-formed but semantically invalid workspace. Confirm each gate’s diagnostic and that a mutable plaintext manifest is not treated as authenticated. |
| Extraction safety | Test absolute, parent, drive/UNC paths; symlink then traversal; hardlink/special files; duplicate normalized paths; case and Unicode collisions; long UTF-8 names; oversized count/member/expanded size. Reject or safely represent without writes outside staging. If Rust zip is selected, test the S05 sequence on the pinned release. |
| Identity/references/preview | Same filename/different bytes; same ID/equal and different content; same title/different ID; missing attachment; dangling relation; import-as-new and complete remap. Preview enumerates exact changes and leaves live data untouched. |
| Schema/migration | Migrate each supported archive schema in order on cloned fixtures. Failure or termination leaves source and live workspace unchanged; an unknown newer schema blocks apply. Validate DB structure, foreign keys, media references, and app invariants separately. |
| Restore/apply atomicity | Test new empty restore and all merge policies. Fail each step across database, preferences, and attachments; terminate before/during/after commit and restart. Recovery selects one known-good workspace or offers rollback, never silent partial state. Keep the old workspace until the candidate passes app usability checks. |
| Encryption/diagnosis | Round-trip supported and generated passphrases; test wrong passphrase, bit flip, truncation, missing final authenticated chunk, unknown visible envelope marker, unsupported inner format, and member mismatch. Confirm honest ambiguity, no secret leakage to logs, and explicit no-recovery warning for a forgotten phrase. |
| Usability | Open a candidate with each supported app build, read representative records/preferences, resolve known attachment references, and exercise a safe workflow. This is a future application test, not established by archive parsing or SQLite checks. |

**Executed for this package:** primary-source documentation review; static SHA-256 comparison confirming the investigator discovery and revealed-plan files match the recorded plan-reveal receipt. The plan-reveal helper itself ran once at 2026-10-12T04:21:15.707Z. No executable archive, storage, migration, encryption, application, fault-injection, or user-data check was run. All witnesses in the table are proposed.

## Evidence references

- [S01 SQLite Online Backup API](https://www.sqlite.org/c3ref/backup_finish.html)
- [S02 SQLite WAL and WAL-reset bug notice](https://www.sqlite.org/wal.html)
- [S03 SQLite PRAGMA reference](https://www.sqlite.org/pragma.html)
- [S04 Python 3.15 zipfile documentation](https://docs.python.org/3/library/zipfile.html)
- [S05 Rust zip extraction advisory GHSA-94vh-gphv-8pm8](https://github.com/zip-rs/zip2/security/advisories/GHSA-94vh-gphv-8pm8)
- [S06 age format v1.0.0](https://c2sp.org/age@v1.0.0)
- [S07 restic 0.19.1 backup documentation](https://restic.readthedocs.io/en/stable/040_backup.html)
- [S08 Rust std::fs::rename](https://doc.rust-lang.org/std/fs/fn.rename.html)
- [S09 NIST FIPS 180-4 Update 1](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)
- [S10 age format v1.1.0](https://c2sp.org/age@v1.1.0)
- [S11 SQLite ALTER TABLE](https://sqlite.org/lang_altertable.html)
- [S12 restic 0.19.1 repository checks](https://restic.readthedocs.io/en/stable/045_working_with_repos.html)
- [S13 SQLite VACUUM and VACUUM INTO](https://www.sqlite.org/lang_vacuum.html)
