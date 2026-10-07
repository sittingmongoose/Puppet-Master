# Partial independent source review — stopped for protocol repair

This is a saved partial boundary, **not a grade, completed source pass, failed screen, or scientific result**. The user stopped the review because counterpart candidate work is still scored and both arms' final artifacts and native terminal receipts must be frozen first. No source research continued after that instruction. A fresh full review must be a new task.

The legitimate brief, frozen thin plan, complete supplied final, complete supplied critique, and both permitted source maps were read. No other arm, previous reviewer/grade, campaign card/cost/timing, native receipt, parent/root/historical analysis, or expected-winner answer was read. No descendants were started. No candidate file was edited or candidate message sent.

## Work already observed

### OBS-BAGIT-VALIDATOR

Candidate locations: final §3; final §4; critique K1–K3.

The shown v1.9.0 code has the oxum-first structure described in the candidate. With matching oxum, non-fast validation continues to completeness and hashes; a failing oxum aborts before those steps. This is not evidence that every non-fast validation skips hashes. Tag raw content matched the independently fetched immutable commit content. v1.8.1 validator structure and block-size declaration were also inspected.

Read locators: v1.9.0 bagit.py L128–131: default algorithms and 512 KiB block size; L586–604: validate entrypoint; L758–776: validate_fetch accepts file scheme without netloc, URL syntax check only; L778–837: unconditional oxum check, fast return, absent-oxum return, mismatch exception; L839–908: completeness and per-algorithm mismatch checks; L1111–1148 and L1374–1402: hashes updated from one read stream; L1453–1477 and L1544–1577: CLI help, flag guards, dispatch/reporting.

Limit: No code or tests executed. No complete standards-conformance or wrapper assessment finished.

Saved evidence: `sources/bagit-v190.py.txt`, `sources/bagit-v190-immutable.py.txt`, `sources/bagit-v181.py.txt`, `sources/bagit-v181-immutable.py.txt`.

### OBS-BAGIT-ISSUE-PR-RELEASE

Candidate locations: final §4; critique K2.

At this review's fetch, #137 and #177 are open; #174 is closed and unmerged. Its patch moves the oxum call inside the fast branch and changes only bagit.py. v1.9.0 was published 2025-06-13 and release notes do not list #174. The independently read PR discussion says the full-mode oxum check is intentional, objects to removing it, and distinguishes better diagnostics from dropping the check; the author closes the PR on that basis.

Read locators: issue bodies/state/date fields; PR state/merged_at/closed_at/body; patch hunk at _validate_contents; PR comments issuecomment-2272257346, -2359230342, -2359532360, -2359595126; release tag_name/published_at/body.

Limit: The consequences for final §4's 'S05 semantics ... acceptable alternative' and the proposed wrapper's final validity status were identified for further assessment, not graded. No merged upstream fix or verified regression execution was established.

Saved evidence: `sources/bagit-issue137.json`, `sources/bagit-issue177.json`, `sources/bagit-pr174.json`, `sources/bagit-pr174.patch`, `sources/bagit-pr174-comments.json`, `sources/bagit-issue137-comments.json`, `sources/bagit-issue177-comments.json`, `sources/bagit-release-v190.json`.

### OBS-BAGIT-TESTS

Candidate locations: final T1–T4; critique K11.

The pinned upstream test file contains a same-size flipped-bit case where full validation raises while fast/completeness-only pass, and detailed completeness coverage that removes bag-info containing oxum. These are observed test definitions, not test results. The candidate supplies its own proposed T1–T4 but does not name these upstream tests.

Read locators: test.py L100–144: flipped bit, fast, completeness, oxum absence; L190–240: detailed checksum/completeness errors, explicit removal of bag-info to force full check.

Limit: No full test-suite audit or final adjudication of the issue/fix/regression-history obligation was completed.

Saved evidence: `sources/bagit-tests-v190.py.txt`.

### OBS-BAGIT-FORMAT-VERSION

Candidate locations: final M1/P1; final §11 first source condition.

The pinned implementation's make_bag writes BagIt-Version 0.97, while the final's source conditions specify BagIt 1.0. The reader accepts 1.x. RFC8493 defines oxum as an optimization, requires checksum verification before proclaiming validity, specifies the actual payload byte/file totals when oxum is present, and defines complete/valid bags.

Read locators: bagit.py L141–143, L242–245: make_bag signature and hardcoded BagIt-Version 0.97; L345–358: reader's accepted version range; RFC8493 §2.2.2 L545–554; §2.4 L735–741; §3 L743–765.

Limit: No determination of whether the proposed packaging path supplies a separate 1.0 writer or version-conversion step; no conformance verdict.

Saved evidence: `sources/bagit-v190-immutable.py.txt`, `sources/rfc8493.txt`.

### OBS-FETCH-CONDITIONS

Candidate locations: final O1.

RFC8493 fetch.txt permits transfer with holes to be filled before meaningful completeness checking; fetched payload files must be in every payload manifest. The pinned component's validate_fetch validates minimally formed URLs; the inspected function does not download payload bytes.

Read locators: RFC8493 §2.2.3 L625–665; bagit.py L758–776.

Limit: The optional 'defers storage cost' wording and its compatibility with mandatory ingest validation were not finally assessed.

Saved evidence: `sources/rfc8493.txt`, `sources/bagit-v190.py.txt`.

### OBS-SQLITE

Candidate locations: final F3/F5/F9; final M5/M6; final P3/P6; final R2–R4; critique K4 R-a/R-b.

The official documentation supports incremental Backup API reads, writer concurrency between steps, WAL sidecar preservation, and the network-filesystem limitation. Backup documentation also describes restart/progress conditions. The VACUUM page distinguishes ordinary VACUUM from VACUUM INTO: INTO leaves the source unchanged and is expressly excluded from the write-operation statement. This matters to critique K4 R-a's rationale; the final prefers Backup API but does not repeat that write-lock sentence. The WAL page also lists a version-specific WAL-reset corruption fix and conditions.

Read locators: Atomic Commit introduction and table of contents, rollback-journal commit sequence and crash sections; WAL opening restrictions/network-filesystem and sidecar snippets; §11 WAL-reset bug; Backup §1 and §3.1, extracted L30–70 and L265–289; VACUUM §2.1 and §3, extracted L66–125.

Limit: No SQLite runtime pin, backup-set consistency assessment, transaction/file atomicity assessment, or final consequence judgment. Atomic Commit is explicitly about rollback mode, not arbitrary payload-file transactions. The newly fetched pragma/rsync documents were not comprehensively read.

Saved evidence: `sources/sqlite-atomiccommit.html`, `sources/sqlite-atomiccommit.txt`, `sources/sqlite-wal.html`, `sources/sqlite-wal.txt`, `sources/sqlite-backup.html`, `sources/sqlite-backup.txt`, `sources/sqlite-vacuum.html`, `sources/sqlite-vacuum.txt`.

### OBS-OMEKA

Candidate locations: final M7/P7; final §6 Omeka bullet; critique K4/K6.

The module page and pinned README distinguish public/private record visibility, file level, and embargo, including strictest access inheritance and configurable embargo cascade. Default static file protection requires routing configuration, with small thumbnails additional paths. The read plugin segment separately handles forbidden/embargo and shows defaults/privileged exceptions. File-controller authorization matches and a matrix test were located, but those files were not read in full.

Read locators: 3.4.47 tag commit 96810900986ce5278cef79c2b9bfcda31d4e59ed; README L123–168, L277–305, L389–402, L535–580; media-check PHP L115–200; file-controller and matrix-test text matches only.

Limit: This is an analogy check, not a security audit or proof of all serving surfaces. No complete candidate-rights-condition assessment.

Saved evidence: `sources/omeka-access-page.html`, `sources/omeka-access-page.txt`, `sources/omeka-access-readme34747.txt`, `sources/omeka-access-tag34747.json`, `sources/omeka-access-media-check.php.txt`, `sources/omeka-access-file-controller.php.txt`, `sources/omeka-access-matrix-test.php.txt`.

### OBS-ARCHIVEMATICA

Candidate locations: final F4/M4/M8/P5; final §6 Archivematica bullet.

The tutorial documents SIP to AIP/DIP normalization roles and explicitly shows an already-preservation-format case where no conversion occurs. It describes storing the AIP before the DIP and reviewing original/preservation copies and process metadata. A more specific AIP-structure page was fetched but not read before interruption.

Read locators: Quick-Start documentation title Archivematica 1.13.2; Quick-Start extracted L100–245; later matched AIP/DIP/METS excerpts; METS page matched generic structure/PREMIS event-rights-agent snippets.

Limit: No full BagIt-AIP attribution or normalization-choice assessment, and no complete comparison of all role/provenance conditions.

Saved evidence: `sources/archivematica-113-quickstart.html`, `sources/archivematica-113-quickstart.txt`, `sources/archivematica-113-metadata.html`.

### OBS-NDSA

Candidate locations: final F2/F8; final P4/P9; final §6 NDSA bullet; final U2.

The landing page identifies v2.1 and provides its matrix directly as an image. The image was viewed: its rows are Storage, Integrity, Control, Metadata, Content; storage cells distinguish two copies at Level 1, three/another geography at Level 2, and different threat/storage type at Level 3. The full image was visually available, including ingest integrity, virus checks, metadata/integrity information backups, logging, and format/content properties.

Read locators: landing page March 2026 v2.1 statement and matrix link; v2.1 matrix image, five functional rows and four level columns.

Limit: No cell-by-cell mapping of the candidate to a level or final judgment about the hedged Level 2–3 claim. No OSF guide/PDF read.

Saved evidence: `sources/ndsa-levels.html`, `sources/ndsa-levels.txt`, `sources/ndsa-matrix-v21.png`.

### OBS-LOC-FORMATS

Candidate locations: final M8/P8; final F7; critique K4 F7.

Audio favors Broadcast WAVE metadata, native resolution, uncompressed/lossless over lossy choices. Digital still-image preferences include original/master-format fidelity, color/resolution properties and multiple named image formats. Candidate S13/S14 point to audio/still-image pages, not the separate textual-work page. Independent textual-page matches contain PDF/A, but that page was not read comprehensively.

Read locators: Audio media-independent section, extracted L46–81; Still Images digital photographs, extracted L60–103; other graphics through L160; Textual Works PDF/UA, PDF/A and PDF preference matches only.

Limit: No completed source-support adjudication of mandatory normalization, scanned-document formats, PDF/A attribution, or converter selection.

Saved evidence: `sources/loc-rfs-audio.html`, `sources/loc-rfs-audio.txt`, `sources/loc-rfs-stillimg.html`, `sources/loc-rfs-stillimg.txt`, `sources/loc-rfs-text.html`, `sources/loc-rfs-text.txt`.

### OBS-ALTERNATIVE-SNIPPETS

Candidate locations: integrated mechanism/alternative breadth obligation; final M1/M2/M3/M6/O3.

Bounded independent primary search located versioned content-addressed OCFL storage and restic backup integrity mechanisms. OCFL digest addressing/dedup/fixity text was read; restic matches distinguish default repository checks from read-data and subsets. SQLite's backup page also identifies sqlite3_rsync, and its applicability matches were examined.

Read locators: OCFL §3.4 extracted L239–275 and version/immutability matches; restic Checking integrity and consistency matches, extracted around L298–392; sqlite3_rsync applicability/version/WAL matches.

Limit: No full alternatives assessment, affordability comparison, candidate breadth grade, or rewritten recommendation. PREMIS landing and other fetched-but-unread documents remain unassessed.

Saved evidence: `sources/ocfl-spec-v11.html`, `sources/ocfl-spec-v11.txt`, `sources/restic-repository-checks.html`, `sources/restic-repository-checks.txt`, `sources/sqlite-rsync.html`, `sources/sqlite-rsync.txt`.


## Exact remaining scope

1. Finish an independent per-obligation assessment of every domain requirement: affordable digitization stations/volunteer operation, photos/audio/scanned documents, immutable original bytes and derivatives, safe dedup, rights/restricted access, silent-corruption detection, interrupted-ingest recovery, failed-storage recovery, and internal/public separation.

2. Finish genuine primary-source selection/appropriateness and bounded discovery-yield assessment; independently fetched/located sources do not by themselves complete this obligation.

3. Finish materially different mechanism/useful alternative comparisons, including actual adoption tradeoffs and affordability. The partial includes source snippets, not a breadth grade.

4. Finish all consequential pinned-component conditions, especially BagIt 1.0 versus make_bag's 0.97 output, any wrapper validity/reporting semantics, actual intended generator path, and full file/tag conformance.

5. Finish issue/fix/regression-test/release applicability assessment using observed PR rejection discussion and pinned test definitions; no final judgment or executed regression evidence exists.

6. Finish source-specific comparison of every relevant finding against all frozen plan clauses and final F1–F10, M1–M8, P1–P10, R1–R8, O1–O4, U1–U4, T1–T4, V1–V7, §6 analogies, and §11 source conditions. These groups were read as candidate text but not all independently adjudicated.

7. Finish supported-correction/product-choice/already-covered/optional/uncertainty/validation-proposal dispositions; partial observations do not establish final planning usefulness.

8. Finish file-plus-row crash/durability/journal ordering, combined DB/payload backup consistency, replica repair and restore assertions, and proposed versus guaranteed recovery claims. rename/fsync/pragma evidence was fetched but not read.

9. Finish normalization/formats/provenance applicability, NDSA matrix-to-plan mapping, complete rights/serve-time conditions, and workload/sampling/retention/resource implications.

10. Finish supplied-critique preservation check across K1–K13, including nuances and limits; the critique and final were read, but no complete delta/disposition map or preservation verdict was authored.

11. Finish executed-versus-proposed/status assessment: the text distinguishes observations/proposals, but no complete claimed-execution audit or historical verification was performed. Native terminal receipts must not be inferred from page/code reads.

12. After both arms and native terminal receipts are frozen, the separately authorized fresh full-review task must supply REVIEW.md/judgment.json and any scientific result; this partial has no grade.

All final sections and the supplied critique were read as inputs. That is **not** a claim that every consequential statement was independently assessed. The source inspection above covers specified code/issue/test sections and document snippets only. Downloading a source, deriving text, locating a match, or inspecting its identity does not count as completing its source/application assessment. The JSON preserves the exact observed coverage, limitations, successful source snapshots and hashes, and failed fetch.

## Blinding and timing limits

The final and permitted maps expose method clues: treatment/research/critic-stage labels, S/C source IDs, and live-reverification claims. The maps also show stage timestamps and references to receipt filenames; the underlying receipts and campaign timing/cost records were not opened. No winner was guessed. The stop message additionally reveals that pair freeze has not occurred.

The first recorded reviewer clock was 2026-10-07 18:40:14 UTC; the safe-boundary stop clock was 18:43:30 UTC. Initial instruction/input setup began shortly before the first recorded clock, so the timing file does not invent an exact earlier start. Reviewer evaluation billing and candidate billing are unknown and remain separate.

No REVIEW.md or judgment.json existed at the boundary check, and no grade was issued. Existing source evidence is retained for the new task; no downloaded code or test was executed. Only PARTIAL.md, partial-status.json and timings.json are written during this save.
