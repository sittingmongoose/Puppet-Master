# D-M07-A protected lower-risk / breadth reserve — working notes (SECOND phase)

Ran AFTER the critical dependency check (notes-critical-check.md), per the mandated order.
Nothing in this phase deletes a lead: every remaining lead from the draft and corpus is
enumerated and dispositioned. Lower-risk operational advice that is supported is preserved
(obligation 4); the optional maintenance lead is assessed without removal from scope
(obligation 5).

## Additional primary checks — capture record (beyond the frozen corpus, per policy)
1. lockingv3: https://www.sqlite.org/lockingv3.html — captured 2026-10-07 ~22:56Z,
   sha256 fa67031159fc0658b6e3fcfa4e446c140838c75cb813ff9fafd47fdae927936f.
   Limitations: live-site capture, not pinned to 3.51.3; lockingv3 documents rollback-journal
   locking semantics that are version-stable in the corpus era; NFS locking behavior varies by
   implementation and OS version, so findings are categorical SQLite-doc advice, not a mount
   certification. Used ONLY for the reserved rollback-over-network lead, which the frozen
   corpus does not cover (grep: zero network-filesystem statements in sqlpragma.html;
   sqlwal.html's two mentions are WAL-specific).
2. uri: https://www.sqlite.org/uri.html — captured 2026-10-07 ~22:57Z,
   sha256 9fba2ee18bc6cbf9167ffd02d40a0a38eb84fdde99eb998b0ad4d9543294e5c7.
   Limitations: live-site capture, not pinned to 3.51.3; used only for immutable=1 semantics
   (lead L6). Frozen-corpus cross-reference: wal.html §5 already lists the immutable query
   parameter as a read-only-WAL condition, so the lead exists in-corpus; the capture only
   supplies its exact safety semantics.

## The explicitly reserved lower-risk check (executed)
Reserved item from the critical phase: draft A5b — "whether direct multi-host access in
rollback (DELETE) mode is acceptable over a network mount" (unresolved in frozen corpus).
Executed: captured lockingv3.html (record above). Evidence: "POSIX advisory locking is known
to be buggy or even unimplemented on many NFS implementations (including recent versions of
Mac OS X) and that there are reports of locking problems for network filesystems under
Windows. Your best defense is to not use SQLite for files on a network filesystem." The same
passage reports fsync()/FlushFileBuffers() failures "especially with some network
filesystems".
Resolution: direct multi-host SQLite access in ANY journal mode on a network mount is
unsupported advice; rollback mode escapes the wal-index shared-memory requirement (critical
phase A1) but NOT the broken-file-locking problem. Verdict: the reserved lead resolves to
REJECTED-as-a-deployment-option (with the capture limitations recorded). This converts the
draft's routing-around recommendation (A5) into supported lower-risk operational advice:
single-host SQLite access plus an application-level path for the second host is not merely a
workaround — it is the only corpus-supported shape for this topology. Draft A5's
"unresolved" status for rollback mode is thereby AMENDED to resolved/rejected.

## Breadth sweep — full lead inventory, none deleted
L1. Auto-checkpoint default: 1000 pages at COMMIT, or at last-connection close; PASSIVE;
    adjustable/disableable via wal_autocheckpoint. Sources: wal.html §3.1, §6; pragma.html
    wal_autocheckpoint. Verdict: ACCEPTED (draft point 8 premise confirmed).
L2. Checkpoint starvation: with always-overlapping readers no checkpoint completes and the WAL
    grows without bound (disk + slow queries); mitigation is "reader gaps" or manual
    RESTART/TRUNCATE checkpoints (which trade blocking for completion). Source: wal.html §6.
    Verdict: ACCEPTED. Uncertainty preserved: the workload's reader-overlap profile is unknown
    in-corpus — thresholds need measurement before adoption (PROPOSED, not executed).
L3. wal_checkpoint(RESTART)/(TRUNCATE): pragma accepts PASSIVE/FULL/RESTART/TRUNCATE/NOOP;
    RESTART works like FULL then blocks until readers are finished with the log so the next
    write restarts it; TRUNCATE additionally truncates the WAL to zero on success; both invoke
    the busy handler; wal.html §6 confirms completion guarantee at the cost of readers
    possibly blocking. Sources: pragma.html wal_checkpoint; wal.html §3.2, §6. Verdict:
    ACCEPTED with a doc-consistency note: wal.html §3.2 names three subtypes and routes
    FULL/RESTART through sqlite3_wal_checkpoint_v2(); pragma.html defines the pragma argument
    forms directly (equivalent to _v2) including TRUNCATE — pragma.html is operative for
    pragma syntax. The draft's proposed pragma form is valid as written.
L4. journal_size_limit: in WAL mode the WAL file is not truncated after checkpoint by default
    (overwritten instead); the pragma limits rollback-journal and WAL file size left in the
    filesystem. Source: pragma.html journal_size_limit. Verdict: ACCEPTED as the
    disk-usage-cap companion to L1–L3 (draft point 8 confirmed).
L5. busy_timeout: sets the busy handler so lock contention waits instead of failing fast.
    Source: pragma.html busy_timeout. Verdict: ACCEPTED as contention hygiene for the
    single-host writer + app-path serialization design. Limitation noted: the default value
    was not in the section text read — not claimed, stays unresolved-in-notes (proposed check:
    confirm default 0 in c3ref/busy_handler docs before relying on defaults).
L6. Second-host reads via WAL read-only openings (wal.html §5: -shm/-wal readable, dir
    writable, or immutable=1): assessed and REJECTED for this product — uri.html: immutable
    asserts the file "cannot be modified"; if it changes anyhow "SQLite might return incorrect
    query results and/or SQLITE_CORRUPT errors." A single active writer exists, so the
    premise fails for any concurrent second-host reader. Lead preserved in record, not
    deleted from scope; application-level read path remains the recommendation.
L7. WAL conversion failure mode: if the VFS lacks shared-memory primitives, PRAGMA
    journal_mode=WAL returns the prior mode unchanged (wal.html §3 intro). Operational
    note preserved: on a network mount the conversion can fail outright — deployment should
    assert the returned mode string is "wal" (supported lower-risk advice).
L8. WAL mode persistence: journal_mode=WAL is persistent across close/reopen and applies to
    all connections (wal.html §3.3). Operational note preserved: reverting requires an
    explicit journal_mode change with exclusive/no-active-connection conditions respected.
L9. Last-connection cleanup: last close runs a final checkpoint and deletes WAL and -shm
    (wal.html §6); crash recovery is the §9 first-connection path (critical phase A3).
    Operational note preserved: clean shutdown behavior is distinct from crash recovery;
    monitoring should treat leftover -wal/-shm after planned downtime as a recovery flag.

## Proposed vs executed (this phase)
Executed: lockingv3 + uri captures (hashed, limitations recorded); in-corpus section reads and
greps backing L1–L9; resolution of the reserved rollback-over-network lead.
Proposed, NOT executed: (a) reader-overlap profiling of the real workload before choosing
auto-checkpoint thresholds; (b) measuring RESTART/TRUNCATE blocking cost against the product's
latency budget; (c) confirming busy_timeout default from the C-API reference; (d) any
live NFS/SMB experiment — out of scope by the brief's no-execution rule and mount
technology unknown. No lead was dropped by a top-k cut: L1–L9 all carry dispositions.
No premium science key used.

Timings: phase started ~22:54Z, finished ~22:59Z — inside the 13-minute reserve ceiling.
Source operations: 2 captures (curl, hashed), 6 in-corpus reads/greps.

## Delivery record (final phase)
final.md written 23:00Z, 8309 bytes, 1107 words,
sha256 e7ac1a889bb1c5c32ace2011fd1868bee6be3207aac3ae56afefd73a0ed240a4.
Full write inventory for this job (nothing outside this directory was written by this
thread; frozen inputs and INPUT_MAP/boundary/assignment files were only read; receipt and
census JSON beside these files are dispatch-harness artifacts, not ours): final.md (8309 B),
notes-critical-check.md (8886 B), notes-reserve.md (7772 B before this record; 8378 B with it),
additional-captures/lockingv3.html (29892 B), additional-captures/uri.html (15559 B).
Delivery completed 23:02Z against the 23:26:18Z absolute case deadline.
No premium science key used; no execution of downloaded code.
