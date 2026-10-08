# D-M09-A v3 final — one full critic, reconciled bounded critique

Candidate: draft.md (labeled untrusted test input, not truth). Pinned sources: S1 https://www.sqlite.org/backup.html (capture 2026-10-07, sha256 306b6cca…e04); S2 https://www.sqlite.org/c3ref/backup_finish.html (capture 2026-10-07, sha256 3beb8d98…25b); S3 sqlite version-3.51.3 `src/backup.c` (sha256 ee4cbfc7…ef7). Cites are pinned-file lines; released S3 governs 3.51.3 behavior. One critic; disagreements reconciled from sources, not voted (obligation 5). Verdict scoreboard: P1 accepted · P2 accepted/amended · P3 amended · P4 accepted · P5 accepted · P6 amended (material) · P7 accepted · P8 accepted · optional lead accepted as labeled proposal. No proposition rejected.

Obligation map: 1→F1,F3,F6,F8; 2→F1,F2,F6; 3→F4,F7; 4→F3 + scoreboard; 5→F5; 6→this document plus proposed tests.

## Eight material findings

**F1 — Loop shape and API contract are source-correct** (P1; obligations 1,2). init() once; step(N) repeatedly; finish() exactly once per successful init (S2:150-160). The source read-lock lives only inside each step: S3 opens the source read transaction per call (350-353) and closes it before return (548-553); S2:239-243 states the shared lock's per-call span, so writers proceed between steps (S1:450-454). step(-1) copies everything in one call and holds the lock throughout (S1:424-429; S2:199). The 5-pages/250 ms cadence is illustrative only.

**F2 — Retry classification confirmed; busy handlers have a blind spot** (P2; obligation 2). Only SQLITE_BUSY and SQLITE_LOCKED are retryable; READONLY, NOMEM, and IOERR_* are fatal — abandon via finish() (S2:219-234; S3:217-219). BUSY arises two ways: a lost lock wait after the busy handler gives up (S2:219-224), and an immediate return when the source btree is mid write-transaction (S3:340-341). That second path returns before any lock wait, so no busy handler or timeout is consulted (corroborated on master, E3). S1 §2.2 (329-335) registers the handler on the file-backed connection; the draft's "both connections" is an extension beyond the doc's letter. Whether the two BUSY origins need different backoff is unsettled in-corpus (unresolved).

**F3 — Material doc/code seam: BUSY/LOCKED are remembered** (P6 amended; obligations 1,4). S2:272-274 says a BUSY/LOCKED step return "does not affect the return value of sqlite3_backup_finish()", but S3 latches every step return into p->rc (558) and finish() returns it unless DONE (603: `rc = (p->rc==SQLITE_DONE) ? SQLITE_OK : p->rc;`). Fatal errors latch permanently (first fatal wins; later steps short-circuit, S3:329-330); BUSY/LOCKED are overwritten by any later OK/DONE step; abandoning immediately after one makes finish() return that code and leave it on the destination handle (603-605). So finish()!=OK right after BUSY/LOCKED is not failure: destination rolled back (599-600); restart via fresh init(), as finish() destroys the object (S2:262-263). Version-stable (E3).

**F4 — Restart seam needs the in-memory caveat** (P3 amended; obligation 3). External writes invalidate copied pages; the next step restarts at page 1 (S2:242-247; S3:701-707, iNext=1). Same-handle writes merge into the destination only when same-process, same-handle, and the source is not in-memory (S1:459-465; in-memory sources always restart, 473-478) — the draft stated the merge unconditionally. Frequent external writes can starve the backup indefinitely (S1:480-482).

**F5 — S1 disagrees with itself on snapshot vintage; the mechanism reconciles it** (P6 uncertainty; obligation 5). S1:183-187 promises a copy "as it was when the copying commenced"; S1:467-471 promises "consistent and up-to-date". Reconciled from code, not voting: the result is a consistent snapshot whose vintage is the final step's read — same-handle merges fold mid-window writes in (S3:661-688), external-write restarts resynchronize to a later full pass, and nothing after the last step's lock release is included. Rely on consistency; vintage = window from last restart to last step.

**F6 — Destination exclusivity and failure locus** (P5/P8 accepted; obligations 1,2). The destination handle must not be used by any thread between init and finish; SQLite does not check — malfunction or mutex deadlock results (S2:301-308). Shared-cache mode excludes the destination file for the whole process (S2:310-315). init() fails on any open destination transaction (S2:178-180; S3:124-130,192). The first successful step opens the destination write transaction, held until DONE or finish (S2:142-143,236-239; S3:365-371). Errors land on the destination handle; read errcode()/errmsg() there after finish() (S1:296-310; S3:604-605).

**F7 — Progress is latched, not live** (P4 accepted; obligation 3). remaining()/pagecount() store values from the previous step and never inspect the file (S1:499-505; S3:33-37,402-404); they are not threadsafe against concurrent step() (S2:317-322). They refresh only on steps returning OK — a BUSY step updates neither (S3:402-404). Report completion = (pagecount−remaining)/pagecount as advisory only (S1:495-497).

**F8 — Page-size/WAL preconditions** (P7 accepted; obligation 1). The first successful step attempts to set the destination page size from the source, and only NOMEM from that attempt propagates (S3:355-363) — which is why a WAL or in-memory destination with a then-mismatched size fails later with fatal READONLY (S3:373-383; S2:210-217), as does a read-only destination (S2:210-212). Other mismatches change the destination page size silently (S1:338-342). Optional lead — scratch destination, rename into place — is sound engineering, correctly labeled non-source; condition: same-filesystem rename only, so it is atomic.

## Governing conditions (corrected recommendation)

1. Dedicate the destination connection; zero use init→finish; in shared-cache mode no process connection touches the destination file.
2. Loop: init once → step(N) with application-bounded retries on BUSY/LOCKED → finish() exactly once. Register busy timeouts (S1 §2.2; extension: both connections), knowing F2's bypass path. On a fatal code, stop stepping and finish().
3. Interpret finish()!=OK per F3 before declaring failure.
4. Where feasible, route writer traffic through the backup's source handle (F4); monitor restarts and completion; alert on starvation (S1:480-482).
5. Create the destination with the source's page size and a compatible journal mode (F8).
6. Treat progress as advisory (F7); refresh only on OK steps.

## Unresolved

Exact pager trigger for external-write detection (lives in pager.c, outside corpus); backoff per BUSY origin (F2); cross-VFS behavior; extended-IOERR discrimination (S2:229); staleness beyond one step interval (F7).

## Checks — executed versus proposed

Executed: E1 hash pinning of S1–S3 — 3/3 match the manifest. E2 full-claim cross-check with line citations (claim-review.md, this stage). E3 upstream master seam corroboration — https://raw.githubusercontent.com/sqlite/sqlite/master/src/backup.c, master snapshot, captured 2026-10-08 (WebFetch text); limitation: no byte-level hash, moving target; corroboration only. No project code executed (policy).

Proposed (not executed): T1 abandon-after-BUSY — hold a write transaction on the source, step→BUSY, finish; assert finish() returns BUSY on this release and the destination is unchanged; a fresh init() then completes. T2 file-source split — same-handle write during the sleep window merges; second-connection write restarts; measure completion rate under write load. T3 in-memory source: same-handle write still restarts (S1:473-478). T4 WAL destination with mismatched size → step returns READONLY; read-only destination → READONLY. T5 counts frozen across external writes until the next OK step. T6 inject one IOERR → subsequent steps short-circuit and finish() returns the first fatal.

Timing: T0 23:45:13Z; complete ~00:15Z; inside the 60-minute stage and 01:45:13Z deadline.
