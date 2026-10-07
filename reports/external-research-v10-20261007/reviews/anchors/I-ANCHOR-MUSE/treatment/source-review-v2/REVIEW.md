# Independent full declared source review — new attempt

**Outcome: NOT_FULL_POSITIVE. This full review completed the declared scope; it did not stop at a FAILED_SCREEN.** The frozen proposal contains useful, broadly relevant research, but a material BagIt causal/repair error prevents a source-correctness pass. Compatibility, backup-set recovery, durable ingest and SQLite release conditions remain incomplete. The supplied critique also contains a distinct VACUUM INTO tradeoff error.

**Source correctness:** not passed as submitted. **Completeness:** the candidate substantially covers the brief but does not satisfy every governing condition. **Planning usefulness:** useful, requiring corrections and conditions. **Breadth:** broad across complementary mechanism families, with limited competing-alternative and affordability depth. These axes are separate; broad coverage does not excuse a wrong source condition.

This assessment concerns the own-arm frozen final, supplied critique, source maps, and specifically authorized prior partial. It does not compare arms, infer a winner, grade costs/timings/native counters, or clear the pair comparative/provenance HOLD. Scored-counterpart provenance exposure remains UNKNOWN on that orchestration axis.

## Authority, input boundary and prior attempt

I read the actual workspace AGENTS.md, ~/.codex/AGENTS.md, the injected global/project rules, and checked explicit applicable ancestors. The task is an external experiment-source review, not a product-canon or ledger task. The user’s exact input boundary therefore governs; no additional Plans, repository work, accounts, provider changes or delegation were needed. All review writes are inside this new review directory.

INPUTS.md authorized the brief, frozen sandbox plan, final, critique, two public source maps, prior PARTIAL.md/partial-status.json, and their named source evidence directories. Those documents and supplied excerpts were read. Fresh primary public-source snapshots were independently obtained. No counterpart, other grader, campaign cost/protocol analysis, historical root reasoning, or underlying receipt/configuration contents were opened. The originals remain unchanged; exact input SHA-256 values are in judgment.json and sources/input-identities.json.

The prior attempt expressly issued no grade. Its source_correctness/completeness/planning_usefulness/breadth values remain null. This is a new attempt after the user declares both arms and native terminal receipts frozen. Every prior observation was rechecked against primary evidence; every prior remaining obligation received a new disposition. Prior exposure and knowledge of the premature review are disclosed, so this is not wholly fresh first-review independence. No best-of result or overwritten earlier failure is involved.

Only named ranges count as source inspection. [sources/SOURCES.md](sources/SOURCES.md), [checked-sources.json](sources/checked-sources.json), and [retrievals.json](sources/retrievals.json) give exact URL/version/range, retrieval timestamps, byte hashes and immutable commit identities. Dynamic API/doc pages are recorded as snapshots, not immutable upstream revisions. A source download, matching hash or citation count alone earned no pass.

## Material findings

### MD1 — Incorrect causal account and unsupported full-validation repair (high)

Candidate: `final.md` L108–109: “root cause identified — oxum check sits outside the `if fast` gate, so validation "always defaults to fast."”
Candidate: `final.md` L118–121: “on oxum failure, record the screening signal and still run completeness + per-file hashes (S05 semantics — dropping oxum from full mode entirely — are the acceptable alternative)”
Candidate: `critique.md` K2 L29–37: “The final therefore recommends "S05 semantics OR warn-and-continue wrapper" rather than naming the patch as the single fix.”

Primary counterevidence [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py): Full mode proceeds to completeness and file/tag hashes when oxum passes; oxum failure is an early rejection, not unconditional fast mode.
Primary counterevidence [R04](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py): test_validate_flipped_bit and test_validation_error_details define full-mode hash detection for a same-size change.
Primary counterevidence [R06](https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174): Maintainer explains both checks remain necessary; author closes #174 because removing full-mode oxum checking was the wrong repair.
Primary counterevidence [R01](https://www.rfc-editor.org/rfc/rfc8493.txt): If oxum is present, its counts must describe actual payload; completeness requires conforming elements, and validity additionally requires every recorded checksum.

Impact: The final promotes a reporter interpretation into root cause and accepts a rejected patch as full validation. A stale-but-tag-checksummed oxum with otherwise matching payload hashes can lose the required metadata rejection under that alternative. Continuing for diagnostics is useful but must preserve failure/invalid status; T2 does not test this otherwise-hash-valid negative case.
Scope/qualification: Not a claim that the unmodified v1.9.0 validator falsely accepts corrupt bytes. The default diagnostic limitation is real. A separately named payload-fixity-only diagnostic could deliberately omit oxum without claiming full BagIt validity; that separation is absent here.

### MD2 — Missing compatibility conditions for the declared format/component pair (high)

Candidate: `final.md` L246–247: “BagIt layout pinned (v1.0 per S01); algorithms explicit per manifest; `bag-info.txt` keys documented, no format extensions.”
Candidate: `final.md` L116–117: “pin bagit-python v1.9.0 WITH the known behavior documented; do not wait for upstream (two releases, no fix).”
Candidate: `final.md` L131–133: “P1. Per-batch BagIt ingest: every batch a bag (sha256+sha512 manifests, tagmanifest, bag-info with Payload-Oxum + contact/rights fields). Validate on ingest, on transfer, on schedule.”

Primary counterevidence [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py): make_bag has no format-version argument and writes BagIt-Version: 0.97 at L243; the reader accepts 1.x. Its completeness calculation uses merged manifest entries, and percent escaping only handles CR/LF.
Primary counterevidence [R01](https://www.rfc-editor.org/rfc/rfc8493.txt): BagIt 1.0 identifies its version as 1.0, requires every payload file in every payload manifest, and requires literal percent characters to be encoded.

Impact: No separate 1.0 writer or conversion/conformance path is declared. The selected library default does not satisfy the stated format pin; accepting 1.x is not evidence of complete 1.0 conformance. Pin applicability remains incomplete.
Scope/qualification: The final specifies a desired format, not a demonstrated generated bag. This is an unresolved component/format compatibility defect, not a claim that all 0.97 bags are invalid or that implementing a separate writer is impossible. Static code inspection is not an executed standards-conformance test.

### MD3 — Unspecified coherent database/payload recovery set (high)

Candidate: `final.md` L60–64: “M6 — Online DB snapshot + verified payload sync (S10). Nightly: Backup-API snapshot of the catalog DB (incremental, lock-only-while-reading — the preferred nightly path), `VACUUM INTO` reserved for periodic compacting snapshots; manifest-verified payload sync. Never raw `cp` of the live `.db`, never piecemeal `-wal`/`-shm` copies.”
Candidate: `final.md` L134–138: “deletion removes references, bytes last; periodic orphan/refcount-consistency sweep”
Candidate: `final.md` L233–234: “DB snapshot restores with clean `integrity_check`; payload replica re-verifies.”

Primary counterevidence [R08](https://www.sqlite.org/backup.html): Backup API gives a coherent SQLite snapshot, not a transaction spanning external files; it may restart after writers.
Primary counterevidence [R12](https://www.sqlite.org/pragma.html): integrity_check is a database structural check, excludes foreign-key checking, and does not verify external object references.
Primary counterevidence [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html): Retained snapshot generations and prune policy are distinct mechanisms; only data still referenced by retained snapshots is reclaimable.

Impact: A DB snapshot can retain a reference whose payload is deleted before payload copying. Hash verification of the files actually copied and an internally clean DB do not detect/avoid that missing backup object. No retention generation, deletion barrier, snapshot object-set receipt, or reference-to-byte restore invariant is specified. Failed-storage recovery is therefore incomplete.
Scope/qualification: The SQLite snapshot recommendation itself is correct. This is a logical interleaving permitted by the stated deletion and backup proposals, not an executed failure. No particular backup product is mandatory.

### MD4 — Durable ingest ordering and recovery state contract remain unspecified (medium)

Candidate: `final.md` L54–58: “M5 — Staged atomic ingest (S08/S09). Write to `incoming/<uuid>/`, hash as bytes land, build manifest, fsync, THEN transactionally register in SQLite and atomically rename into place. Boot recovery completes or discards staged units by journal state. DB atomicity covers rows; the staging protocol covers files+rows together.”
Candidate: `final.md` L139–141: “DB transaction + atomic rename → verify. Boot recovery replays/discards by journal state”

Primary counterevidence [R11](https://www.sqlite.org/atomiccommit.html): SQLite atomic commit covers its database transactions; super-journals concern attached databases, not arbitrary payload files.
Primary counterevidence [R13](https://man7.org/linux/man-pages/man2/rename.2.html): Rename is a namespace operation on the same filesystem; fsync of a file does not make its containing directory entry durable.
Primary counterevidence [R12](https://www.sqlite.org/pragma.html): WAL synchronous=NORMAL may lose committed transactions on power loss; durability depends on explicit settings.

Impact: The chosen strategy can work, but no durable journal states, DB commit/rename order, directory sync point, same-filesystem requirement, or idempotent replay/deletion rule is supplied. Process-kill V1 and the DB-focused V4 do not establish the stronger file/row power-loss invariant.
Scope/qualification: All candidate checks are proposed. This finding does not demand executed product code, and does not treat the V1 desired outcome as a claimed successful run. It identifies the source conditions needed to make the proposed contract assessable.

### MD5 — Omitted pertinent WAL release condition (medium)

Candidate: `final.md` L151–155: “WAL on local disks with periodic checkpoint, rollback-journal on shares only where locking is verified; nightly Backup-API snapshot (VACUUM INTO for periodic compaction); sidecars excluded from cleanup; `integrity_check` in the scheduled job.”
Candidate: `final.md` L251–252: “SQLite mode chosen per storage location and documented; Backup API / VACUUM INTO mandatory for DB replicas; sidecars protected.”

Primary counterevidence [R09](https://www.sqlite.org/wal.html): Official WAL page §11 names corruption race through 3.51.2, fixed in 3.51.3 and later, with 3.44.6/3.50.7 backports. It requires multiple connections and coincident checkpoint/write activity.
Primary counterevidence [R26](https://www.sqlite.org/releaselog/3_51_3.html): Official 3.51.3 release log explicitly includes the WAL-reset corruption fix.

Impact: The plan adopts WAL/checkpointing without a SQLite runtime version/fix requirement or a documented exclusion of the triggering topology. This is directly pertinent to silent corruption and is not resolved by scheduled integrity checks.
Scope/qualification: Conditional and rare; not proof the archive uses an affected binary or will corrupt data. This is a missing release-applicability condition, not a blanket rejection of SQLite/WAL.

### MD6 — VACUUM INTO tradeoff rationale conflates distinct operations (medium)

Candidate: `critique.md` K4 R-a L71–75: “reserve `VACUUM INTO` for periodic compacting snapshots — VACUUM takes a write lock and is the heavier nightly choice on a busy catalog.”

Primary counterevidence [R10](https://www.sqlite.org/lang_vacuum.html): Official documentation excludes VACUUM INTO from its ordinary VACUUM write-operation statement; INTO leaves the original unchanged. The documented advantage of Backup API is fewer CPU cycles and incremental operation.

Impact: The required criticism gives an incorrect blanket locking rationale for ranking the two backup methods. This weakens the source tradeoff audit even though the final Backup-API preference has other support.
Scope/qualification: The final L60–64 keeps the preference but does not repeat the false write-lock sentence. Do not attribute that sentence to the final or claim the preference itself is wrong.

## Original integrated obligations and domain requirements

The eight integrated obligations and eleven domain requirements below were each assessed. “Assessed” does not mean “passed.” The JSON keeps coverage and candidate satisfaction separate.

- **OB01 — Genuine primary public-source selection from the domain brief**: satisfied_with_limits. RFC/LOC component and format sources, NDSA, official SQLite docs, and system-authored Archivematica/Omeka material directly fit preservation, integrity, metadata and access. Selection is substantively primary; original search chronology and historical reads cannot be authenticated from frozen prose alone. No pass is inferred from citation count. Evidence: [R01](https://www.rfc-editor.org/rfc/rfc8493.txt), [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R08](https://www.sqlite.org/backup.html), [R14](https://omeka.org/s/modules/Access/), [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html).

- **OB02 — Materially different mechanisms and useful alternatives**: substantive_but_limited. Eight materially different complementary mechanisms, plus hash/mode/snapshot/offsite choices, create meaningful breadth. Alternatives are lightly compared; no quantitative station/storage/operational budget or complete substitute-stack comparison is supplied. Bounded reviewer checks show available versioned storage/backup options, without requiring those specific products. Evidence: [R08](https://www.sqlite.org/backup.html), [R10](https://www.sqlite.org/lang_vacuum.html), [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/), [R22](https://ocfl.io/1.1/spec/), [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [R24](https://www.sqlite.org/rsync.html).

- **OB03 — Actual component/code behavior at a pinned version**: satisfied_core_incomplete_conditions. Real pinned v1.8.1/v1.9.0 behavior is supplied and verified. Generator format and full-validation success conditions are consequential omissions; accepting 1.x is not enough for the stated format pin. Evidence: [R01](https://www.rfc-editor.org/rfc/rfc8493.txt), [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R03](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/22675e58c893a32107f62549974fdf6844591747/bagit.py), [R04](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py).

- **OB04 — Pertinent issue/fix/regression test and release applicability or justified equivalent history**: partially_satisfied. Reported issue, rejected patch state and actual release behavior are traced accurately in part. Rejection reason is omitted, the causal account is inaccurate, and candidate tests are proposed rather than inspected upstream tests. No equivalent-history justification bridges that gap. Reviewer inspection does not add test research to scored candidate yield. Evidence: [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R04](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/test.py), [R05](https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/137), [R06](https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174), [R07](https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0).

- **OB05 — Every relevant declared discovery compared with frozen-plan choices**: substantive_but_incomplete_conditions. Every F/M/P/R/O/U/T/V item, analogies and source conditions has an independent disposition here. F1–F10 track each thin-plan clause and uncertainty. Several cited governing conditions are missing or insufficiently compared; source/plan mapping is not proof of safety. Evidence: [R01](https://www.rfc-editor.org/rfc/rfc8493.txt), [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R08](https://www.sqlite.org/backup.html), [R09](https://www.sqlite.org/wal.html), [R11](https://www.sqlite.org/atomiccommit.html), [R14](https://omeka.org/s/modules/Access/), [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R21](https://www.loc.gov/preservation/resources/rfs/faq.html).

- **OB06 — Supported corrections, product choices, covered dispositions, optionals, uncertainties and useful validation proposals**: substantive_requires_correction. Corrections, keep-SQLite/keep-catalog dispositions and all optional/uncertainty/validation groups survive. Main choices are useful, but validity semantics, backup generations, durable state ordering and normalization/resource policy need conditions. T/V goals are valuable proposals, not proof. Evidence: [R01](https://www.rfc-editor.org/rfc/rfc8493.txt), [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R08](https://www.sqlite.org/backup.html), [R09](https://www.sqlite.org/wal.html), [R12](https://www.sqlite.org/pragma.html), [R13](https://man7.org/linux/man-pages/man2/rename.2.html), [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html).

- **OB07 — Required criticism and final proposal, including critique preservation**: artifact_present_preservation_assessed_quality_partial. Full supplied critique read; K1–K13 mapped to final, not accepted on presence. Most deltas are faithfully carried. MD1 persists through the critic and MD6 affects its tradeoff explanation. Same-family/freshness execution cannot be corroborated without excluded receipts. Evidence: [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R06](https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174), [R10](https://www.sqlite.org/lang_vacuum.html).

- **OB08 — Distinguish executed checks from proposals**: satisfied_as_claimed_artifact_status. Final consistently labels P/O/T/V as proposed and source reads as observed; no runtime pass is claimed. This review also performs source/static inspection only. Historical complete command execution/provider receipts are outside authorized scope, not inferred from snippets.

- **D01 — Affordable small digitization stations and volunteer operation**: partially_satisfied. Local storage/library/SQLite architecture and one-button reports fit a small shop. No measured volume, labor, support, storage expansion or converter cost analysis substantiates minimal-affordable. Evidence: [R08](https://www.sqlite.org/backup.html), [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R21](https://www.loc.gov/preservation/resources/rfs/faq.html), [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html).

- **D02 — Photograph handling**: supported_policy_conditions_open. Originals, TIFF/access candidates and provenance supported; native format, color/bit-depth/resolution and no-op branches need policy. Evidence: [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R21](https://www.loc.gov/preservation/resources/rfs/faq.html).

- **D03 — Oral-history audio handling**: supported_policy_conditions_open. BWF/native PCM preferences and service derivatives appropriate. Universal conversion does not improve an already-lossy source; bandwidth/storage/fidelity and converter selection remain open. Evidence: [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R21](https://www.loc.gov/preservation/resources/rfs/faq.html).

- **D04 — Scanned-document handling**: supported_policy_conditions_open. TIFF/PDF-A directions and original retention plausible. Page-image/text/accessibility/significant-property policy and chosen validator/converter are deferred. S14 PDF-A context is narrower than general textual works. Evidence: [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R21](https://www.loc.gov/preservation/resources/rfs/faq.html).

- **D05 — Original bytes and derivative provenance**: substantively_satisfied. Immutable originals, separate derivatives and source/tool/settings/output records address the brief. Metadata/package recovery and preservation of original capture properties still need validation. Evidence: [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R18](https://www.archivematica.org/en/docs/archivematica-1.13/user-manual/metadata/METS/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html).

- **D06 — Safe dedup**: supported_direction_conditions_open. Hash identity fixes the actual filename/size defect. Reference deletion, BagIt physical payload representation, logical accession rights and retained-backup ownership must be integrated. Evidence: [R01](https://www.rfc-editor.org/rfc/rfc8493.txt), [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R22](https://ocfl.io/1.1/spec/), [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html).

- **D07 — Rights and restricted access**: substantively_satisfied_as_proposal. Independent notice/file/embargo model and all-surface probes are appropriate. Actual serving routes/defaults/cascade and role policy are conditional; no deployment security pass issued. Evidence: [R14](https://omeka.org/s/modules/Access/), [R15](https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/src/Mvc/Controller/Plugin/IsAllowedMediaContent.php), [R16](https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/tests/AccessTest/Service/AccessMatrixTest.php).

- **D08 — Silent-corruption detection and repair**: partially_satisfied. Manifests/full audits/trusted replicas are useful. Full validation semantics, all-replica audit coverage, repair authority/no-good-copy path and WAL version risk remain material conditions. Evidence: [R01](https://www.rfc-editor.org/rfc/rfc8493.txt), [R02](https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/861ddacb339d5b92659f0187a402f501d841abbe/bagit.py), [R09](https://www.sqlite.org/wal.html), [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/), [R26](https://www.sqlite.org/releaselog/3_51_3.html).

- **D09 — Interrupted-ingest recovery**: partially_satisfied. Staging/replay and crash drills address the requirement, but durable file/row state ordering is underspecified. Evidence: [R11](https://www.sqlite.org/atomiccommit.html), [R12](https://www.sqlite.org/pragma.html), [R13](https://man7.org/linux/man-pages/man2/rename.2.html).

- **D10 — Failed-storage recovery**: partially_satisfied. Three/offsite copies and restore drills are relevant. Consistent backup generations, deletion retention, metadata/object-set linkage and encryption-key/config recovery are unestablished. Evidence: [R08](https://www.sqlite.org/backup.html), [R12](https://www.sqlite.org/pragma.html), [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/), [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html).

- **D11 — Internal preservation versus public browse separation**: substantively_satisfied_as_proposal. Master/access roles, private original locations and metadata/file visibility split explicitly handle the sensitive-original/public-catalog distinction. Public notice policy is separate from content rights. Evidence: [R14](https://omeka.org/s/modules/Access/), [R15](https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/src/Mvc/Controller/Plugin/IsAllowedMediaContent.php), [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R18](https://www.archivematica.org/en/docs/archivematica-1.13/user-manual/metadata/METS/).

## Bounded discovery yield, alternatives and affordability

The proposal’s useful yield is substantive: it finds self-verifying packaging; digest identity instead of filename identity; recurring audits instead of mere copying; role/provenance separation; real database snapshots; local database/network-locking and sidecar conditions; notice/file/embargo rights; and geography/restore/native-fidelity concerns. These materially differ in mechanism and address real frozen-plan gaps. F9 and F10 explicitly keep already-present SQLite and catalog choices under conditions. This is credit for supported discoveries, not for fourteen source labels or eight M labels.

The M choices are mostly complementary parts of one design. Internal alternatives are real—single versus dual digest use, WAL versus rollback locations, Backup API versus VACUUM INTO, and rotating offsite drives versus object storage—but tradeoffs remain lightly analyzed. The declared small-library/local-DB approach is plausibly affordable; “minimal-affordable,” “small bill,” the ~1k multiprocessing crossover and ~1 TB sampling threshold are not measured budget/capacity results. No hardware quote, provider account, purchase, converter install or candidate allowance/cost data was used.

Bounded independent comparison checked OCFL 1.1 object-at-rest version/digest inventories against per-batch BagIt packaging. OCFL provides within-object version identity and dedup with more inventory/version rules; it is not a global cross-accession dedup service or a replacement dictated by this brief. The comparison exposes the candidate’s unresolved physical payload/reference arrangement while confirming that digest identity is a real mechanism. [R22](https://ocfl.io/1.1/spec/).

Restic documentation offers retained backup snapshots and explicit restore/check paths, with retention/pruning complexity. Its default structural checks do not read all backed-up data; random subsets do not guarantee complete eventual coverage. That is a useful counterpoint to current-tree copying and unexplained sampling, not a reason to require restic. SQLite’s own sqlite3_rsync is a remote DB-snapshot alternative; pre-3.50 restrictions and mixed-version negotiation conditions matter. It still does not capture external preservation payloads. Reviewer-only alternatives are not credited to the frozen candidate or added to its final. [R23](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [R24](https://www.sqlite.org/rsync.html).

## Formats, rights and NDSA conditions

Original retention, separate service derivatives and derivation records are supported. Named TIFF/BWF/PDF-A directions are reasonable format candidates. The RFS prefers native fidelity and multiple formats, and its FAQ frames it around published-content selection and institutional capabilities. Archivematica’s own example skips conversion for an already-preservation-format source. Thus a universal normalization rule is an archive policy needing a no-op/fidelity/resource branch, not a conclusion compelled by the cited sources. The preserved U3 and proposed V6 are useful but do not select or verify the conversion path. [R17](https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/), [R20](https://www.loc.gov/preservation/resources/rfs/audio.html), [R21](https://www.loc.gov/preservation/resources/rfs/faq.html).

The prior partial’s PDF-A question was specifically rechecked: S14 does contain PDF/A in an acceptable vector/page-layout context; the independently read textual-work page supplies clearer text-specific support. I do not invent a categorical absent-PDF-A-citation defect. Images still need native color/bit-depth/resolution fidelity and scans/audio need significant-property policy; changing container format alone is not demonstrated preservation benefit.

The rights analogy is well selected. P7/V5 retain separate notice visibility, file access and embargo, and explicitly cover thumbnails/search/API/direct routes. The pinned Omeka code makes the visibility check and content gate separate; documented static routing, default/privileged exceptions and configurable embargo cascade are consequential. Those conditions prevent treating the module name or a matrix test as an all-serving-surface security proof. Since the candidate adopts the pattern rather than deploys Omeka, missing Omeka server commands are not themselves an implementation defect. [R14](https://omeka.org/s/modules/Access/), [R15](https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/src/Mvc/Controller/Plugin/IsAllowedMediaContent.php), [R16](https://raw.githubusercontent.com/Daniel-KM/Omeka-S-module-Access/96810900986ce5278cef79c2b9bfcda31d4e59ed/tests/AccessTest/Service/AccessMatrixTest.php).

The entire NDSA v2.1 matrix was viewed and mapped. P9 targets the three-copy/geography storage cell and part of threat diversity; a different storage type and obsolescence tracking are not assured. P4 targets recurring integrity checks/logged repair, but virus checking and separately protected integrity information are absent. P7/logs contribute to Control without a complete internal actor/action policy. Metadata and Content have provenance/format candidates, but inventory recovery and ongoing property/dependency monitoring are incomplete. This supports selected higher-level targets, not a complete Level 2–3 program. U2 is honestly preserved, yet the cited page already supplies the authoritative matrix image; a PDF is not necessary to inspect those cells. [R19](https://www.ndsa.org/publications/levels-of-digital-preservation/).

## Every declared candidate group

The following dispositions cover every F1–F10, M1–M8, P1–P10, R1–R8, O1–O4, U1–U4, T1–T4, V1–V7, the pinned/history accounts, analogies, source conditions and status ledger. Detailed defect/source keys are preserved in judgment.json.

- **F1** (final §1; supported): Name and size cannot safely identify bytes; hash identity is a defensible product choice. BagIt itself is not a cross-accession dedup system. Sources: R01, R02, R22.

- **F2** (final §1; supported_with_conditions; MD1): Ingest manifests and recurring audits address unspecified fixity. Repair requires trusted expected hashes and a verified good replica. Sources: R01, R02, R19.

- **F3** (final §1; supported_with_conditions; MD3): Live-copy risk and DB snapshot remedy are sound. The thin plan does not explicitly say its SQLite file is inside the copied tree; that part is a risk inference. Coupled backup remains open. Sources: R08, R09.

- **F4** (final §1; supported): A preservation/access split and derivation records address unspecified provenance. Co-location alone is not inherently invalid. Sources: R17, R18.

- **F5** (final §1; incomplete_conditions; MD4): Staging and replay are useful; SQLite does not supply file-plus-row atomicity. Sources: R11, R12, R13.

- **F6** (final §1; supported): Notice visibility, file rights and embargo address an actual missing rights model. Sources: R14, R15.

- **F7** (final §1; underjustified_product_choice): Keeping originals and named master formats is sensible; universally normalizing every input is not prescribed by the cited preferences. Sources: R17, R20, R21.

- **F8** (final §1; supported_with_conditions): Geographic/threat diversity and restores improve a second-disk plan. Same site is correctly labeled implied, not observed. F8 alone has two copies; P9 supplies three. Sources: R19.

- **F9** (final §1; supported_with_conditions; MD3, MD4, MD5): Keep SQLite with local topology and real DB snapshots; additional durability/release and backup-set conditions are needed. Sources: R08, R09, R11, R12.

- **F10** (final §1; supported): Retaining the catalog is an explicit already-covered disposition; rights-aware metadata/derivative serving is a useful constraint. Sources: R14, R15, R17.

- **M1** (final §2; supported_with_conditions; MD1, MD2): Self-verifying transfer/ingest units materially differ from a plain tree; contact/rights tag metadata is allowed. Mandatory tagmanifest/oxum is archive policy, not universal BagIt requirement. Sources: R01, R02.

- **M2** (final §2; supported_with_conditions): Digest identity materially differs from filename identity; linking/refcounts is additional design, not supplied by BagIt. Exact doubling of CPU is unmeasured; one byte stream updates both hashers. Physical dedup must still yield complete bags. Sources: R02, R22.

- **M3** (final §2; supported_with_conditions; MD1): Audit detects failures copying alone cannot reveal. Weekly/full plus random/daily is a proposed workload policy; no sampling guarantee or capacity measurement exists. Sources: R02, R19, R23.

- **M4** (final §2; supported): Original/master/access roles and derivation records are supported by the analogy. Never serving masters is a stricter product policy. Sources: R17, R18.

- **M5** (final §2; incomplete_conditions; MD4): A filesystem/DB recovery protocol is necessary; atomic rename plus an unspecified journal is not yet a durable state contract. Sources: R11, R12, R13.

- **M6** (final §2; supported_with_conditions; MD3, MD6): Online snapshots are materially different from raw copying. Backup API preference is supported by incremental/CPU tradeoffs, not the critique write-lock claim. External payload matching remains open. Sources: R08, R10.

- **M7** (final §2; supported_with_conditions): File/notice/embargo independence is accurately analogous. Module enforcement depends on configured routes and visibility checks; this is not proof of a deployed rights system. Sources: R14, R15, R16.

- **M8** (final §2; underjustified_product_choice): Original retention and recorded conversion are useful. TIFF/BWF/PDF-A candidates have primary support, but same-format/native-fidelity and no-op branches plus a resource/fidelity policy are omitted. Sources: R17, R18, R20, R21.

- **P1** (final §5; incomplete_conditions; MD1, MD2): Manifest/tag/metadata packaging is concrete at the format-policy level. The chosen generator/format pair and validator success semantics are unresolved. Sources: R01, R02.

- **P2** (final §5; supported_with_conditions; MD3): Reference-first deletion and orphan checks are useful. Storage linking must reconcile cross-batch BagIt completeness, logical accession identity/rights, and backup retention before byte reclamation. Sources: R01, R22, R23.

- **P3** (final §5; incomplete_conditions; MD4): Stages and commit/abort log are named, but durable states and replay ordering are absent. Sources: R11, R12, R13.

- **P4** (final §5; supported_with_conditions; MD1): Honest mode labeling and quarantine/replica verification are useful. Continuing diagnostics must not clear an oxum validity failure; trusted manifests and all-replica checks remain necessary. Sources: R01, R02, R19.

- **P5** (final §5; supported): Role separation plus derivative provenance is useful; METS-lite is a local proposal, not a verified interoperability profile. Sources: R17, R18.

- **P6** (final §5; incomplete_conditions; MD3, MD4, MD5): Local DB/push, sidecar protection, snapshots and known-good locking are sound. Runtime fixes, synchronous policy, combined restore set and station conflict/central aggregation details remain open. Sources: R08, R09, R10, R11, R12.

- **P7** (final §5; supported_with_conditions): Notice/file/embargo and derivative inheritance are meaningful. Anonymous direct routes, search/snippets/thumbnails/API must enforce the proposed policy; Omeka analogy does not prove all surfaces. Sources: R14, R15, R16.

- **P8** (final §5; underjustified_product_choice): Originals are retained, reducing irreversible loss. Converter/version selection is openly unresolved, but blanket reformatting still needs a fidelity/no-op/capacity decision. Sources: R17, R20, R21.

- **P9** (final §5; supported_with_conditions; MD3): Three copies, local/offsite, inventory and restore rehearsal are useful. Current-copy replication lacks declared retained generations, deletion barriers and encryption-key recovery. Sources: R19, R23.

- **P10** (final §5; useful_proposal): Plain reports and confirmation/logged destruction are sensible volunteer goals, not implemented usability evidence or a measured affordability result. Sources: R19.

- **R1** (final §7; supported_with_conditions; MD1): Fast/API confusion is a real presentation risk; CLI help explicitly warns. Full mode is not always hash-free. Sources: R02, R04.

- **R2** (final §7; supported_with_conditions; MD3): Live DB copying is a real conditional risk; snapshotting is a supported correction. Sources: R08, R24.

- **R3** (final §7; supported_with_conditions): Network locking and WAL shared-host constraints are relevant; local-first is conservative and supported. Sources: R09, R11.

- **R4** (final §7; supported_with_conditions): Hot-journal/sidecar deletion can defeat recovery; protection is accurate. A leftover journal is a recovery signal, not conclusive corruption. Sources: R09, R11.

- **R5** (final §7; supported_with_conditions): Derivative overwrite risk is reduced by immutable master paths; this is a product protection choice. Sources: R17, R18.

- **R6** (final §7; supported_with_conditions): Rights drift through alternate serving surfaces is real; P7/V5 directly address it. Sources: R14, R15.

- **R7** (final §7; supported_with_conditions): A second disk does not establish another disaster envelope; P9/V7 address that. Sources: R19.

- **R8** (final §7; supported_with_conditions): Obsolescence is pertinent, but normalization alone is not content/format dependency monitoring and does not establish lower lifetime cost. Sources: R19, R20, R21.

- **O1** (final §8; incomplete_optional_lead): fetch.txt is a transfer/pending-ingest mechanism, not completed preservation with absent payload. validate_fetch checks URL form and does not fetch bytes; availability, retrieval limits and complete-before-accept state must be explicit. Sources: R01, R02.

- **O2** (final §8; useful_optional_lead): Multiprocessing exists; the ~1k threshold is a measure-first hypothesis, not a tested crossover. Sources: R02, R03.

- **O3** (final §8; useful_optional_lead): Rotation versus object storage is an actual offsite alternative. Native checksums, cost, credentials, encryption/key recovery and provider semantics are unselected/unmeasured. Sources: R19, R23.

- **O4** (final §8; useful_optional_lead): Preservation events have primary precedent. A stable vocabulary helps, but objects/agents/rights/relationships are needed for PREMIS-style expansion; no-rework is an aspiration, not a guarantee. Sources: R18, R25.

- **U1** (final §9; resolved_with_correction): The v1.9.0 oxum gate is directly verified; the original uncertainty is legitimately resolved. The chosen repair still has MD1. Sources: R02, R07.

- **U2** (final §9; preserved_but_readily_resolvable): Honest noninspection disclosure, but a primary v2.1 matrix image is available on the cited page. Selected target cells do not prove whole-program Level 2–3. Sources: R19.

- **U3** (final §9; justified_uncertainty): Converters/licenses/versions and fidelity need selection; this is not fabricated execution. Current format recommendations alone do not supply the toolchain. Sources: R20, R21.

- **U4** (final §9; underjustified_uncertainty): Workload/sample math is rightly open; ~1 TB does not itself determine a schedule or detection probability. Need byte volume, file mix, replica bandwidth and coverage/latency targets. Sources: R19, R23.

- **T1** (final §4; useful_proposed_not_executed): Useful same-size mutation case; stock upstream definitions already show full-mode hashing works when oxum agrees. Per-algorithm details may name the same file more than once. Sources: R02, R04.

- **T2** (final §4; useful_proposed_not_executed; MD1): Useful wrapper diagnostic gate, not a stock-v1.9.0 passing test. Missing case: otherwise-valid payload/manifests with inaccurate present oxum must not report full bag validity. Tagmanifest fixture consistency matters. Sources: R01, R02, R04, R06.

- **T3** (final §4; useful_proposed_not_executed): Appropriate proposed no-hash assertion for fast mode; reflects CLI help and code. Sources: R02, R04.

- **T4** (final §4; useful_proposed_not_executed): Appropriate missing/extra-file diagnostics; oxum and completeness exceptions need separate diagnostic handling. Existing upstream definitions cover related cases. Sources: R02, R04.

- **V1** (final §10; useful_proposed_not_executed; MD4): Useful process-crash convergence goal; random kill -9 does not simulate filesystem power-loss/reordering. Durable boundaries and idempotent replay remain unspecified. Sources: R11, R12, R13.

- **V2** (final §10; useful_proposed_not_executed): Good separate bit-flip/add/delete drills and verified repair goal. Missing/extra diagnostics may use missing/not-applicable hash values; trusted baseline and no-good-replica branch matter. Sources: R01, R02, R19.

- **V3** (final §10; useful_proposed_not_executed): Meaningful dedup traps; multiple accessions/rights, last reference, interruption and physical bag-completeness cases are additional necessary boundaries. Sources: R01, R22.

- **V4** (final §10; useful_proposed_not_executed; MD3, MD4): Meaningful backup interruption proposal, but integrity_check plus independent payload fixity does not validate the DB-referenced object set, foreign keys or whole archive recovery. Sources: R08, R10, R12.

- **V5** (final §10; useful_proposed_not_executed): Strong cross-surface restricted-access proposal; covers direct URLs and public notices. Real static routing/defaults and rights-revocation/cache behavior need application-specific verification. Sources: R14, R15, R16.

- **V6** (final §10; useful_proposed_not_executed): Independent decoding/significant-property comparison is useful; decoding alone is not evidence that normalization improves preservation or preserves all content properties. Sources: R17, R20, R21.

- **V7** (final §10; useful_proposed_not_executed; MD3): Budget-conscious partial restore rehearsal is useful. A random 5% cannot prove all masters restore; coverage rotation, DB/object consistency and key/config recovery remain open. Sources: R19, R23.

- **PINNED-ACCOUNT** (final §3; largely_supported): Gate ordering, absent-oxum behavior, defaults, CLI guards, file-URL syntax and 512 KiB value verified. Core _validate_contents/_validate_oxum match v1.8.1; whole implementations differ. Core diagnosis correctly identifies oxum-failing cases, not all full-mode validation. Sources: R02, R03, R04.

- **HISTORY-ACCOUNT** (final §4; partially_correct_material_defect; MD1): States, patch, release date and shipped gate supported. Rejected-patch rationale and upstream regression definitions are not preserved; reporter root-cause wording is overpromoted. Proposed tests are not an observed upstream regression chain. Sources: R02, R04, R05, R06, R07.

- **ANALOGIES** (final §6; supported_with_conditions): Archivematica role separation and Omeka rights pattern are appropriate analogies; no deployment recommendation is inferred. NDSA selected targets cross levels but do not substantiate an overall Level 2–3 program. Sources: R14, R15, R17, R18, R19.

- **SOURCE-CONDITIONS** (final §11; incomplete; MD1, MD2, MD3, MD4, MD5): Manifest algorithms/custom metadata, explicit modes, snapshots, sidecars, roles and all-surface rights conditions are carried. Component/format conformance, failure status, durable ordering, coherent backup generations and SQLite fix applicability are missing. Sources: R01, R02, R08, R09, R11, R12, R13, R14, R17.

- **STATUS-LEDGER** (final L6–7 and §12; supported_as_artifact_status): Reads/observations versus T/V/P/O proposals are clearly distinguished. No runtime test success is asserted. S01–S14 historical reads, critic freshness/provider identity and native receipt execution are not independently established from the allowed documents.

## Required critique preservation

The original supplied critique remains frozen. I mapped its complete K1–K13 scope to the final and checked the source claims independently. Presence and agreeable wording do not prove criticism quality.

- **K1** → final §3/§4/U1/T2; preservation: yes. Pin upgrade and U1 resolution carried; direct source confirms the narrow gate structure, not whole-file identity.

- **K2** → final §4/P4; preservation: yes_with_source_error. Warn-and-continue preference and S05 alternative carried, including the unsupported repair. Rejected-PR rationale absent; MD1.

- **K3** → final §3 L93–96/§11; preservation: yes. Absent-oxum nuance and reporting rule carried and correct; non-fast without oxum still hashes.

- **K4** → F1–F10/M2/M6/P2/P6; preservation: mostly. Backup preference, local-first topology, orphan sweep and hashing-choice note carried. False VACUUM locking rationale not repeated in final; unmeasured CPU-doubling claim carried. MD6 distinguishes the source error from the preference.

- **K5** → M1–M8; preservation: yes. Eight complementary mechanisms carried; multiple kinds are real. This does not establish comprehensive substitute alternatives or affordability.

- **K6** → final §6; preservation: yes. Roles/pattern/yardstick carried. Claim no cheaper analogy missed is not an independently substantiated exhaustive search result.

- **K7** → R1–R8; preservation: yes. Risk list and CLI-help nuance carried; known risks useful, additional cited conditions omitted.

- **K8** → P1–P10; preservation: yes. All ten proposals retained; no supplied proposal silently dropped. Traceability does not establish their complete safety contracts.

- **K9** → O1–O4; preservation: yes. All optionals retained, with file-URL syntax observation; pending-ingest versus preserved bytes condition still missing.

- **K10** → U1–U4; preservation: yes. One resolution and three uncertainty labels preserved. U2 is readily addressable; U3 legitimate; U4 threshold lacks a workload basis.

- **K11** → T1–T4/V1–V7; preservation: yes. All proposed validations preserved as proposals. Neither critic nor final supplies executed or inspected upstream regression-test evidence.

- **K12** → final §3/§6/§12; preservation: selective_explicit_disposition. 512 KiB non-reverification disclosure and level hedge carried; artifact-timestamp issue explicitly not propagated. No histories or receipt files opened. The no-material-unsupported-assertion conclusion is contradicted by MD1 and MD6.

- **K13** → final complete proposal; preservation: yes_as_claim_not_verified_conclusion. Completeness assertion carried in substance; new full review finds conditional incompleteness. Same-family/freshness labels are supplied claims, not receipt-verified facts.

## Prior observations and remaining scope

All eleven prior observation groups were independently verified and completed to an assessment boundary. Core BagIt gate/state/release observations held. The rejection rationale, upstream test definitions, generator/format issue, SQLite conditions, rights analogy, AIP/provenance attribution, full matrix mapping and bounded alternatives received explicit final dispositions above. The LOC citation question was refined rather than inherited as a defect. The twelve exact prior remaining items are retained in sources/prior-boundary.json and individually marked assessed in judgment.json. No original partial, source capture, grade or failure was overwritten.

**Unassessed remainder within the declared review: none.** No full implementation/security/conformance test suite was run; none was required or authorized. Those are scope exclusions, not invented successful checks. Historical full command execution, provider identity/tier, native receipt status, forbidden counterpart/protocol information and exhaustive worldwide source discovery were not assessed or inferred.

## Executed versus proposed and blinding limits

The final’s P/O/T/V labels are consistently proposed; its “observed” code/page reads are not runtime test results. This reviewer performed authorized input/instruction reads, independent public-source retrieval/static inspection, local HTML text/table parsing and hashing/static comparison, matrix viewing, and review/evidence writes. No downloaded code, upstream/candidate test, installer, product implementation or hidden extra candidate critic was executed. A public LICENSE fetch returned 404 and supplies no finding. Three unused captures were removed from this review directory; useful evidence and all original frozen artifacts were preserved.

- This is a new post-freeze review attempt after a protocol-timing stop. Required prior PARTIAL.md and partial-status.json were read as disclosed observations. It is not wholly fresh independent first review; their exposure and the premature review existence limit blinding.

- User declares both arms/final artifacts/native terminal receipts frozen before dispatch. No receipts were opened to authenticate that declaration. No scored candidate work, messages or edits were performed.

- Treatment/stage/S-C source labels and stage timestamp/receipt-filename clues are visible in authorized final/critique/maps/partial. Those cannot be unobserved. No underlying candidate costs/timings/native counters or provider/dispatch receipt contents were read.

- No counterpart answer, expected winner, other graders, root/parent/historical analyses or protocol-cost files were read. No nested delegation, best-of selection or scientific rescue.

- Prior scored-counterpart provenance exposure is UNKNOWN as stated in dispatch. Pair comparative/provenance HOLD remains an orchestration axis. It neither grants nor determines this source-quality judgment.

- Runtime injection identifies gpt-6.1-sol with xhigh effort. Requested codex_gmail/priority service settings are recorded as requested, not independently verified through prohibited provider receipts; no settings/provider/account/global changes were made.

Requested target: codex_gmail / gpt-6.1-sol / xhigh / priority. Injected runtime confirms model/effort only; prohibited provider receipts were not used to verify provider/tier. Evaluation allowance is up to 1800 seconds, independent of the candidate allowance. Billing is unknown. Timings in timings.json concern only this reviewer attempt.

Outputs: REVIEW.md, judgment.json, timings.json and sources/ identities/evidence. This judgment grades source quality and declared planning coverage only; it neither resolves the independent comparative/provenance HOLD nor produces a comparative scientific result.
