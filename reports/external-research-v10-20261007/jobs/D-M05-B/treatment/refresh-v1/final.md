# D-M05-B treatment refresh — Job store WAL deployment change

Scope: SQLite 3.51.3 job index, WAL, simultaneous readers + one writer, restart recovery. Deployment changed from one Linux host + local disk to two Linux hosts opening one database on a mounted network filesystem. Runtime, data model, concurrency requirement unchanged. Rename Queue store to Job store. Prior state is untrusted candidate input, not truth. Listed frozen sources only; no execution.

## No-op assessment (obligation 2)

Rename is no-op for every prior finding F1–F7. Dependencies establish this: F1 DEP-linux-local-vfs, F2 DEP-single-writer-discipline/DEP-reader-end-mark, F3 DEP-checkpoint-schedule/DEP-reader-gaps, F4 DEP-synchronous-level/DEP-clean-restart-order, F5 DEP-clean-shutdown/DEP-file-custody, F6 DEP-version-pin-3.51.3, F7 DEP-writer-txn-mode/DEP-busy-retry-policy. None references the store name; all source conditions cite WAL mechanics, deployment, version, or txn discipline. Name appears nowhere in cited `sqlwal`/`sqlwalcode`/`sqltransaction` ranges. Already-covered YES as no-op; never means implemented or tested.

## Dependency map (obligation 1)

| Dependency | Prior value | New value | Status |
|---|---|---|---|
| DEP-linux-local-vfs | single host, local disk | two hosts, network mount | CHANGED — violates same-host/local constraint |
| DEP-single-writer-discipline | one active writer (brief) | one writer required, cross-host unenforced | CHANGED (scope) |
| DEP-reader-end-mark | per-reader snapshot via wal-index shm | shm unavailable across hosts | CHANGED (applicability) |
| DEP-checkpoint-schedule | auto 1000 pages or app-driven | same default, coordination broken | CHANGED (applicability) |
| DEP-reader-gaps | gaps provisioned on one host | gaps across two hosts uncoordinated | CHANGED |
| DEP-synchronous-level | unstated | still unstated | UNRESOLVED (retained open) |
| DEP-clean-restart-order | recovery before readers, one host | recovery + exclusive lock across mount | CHANGED |
| DEP-clean-shutdown | orderly last-close | last-close across two hosts | CHANGED |
| DEP-file-custody | db + -wal together | db + -wal + -shm over mount | CHANGED |
| DEP-version-pin-3.51.3 | 3.51.3 | 3.51.3 unchanged | RETAINED with equivalence evidence |
| DEP-writer-txn-mode | IMMEDIATE recommended, unstated | still unstated | UNRESOLVED |
| DEP-busy-retry-policy | unstated | still unstated, wider BUSY surface | UNRESOLVED |

## Revised material findings (max 8)

### R1. New deployment violates the WAL same-host / no-network-filesystem constraint (prior F1; obligation 3)

Verdict: CHANGED — prior satisfaction claim is void; prohibition now fires.
Sources: `sqlwal` §1 disadvantage lines 177–180 (all processes same host; WAL does not work over network filesystem; shared-memory reason); §2.2 lines 286–291 (wal-index in shared memory; all readers same machine; will not work on network filesystem); §7 lines 601–614 (wal-index by mmap of file in same directory as database; same-shm guarantee construction).
Conditions: none of the prior satisfying conditions hold: two hosts cannot share wal-index shm; database directory is a network path.
Already-covered: YES that the stated deployment is prohibited (new brief facts + cited prohibition). NO for any workaround.
Unresolved: exact failure mode on the specific mount (corruption vs BUSY vs split-brain reads) — not determined by listed sources.

### R2. One-writer / snapshot-read mechanism retained as definition; deployment applicability withdrawn (prior F2)

Verdict: RETAINED mechanism, CHANGED applicability.
Sources: `sqlwal` lines 166–168, 269–297 (end mark, snapshot, one WAL = one writer); `sqltransaction` §2.1 lines 290–317 (one simultaneous write txn, snapshot isolation).
Equivalence evidence for mechanism: runtime and concurrency requirement unchanged per `changes.json`; cited ranges re-read identical bytes (hashes match).
Conditions: end-mark snapshot depends on wal-index shm coherent across all readers (R1) — absent across hosts.
Already-covered: YES for abstract rules; NO for cross-host correctness.
Unresolved: writer serialization across two hosts; no longer a single-host handoff — never already covered.

### R3. Checkpoint primitive and 1000-page default retained; progress and rewind promises withdrawn (prior F3; obligation 4)

Verdict: RETAINED definition, CHANGED operational promise.
Sources: `sqlwal` §2.1 lines 244–263; §2.2 lines 299–318 (checkpoint stops at reader end marks; rewind only when fully transferred, synced, unused); §3 default 1000 pages; §6 lines 555–579 reader gaps; `sqlwalcode` walCheckpoint 2193, sqlite3WalCheckpoint 4292, final PASSIVE at close 2528–2529, walRestartHdr 2146/2377.
Conditions: checkpoint coordination state lives in wal-index shm; reader-gap reasoning assumed one host.
Already-covered: YES for default mechanism; NO for bounded WAL size or checkpoint completion on new deployment.
Unresolved: checkpoint schedule tuning (prior open) plus cross-host starvation semantics.

### R4. Durability and recovery promises suspended; synchronous choice still open (prior F4; obligation 4)

Verdict: CHANGED applicability; UNRESOLVED choice retained open.
Sources: `sqlwal` §2 COMMIT record lines 231–238; §2.3 FULL vs NORMAL lines 324–331/369–377, checkpoint sync lines 342–347; §9 recovery exclusive lock + BUSY lines 700–704; `sqlwalcode` frame checksums/salts 36–56, WAL_MAX_VERSION 3007000 lines 277–278/1463–1466, walIndexRecover 1384.
Conditions: replay assumes WAL custody with database and coherent wal-index; recovery exclusive lock assumed single-host file locking.
Already-covered: YES for FULL/NORMAL definitions and recovery-takes-exclusive-lock rule; NO for any durability guarantee on network mount.
Unresolved: synchronous=FULL vs NORMAL (prior open, still open); power-loss durability over mount; busy/retry during cross-host recovery.

### R5. Sidecar lifecycle rules retained; custody and last-close cleanup broken across hosts (prior F5; obligation 4)

Verdict: RETAINED rules, CHANGED deployment safety.
Sources: `sqlwal` §1 lines 201–204; §4 lines 472–494 (WAL deleted at last close; retained on unclean exit or PERSIST_WAL; WAL is persistent state, move together; separation risks loss/corruption; safe removal open-then-close); §6 lines 526–535; §7 lines 616–622 (backing file ≤32 KiB, never synced, deleted at last disconnect).
Conditions: orderly last-close and capture-db-plus-WAL assumed one host's directory.
Already-covered: YES for lifecycle rules; NO for safe backup/copy/cleanup procedure on shared mount.
Unresolved: PERSIST_WAL, journal_size_limit, backup procedure (prior open) plus which host performs last-close checkpoint/delete and what the other observes.

### R6. Version pin 3.51.3 retains the WAL-reset fix scope (prior F6; obligation 5)

Verdict: RETAINED with evidence of equivalence.
Sources: `sqlwal` §11–§11.2 lines 739–835 (affected 3.7.0–3.51.2, fixed 3.51.3 2026-03-13, backports 3.44.6/3.50.7; 2+ connections write/checkpoint race; six-step sequence; reproducer 2026-08-24; wild rate ≤ SSD/cosmic-ray).
Equivalence evidence: `changes.json` unchanged includes SQLite 3.51.3; brief pins 3.51.3; same frozen bytes re-hashed.
Conditions: pin must strictly hold (3.51.3+ or accepted backport); fix scope does not cure unsupported deployment.
Already-covered: YES conditional on pin holding. Unresolved: strict floor enforcement (prior open, retained).

### R7. Transaction discipline rules retained; writer mode and BUSY policy unresolved and widened (prior F7; obligation 4)

Verdict: RETAINED rules; UNRESOLVED policy (never already covered).
Sources: `sqltransaction` §2.1 lines 295–317 (upgrade-or-BUSY, snapshot); §2.2 lines 324–357 (DEFERRED default, IMMEDIATE fail-fast BUSY, EXCLUSIVE same as IMMEDIATE in WAL); §2.3 lines 360–389 (implicit commit on reset/finalize/blob-close; COMMIT BUSY on pending writes or open reader elsewhere, retry later); nesting/SAVEPOINT 277–286; §3 errors 410–440. `sqlwal` §9 BUSY cases incl. exclusive-lock holder and last-close cleanup.
Conditions: single-writer discipline now spans two hosts; BUSY surface adds cross-host recovery/cleanup races.
Already-covered: YES for txn state machine; NO for queue enqueue/dequeue/COMMIT busy-timeout/retry policy, reader txn shape, savepoint use.
Unresolved: all prior F7 opens retained; similar single-host wording is not cross-host equivalence.

## Useful optional material

EXCLUSIVE locking without shm (`sqlwal` §8 lines 631–668) requires the process be the only accessor and sticks in EXCLUSIVE; it does not save two-host sharing. Read-only conditions (§5 lines 505–515) do not restore multi-host WAL. The mmap-same-directory construction (§7) is the only supported same-shm guarantee; chroot-split warning shows path-identity sensitivity, a fortiori across hosts.

## Bounded revised disposition (obligation 6)

WAL as specified is not viable on the stated two-host network-filesystem deployment: R1 prohibition governs, so R2–R5 and R7 operational promises are suspended, not transferred. Retained: rename no-op, abstract WAL/txn/version mechanisms, and R6 fix scope under strict pin. Bounded options (no full app plan): (a) restore a single-host local-disk WAL accessor and put network clients behind it; or (b) exit this WAL deployment for a supported architecture — alternative selection needs sources outside this corpus and is out of scope. No finding here is implemented or tested.

## Uncertainty

Listed sources do not determine the specific mount's lock/mmap/fsync behavior, VFS xShmMap/xShmLock mapping over the mount, or whether violation manifests as corruption, SQLITE_BUSY/CANTOPEN, or stale reads. No code execution was performed or is authorized in this module. Power-loss durability over the mount and cross-host recovery ordering are undetermined.

## Validation

Performed (only): INPUT_MAP sha256 verification of all three sources plus prior-state hash match; targeted range re-reads listed in sources.json. No project code executed, no installers, no repo writes.
Proposed (discriminating, not performed): (1) deployment gate asserting all connections share one host and a local-disk database directory — must FAIL on new deployment, PASS on prior; (2) two-process wal-index coherence probe on local vs mounted path (shm-backed page lookup agreement); (3) checkpoint-progress probe with overlapping readers asserting rewind only after full transfer + sync + no reader use; (4) crash-recovery BUSY-window probe asserting exclusive-lock recovery and third-connection BUSY; (5) sidecar-custody probe asserting delete-on-clean-last-close and retained-WAL replay; (6) version-floor probe asserting 3.51.3+ or accepted backport. M06 witness only, if any execution occurs.

## Refresh operations

Identified rename no-op via dependency scan; rebound F1–F7 to exact deployment/source dependencies; re-read prohibition (§1, §2.2), shm construction (§7), no-shm limits (§8), durability/recovery (§2.3, §9), lifecycle (§4–§6), version fix (§11), txn rules (§2–§3); split each prior finding into retained mechanism vs withdrawn applicability; carried all prior unresolved items forward and added cross-host scope.
