# B-APPL-M-01 verification: SQLite WAL on a local cache

Case ER12-B-APPL-M-01-FRESH. Config: SQLite 3.51.3, WAL, shared-memory-capable
VFS, multi-process single host, local disk; one long-running read possible. No
workload measurement or custom build settings. Each claim judged independently.

## 1. Multiple simultaneous writers — FALSE

Config: WAL since 3.7.0, including 3.51.3. S1 sec. 2.2: "since there is only
one WAL file, there can only be one writer at a time"; writers and readers may
coexist, writers serialize. Corrected: one writer concurrent with readers; a
second writer blocks or gets SQLITE_BUSY. Exceptions: none here permit
simultaneous appends; separate files or a single-machine proxy are different
deployments. Uncertainty: none on the rule.

## 2. Long-running reader blocks checkpoint, WAL grows — TRUE, bounded

Config: stated WAL with default autocheckpoint. S1 sec. 2.2: a checkpoint
"must stop when it reaches a page in the WAL that is past the end mark of any
current reader," so "a long-running read transaction can prevent a checkpointer
from making progress"; rewind needs full transfer plus no readers. S1 sec. 6:
with always one active reader, "no checkpoints will be able to complete and
hence the WAL file will grow without bound." Corrected: one long read can
prevent completion/reset, so continued writes grow the WAL until a reader gap.
Exceptions: RESTART/TRUNCATE wait on readers but may block them; disabled
autocheckpoint and huge write transactions grow the WAL independently.
Missing: hold durations and write rate; resolve with those measurements.

## 3. Unchanged design on multi-host NFS supported — FALSE

Config: stated WAL moved unchanged to shared NFS. S1 Overview: "All processes
using a database must be on the same host computer; WAL does not work over a
network filesystem" (wal-index needs shared memory, sec. 2.2). A2: network
locking/sync vary, have corrupted databases; remote use is "at the user's
risk." Corrected: multi-host NFS WAL is explicitly unsupported; being embedded
changes nothing. Alternatives are different deployments: co-located WAL behind
a proxy, rollback mode (still risky), or a client/server engine. Missing: NFS
details unsupplied, but nothing supplied can satisfy the same-host condition.

## 4. Read-only WAL open under sidecar/immutable conditions — TRUE, conditional

Version: relaxation "beginning with version 3.22.0"; 3.51.3 is later, so it
applies (no reversal retrieved). S1 sec. 5: readable "as long as one or more"
of (a) -shm/-wal exist and readable, (b) directory writable to create them,
(c) immutable query parameter. A1: immutable=1 opens read-only, skips
locking/detection, but changes risk wrong results or SQLITE_CORRUPT.
Corrected: some read-only opens succeed exactly when (a), (b), or (c) holds.
Exceptions: pre-3.22 needed write access; WAL is persistent state, ship it
with the DB; prefer converting to DELETE before publication. Missing: which
of (a)-(c) the snapshot satisfies; resolve by stating it.

## 5. PASSIVE checkpoint guarantees zero-byte WAL — FALSE

Config: stated 3.51.3 interface. S2: PASSIVE does "as many frames as possible
without waiting" and "might leave the checkpoint unfinished," never invoking
the busy handler; only TRUNCATE "truncates the log file to zero bytes just
prior to a successful return" (pnLog=pnCkpt=0). S1 sec. 6: checkpoints "do[]
not normally truncate." Corrected: only TRUNCATE guarantees zero bytes;
PASSIVE guarantees best effort — inspect pnLog/pnCkpt. Exceptions: FULL/RESTART
do not truncate; busy-handler 0 degrades to PASSIVE-like with SQLITE_BUSY;
NULL attached-DB calls leave outputs undefined. Uncertainty: none material.

## 6. Docs establish >=40% p95 gain — UNSUPPORTED

Config: no workload measurement. S1 says "significantly faster in most
scenarios" but gives no p95 and no 40%; WAL can be slightly slower for
mostly-read loads, reads slow as the WAL grows, strategy "vary[ies]" by
platform/workload. Corrected: directional hypothesis only, not a quantified
p95 guarantee. Missing: baseline p95, workload mix, cache/synchronous and
checkpoint settings, 3.51.3 benchmark; resolve by measuring before/after WAL.

## Acceptance checks

1. Local probe (installed sqlite3 only): hold a write on A, attempt one on B
— expect serialization/BUSY, never simultaneous commits. Hold a long read,
run PASSIVE — expect incomplete checkpoint, no reset; release, run TRUNCATE —
expect zero-byte WAL.
2. Read-only matrix plus bar: on 3.51.3 open the snapshot (a) normally on a
read-only dir (success only with readable -shm/-wal) and (b) via
file:...?immutable=1 (lock-free read); refuse multi-host NFS. Record catalog
p95 before/after WAL — reject claim 6 unless >=40% measured.
