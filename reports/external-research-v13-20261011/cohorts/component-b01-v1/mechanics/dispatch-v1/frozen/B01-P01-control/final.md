# Notebook backup/export component proposal

**Status:** research-backed implementation proposal; not a built or deployed component.  
**Target:** one user, a desktop notebook, CPython 3.13.9, SQLite on local disks. The database contains notes, tags, and attachment references; attachment bytes live outside SQLite. Editing remains available during a manual backup. Remote synchronization and a server database are out of scope.

## 1. Decision and invariants

Use SQLite's online backup API for the database, owned by a background database worker. Store attachments as immutable generations and pin the exact generations referenced by the copied database while streaming them into the bundle. Publish only after both payload types and restore checks succeed. Allocate the chosen bundle path exclusively; if it exists, leave it untouched and ask for another name. Restore into a new workspace and activate it only after validation.

The API is the best fit for live database state; it is not a cross-resource transaction over attachment files. The attachment generation and reclamation protocol below is a required companion feature, not an observed capability of the current notebook.

- Backup is a user-started local operation. It must create a restorable bundle without asking the user to close the notebook.
- Database and attachment payloads are both required for success.
- The app must own immutable attachment generations. Arbitrary mutable external paths do not receive the same guarantee without a separately designed snapshot protocol.
- One DB-owner worker serializes app writes. The UI can continue accepting edits, with a visible pending-save state until committed.
- Keep each connection on its creating worker. Record the linked SQLite library version and journal mode at runtime; Python 3.13.9 alone does not identify them.
- Memory use is bounded by SQLite page working space, fixed file-copy buffers, and bounded queues. Do not materialize the complete DB or attachment set.
- Failed, canceled, or incomplete directories are never restorable bundles. Existing published backups are never silently overwritten.
- A successful restore creates a new workspace. WAL mode remains supported; this feature does not change journal mode.

## 2. Database worker, progress, and cancellation

A dedicated database-owner worker creates, uses, and closes source and destination connections. The editor sends database commands to that owner; it never transfers a connection across threads. CPython 3.13 defaults check_same_thread to true, so each connection stays with its creating thread [S1-connect]. Before backup, the worker commits pending edits and creates a fresh destination database inside this job's incomplete bundle.

Use Connection.backup with an initial pages value of 64 and sleep of 0.050 seconds, both unvalidated starting choices. CPython documents pages as pages per step and gives the callback status, remaining, and total [S1-N1]. The pinned CPython implementation sleeps only after SQLITE_BUSY or SQLITE_LOCKED; successful page steps loop without that sleep [S2-N1/S2-N2]. Therefore pages bounds page count per step and sleep handles lock retries; neither promises a fixed rate, maximum step duration, or UI time slice. Tune both with measured save latency and throughput on representative local disks. Do not show a fixed ETA.

The callback runs on the worker. It checks cancellation, sends the latest page counts through a coalescing progress channel, and services at most a bounded, validated database write on the same source connection before returning. It does no GUI work, filesystem copying, waiting, or slow queries. Show SQLite page counts as provisional: allow progress to regress or totals to change. Call the database phase complete only after backup returns normally and connections close. Attachment byte counts have a stable total after the copied database reference set is fixed; show them in a separate phase.

SQLite documents that a write through the same source database handle updates the destination during backup. A write through another handle or process usually restarts the next step, and frequent restarts may prevent completion [S4-N2]. The inspected CPython upstream test modifies and commits from the progress callback and observes remaining values 1, 1, 0 [S3-N2]. Route in-app notebook writes through the worker's source connection between backup steps; the UI may accept edits, but must show a pending-save state until committed. If the app cannot adopt this single writer owner, a restart/starvation policy is a release blocker. Other processes and direct DB writers remain outside the guarantee.

Use finite page steps for multi-GiB backups; an all-pages step weakens progress and cooperative cancellation. The UI sets a cancellation event; at the next callback, raise a dedicated BackupCancelled exception. Cancellation is cooperative and its latency includes the current SQLite step. CPython's implementation calls sqlite3_backup_finish when the callback raises, and the inspected upstream test asserts callback-error propagation [S2-N1, S3-N3]. These are source-inspection findings, not tests run for this application. Catch cancellation at the worker boundary, close both connections in finally blocks, clean only this job's incomplete bundle, and service queued edits afterward. Report a callback, SQLite, or I/O failure distinctly from cancellation.

Measure event-loop and pending-save latency, backup duration, cancellation latency, throughput, and peak memory with representative GiB databases. Memory should depend on SQLite page working space, a fixed attachment copy buffer, and bounded queues, not the full database or attachment set.

## 3. Database and attachment consistency

SQLite's backup API snapshots SQLite-managed database state; it does not include a transaction over external files. The draft's claim that the DB snapshot automatically makes copied attachments consistent is unsupported and removed.

Before shipping, attachment rows must refer to immutable application-owned object generations, not mutable paths whose bytes can be replaced in place. Assign each generation a stable opaque identifier. To publish an edit, write and verify a new temporary object, publish the immutable generation, then commit the DB reference to it. A failed DB commit may leave an unreferenced object for later safe collection. Never mutate a generation referenced by a committed note. If the current schema stores mutable or arbitrary absolute paths, first add a generation mapping and a migration or design and test a snapshot conversion.

For a backup, acquire a store-wide attachment-reclamation interlock before starting the DB backup. This pauses deletion of old objects, not object creation or note edits. Run the online backup; query distinct attachment IDs from the completed staged DB; while still holding the interlock, persist and verify a per-job lease for exactly those IDs; then release the broad interlock. Stream those pinned objects into the bundle in bounded chunks, calculating SHA-256 and byte length. Reject missing files, changed bytes, path escapes, and mismatches. The manifest maps each DB-referenced ID to one relative bundle path, length, and digest. Require the DB reference set and manifest set to match exactly. This ordering keeps generations available even when edits replace a reference during backup.

The interlock must cover every process that can collect objects; a thread lock alone is insufficient if multiple notebook processes can open the same store. Persist narrow leases before releasing the interlock. Release leases after bundle copies are verified or the operation is canceled and cleaned. On crash, a stale lease may retain storage indefinitely; recovery may remove it only after proving the operation is abandoned. If safe cross-process lease recovery is not available on a supported platform, retain old generations conservatively. This protocol is proposed engineering, not an SQLite capability or an inspected existing feature. It costs temporary disk space and a short reclamation pause. Test concurrent backups, low disk space, replacement, deletion, crash points, and garbage collection before claiming consistency.

### Restore and privacy

Use a versioned directory bundle so multi-GiB payloads can be streamed. Restore only into a new workspace. Read the manifest first; reject unsupported versions, absolute or parent-traversing paths, symlink escapes, duplicate IDs, missing objects, length/digest mismatches, and unsupported schema versions. Rebuild the app-managed attachment store using relative paths and stable IDs without writing into the source notebook.

Open the candidate DB and run PRAGMA integrity_check; require the only result to be ok. Run PRAGMA foreign_key_check and require no rows; integrity_check does not check foreign-key errors [S7]. Then verify application-level note/tag references, every DB attachment ID against the manifest and copied object, supported schema/migrations, and representative content. Activate only after all checks pass. Leave the source notebook and published bundles unchanged on failure.

Keep bundle directories private to the local user as the OS allows. Exclude note text, titles, tags, attachment names, credentials, and absolute source paths from progress, routine logs, and crash reports. Use opaque IDs and relative paths; digests and sizes still reveal metadata and stay inside the protected bundle. If users need portable protection on removable/shared media, specify an optional established encryption format and vetted key management separately; do not invent cryptography. No remote upload or server database is in scope.

## 4. Staging, publication, and failure behavior

Use a versioned directory bundle containing a manifest, SQLite database file, and relative attachment files. The manifest records bundle-format and application-schema versions, DB size and SHA-256, and each distinct attachment ID, relative path, byte length, and SHA-256. It does not contain note bodies or absolute source paths. Stream large files in bounded chunks.

Create the chosen bundle directory exclusively; Python's os.mkdir raises FileExistsError if it already exists [S6]. If it already exists, report the collision and prompt for another name. Never publish through an overwrite-style replacement. Write an INCOMPLETE job marker while work is underway; the app and restore picker ignore the directory until every check succeeds. Flush bundle files and directory metadata as supported by the target OS, then create a COMPLETE marker exclusively. Recognize only a COMPLETE directory with a valid manifest as a backup. The exact power-loss durability of directory entries varies by OS/filesystem and needs platform-specific validation.

On cancel or error, close DB handles before cleanup. Remove only this job's new directory after confirming its job ID; never remove a pre-existing path. If cleanup fails, leave it visibly incomplete, report its user-selected location, and offer cleanup later. Disk-full, permission, lock, callback, or verification errors identify the phase and an actionable next step. No failure path creates COMPLETE.

Show separate phases for database copy, attachments, validation, and publication. Database page counts are provisional and may regress; no fixed rate or ETA is promised. Attachment bytes copied can progress against a stable total once the snapshot references are pinned. Cancellation takes effect at the next explicit check; filesystem calls may delay it.

## 5. Alternatives and operational costs

### SQLite online backup API — default

CPython Connection.backup supports pages per step, a progress callback, source DB name, and sleep between attempts [S1-N1]. SQLite says incremental backup need not hold the source lock for the full copy [S4]. It gives the strongest fit for an online DB copy, while requiring a worker, a same-handle write policy, and an attachment protocol. It uses disk I/O and CPU and may take longer under writes or lock contention.

### Filesystem copying

Reject copying only the open main DB file. WAL mode stores committed transactions in a separate WAL [S5]. SQLite's historical locked-copy procedure blocks writers and warns that a power or OS failure during copy can leave a corrupt copy [S4]. A stopped-app copy is a valid conditional alternative after all connections close and a complete SQLite file-set/journal policy is followed and tested. It may be simple and fast, but violates uninterrupted editing and still needs a consistent attachment set. WAL itself is not rejected.

### Logical SQL dump

Connection.iterdump returns an iterator of SQL source and Python documents writing it line by line [S1-N2]. It can be a streaming, inspectable export, but is not the default binary backup: it needs a defined consistent read boundary and restore/encoding policy, and adds SQL formatting and re-execution work. It excludes attachments. These costs and object-compatibility limits need measurement; they are trade-offs, not benchmark results from this review.

## 6. Release validation plan

No application backup, cancellation, crash-durability, throughput, or restore test ran in this review. Cited upstream CPython tests were inspected only. Test on each supported desktop OS/filesystem using the actual CPython 3.13.9 build and recorded SQLite library version:

1. Use realistic databases and multi-GiB attachments. Measure peak memory, disk use, CPU, duration, UI latency, save latency, and throughput. Confirm memory does not scale with total input size.
2. Edit notes/tags during backup through the same DB owner. Verify a consistent returned DB and measure pending-save latency for several page sizes.
3. Test external-handle and second-process writes; count backup restarts and verify a clear no-progress/starvation outcome. Verify single-owner enforcement where required.
4. Cancel before start, during DB pages, attachment files, and validation; inject callback exceptions. Confirm cancellation/error distinction, handle close, queued edits, cleanup only of the job stage, and absence of COMPLETE.
5. Inject busy/locked states, permission loss, disk-full at every phase, read-only destination, and manifest-write failure. Confirm phase-specific errors, no overwrite, and safe incomplete retention.
6. Race attachment replacement/deletion with backup. Check immutable generations, durable pins, exact reference/manifest match, hashes, concurrent leases, low-space behavior, and safe stale-lease recovery.
7. Crash after object creation, DB snapshot, pin, file copy, manifest, validation, COMPLETE, and lease cleanup. On restart offer only complete valid bundles.
8. Restore valid bundles into fresh workspaces. Also test missing, extra, corrupt, truncated, altered, and symlinked objects; corrupt DB pages; FK failures; schema incompatibility; and occupied restore destinations. Source notebooks and old bundles stay intact.
9. Test name collisions, concurrent jobs, Unicode/long names, case-insensitive filesystems, interrupted cleanup, and permissions changed mid-operation.
10. Inspect bundle permissions, manifest, progress, logs, and crash reports for private note content, tags, filenames, paths, or credentials. Test optional encryption and key loss separately before promising encrypted portability.

Checksums show bytes match the manifest; they do not prove semantic consistency or crash durability. integrity_check and foreign_key_check are distinct and can be expensive on GiB databases. Ship only after the generation/lease protocol and interrupted-stage lifecycle pass this matrix.

## 7. Preserved investigation history

The following investigation sentences are retained verbatim where their history/choice remains useful:

> An earlier idea copied only the database file during editing. Retire it: SQLite's WAL documentation says committed content can reside in a separate WAL [S5], and online backup has a clearer database snapshot contract [S4].

> A logical dump remains an optional human-readable export rather than the default binary backup: it reconstructs SQL objects and requires deliberate transaction, encoding and restore decisions [S1].

The evidence and validation-status paragraph is retained verbatim below; the plan above expands its test matrix and corrects the old attachment-consistency claim:

> Documentation, implementation and named upstream tests have been inspected; no application backup, cancellation, durability or restore test has run. Propose concurrent note edits during backup, repeated page-count changes, callback cancellation, destination permission/disk exhaustion, occupied names and restore with attachment deletion/replacement. Measure GUI responsiveness and throughput on representative GiB bundles. Checksums detect byte mismatches, not semantic snapshot consistency or crash durability. Shipping should wait for a tested attachment-generation protocol and interruption-safe staging cleanup.


The original draft also claimed that a 50 ms sleep paces every successful batch, that progress must be monotonic against the original total, and that a DB snapshot automatically freezes attachments. The replacements above correct those claims. The original worker, incremental backup, bounded-memory, collision, cancellation, new-workspace restore, privacy, history, and no-tests-run obligations remain and are made more precise.

## 8. Execution and uncertainty

This is a proposal, not a built component or benchmark. Sources were inspected; no upstream or application test suite was run. The local assembly program only generated this text; its command, interpreter, stdout/stderr, source intervals, and hashes are in assembly-results.json. That run is not a SQLite or application behavior witness.

The requested route was Luna Max Standard. The T3 runtime banner observed gpt-6-luna with max reasoning effort. The native Goal receipt has a thread ID, objective, status, and timestamps, but no provider, route, or service-tier identity; whether the service tier was Standard is unknown. The activation checker confirmed binding and reported provenance/freshness as unknown beyond the checker. No provider setting was changed.
