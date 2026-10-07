# D-M04-A independent primary-source review

Both frozen outputs received complete assessment of all six declared obligations. Output1 has **source_quality PASS** and is a useful deliverable. Output2 has **source_quality PARTIAL** and remains useful, with a material missing disposition when an active COMMIT reaches the retry limit. These are source and scope conclusions, with no winner, economic ranking, target grade or candidate revision.

PASS here requires complete declared-scope assessment and no material false claim or mandatory policy omission. PARTIAL identifies a supported useful core with a material incomplete obligation. A defect is material when it affects safe transaction disposition or omits a mandatory policy branch; a wording qualification is nonmaterial when the final already retains the correct safe action. No additional scoring rubric is used.

## Scope, inputs and independence

The mapped brief specifies SQLite **3.51.3**, one writer and long-lived readers on local disk; it asks for a bounded diagnostic recommendation, rather than an application plan. Changes and common prior state are null. I read the actual global AGENTS.md, repository AGENTS.md and AGENTS.append.md. Their paths and hashes are recorded in REVIEW.json. The explicit review boundary governs this work outside the repository: no canon, repository, main, WorkNode, account, installation, external-write or child-agent activity occurred.

I read only the mapped brief, both neutral frozen final.md/sources.json pairs, the mapped primary bytes, applicable rules, my own review artifacts and independently fetched public primary sources. All four mapped source hashes and all four candidate artifact hashes matched the map before substantive assessment and again afterward. Hash matches establish identity, not truth. Claim decisions below use the actual source passages and release-specific control flow.

The neutral files do reveal method/arm names in headings and embedded job paths. Those embedded paths were never opened. Initial rules discovery enumerated filenames under .codex/.t3 and the review directory without reading unrelated contents. No parent analysis, costs, targets, expected winner, other grades/cases, job prompts, source-arm files or campaign state were read. Source-manifest operation claims are self-reports; they do not independently establish candidate executions or earlier-draft preservation. The requested account was not authenticated by reading credentials or changing an account.

A fresh native Goal was activated with the exact concise objective “D-M04-A independent source review.” The unmodified create_goal and fresh active get_goal results are saved in goal-active-receipt.json. After authorship and verification, update_goal complete and a fresh get_goal are saved separately in goal-terminal-receipts.json. Actual final elapsed time is recorded in REVIEW.json; the budget is 900 seconds.

## Output1

**Complete declared scope assessed: true.**

1. **Deferred versus immediate — satisfied.** Final line 7 correctly places database acquisition at DEFERRED's first access and write acquisition at IMMEDIATE begin. It distinguishes SELECT-first promotion and gives the correct single-writer constraint. Primary evidence: frozen sqltransaction.html 290–304 and 330–349.

2. **Reader-to-writer transition — satisfied.** Lines 7 and 9 retain the historic snapshot, promotion failure and whole safe-operation restart boundary. Crucially, line 9 conditions BUSY_SNAPSHOT on obtaining the writer lock and then finding a changed WAL-index header. That ordering agrees with the actual 3.51.3 implementation: frozen sqlwalcode.c 3712–3736. The old read view persists until the transaction ends: sqltransaction.html 308–316.

3. **WAL assumptions and BUSY/LOCKED — satisfied.** Lines 5, 13 and 29 require actual WAL mode, same-host access and the selected release. The returned mode condition is supported by sqlpragma.html 1214–1224. WAL reader/writer concurrency, one writer, checkpoint obstruction and exclusive/cleanup/recovery BUSY cases are supported by sqlwal.html 166–180, 269–318 and 681–704. The claim that the mapped corpus does not establish a LOCKED retry policy is appropriately limited: exact-token searches found no SQLITE_LOCKED in those four objects. Separate diagnosis remains useful; this is not blanket abstention.

4. **Application policy versus database guarantees — satisfied.** Line 11 calls for finite deadline/cap/backoff and safe replay, fits SQLite wait time into the application's budget, and does not promise eventual success. The busy handler condition is directly supported by sqlpragma.html 576–588. Backoff, jitter, queueing and idempotency are application choices, not measured or SQLite-mandated outcomes. Numeric values remain to be selected; the brief does not mandate particular numbers.

5. **Failure cleanup — satisfied.** Line 17 skips the body after failed begin, checks state, requires rollback before active-connection reuse and retires uncertain state. It separates retrying an active COMMIT from replaying the body, and does not assign ordinary rollback-reader commit contention to WAL readers. Primary evidence: sqltransaction.html 263–286, 378–389 and 410–440; sqlwal.html 166–168. The SAVEPOINT alternative for nested work is supported by transaction lines 277–286. The broad cleanup-before-reuse rule covers terminal retry failure even though each terminal branch is not separately enumerated.

6. **Useful alternative and discriminating test — satisfied.** Line 19 retains a bounded write queue for competing write intents, with explicit latency/head-of-line tradeoffs, and DEFERRED for read-mostly work. The queue is a conditional application inference from SQLite's single-writer constraint, not a benchmark result or a required change to the brief's existing one-writer arrangement. Lines 21–25 propose stale-promotion/acquisition, long-reader/checkpoint and busy-budget/LOCKED checks that distinguish the relevant mechanisms.

No material defect or declared-scope omission was found. Optional supported discoveries are the official LOCKED definition and an explicit distinction between pending-write COMMIT BUSY and external-reader COMMIT BUSY. The former is supported by the independently captured official result-code page at raw lines 428–453; the latter by the frozen transaction page at 378–389 and tagged vdbe.c 4027–4034. These optional findings do not make Output1's mapped-corpus uncertainty an incorrect rejection.

The final retains IMMEDIATE for known writes, DEFERRED for optional writes, stale-snapshot restart, mode/host/code prerequisites, finite application retry policy, safe replay and connection cleanup. Loaded-library identity remains unverified. No authorized prior draft was supplied, so historical preservation or earlier critic corrections are not independently assessable.

## Output2

**Complete declared scope assessed: true.**

1. **Deferred versus immediate — satisfied.** Lines 3 and 5 distinguish first-access DEFERRED from up-front IMMEDIATE acquisition, correctly reserve the single-writer constraint and keep unrelated work outside the write transaction. Evidence: sqltransaction.html 290–304 and 330–349.

2. **Reader-to-writer transition — satisfied, with O2-D1 below.** Line 5 retains the safe rollback/re-read/replay response to failed promotion. Its exact-result statement omits a writer-acquisition qualification, but line 13 still requires cleanup after failed promotion. Evidence: sqltransaction.html 308–342 and sqlwalcode.c 3712–3736.

3. **WAL assumptions and BUSY/LOCKED — satisfied, with that same nonmaterial precision issue.** Lines 7, 11 and 17 preserve actual mode, host, one-writer/checkpoint conditions, WAL BUSY subcases, extended code exposure and fallback behavior. The additional LOCKED distinction is supported by the independently reacquired [official result-code page](https://www.sqlite.org/rescode.html), raw lines 428–453. Its SHA-256 matches the frozen manifest's supplemental capture without opening the candidate's cache. Releasing a local conflicting statement is useful for that documented case; resolving a shared-cache conflict may additionally depend on another connection. The candidate does not promise that closing this connection's cursor resolves every LOCKED case.

4. **Application policy versus database guarantees — satisfied.** Lines 9 and 17 give explicit initial parameters: 100 ms timeout, four total acquisition/COMMIT calls, capped pauses and a 1 s monotonic deadline. They label these as tuneable application values. They are unmeasured and do not establish a hard bound on all database work or filesystem latency; that is an operational limit, not an observed overrun. The source-backed single-handler condition is sqlpragma.html 576–588. Terminal transaction disposition is assessed separately under cleanup.

5. **Failure cleanup — partially satisfied; O2-D2 is material.** Lines 11 and 13 correctly retain an active COMMIT for commit-only retry and clean up body errors/failed promotion before reuse. However, line 9 returns a retryable/requeue result on budget expiry without stating what happens if that expiry follows an active COMMIT failure. The cleanup paragraph names body errors and failed promotion, not this terminal COMMIT branch.

6. **Useful alternative and discriminating test — satisfied.** Lines 3 and 15 keep DEFERRED for read-mostly paths and propose acquisition, stale-promotion, stable-event-ID, checkpoint and mode-fallback checks. A clearer COMMIT discriminator would explicitly retain a rollback-mode reader through the writer's COMMIT. The proposed checks remain useful and are explicitly unrun.

**O2-D1 — nonmaterial source-condition imprecision.** Final line 5 makes an intervening commit appear sufficient for BUSY_SNAPSHOT. In the frozen 3.51.3 WAL source, raw lines 3712–3718 first attempt the writer lock and return an acquisition error immediately; only lines 3721–3728 compare the snapshot header and set BUSY_SNAPSHOT. A stale read can therefore first receive ordinary BUSY while the writer slot is held. Reviewer case C1 observed BUSY (5), followed by BUSY_SNAPSHOT (517) on the same old read transaction after the writer released its slot. The illustrative runtime was 3.46.1; the selected-release finding rests on inspected 3.51.3 source, not that runtime. This is nonmaterial because the frozen final already restarts after any failed promotion; the correction changes exact-code precision, not its safe restart disposition.

**O2-D2 — material declared-scope omission.** The application can stop retrying while COMMIT still leaves the transaction active. The frozen transaction manual, lines 385–389, explicitly preserves an active transaction after reader-blocked COMMIT. Tagged [3.51.3 vdbe.c](https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/vdbe.c), lines 4040–4044, restores the previous autocommit state on the BUSY path. Requeue/connection reuse needs a known disposition of that active transaction; expiry itself is not cleanup. C3 observed four BUSY commits, a still-active writer transaction and a blocked competing writer; explicit rollback released it and preserved only the original rows. This used timeout zero on 3.46.1 and did not execute the candidate's proposed schedule. It corroborates the state boundary; exact-release persistence has independent primary evidence. The defect is an omitted mandatory branch, not an assertion that the final explicitly orders a transaction leak. No repair was applied.

The noticed result-code documentation tension is real, not an incorrect rejection of IMMEDIATE. The public page at raw lines 416–424 makes broad successful-IMMEDIATE/no-later-BUSY wording. In the selected release, pending write statements cause COMMIT BUSY even with WAL: tagged vdbe.c 4027–4034. Ordinary rollback-mode IMMEDIATE takes a RESERVED lock, while commit can subsequently require EXCLUSIVE: tagged pager.c 5918–5955, 6408–6432, 4282–4292 and 6597–6609. Thus a release/domain check is warranted. Output2 honestly retains uncertainty about this unpinned documentation instead of adopting an unconditional guarantee. The review's additional findings do not silently become candidate work.

Output2 preserves its substantive dispositions and deployment/replay prerequisites, but lacks the transaction-disposition dependency for terminal active-COMMIT budget exit. No supplied prior permits historical preservation or earlier-correction judgments.

## Proposed work versus performed evidence

Both frozen finals explicitly say their runtime checks were **not run**. No independent candidate execution evidence was supplied or consulted. Acquisition/cache/fetch operations in sources.json are self-reported, except that this review independently verified mapped identities and reacquired the supplemental public result-code bytes.

I executed one reviewer-authored bounded harness, review-counterexamples.py, with the existing Python SQLite **3.46.1**. No candidate implementation existed or was executed. Six cases produced the recorded observations in counterexamples.json:

- C1: stale snapshot plus held writer returns ordinary BUSY; released writer exposes BUSY_SNAPSHOT.
- C2: losing IMMEDIATE begin returns BUSY and leaves no active transaction; the harness skips the body.
- C3: repeated rollback-reader COMMIT BUSY remains active until explicit cleanup.
- C4: WAL COMMIT is BUSY with an unfinished write RETURNING statement; closing it permits commit.
- C5: a same-connection reader makes DROP TABLE LOCKED; closing the cursor resolves that local conflict.
- C6: a WAL writer commits while a long reader limits PASSIVE checkpoint progress; checkpointed frames rise from 5/6 to 6/6 after the read transaction ends. PASSIVE progress does not claim file shrinkage.

The harness ran once in about 0.204 seconds. Temporary databases, WAL and shared-memory files were created under the review output scope and automatically removed. No installer, downloaded code, candidate edit or repeated best-of test occurred. The 3.46.1 runtime is an explicit limitation: exact 3.51.3 conclusions use source inspection, not an assumption that the installed library is the selected version.

There is no unassessed remainder within the six declared source-review obligations. Neither candidate's deployed binding/library, exact retry performance, historical draft preservation or all possible SQLite/VFS failure cases was established. No exhaustive unknown-answer recall is claimed.

Output1's useful yield is its correct acquisition/snapshot/checkpoint separation and general reuse cleanup. Output2 adds supported LOCKED semantics and explicit starting retry values, while retaining an actual documentation tension. The evidence-backed differences are the snapshot qualification and terminal COMMIT cleanup coverage; neither source method is used as a quality proxy.

## Primary identity and locator record

Raw line numbers refer to captured bytes, not a later rendered web page. REVIEW.json carries full candidate locators, individual obligation dispositions, claim conditions, source identities and defects. The following files are retained as necessary review evidence; none is executable candidate code.

- **sqltransaction** — [primary URL](https://www.sqlite.org/lang_transaction.html); SQLite transaction documentation capture 2026-10-07. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M04-A/inputs/sources/sqltransaction.html`. SHA-256: `b65dc308fd9e0ce471844c97366a4f5ad3a1f42833a3b19486ad7d6555a8e24e`. Inspected raw lines: 248–443.

- **sqlwal** — [primary URL](https://www.sqlite.org/wal.html); SQLite WAL documentation capture 2026-10-07; selected runtime 3.51.3. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M04-A/inputs/sources/sqlwal.html`. SHA-256: `f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e`. Inspected raw lines: 140–205, 228–345, 548–590, 672–711.

- **sqlpragma** — [primary URL](https://www.sqlite.org/pragma.html); SQLite PRAGMA documentation capture 2026-10-07. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M04-A/inputs/sources/sqlpragma.html`. SHA-256: `b9bcb335ae818497f3fa05114a10492f64f35503f275da2264f2d5d436db3f5d`. Inspected raw lines: 569–599, 1208–1303.

- **sqlwalcode** — [primary URL](https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/wal.c); SQLite version-3.51.3. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M04-A/inputs/sources/sqlwalcode.c`. SHA-256: `100980ad092bcd2b722902b4b2f9927975cfa953d57eef521d7aed42918a39be`. Inspected raw lines: 2070–2125, 3680–3765.

- **review-rescode** — [primary URL](https://www.sqlite.org/rescode.html); Mutable official docs, review capture; not release-pinned. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/reviewer-primary/rescode.html`. SHA-256: `05ce13c1b04b1c7ea074f2155e979482512946634590dfe86f99af5e36e93b23`. Inspected raw lines: 399–453, 915–939.

- **review-btree-3.51.3** — [primary URL](https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/btree.c); version-3.51.3. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/reviewer-primary/btree-3.51.3.c`. SHA-256: `ab4135be6b5e19f1766b1f4022fa6843fe8dd447504d39c49f22598366de8d61`. Inspected raw lines: 3563–3594, 3645–3720, 4280–4310.

- **review-pager-3.51.3** — [primary URL](https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/pager.c); version-3.51.3. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/reviewer-primary/pager-3.51.3.c`. SHA-256: `5ef7135d2d67ba7f2be6da0197854788ece57bccd2a743f6f1a5f33c94e8ce7b`. Inspected raw lines: 3940–3962, 4275–4305, 5860–5966, 6407–6441, 6461–6533, 6540–6590, 6590–6622.

- **review-vdbe-3.51.3** — [primary URL](https://raw.githubusercontent.com/sqlite/sqlite/version-3.51.3/src/vdbe.c); version-3.51.3. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/reviewer-primary/vdbe-3.51.3.c`. SHA-256: `4b48c880d07fe4e181100e7989f534cd0e834651d2204bb663d782d1140bc09d`. Inspected raw lines: 4000–4058.

Execution and active-receipt evidence:

- `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/review-counterexamples.py` — SHA-256 `e7a92d2ca9c79545b07c936343f61db46d295a279fd01427f21b71f560ad61fd`.

- `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/counterexamples.json` — SHA-256 `c6cf141ffef99aa62b3f2820f3e7069e11dd77cabf059b15f85a987be3f87e56`.

- `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/goal-active-receipt.json` — SHA-256 `d9cf27cc3d80fa5797816c076781f8bb233e86d38d0e4a3d8881f3ed9b2acafa`.


- **review-autocommit** — [primary URL](https://www.sqlite.org/c3ref/get_autocommit.html); Mutable official docs, review capture; not release-pinned. Path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/reviewer-primary/get_autocommit.html`. SHA-256: `07a24bb37b41ac779fdb8d0b9523b632b6810f28e5f963c3d83dd3689c6fbce9`. Inspected raw lines: 118–140. Supplementary state-inspection confirmation, not release-pinned execution evidence.

Final terminal receipt: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M04-A/goal-terminal-receipts.json` — SHA-256 `a407cacf13522be11248d19329165429b023617a224a4d02aa1a9c559b0445e9`. Native update and fresh get both report complete. Actual elapsed through saved terminal receipts: 418.485 seconds of 900; recorded at 2026-10-07T19:19:36.484776+00:00. Final consistency and frozen-hash checks passed; no temporary database directories remain.
