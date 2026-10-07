# D-M05-B independent source review

Both outputs provide a useful, supported rejection of the stated two-host network-mounted WAL deployment. Both fail full source quality because they retain a material journal-mode error. All six declared obligations were independently assessed for each output; this is not an early-stop review. Frozen candidates were not edited.

REVIEW.json contains the per-output obligation dispositions, supported claims, primary paths and SHA-256 values, exact line locators, defects, preservation assessment, proposed/performed distinction and blinding limits. Its P1–P13 evidence records bind every source locator to its captured bytes.

## Material defects

**D1 — both outputs:** Output1 final.md:35 and Output2 final.md:80 retain the generic transaction-page warning about COMMIT returning BUSY because another connection has an open reader as a WAL rule. Output1 final.md:53 additionally requires that test to return BUSY. Ordinary supported WAL allows the writer to commit while a separate reader retains its snapshot. Readers can constrain checkpoint/reset, and a stale reader's write upgrade can fail; these are different operations.

Primary evidence: frozen sqlwal.html:231–238,293–297; released pager-3.51.3.c:6408–6432 skips the rollback-mode exclusive database lock in WAL; :6496–6514 commits through WAL frames; frozen sqlwalcode.c:3866–3905 declines a busy reset and continues, and :4220–4252 publishes committed frames. See P9 and [SQLite isolation documentation](https://www.sqlite.org/isolation.html). The generic sqltransaction.html:385–389 warning does not establish the claimed WAL domain.

The reviewer-authored local witness committed value 2 while a separate connection stayed in a read transaction seeing value 1. Its installed runtime was **SQLite 3.46.1**, so it is supplemental, not selected-release certification. Actual 3.51.3 implementation inspection is decisive. An unsupported network mount also cannot supply a guaranteed BUSY oracle.

**D2 — Output1 only:** final.md:29 preserves a strict promise that NORMAL plus background checkpointing avoids foreground sync. Frozen WAL documentation does use this shortcut, but released code contains a header-sync exception. sqlwalcode.c:1714–1731 initializes syncHeader and disables it for a sequential-capability VFS; :4074–4115 synchronizes a new/reused WAL header while writing frames. pager-3.51.3.c:3614–3649 supplies nonzero checkpoint sync flags under NORMAL; wal-3.51.3.h:20–26 defines the flag extraction. See P10 and [synchronous pragma documentation](https://www.sqlite.org/pragma.html#pragma_synchronous). Omitting the extra ordinary commit sync does not guarantee zero foreground sync. No sync tracing was performed. Output2 does not explicitly make this promise and is not charged with D2.

## Localized nonmaterial errors

**D3 — Output2:** final.md:64 changes the source's usual small size into a total upper bound of 32 KiB. Frozen sqlwal.html:616–622 says the index rarely exceeds that size. sqlwalcode.c:153–183,615–629,740–803 supports multiple index blocks. A supplemental 3.46.1 witness produced a 65,536-byte shm file. No recommendation or resource budget relies on that bound.

**D4 — Output2:** final.md:17 says prior reader gaps were provisioned. The mapped prior F3 and cross-cutting unresolved item 2 leave their provision/workload policy unresolved. The final still withdraws the size guarantee, so this erroneous binding is nonmaterial to its disposition.

## Coverage and preservation

For both outputs, rename independence and the network/process-location reassessment are supported. Each revisits locking, shared memory, checkpointing, durability, recovery, sidecar custody and the version fix. Their unchanged-version evidence supports retaining the 3.51.3 WAL-reset fix; it does not cure unsupported deployment. The released checkpoint code also checks live salts before updating backfill state (sqlwalcode.c:2256–2268). [The official release record](https://www.sqlite.org/releaselog/3_51_3.html) confirms the fix.

Their narrow deployment rejection is correct, not blanket abstention. The stated recovery, storage/VFS, workload, retry and backup unknowns remain legitimate. Whole recommendations cannot receive a source-quality pass while D1 remains. Output1's proposed validation is additionally impaired by its false COMMIT oracle. Output2's bounded validation outline is useful with configuration and timing refinements.

Both candidates distinguish reported source inspection from proposed runtime checks. Frozen manifests are reports, not independent proof that those candidate operations occurred; no candidate tool histories or terminal artifacts were opened.

Supported optional leads are stale-snapshot transaction restart rather than same-transaction retry, persistent WAL versus transient reconstructible shm, PASSIVE success versus checkpoint completion, and actual runtime/build identity rather than WAL format number. These are recorded separately from material failures. Sole-process EXCLUSIVE and read-only opening do not rescue concurrent two-host WAL.

## Limits and audit artifacts

No actual two-machine mount, target VFS, workload, crash/power-loss, backup or selected-release runtime execution was assessed. Those empirical facts are unknown, not omissions from assessment of the six declared obligations. No exhaustive unknown-defect recall is claimed.

Only the mapped task/prior/source files and neutral frozen final/manifest pairs were read, plus actual applicable AGENTS/global rules and bounded additional public primaries. Candidate content exposed method labels and arm paths; these are disclosed blinding limits, not read authority. No parent analysis, economics, targets, grades, campaign state or candidate job prompts were read. No children, installs, account changes, canonical/repository changes or candidate rescue occurred.

Additional primary raw bytes and hashes are retained in reviewer-primary/ and reviewer-primary.json. Reviewer-authored execution and results are counterexamples.py and counterexamples.json; temporary databases were removed. Native create/active and completion/fresh-get receipts are saved verbatim JSON. Actual elapsed time is recorded in review-time.json.

