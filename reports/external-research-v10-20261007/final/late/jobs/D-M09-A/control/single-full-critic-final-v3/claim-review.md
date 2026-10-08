# Claim review — ticket 2 working notes (D-M09-A v3 single-full-critic-final)

Reviewer: one full critic. Draft under review: fresh-untrusted-proposal-v3/draft.md (untrusted candidate, propositions P1–P8 + one optional lead).
Pinned sources (hashes verified in scope-pin.md): S1 = sqlbackup.html (https://www.sqlite.org/backup.html, capture 2026-10-07, sha256 306b6cca…e04), S2 = sqlbackupapi.html (https://www.sqlite.org/c3ref/backup_finish.html, capture 2026-10-07, sha256 3beb8d98…25b), S3 = sqlbackupcode.c (sqlite version-3.51.3 src/backup.c, sha256 ee4cbfc7…ef7). Line numbers below are the pinned capture files' lines.

## Verdict legend
accepted = draft claim matches corpus as cited; amended = substantively right but needs a correction or missing condition; rejected = contradicted by corpus; unresolved = corpus cannot settle it (kept open).

## P1 — Loop shape: ACCEPTED
- init once / step(5) loop / sleep / finish once: S1:392-411 (init 392, step 400, sleep 406, finish 411); S2:150-160 ("exactly one call to sqlite3_backup_finish() for each successful call to sqlite3_backup_init()").
- Source read-lock held only inside each step: S2:239-243 ("obtains a shared lock on the source database that lasts for the duration of the sqlite3_backup_step() call… not locked between calls"); S3:350-353 opens the source read txn and S3:548-553 closes it before step exits.
- Writers proceed between steps: S1:450-454 (during the sleep, no read-lock and no pDb mutex).
- step(-1) holds the lock for the whole copy: S1:424-429 (one-call copy "requires holding a read-lock… for the duration"); S2:199 (negative N copies all remaining).
- Minor note (does not change verdict): the example sleeps only when rc ∈ {OK, BUSY, LOCKED} (S1:405-408); 250 ms is example pacing, correctly flagged as non-normative by the draft.

## P2 — Retry classification: ACCEPTED (classification) + AMENDED (busy-timeout advice)
- Only BUSY and LOCKED retryable; READONLY/NOMEM/IOERR_* fatal → abandon via finish(): S2:219-234 (BUSY "can be retried later", LOCKED "can be retried later", IOERR/NOMEM/READONLY "no point in retrying… fatal… pass the backup operation handle to sqlite3_backup_finish()"); S3:217-219 isFatalError (all fatal except BUSY, LOCKED).
- LOCKED origin: S2:225-228 (source connection in use for writing when step is called → LOCKED immediately).
- BUSY origins: S2:219-224 (file-lock wait lost after busy-handler gives up); S3:340-341 (source btree TRANS_WRITE → BUSY returned immediately).
- AMENDMENT A (busy timeout placement): S1 §2.2:329-335 demonstrates registering the busy handler/timeout on the file-backed connection pFile (the destination in Example 2), not literally "both connections". Registering on both is a prudent superset, but the corpus only demonstrates one; mark it as extension, not doc text.
- AMENDMENT B (handler bypass): the S3:340-341 BUSY path returns before any lock wait, so no busy handler or timeout is consulted there (corroborated on upstream master, see extra check). A busy timeout therefore does not substitute for the application retry loop; the draft's own "bound application retries" is the operative advice.
- Draft's residual uncertainty (two BUSY origins, backoff not settled in-corpus) is real: UNRESOLVED by corpus, correctly left open.

## P3 — Restart seam: ACCEPTED + AMENDED (in-memory caveat)
- External write → next step restarts from page 1: S2:242-247 ("modified by an external process or via a database connection other than the one being used by the backup operation… automatically restarted by the next call to sqlite3_backup_step()"); S3:701-707 sqlite3BackupRestart sets p->iNext = 1.
- Same-handle writes merge for already-copied pages: S3:661-688 backupUpdate (condition iPage < p->iNext at 669); S2:247-250.
- AMENDMENT: S1:459-465 states the merge exception requires a NON-in-memory source, same process, same handle; S1:473-478 says writes to an in-memory source are restarted (entire backup restarts) even via pDb. The draft states the merge unconditionally — add the in-memory-source caveat.
- Frequent external writes can prevent completion: S1:480-482.
- Uncertainty ("usually" at S1:456-459; exact pager trigger lives in pager.c, outside corpus): fair; S3:691-699 documents only that the pager calls Restart when it detects an external modification. Remains UNRESOLVED by this corpus.
- Proposal (route writer traffic through the backup's source handle; measure restarts/completion): sound engineering consequence of S1 §3.1, correctly labeled proposal.

## P4 — Progress is stale: ACCEPTED
- Latched by previous step, not a live read: S1:499-505 ("report values stored by the previous call to sqlite3_backup_step(), they do not actually inspect the source database file"); S3:33-37 (nRemaining/nPagecount "set by every call to backup_step()"), S3:402-404 (updated only in the rc==SQLITE_OK block), S3:622-647 ("as of the most recent call to sqlite3_backup_step()").
- remaining()/pagecount() not threadsafe vs concurrent step: S2:317-322; S3:60-65. (Note S2:317-318: concurrent step() calls themselves are safe.)
- Completion formula as advisory: S1:495-497 gives the formula; staleness caveat S1:499-505.
- "Bounded by one step interval": consistent with the S1 loop shape; left as stated uncertainty, acceptable.

## P5 — Destination exclusivity: ACCEPTED (one minor code note)
- Destination handle must not be used by any thread between init and finish: S2:301-308.
- SQLite does not check; malfunction or mutex deadlock possible: S2:304-308.
- Shared-cache mode: no process connection may touch the destination file: S2:310-315.
- First (successful) step opens the destination write transaction, held until finish or DONE: S2:142-143, 236-239; S3:365-371 (bDestLocked), rollback at S3:599-600.
- init() fails if destination has any open transaction: S2:178-180; S3:124-130 checkReadTransaction, called at S3:192.
- Minor code note (observation, not a correction): if the very first step returns BUSY via the S3:340 source-mid-write check, the destination lock is not acquired on that call (S3:366 requires rc==SQLITE_OK); S2's "first call" wording is the idealized case. Self-corrects on the next successful step.
- Proposal (dedicate the destination connection): direct consequence of S2:301-315; accepted as proposal. "Cross-VFS untested" uncertainty is fair (S3:356-360 mentions ZipVFS only re page size).

## P6 — Completion and abandonment cleanup: AMENDED (material doc/code seam on BUSY/LOCKED latching)
- Commit completes inside the step that returns DONE: S3:417-541 (UpdateMeta 423, truncate image 530 or file truncate 470-528, CommitPhaseOne, BtreeCommitPhaseTwo 536, then rc=SQLITE_DONE 538).
- File truncated to copied size (source bytes at matched page sizes): S3:449-457 (nDestTruncate math), 522 (backupTruncateFile), 530 (TruncateImage); matched sizes ⇒ destination truncated to source byte length.
- Schema cookie bumped, cached schemas invalidated: S3:412-432 (sqlite3BtreeUpdateMeta(p->pDest,1,p->iDestSchema+1) at 423; sqlite3ResetAllSchemasOfConnection at 427).
- finish() before DONE rolls back the destination transaction, preserving pre-backup contents: S2:260-261; S3:599-600.
- AMENDMENT (the material one): draft says finish() "returns the first prior step error, except BUSY/LOCKED, which it does not remember [S2]". S2:272-274 does say BUSY/LOCKED "does not affect the return value of sqlite3_backup_finish()", but S3 shows the code remembers the LATEST step return in p->rc (S3:558) and finish returns it unless DONE (S3:603: `rc = (p->rc==SQLITE_DONE) ? SQLITE_OK : p->rc;`). Consequences, all in-corpus:
  (a) fatal errors latch: once isFatalError(p->rc) (S3:330), every later step short-circuits and returns the FIRST fatal error; finish returns it;
  (b) BUSY/LOCKED are overwritten by any later OK/DONE step, so they are transient — but if the application abandons immediately after a BUSY/LOCKED step, finish() in this release returns that BUSY/LOCKED and leaves it as the destination handle error (S3:603-605);
  (c) operational rule: finish()!=OK right after a BUSY/LOCKED step does not indicate a fatal failure — the destination was rolled back and a fresh init()/step/finish cycle may be started (the old object is destroyed by finish, S2:262-263; S3:612-615).
  The draft's "does not remember" is therefore too strong; S2's doc sentence is only accurate once a later step overwrites p->rc. (Doc-internal accuracy aside, the code governs the release per brief.)
- Snapshot-vintage tension (draft uncertainty): S1:183-187 ("bit-wise identical copy of the source database as it was when the copying commenced") vs S1:467-471 ("consistent and up-to-date snapshot of the original"). The draft's reconciliation (consistency guaranteed; vintage depends on which writes went through the source handle) is adopted and sharpened: with same-handle merges, writes made through pDb during the window ARE included (so not "as commenced"); with external-write restarts, the result reflects the final full pass; and writes after the last step's read-lock release are in no case included. Both S1 sentences are approximate; S3's mechanism is the precise statement.

## P7 — Page-size and WAL preconditions: ACCEPTED (with supporting detail)
- First step attempts setDestPgsz: S3:355-363 (and only SQLITE_NOMEM from it is propagated, 361-363).
- WAL or memdb destination with differing page size → SQLITE_READONLY (fatal): S3:373-383; S2:210-217 (three READONLY causes: read-only destination; WAL + size differ; memdb + size differ).
- Read-only destination → READONLY: S2:210-212 (code path is in btree/pager, outside backup.c; doc-stated).
- "Other mismatches handled silently in-corpus": correct — non-fatal setDestPgsz failures are ignored (S3:361-363) and the copy/truncate math handles ratio changes (S3:233-251, 449-457); S1:338-342 confirms the destination page size is "simply changed as part of the backup operation" except in-memory.
- Proposal (match page sizes at creation; verify journal mode): sound; S1:349-354 suggests PRAGMA page_size on an empty in-memory destination.

## P8 — Error reporting locus: ACCEPTED
- Errors attached to the destination connection; read errcode()/errmsg() there after finish: S1:296-310 (finish "does not overwrite an error code stored in the destination connection by step"); S2:182-187 (init errors stored in D); S3:604-605 (finish calls sqlite3Error(p->pDestDb, rc)).
- S1 examples read the code from the destination handle: S1:267 (pTo), S1:413 (pFile).
- Extended-IOERR documented but untested: S2:229. Fine as stated.

## Optional lead (scratch destination + rename into place): ACCEPTED as labeled
- Correctly labeled engineering practice, not a source claim. Grounding it uses is real: destination exclusive lock for the whole run (S2:236-239). Condition to add in final: rename must be same-filesystem to be atomic; and the scratch-then-rename pattern bypasses the shared-cache whole-process exclusion only if the final name is not opened by process connections during the run.

## Extra primary check (within policy/budget)
- Check: upstream master src/backup.c compared on the P6 seam. URL https://raw.githubusercontent.com/sqlite/sqlite/master/src/backup.c; version: master branch snapshot; captured 2026-10-08 (post-pinning, via WebFetch text extraction). Result: identical finish return line `rc = (p->rc==SQLITE_DONE) ? SQLITE_OK : p->rc;`, identical `p->rc = rc;` latching, identical TRANS_WRITE→BUSY immediate return, and nothing resets p->rc to OK before finish. So the S2/S3 seam is version-stable, not a 3.51.3 transcription artifact.
- Limitations: text extracted through a summarizing fetch; no byte-level sha256 could be recorded for the fetched copy; master is a moving target. Used as corroboration only; the pinned 3.51.3 release remains authoritative for all claims.

## Scoreboard (feeds final.md)
- P1 accepted · P2 accepted/amended · P3 amended · P4 accepted · P5 accepted · P6 amended (material) · P7 accepted · P8 accepted · lead accepted-as-proposal.
- No draft proposition is rejected; none is dropped. Two amendments are material (P6 BUSY/LOCKED latching; P3 in-memory merge caveat); P2 carries two advisory amendments.
