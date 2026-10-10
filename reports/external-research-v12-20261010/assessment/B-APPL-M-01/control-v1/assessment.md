# ER12 B-APPL-M-01/control-v1 independent assessment

**Source judgment: PASS_WITH_LIMITATIONS. Coverage: complete for the bounded applicability/exception verification role. No material findings.** The minor limitation concerns a prospective checkpoint counter oracle (L1). Native, protocol and time observations are separate. This is not full-pipeline or product qualification.

The complete frozen verification has 720 whitespace-separated words, addresses all six claims individually and finishes with two concrete acceptance checks. I read the common assignment, fixture, corpus index and both complete corpus files, the arm input map and assignment, complete verification, source map and sole source evidence file, terminal freeze, and arm dispatch/status metadata. No other arm, evaluation, history or repository canon was read.

## Independent claim assessment

1. **PASS — claim 1 correctly rejected.** The subject is simultaneous writers appending to one WAL database. SQLite 3.51.3 in the stated local multi-process configuration permits one writer; the corrected reader/writer concurrency distinction is sound. Concurrency is not an unconditional promise against every busy result. Evidence: [WAL §§2.2 and 9](https://www.sqlite.org/wal.html).
2. **PASS — claim 2 correctly conditional.** The candidate preserves partial progress, continuing writes as a growth condition, and later progress after reader release. It does not turn a merely possible reader into measured unlimited growth. Evidence: [WAL §§2.2 and 6](https://www.sqlite.org/wal.html).
3. **PASS — claim 3 correctly rejected.** Embedded operation does not establish unchanged multi-host NFS support. Ordinary shared-memory WAL requires same-host coordination. Exclusive single-process/custom-VFS alternatives change this design; a redesign is outside the required verification. Evidence: [WAL §§1, 2.2 and 8](https://www.sqlite.org/wal.html).
4. **PASS — claim 4 correctly conditional.** All three documented opening conditions and the 3.22.0 history are preserved for 3.51.3. WAL state during shipping and immutable assertion consequences are retained; the actual snapshot remains unknown. Actual URI parameter use presupposes URI recognition. Evidence: [WAL §§4–5](https://www.sqlite.org/wal.html) and [URI filenames §§2 and 3.3](https://www.sqlite.org/uri.html).
5. **PASS_WITH_LIMITATIONS — claim 5 correctly rejected, with L1 below.** PASSIVE completion, checkpointed frames and physical truncation are distinct. TRUNCATE's applicable guarantee is immediately before successful return, not a promise against subsequent writes. Evidence: [checkpoint interface PASSIVE/TRUNCATE and output/return conditions](https://www.sqlite.org/c3ref/wal_checkpoint_v2.html) and [WAL §6](https://www.sqlite.org/wal.html).
6. **PASS — claim 6 correctly unsupported.** Generic performance guidance cannot establish this catalog's p95 gain. Missing matched, repeated measurements are identified. AC2's WAL p95 <=60% of baseline correctly represents a 40% reduction. Evidence: [WAL §§1 and 2.3](https://www.sqlite.org/wal.html).

The added WAL-reset version note is independently supported: [SQLite 3.51.3 release log, specific patch changes item 1](https://www.sqlite.org/releaselog/3_51_3.html) confirms the fix. This is useful version-specific history for the multi-connection scenario; it does not identify the shipped binary.

## Limitation and validation

**L1, minor — checkpoint counter oracle.** Claim 5 and AC1 mention pnLog/pnCkpt monitoring without specifying the database-name argument or exceptional counter interpretation. The [C reference's output and zDb paragraphs](https://www.sqlite.org/c3ref/wal_checkpoint_v2.html) make both values undefined for NULL/empty zDb; -1 may indicate error or non-WAL operation. Counters measure frames, including prior checkpoint work, rather than physical bytes. No concrete all-database call or executed result is asserted; AC1 first verifies WAL activation and also records return code and physical file size. This is a minor qualification of a prospective check, not a material error or required candidate repair.

AC1 proposes target version/VFS and WAL activation observations, a local writer/long-reader exercise, checkpoint progress after reader release, and actual snapshot conditions. Its NFS rejection is a documented support-boundary decision, not an executed NFS experiment. AC2 proposes matched rollback/WAL measurements with a meaningful ratio oracle. Both are explicitly **proposed, not executed**. Missing deployed binaries, snapshots and workloads are honest unknowns, not failures invented for this role.

The reviewer executed independent primary retrieval and artifact inspection/integrity/count checks. Four official pages were opened with surrounding exception passages, including the exact release log. No database probe, installation, downloaded-code execution, benchmark, account or service operation was performed. Discovery breadth, implementation redesign, critique dispositions and full finalization-chain preservation were not assigned.

## Delivery, native protocol and time

**Delivery PASS:** verification, source map, source notes and terminal freeze are present. All four shared input entries and all eleven terminal manifest hashes/byte lengths match current bytes. This proves identity/custody only; semantic judgment comes from independent source analysis.

Frozen verification: [verification.md](ER12_RUNTIME/runs/B-APPL-M-01/control/stages/role/verification.md), SHA-256 2fb5c2847aadfe3a848d9e30cb350a4fc737be8353eefba7e98660500545c76c. Frozen source map: [source-map.json](ER12_RUNTIME/runs/B-APPL-M-01/control/stages/role/source-map.json), SHA-256 3eecb95ed15648435c7d2c653f9e7e1fe21c352f89d8d546c458a117b68d07f3. Companion JSONs record all inspected absolute paths and hashes.

**Candidate native UNKNOWN:** status.json reports native Goal completion and 2m54s elapsed, but allowed frozen artifacts supply no direct native activation/completion receipt. freeze.json records native status as unknown until observed. T3 terminal completion is separately reported; native provenance, exact elapsed time and save-before-native-completion ordering remain UNKNOWN. No history/transcript was read to fill these gaps.

**Protocol:** no violation is visible in authored science or allowed metadata. The source map lists the two corpus URLs plus one additional primary page; no local execution is claimed and T3 reports no pending child runs. Full prohibited-action compliance and retrieval timing cannot be certified without execution trace. Unauthorized assistance, if established later, invalidates method protocol without rewriting this source diagnostic.

**Host time:** prepared 2026-10-10 04:02:08 UTC; terminal freeze 04:06:21.179851 UTC, an observed 253.179851-second interval within the 04:17:08 absolute deadline. Verification/source-evidence mtimes are 04:05:22/04:05:41 UTC. These are custody observations, not verified native occupancy, inference time or billing. Investigation/writing accounting remains UNKNOWN; early finish is allowed. No paired conclusion or speed/savings inference is made.

This review used one actual native Goal. Activation and the latest pre-save receipt are recorded in assessment.json. The complete review artifacts are saved before that Goal is completed. Preserve this original assessment; later dispute dispositions belong in separate artifacts.
