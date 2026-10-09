# ER11 S12 archive-transfer — final (reviser, treatment, M12 v1)

Case S12 archive-transfer. Block A-M12-A, treatment/reviser, method M12 v1 adaptive-evidence-state-branching.
Brief: digital handoff service for a regional historical archive receiving files from small donors; package validation, malware/quarantine separation, understandable rejection reports, metadata repair, repeatable transfer history without assuming a checksum proves provenance; interoperable tools, competing workflows, implementation/version conditions, low-cost deployment.
Predecessors read COMPLETE: treatment/research/draft.md, discovery.md, revealed-plan.md, source-map.json (S01–S16) plus all 11 retained research evidence files; treatment/critic/critique.md and source-map.json (C01–C07) plus all 6 retained critic evidence files. No other campaign/history/evaluator/counterpart read.
Written: 2026-10-09T19:16:00Z. Deadline 2026-10-09T19:30:15Z (arm 19:53:15Z). This final is the ONE coherent self-contained deliverable for the scope; predecessor IDs are cited for lineage only and never replace material text.
Evidence kind: full-discovery. Executed at runtime in any stage: none; all V-checks remain PROPOSED with executable oracles.

## 0. Exact thin plan under comparison (verbatim)

P1: Accept ZIP uploads. P2: Verify SHA-256 checksums. P3: Extract to the archive folder and update a database. P4: Let staff edit metadata after import. P5: Keep original filenames. P6: Test with three good packages.

Disposition vocabulary (O4): CORRECTION (plan clause wrong/incomplete, must change), ALREADY-COVERED (discovery satisfies it), OPTIONAL ENHANCEMENT (useful, not required), USER DECISION (archive/staff choice; both options retained), REJECTED (investigated, set aside with reason), UNCERTAIN (evidence insufficient).

Criticism-disposition vocabulary (this stage): ACCEPT (criticism correct as stated; applied), AMEND (correct in direction; applied with stated modification), REJECT (incorrect; reason given), UNCERTAIN retained (held open; owner/next step named).

## 1. M12 reviser branch ledger (parent–child search states)

Propositions tied to product recommendation, applicability, plan correction, or useful alternative. Transitions recorded after each retrieval. Attention weights: +4 consequential proposition transition, +2 new applicability condition, +2 viable alternative, −2 duplicate. One unresolved countercase branch plus obligation/alternative coverage floor preserved; zero-change branches pause only after all mandatory coverage is met.

| Branch | Proposition (initial) | Retrieval → transition | End state |
|---|---|---|---|
| R-B1 SNSD durability (M1) | MinIO SNSD can carry the replication/versioning story | R01 official docs: Standalone evaluation-only, no production recommendation, data-loss on node/drive loss; versioning/object-lock/replication require distributed erasure coding → proposition transition + new condition | REFUTED-as-worded; restated: SNSD = S3-API shim, durability = FS OCFL + independent second copy + re-verify |
| R-B2 bagit pin (M2) | `>=1.9,<2` range pin suffices; PyPI lags GitHub | R02 PyPI 1.9.0 page referenced live (secure-record-transfer #812) + libraries.io 1.9.0 → PyPI-lag part refuted (lag resolved); fetch.txt/expandvars conditions from C03 stand unchallenged | AMENDED: pin verified PyPI artifact `bagit==1.9.0` + hash; range kept as compat note only |
| R-B3 ClamAV binding (M4) | Exit-code/`--move` claims lack a primary locator | R03 Ubuntu Jammy clamscan manpage (clamav 1.5.4+dfsg): RETURN CODES 0/1/2 + `--move=DIRECTORY` → unknown→supported transition | SUPPORTED with version-bound primary; build rebinds to its pinned version + clamdscan distinction |
| R-B4 Archivematica demotion (M3) | Transient Noble failure disqualifies Line B as default; ~50GB baseline sourced | C07 re-read (maintainer fix promised; sibling fixable); no S-entry supports 50GB → strength transition, no new retrieval needed | QUALIFIED: conditional viability; 50GB dropped |
| R-B5 server-bag/pre-bag/lock/oracles (M5/M6/M7) | Draft pipeline order + oracles executable as written | Logic against sourced premises (BagIt UTF-8 rule, OCFL no-locking, V-oracle executability); no retrieval needed | CONDITIONAL: pre-bag stage 2.5, server-bag wording, named lock, tightened oracles |
| R-B6 countercase (C-B7 preserved) | Signed manifests + transparency log could reduce event-chain needs | No retrieval by design; V4 discriminates checksum-fallacy only | UNKNOWN/CONDITIONAL, deliberately unresolved; V4b scoped |
| R-B7 omissions (O-A..O-D) | Line A complete without auth/rights/resume/channel | Logic vs brief ("receiving files from small donors") | O-A MATERIAL accepted as build decision; O-B/C/D accepted as open decisions |

Attention trace: R-B1 drew first retrieval (refutation + new distributed-gating condition, largest single-step change). R-B3 drew second (unknown→supported, +4). R-B2 drew third (partial refutation of lag, +4 on pin hygiene). R-B4/R-B5 resolved against already-sourced premises (−2 duplicate risk accepted, no retrieval). R-B6 preserved by rule with zero retrievals. No branch paused before P1–P6 + alternatives + validations floor met.

## 2. Per-P disposition (O4)

### P1 — "Accept ZIP uploads" → CORRECTION (transport ≠ package). Critic verdict UPHELD with conditions.

Half-right as transport (donors can already make ZIPs), wrong as preservation decision: a bare ZIP has no standard validation semantics, no payload/tag distinction, no PREMIS mapping, and brings Zip-slip, filename-encoding, and nested-archive hazards. Build keeps ZIP as transport wrapper; the validated unit is a BagIt 1.0 package.

Corrected behavior:
- Accept (a) a ZIP containing exactly one top-level BagIt 1.0 bag, and (b) an Exactly-pattern donor-client upload that creates the bag at source (functional spec §5: bag-at-source + transfer + receipt-validate + report rows; FTP/sync/USB paths retained for offline donors). A bare directory upload that the server bags immediately is an allowed fallback, recorded as server-bagged with operator agent — with the M5 load-bearing wording (§2-P1-M5).
- Never treat outer-ZIP listing or central-directory CRC as validation. Validation = RFC 8493: required elements present, every payload file listed in every payload manifest, every checksum recomputes, tag-manifest-listed tags recompute.
- Guards: Zip-slip (reject absolute paths, `..`, drive letters, symlinks; unsafe-path handling tested against the pinned bagit artifact per M2 because v1.9.0 changed it), filename handling in the pre-bag stage 2.5 per M6 (never silent rename), size caps and recursion limits shared with the ClamAV gate (oversize/nested-depth → quarantine + report, not silent skip), encrypted ZIP → quarantine + request re-supply with a documented v2 password-handoff option per M5 (out-of-band, single-use, policy-gated; no password collection in v1).
- Alternatives retained: SWORD v2/v3 package deposit conditioned per m1 (only where a SWORD server with mediated `on-behalf-of` deposit already exists; v3 BagIt-packaging claim needs a spec locator at build); direct S3/MinIO multipart upload for large AV with resume semantics per O-C (still lands in untrusted staging, still gated). Bare-ZIP-only (no BagIt) is REJECTED as a preservation path, kept only as a documented migration note.

### P2 — "Verify SHA-256 checksums" → CORRECTION + ALREADY-COVERED (necessary, insufficient). Critic verdict UPHELD with conditions.

SHA-256 verification stays, but the clause would let a checksum stand for provenance and omits the semantics that make verification meaningful.

Corrected behavior:
- Verify per BagIt 1.0 semantics: every payload file in every payload manifest (1.0 tightened from 0.97; single-manifest 0.97 bags are repair candidates, not valid 1.0), plus tag manifests when present, plus OCFL sidecar/inventory digests at commit, plus PREMIS fixity events. A checksum that verifies proves only that the bytes match the manifest at verification time; provenance = BagIt manifest + PREMIS ordered event chain (ingest, virus check, identification, validation, fixity check, transformation, replication, accession-per-m7) + OCFL version chain + donor attestation (§2-P3-O-A); the checksum is one link, not the chain.
- Algorithm/version conditions: pin a verified PyPI artifact `bagit==1.9.0` + content hash on Python ≥3.8 (M2 as amended: PyPI 1.9.0 confirmed live, R02; record what the resolver installs at build; `>=1.9,<2` kept only as a compat note); invoke with explicit hash flags; never pass exotic `hashlib`-derived flags (`shake_*`, `blake2*`, `sha3_*`) other tools reject; validate with `--validate`; record tool version in every report. Hash-default choice is a USER DECISION per m6: SHA-512-only default recommended (RFC SHOULD-default-SHA-512; halves manifest size/hash time for large AV; MUST-support-both keeps it interoperable) with dual SHA-256+SHA-512 as the option where a partner demands it; record the interop note either way. MD5-only is REJECTED for new bags (read-only legacy verification kept).
- `fetch.txt`: deny remote-file bags for donor handoff, or quarantine until fetched bytes are retrieved and validate. V1 oracle specifies scheme (file:// vs http(s)) and runs with fetching disabled, because v1.9.0 allows file-URL fetch.txt to validate (M2).
- Conditional enhancement: OCFL `fixity` second algorithm at commit so later migrations re-verify without re-bagging.

### P3 — "Extract to the archive folder and update a database" → CORRECTION (staged pipeline; store ≠ folder+DB). Critic verdict UPHELD in structure with three qualifications applied.

Direct extract-to-archive plus a DB write skips quarantine, validation, versioning, and repeatability, and makes the database a source of truth it cannot be.

Corrected behavior (Line A lightweight pipeline, recommended):
1. `incoming/` (untrusted, noexec): receive upload, record receipt PREMIS event (donor identity per O-A, method, operator, bytes, tool versions).
2. Pre-bag stage 2.5 (new per M6): filename triage before bagging — undecodable names rejected/repaired with a report row and their own PREMIS event (they cannot be manifested at all); NFC/normalization collisions flagged as their own row kind.
3. Malware gate (ClamAV `clamd`/`clamscan` + `freshclam`): scan with `--move=$QUARANTINE_DIR`; exit 0 clean → continue, 1 infected → `quarantine/`, 2 error/oversize/encrypted → `quarantine/` with distinct report row. Primary binding: Ubuntu Jammy clamscan manpage (clamav 1.5.4+dfsg) RETURN CODES 0/1/2 and `--move=DIRECTORY` (R03); the build rebinds to its pinned version's manpage/docs and distinguishes `clamscan` from `clamdscan` codes (M4). Preflight asserts `sigtool --info` daily/main/bytecode versions; stale-DB or updater failure fails closed. On-access blocking defaults off and is NOT the gate. Archive-bomb limits are set from the pinned version's directive spellings/defaults asserted on first run (not trusted from the family list) + `MaxThreads` sized to the VM; oversize = quarantine + report.
4. BagIt validate (pinned artifact): RFC 8493 validity; failures → human-readable rejection report (check, files, expected vs observed with manifest line + recomputed digest, plain-language meaning, next step, tool+DB versions).
5. Identify (Siegfried + PRONOM, `sf -update` vintage recorded: `siegfried`, `signature`, `created`, `DROID_SignatureFile_Vnn`, `container-signature-YYYYMMDD`) then validate by PUID routing (TIFF→JHOVE+DPF Manager; generic PDF→JHOVE PDF module with known gaps; PDF/A→veraPDF where collection policy requires conformance, per m5; JP2→Jpylyzer; AV→MediaConch; WAVE→JHOVE version discovery). Siegfried-only is never reported as validation (NLW TIFF-version gap; PPT/XLS container-precedence fix behind `-doubleup`).
6. Metadata completeness check against CSV template; failures route to the P4 repair loop, not to silent ingest.
7. OCFL version commit: new content under new `vN/content/` (dedup by known digest), new version inventory+sidecar, root inventory+sidecar last, digest after all edits; writers serialize through the named mechanism (default single-writer queue; filesystem lock or DB advisory lock are the stated alternatives — build picks one, M7), re-verify `head`; validator E-codes map to report rows.
8. Index update: the database/search index is a derived view of the OCFL store + PREMIS log, rebuilt from them via the defined rebuild procedure and covered by test V8 (m4); never the preservation truth. Durability (M1 restatement): OCFL root on filesystem + an independent second copy on a second disk/bucket/host + re-verify, with the copy/verify job named; MinIO SNSD is the S3-API shim/access layer and may be one copy, never the whole durability story. SNSD carries no production, expansion, or (until the release matrix is asserted) versioning/object-lock claim.
- USER DECISIONS: (a) filesystem-only vs filesystem+S3-API from day one (recommend both for the second copy; SNSD keeps the access layer cheap); (b) full Archivematica OAIS suite vs this lightweight line — Archivematica stays a retained alternative, now CONDITIONAL per M3 (viable where OAIS + access publishing is wanted now AND the OS/branch pair is pinned AND ops capacity exists; revisit after the Noble packaging fix; no quantitative baseline claimed — the unsourced ~50GB figure is dropped); outputs stay Archivematica-compatible (BagIt/METS/PREMIS) so a later move is a migration; (c) SWORD-deposit line into an existing server per m1 (Fedora 6+ is OCFL-native).
- OPTIONAL ENHANCEMENT: object-locking WORM retention + lifecycle tiering where the deployed (distributed) store supports them — asserted against the release matrix, not assumed on SNSD; Prometheus `minio_*` + freshclam/clamd health via an exporter or log-scrape job (m3, integration work with an owner) into the same dashboard as transfer stats.

### P4 — "Let staff edit metadata after import" → CORRECTION (repair loop, not silent edit). Critic verdict UPHELD, no change.

Staff editing stays, but post-import hand-edits to preserved bytes would destroy repeatability.

Corrected behavior:
- Payload bytes: staff never hand-edit to make a checksum pass; donors re-supply. Metadata: ExifTool extract → CSV template → OpenRefine facet/clean/reconcile (operation history extracted into the PREMIS transformation event detail) → staff review → re-apply to a staging copy → re-validate → commit a new OCFL version with a PREMIS transformation event (who/what/when/tool versions). Every preserved-byte change has an event; no silent mass edit.
- ExifTool writes scoped (targeted tags, deliberate `icc_profile`/makernotes policy), never blind `-all:all` on originals. CSV templates carry required/repeatable/controlled-vocabulary rules so the next donor package checks mechanically.
- UNCERTAIN retained (archive input): repair-approval roles/rights, and retention of superseded metadata versions beyond the OCFL chain (default: keep all versions; archive may set a review window).

### P5 — "Keep original filenames" → ALREADY-COVERED with CONDITIONS + USER DECISION. Critic verdict UPHELD with conditions.

Original filenames stay: BagIt payload paths, OCFL content paths, PREMIS `originalName`, transfer manifest. Conditions per M6 are part of the disposition, not footnotes.

Conditions:
- Normalize for storage (Unicode NFC, strip control characters, path-length and reserved-name rules, reject/escape absolute/`..`/drive/symlink entries), keep an explicit original→stored mapping table, report every normalization as a report row (never silent rename). Normalization-collisions (NFD vs NFC inputs normalizing identically) are their own row kind, distinct from case-collisions and duplicate basenames. Undecodable names are handled in pre-bag stage 2.5 with a PREMIS event. Case-collision/duplicate-basename policy explicit (suffix default `name~2.ext`, recorded in the mapping).
- Display name = original; storage name = sanitized; both searchable. Donor directory structure preserved inside `data/`; archive arrangement lives in metadata, not by renaming payload.
- USER DECISION: collision-suffix scheme and reserved-character table (defaults proposed above; archive confirms before build).

### P6 — "Test with three good packages" → CORRECTION (discriminating matrix; three good = smoke only). Critic verdict UPHELD with conditions.

Three good packages prove the happy path once; they cannot discriminate validation semantics, quarantine, provenance, identify-vs-validate, repair audit, or portability. Retained as the smoke preamble of the §7 matrix (V1–V8), all PROPOSED, none executed (no sandbox in any stage; no proposal presented as run).

## 3. Criticism dispositions (every critic item, explicitly)

### 3.1 Per-P verdicts

| Critic verdict | Disposition | Application |
|---|---|---|
| P1 UPHOLD with M5+M6 | ACCEPT | Pre-bag stage 2.5, server-bag wording + V4 fixture, v2 password-handoff note (§2-P1) |
| P2 UPHOLD with M2 | ACCEPT as AMENDED | Verified PyPI pin + scheme-bound fetch rule + hash-default user decision (§2-P2) |
| P3 UPHOLD structure + M1/M3/M4 | ACCEPT | SNSD restatement, Archivematica conditional + 50GB dropped, primary ClamAV binding (§2-P3) |
| P4 UPHOLD, no change | ACCEPT | Repair loop + two UNCERTAIN sub-items unchanged |
| P5 UPHOLD with M6 | ACCEPT | Normalization-collision rows + pre-bag placement (§2-P5) |
| P6 UPHOLD with M7 | ACCEPT | Named lock in V2 + config-only oracle in V7, V8 added (§7) |

### 3.2 Material findings M1–M7

- M1 SNSD-as-replication + S16 non-primary source — ACCEPT. Independently confirmed and strengthened (R01): official-family docs say Standalone is for early development/evaluation, not recommended in production ("loss of the node or its storage medium results in data loss"), no expansion via new server pools, and versioning/object-lock/bucket-replication require distributed erasure-coded deployment (minimum 4 drives). Applied: SNSD restated as S3-API shim/access layer; durability = FS OCFL + independent second copy + re-verify with named copy job; versioning/object-lock claims gated on the asserted release matrix. S16's secondary-source defect is agreed and superseded by R01. AGPLv3 trigger stated plainly: internal self-hosted use over the S3 API does not itself distribute; distributing modified MinIO binaries/images or embedding MinIO code in a distributed product triggers share-alike obligations — archive confirms comfort with counsel where distribution is planned; SeaweedFS/Garage/RustFS stay noted alternatives. UNCERTAIN retained: exact SNSD-vs-distributed feature parity for the chosen release — asserted at build, not guessed here.
- M2 bagit pin + v1.9.0 behavior — ACCEPT as AMENDED. C03 conditions accepted: V1 oracle specifies file:// vs http(s) with fetching disabled; Zip-slip/unsafe-path guard tested against the pinned artifact. Pin hygiene amended: the PyPI lag (C04, 1.8.1 Feb 2021) is resolved — `bagit` 1.9.0 is on PyPI (R02) — so the build pins the verified PyPI artifact `bagit==1.9.0` + content hash and records resolver output; the `>=1.9,<2` range is a compat note, not the pin. Exotic-hashlib-flag guard upheld. UNCERTAIN retained: whether any 1.9.x post-release touches manifest-line error text — V1 asserts its "exact manifest line" oracle against the pinned artifact on first run.
- M3 Archivematica strength + ~50GB — ACCEPT. #1766 is a real point-in-time `python3-distutils` packaging failure with a maintainer fix promised, not architectural evidence. Applied: demotion downgraded to conditional viability (OAIS+access wanted now AND OS/branch pinned AND ops capacity; revisit after fix). The ~50GB baseline is dropped as unsourced; any quantitative baseline the build uses must carry a source. The `hack/README` dev-orientation note stands. No false-rejection repair needed beyond the strength change.
- M4 ClamAV primary locators + V3 scope — ACCEPT in direction, AMENDED on evidence: the critic's held-open unknown is RESOLVED by reviser retrieval R03 (Ubuntu Jammy clamscan manpage, clamav 1.5.4+dfsg: RETURN CODES 0/1/2; `--move=DIRECTORY`). Applied as the version-bound primary for this final; the build rebinds to its own pinned version and distinguishes `clamscan` vs `clamdscan` codes. Directive family (`MaxScanSize`/`MaxFileSize`/`MaxRecursion`/`MaxFiles`/`StreamMaxLength`) spellings/defaults are asserted from the pinned release on first run. V3 gains OLE2/OOXML/PDF-parser fixtures. UNCERTAIN retained: exact directive spellings for the to-be-pinned release — deliberately not asserted here.
- M5 server-bagged attestation + encrypted-ZIP — ACCEPT. Server-bagged transfers carry the prose sentence "manifest created by archive operator from received bytes; donor attestation absent" in the report (never a bare flag), and V4 includes a server-bagged fixture asserting that wording and the weaker chain. Encrypted-ZIP v1 behavior (quarantine + re-supply, no password collection) stands, with the v2 password-handoff option documented so friction is decided, not discovered.
- M6 pre-bag sanitization + NFC collision — ACCEPT. Pipeline gains explicit stage 2.5 before bagging with its own PREMIS event; BagIt-validate is not credited with pre-manifest work. Normalization-collisions are a distinct report row kind. Suffix default `name~2.ext` kept as a proposal awaiting archive confirmation.
- M7 V2 lock + V7 oracle — ACCEPT. V2 is repaired by naming the serialization mechanism as a build decision (default single-writer queue; filesystem lock or DB advisory lock as stated alternatives) and driving two concurrent commits through it (exactly one wins + head re-verified + loser retried-or-reported). V7's "config-only S3 swap" oracle is now executable: the V1–V3 + portability subset passes on a scratch bucket with only endpoint/credential/config change and zero code change; the MinIO→S3 delta (auth, addressing style, object-lock prerequisites) is the measured result.

### 3.3 Minor findings m1–m8

- m1 SWORD sourcing — ACCEPT. The v3-BagIt deck is not the spec; build asserts against the SWORDv3 spec repo/site. Mediated deposit scoped per implementation (DSpace supports it; not universal). Line C conditioned on a capable server already existing.
- m2 Exactly functional spec — ACCEPT. "Exactly pattern" now means: bag-at-source + transfer + receipt-validate + report rows. Code adoption vs UI rebuild stays undecided (community-fork maintenance risk); either implementation satisfies the same spec.
- m3 dashboard exporter — ACCEPT. freshclam/clamd have no native Prometheus endpoints; the "same dashboard" item is integration work (exporter or log-scrape job) with an owner, not config.
- m4 derived-index discipline — ACCEPT. Defined rebuild procedure (drop index → rebuild from OCFL + PREMIS → diff) plus test V8; without it the discipline is unenforceable.
- m5 PDF/A split — ACCEPT. Generic PDF → JHOVE PDF module (known gaps stated); PDF/A conformance → veraPDF only where collection policy requires it.
- m6 dual-hash cost — ACCEPT as USER DECISION. Default SHA-512-only recommended with dual as the option; interop note recorded either way; no silent cost imposed on large-AV donors.
- m7 PREMIS vocabulary — ACCEPT. "Accession" bound to the PREMIS 3 event-type vocabulary with a local-extension point; where accession reads as OAIS-function rather than PREMIS-event, the local type is declared explicitly.
- m8 V4b scope — ACCEPT. V4 discriminates the checksum-fallacy; signed-manifest sufficiency needs its own V4b oracle (threat model + what the transparency log proves) — correctly out of v1; the countercase stays open.

### 3.4 Omissions O-A..O-D

- O-A donor identity / upload auth (MATERIAL) — ACCEPT. Build decision required: auth model (donor accounts vs magic links vs mediated-only), attestation record shape (who/when/how bound to the receipt event), anonymous-upload policy (refuse vs mediated-only). Without an authenticated donor identity, "donor attestation" in the event chain is vacuous; Line C's SWORD on-behalf-of covers repository deposit only. Added to open decisions and to stage-1 receipt-event content.
- O-B privacy/PII + rights — ACCEPT (minor, near-material). Open decisions: quarantine retention/deletion policy, access controls on infected holdings, and use of the PREMIS Rights entity. The regional-archive context makes rights more than theoretical; flagged, not solved here.
- O-C large-transfer resume — ACCEPT. Multipart upload for large AV gains resume/checkpoint semantics in the deployment notes; interrupted uploads resume rather than restart.
- O-D report channel — ACCEPT. Reports are specified as content; the channel (staff dashboard? email? donor-visible copy?) is a named decision.

### 3.5 False-correction / false-rejection audit

Agreement with the critic: no false rejection found. Bare-ZIP-only, MD5-only-new, Siegfried-as-validator, silent-edits, database-as-truth, checksum-as-provenance, and default fetch.txt-deny dispositions are all CORRECT. Archivematica-as-default demotion was direction-right but strength-overstated — corrected per M3. MinIO-alternatives deferral is CORRECT with the M1 trigger-condition sentence added. Nothing in this critique overturns the Line A recommendation or the retained-alternatives set.

## 4. Retained findings, conditions, alternatives (O1/O5)

- Recommended Line A: Exactly-pattern donor client → staged pipeline (pre-bag 2.5 → ClamAV → BagIt → Siegfried → JHOVE-family → repair loop → OCFL → PREMIS → FS + second-copy replication) → human-readable reports. Cheapest to run, explainable to small donors, interoperable outputs.
- Retained alternative Line B (Archivematica OAIS): transfer→SIP→micro-services→AIP(METS/PREMIS)→DIP to AtoM/ArchivesSpace/DuraCloud/Dataverse. CONDITIONAL per M3 (see §2-P3).
- Retained alternative Line C (repository deposit): SWORD BagIt deposit into an existing capable DSpace/Fedora; reuses auth/search/access; pre-deposit quarantine/validation gates still required; conditioned per m1.
- Explicitly REJECTED but documented: bare-ZIP + sidecar hash + spreadsheet log; MD5-only new bags; Siegfried-as-validator; silent metadata edits; database-as-truth; checksum-as-provenance; default fetch.txt-allow.
- Original constraints preserved: small donors (no CLI assumed), staff-legible reports (every row carries prose, expected/observed, next step — never bare IDs), repeatable history (OCFL versions + PREMIS events + transfer manifest with tool/DB versions), low cost (single VM, open-source tools, S3-compatible exit path).
- Disagreement preserved: MinIO AGPLv3 vs SeaweedFS/Garage/RustFS (trigger sentence added; choice stays open); Exactly code adoption vs UI rebuild (spec fixed; implementation open); hash-default (SHA-512-only recommended, dual optional); SWORD vs custom upload (depends on existing server); AV-policy depth per collection.

## 5. Consequential behavior, defaults, limits (O2)

BagIt 1.0 (RFC 8493) + pinned bagit: `bagit.txt` + `data/` + ≥1 payload manifest; every payload file in every payload manifest; tag manifests optional but checksum-enforced when present; manifest lines `<hex> <relative-UTF-8-path>`; `bag-info.txt` Tag/value pairs. No versioning/dedup/locking; `fetch.txt` shifts fixity to retrieval — denied-or-quarantined here. Encoding/line-ending interop failures name the exact manifest line. Handoff validation only; history is OCFL's job.

OCFL 1.1: object root NAMASTE + root inventory+sidecar + `v1..vN` (no gaps) each with inventory+sidecar and `content/`; inventory carries `head`, digest-keyed `manifest` (dedup/forward-delta), `fixity`; write order content → version inventory+sidecar → root inventory+sidecar last; digest after all edits (E062); no locking — external serialization + head re-verify; E001–E112/W001–W016 map to report rows; large inventories are machine-first (`ocfl_layout.json`, extension sharding).

ClamAV gate: `clamd` + `clamscan` + `freshclam` + `sigtool --info`; primary exit binding R03 (0 clean / 1 infected / 2 error; `--move` quarantine; build rebinds to pinned version; clamdscan distinguished); report-only by default so `--move` is explicit; archive-bomb directives asserted from the pinned release; `freshclam` CVD + `.cdiff` + `.sign` verification with `certs/` dir, `DatabaseMirror`/`DNSDatabaseInfo`, ≤4 checks/hour; `.cvd`/`.cld` both accepted; updater failure fails closed; `incoming/`/`quarantine/`/`clean/` separation with distinct perms; virus-check PREMIS event carries signature versions.

Siegfried + PRONOM: `sf -update` fetches `default.sig` (byte+container signatures; full-scan cost on large AV without a `roy`-built limited file); output carries PUID/format/mime plus `signature`/`created`/identifier versions; container precedence unless `--doubleup`; DROID-like priorities post-identification. Identify only; version-sensitive formats route to JHOVE-family; every report records the signature vintage.

JHOVE-family: JHOVE well-formed/valid/neither (~14 formats) for TIFF/WAVE/version discovery; veraPDF for PDF/A conformance only; Jpylyzer JP2; DPF Manager TIFF policy; MediaConch AV policy. PUID routing, not blanket-every-file.

ExifTool + OpenRefine + PREMIS: ExifTool batch CSV/JSON read/write with scoped writes; OpenRefine facet/clean/reconcile with operation history extracted into the PREMIS transformation detail; silent mass edit barred by template + review + logged history. PREMIS: fixity is an Object property; every computation/verification is an Event with agents/outcome; provenance is the ordered event chain + agents + rights.

SWORD / Fedora / MinIO: SWORD v2 AtomPub CRUD + mediated deposit; v3 BagIt packaging asserted at build (m1); Fedora 6+ OCFL-native as a later migration target. MinIO: single Go binary, S3 SigV4 API, SNSD = S3-API shim for dev/eval/access (R01); durability and any versioning/object-lock claim require distributed erasure-coded deployment or an independent second copy + re-verify; AGPLv3 per M1 sentence.

## 6. Issue / fix / regression / release chains (O3)

Chain 1 — bagit-python default-hash evolution + hashlib-surface regression + v1.9.0 behavior + PyPI resolution. MD5-default → issue #86 → commit 81a6123 (SHA-256+SHA-512 default, hashlib-derived flags) → RFC 8493 MUST-support/ SHOULD-default-SHA-512 + 1.0 every-file-in-every-manifest (breaks some 0.97 bags) → issue #158 (non-BagIt flags in `--help`, runtime errors) → bdbag 1.8.0 pins bagit 1.9.0 / drops Python <3.8 → v1.9.0 file-URL fetch.txt + expandvars change (C03) → PyPI 1.9.0 live (R02; C04 lag resolved). Build condition: verified `bagit==1.9.0` artifact + hash, explicit flags, no exotic flags, scheme-bound fetch rule, pinned-artifact guard tests.

Chain 2 — Siegfried mis-identification + TIFF-version gap (identify ≠ validate). #52 PPT-as-XLS via byte signature → container-precedence fix unless `-doubleup` (+ #140/#146 priorities) → persistent TIFF-version gap (NLW: DROID+JHOVE-passed files failed Archivematica's Siegfried step; CLI JHOVE added for version discovery) + PRONOM scan-limit variance (BWF fmt/142 vs fmt/704). Build condition: record full signature vintage; route version-sensitive formats to JHOVE-family; never Siegfried-only validation.

Chain 3 — ClamAV signature-trust + staleness/presence + primary binding. 1.5.0 CVD `.sign` verification + `certs/` dir → `.cvd`→`.cld` presence-break fix (accept either; freshclam stages+renames) → stale-DB recurrences (timer/service not enabled; old configs lacking mirror directives) → R03 primary exit-code/`--move` binding (resolves the critic's held-open unknown for clamscan; clamdscan + directives still build-asserted). Build condition: monitored freshclam service, preflight `sigtool --info`, fail-closed on updater failure.

Chain 4 (supporting) — Archivematica install fragility as a weakened version condition. #1766 Noble `python3-distutils` failures across three of four paths + #1767 fixable VM issues + maintainer fix promised (C07) → point-in-time packaging evidence, not architecture. `hack/README` dev-stack DB-creation note stands. Build condition: Line B only on a pinned OS/branch pair with ops budget; re-check fix status at build.

Absence recorded: no source shows any checksum alone establishing provenance; preservation sources uniformly treat provenance as event-chain + agents + rights plus versioned storage.

## 7. Validations: executed vs proposed (O6)

Executed: none in any stage. No runtime was available or claimed; no witness ran; no proposal is presented as executed. The oracles below are build-time assertions.

- Smoke (P6 three-good, retained): upload→accept→report→history in under an hour on the reference VM. YES, keep as preamble.
- V1 BagIt interop/negatives: dual- and SHA-512-only bags from the pinned artifact validate under a second implementation; one-byte mutation fails naming the exact manifest line (oracle asserted against the pinned artifact on first run); 0.97 single-manifest bag flagged as repair candidate; fetch.txt bags quarantined with file:// vs http(s) + fetching-disabled specified. Discriminates 1.0-rule compliance.
- V2 OCFL round-trip + writer serialization: v1→v2→v3 with dedup; one-byte corruption reports exact E-code/version; head/root mismatch detected; two concurrent commits driven through the named mechanism (default single-writer queue) assert exactly-one-wins + head re-verified + loser retried-or-reported. Discriminates history + serialization integrity.
- V3 malware gate: EICAR + clean + oversize + nested-archive + password-ZIP + OLE2/OOXML/PDF-parser fixtures; exit 0/1/2 mapping from the pinned manpage, `--move` placement, stale-DB fail-closed, `.cvd`/`.cld` acceptance, `certs/` path, asserted directive spellings/defaults. Discriminates quarantine correctness + parser coverage.
- V4 provenance countercase: pre-manifest swap (verifies) vs post-manifest swap (fails) vs server-bagged transfer (weaker chain + mandated report sentence); only event-chain + attestation distinguishes them. Discriminates the checksum-as-provenance fallacy; keeps the B6/C-B7 countercase open until run. V4b (signed-manifest sufficiency: threat model + transparency-log proof) scoped, not demanded in v1.
- V5 identify/validate split: TIFF-version, PPT/XLS, Broadcast-WAVE fixtures through Siegfried then JHOVE; PUID + validator verdict both recorded, disagreements shown openly; PDF/A-vs-generic-PDF split applied. Discriminates identify==validate conflation.
- V6 repair audit: dirty CSV through OpenRefine ops log → re-apply → re-validate; every preserved change has a PREMIS event; no silent mass edit. Discriminates repair accountability.
- V7 portability (if chosen): SWORD BagIt deposit to test DSpace where applicable; S3-API round-trip; config-only swap oracle (V1–V3 + portability subset passes on a scratch bucket with endpoint/credential/config change only, zero code change; MinIO→S3 delta measured). Discriminates deployment portability.
- V8 derived-index rebuild (new per m4): drop index → rebuild from OCFL + PREMIS → diff against pre-drop. Discriminates index-derivation discipline.
- Milestone order: V1–V4 first (preservation-critical), then V5–V8 with validator routing and deployment choices.

## 8. Uncertainty (open, not hidden)

1. B6/C-B7 countercase: whether donor-signed manifests + a transparency log could reduce (not eliminate) event-chain requirements for low-risk collections. Needs V4 + V4b + legal/custody input. Not decided.
2. Repair-approval roles/rights + superseded-metadata retention (archive input).
3. Collision-suffix / reserved-character tables (archive confirms defaults).
4. Upload auth model + attestation record shape + anonymous-upload policy (O-A; the material open decision).
5. SWORD-vs-custom, MinIO license comfort, AV-policy depth (as before, plus M1 restatement).
6. Pinned-version assertions left to first build run (not guessed): ClamAV directive spellings/defaults + clamdscan codes; bagit manifest-line oracle text; MinIO release SNSD feature matrix; SWORDv3 spec locator.
7. Privacy/rights, quarantine retention/access, resume details, report channel (O-B/C/D).
8. Usage/billing: unobserved for all reviser sources (anonymous public reads); null throughout.

## 9. Low-cost deployment path (conditions)

Reference: one VM (Ubuntu LTS pinned; Archivematica-avoidance note now conditional per M3), Docker Compose or systemd units for `clamd`+`freshclam`, pinned-bagit service, `sf`+JHOVE workers, OCFL filesystem root + S3-API layer (SNSD MinIO as the cheap access shim), derived Postgres/SQLite index, static report UI. Durability is the FS OCFL root plus an independent second copy on a second disk/bucket/host with a named copy/verify job — never SNSD alone. Health: `sigtool --info`, `sf -update` vintage, OCFL validator, store console/Prometheus via exporter. Swap path: S3-API endpoint/credential change; filesystem OCFL root rsyncs anywhere; Fedora 6+ later if a repository is wanted. Multipart resume per O-C. Costs stay at one VM + disks until collections outgrow the single node, at which point the erasure-coded distributed topology (minimum 4 drives) replaces SNSD for any durability/versioning claim.

## 10. Source notes

Reviser evidence: source-map.json R01–R03 (MinIO official-family SNSD guidance; bagit PyPI 1.9.0 live reference; Ubuntu Jammy clamscan manpage 1.5.4+dfsg). Bounded excerpts in sources/ with navigable sources/index.md. IDs immutable; mutable pages bound by URL + access timestamp + locator; no silent rebind. Predecessor S01–S16 and C01–C07 cited by reference for lineage; where reviser re-observed (R01 supersedes S16's secondary source; R03 resolves C05's held-open unknown; R02 resolves C04's lag), the reviser ID governs. Usage/billing null throughout.
