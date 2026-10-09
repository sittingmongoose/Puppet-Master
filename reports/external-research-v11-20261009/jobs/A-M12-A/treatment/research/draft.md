# ER11 S12 archive-transfer — draft (post-reveal planning deliverable)

Case S12 archive-transfer. Block A-M12-A, treatment/research, method M12 v1 adaptive-evidence-state-branching.
Brief: digital handoff service for a regional historical archive receiving files from small donors; package validation, malware/quarantine separation, understandable rejection reports, metadata repair, repeatable transfer history without assuming a checksum proves provenance; interoperable tools, competing workflows, implementation/version conditions, low-cost deployment.
Discovery frozen before reveal (discovery.md + source-map.json S01–S16 + sources/index.md); discovery not rewritten after reveal. This draft is the complete self-contained coherent final for this scope; later stages may correct it.
Written: 2026-10-09T19:05:00Z. Deadline: 2026-10-09T19:23:15Z (arm 19:53:15Z).

## 0. Exact thin plan under comparison (verbatim)

P1: Accept ZIP uploads. P2: Verify SHA-256 checksums. P3: Extract to the archive folder and update a database. P4: Let staff edit metadata after import. P5: Keep original filenames. P6: Test with three good packages.

Disposition vocabulary (O4): CORRECTION (plan clause is wrong/incomplete and must change), ALREADY-COVERED (discovery already satisfies it; plan adds nothing), OPTIONAL ENHANCEMENT (useful but not required), USER DECISION (needs archive/staff choice, both options retained), REJECTED (investigated and set aside with reason), UNCERTAIN (evidence insufficient; validation or input needed).

## 1. Per-P disposition

### P1 — "Accept ZIP uploads" → CORRECTION (transport ≠ package)

The clause is half-right: donors can already make ZIPs, so accepting them lowers friction. It is wrong as a preservation decision: a bare ZIP has no standard validation semantics, no payload/tag distinction, no PREMIS mapping, and brings Zip-slip, filename-encoding, and nested-archive hazards. The build keeps ZIP as a transport wrapper and requires a BagIt package as the validated unit.

Corrected behavior:
- Accept (a) a ZIP containing exactly one top-level BagIt 1.0 bag, and (b) an Exactly-pattern donor-client upload that creates the bag at source (FTP/sync/USB paths retained for offline donors). A bare directory upload that the server bags immediately is an allowed fallback, recorded as server-bagged with operator agent.
- Never treat outer-ZIP listing or central-directory CRC as validation. Validation = RFC 8493: required elements present, every payload file listed in every payload manifest, every checksum recomputes, tag-manifest-listed tags recompute.
- Guards: Zip-slip (reject absolute paths, `..`, drive letters, symlinks), filename encoding normalized to UTF-8 (reject/repair undecodable names with a report row, never silent rename), size caps and recursion limits shared with the ClamAV gate (oversize/nested-depth → quarantine + report, not silent skip), encrypted ZIP → quarantine + request re-supply (no password collection in v1).
- Alternatives retained: SWORD v2/v3 package deposit (explicit BagIt support in v3; mediated `on-behalf-of` deposit so staff can submit for donors) where a DSpace/EPrints/Fedora endpoint already exists; direct S3/MinIO multipart upload for large AV (still lands in untrusted staging, still gated). Bare-ZIP-only (no BagIt) is REJECTED as a preservation path, kept only as a documented migration note for donors who need hand-holding.

### P2 — "Verify SHA-256 checksums" → CORRECTION + ALREADY-COVERED (necessary, insufficient)

SHA-256 verification is already covered and stays, but the clause as written would let a checksum stand in for provenance and omits the semantics that make verification meaningful.

Corrected behavior:
- Verify per BagIt 1.0 semantics, not "a SHA-256 column matches": every payload file in every payload manifest (1.0 tightened this from 0.97; single-manifest 0.97 bags are repair candidates, not valid 1.0), plus tag manifests when present, plus OCFL sidecar/inventory digests at commit, plus PREMIS fixity events. A checksum that verifies proves only that the bytes match the manifest at verification time; it says nothing about who supplied them, pre-manifest substitution, or custody between transfers. Provenance = BagIt manifest + PREMIS ordered event chain (ingest, virus check, identification, validation, fixity check, transformation, replication, accession with agents/outcomes/dates) + OCFL version chain + donor attestation; the checksum is one link, not the chain.
- Algorithm/version conditions (from the bagit-python chains): pin `bagit>=1.9,<2` on Python ≥3.8; invoke with explicit hash flags (dual SHA-256+SHA-512 matches current bagit-python default and the RFC SHOULD-default-SHA-512; minimum SHA-512 alone); never pass exotic `hashlib`-derived flags (`shake_*`, `blake2*`, `sha3_*`) that other BagIt tools reject; validate with `--validate`; record tool version in every report. MD5-only is REJECTED for new bags (kept read-only for legacy verification). Deny `fetch.txt` remote-file bags for donor handoff, or quarantine until fetched bytes are retrieved and validate — otherwise fixity is deferred to an uncontrolled fetch.
- Conditional enhancement: add OCFL `fixity` second algorithm at commit so later migrations can re-verify without re-bagging.

### P3 — "Extract to the archive folder and update a database" → CORRECTION (staged pipeline; store ≠ folder+DB)

Direct extract-to-archive plus a database write is the most dangerous clause: it skips quarantine, validation, versioning, and repeatability, and makes the database the source of truth it cannot be.

Corrected behavior (Line A lightweight pipeline, recommended for this brief):
1. `incoming/` (untrusted, noexec): receive upload, record receipt PREMIS event (donor, method, operator, bytes, tool versions).
2. Malware gate (ClamAV `clamd`/`clamscan` + `freshclam`): scan with `--move=$QUARANTINE_DIR`; exit 0 clean → continue, 1 infected → `quarantine/`, 2 error/oversize/encrypted → `quarantine/` with distinct report row. Preflight asserts `sigtool --info` daily/main/bytecode versions; stale-DB or updater failure fails closed (quarantine, do not scan-then-accept silently). On-access blocking defaults off and is NOT the gate; the explicit pre-ingest scan is. Archive-bomb limits (`MaxScanSize`/`MaxFileSize`/`MaxRecursion`/`MaxFiles` family + `MaxThreads` sized to the VM) are set and documented.
3. BagIt validate (bagit-python pinned): RFC 8493 validity; failures → human-readable rejection report (check, files, expected vs observed with manifest line + recomputed digest, plain-language meaning, next step, tool+DB versions).
4. Identify (Siegfried + PRONOM, `sf -update` vintage recorded: `siegfried`, `signature`, `created`, `DROID_SignatureFile_Vnn`, `container-signature-YYYYMMDD`) then validate by PUID routing (TIFF→JHOVE+DPF Manager; PDF→JHOVE+veraPDF; JP2→Jpylyzer; AV→MediaConch; WAVE→JHOVE version discovery). Siegfried-only is never reported as validation (NLW TIFF-version gap; PPT/XLS container-precedence fix behind `-doubleup`).
5. Metadata completeness check against CSV template; failures route to the P4 repair loop, not to silent ingest.
6. OCFL version commit: new content under new `vN/content/` (dedup by known digest), new version inventory+sidecar, root inventory+sidecar last, digest after all edits; serialize writers externally, re-verify `head`; validator E-codes map to report rows.
7. Index update: the database/search index is a derived view of the OCFL store + PREMIS log, rebuilt from them; it is never the preservation truth. Replicate OCFL root to a second disk/bucket (MinIO SNSD bucket with versioning/object-lock) and re-verify.
- USER DECISIONS: (a) filesystem-only vs filesystem+MinIO from day one (recommend both from day one for replication, MinIO SNSD single binary keeps cost flat); (b) full Archivematica OAIS suite (Dashboard+Storage Service, METS/PREMIS AIPs, DIPs to AtoM/ArchivesSpace) vs this lightweight line — Archivematica stays a retained alternative for archives that want OAIS+access publishing now, but the default is the lightweight line because Archivematica's install footprint (~50 GB baseline, Ubuntu-server comfort) and current install fragility (Ubuntu Noble 24.04 paths failing) disqualify it as the low-cost default. Outputs stay Archivematica-compatible (BagIt/METS/PREMIS) so a later move is a migration, not a rewrite. (c) SWORD-deposit line into an existing DSpace/Fedora (Fedora 6+ is OCFL-native) where that server already exists.
- OPTIONAL ENHANCEMENT: object-locking WORM retention + lifecycle tiering on MinIO; Prometheus `minio_*` + freshclam/clamd health into the same dashboard as transfer stats.

### P4 — "Let staff edit metadata after import" → CORRECTION (repair loop, not silent edit)

Staff editing is required and stays, but post-import hand-edits to preserved bytes would destroy repeatability. The correction is a logged repair loop.

Corrected behavior:
- Payload bytes: staff never hand-edit to make a checksum pass; donors re-supply. Metadata: ExifTool extract → CSV template → OpenRefine facet/clean/reconcile (operation history extracted into the PREMIS transformation event detail) → staff review → re-apply to a staging copy → re-validate → commit a new OCFL version with a PREMIS transformation event (who/what/when/tool versions). Every preserved-byte change has an event; no silent mass edit.
- ExifTool writes are scoped (targeted tags, deliberate `icc_profile`/makernotes policy), never blind `-all:all` on originals. CSV templates carry required/repeatable/controlled-vocabulary rules so the next donor package can be checked mechanically.
- UNCERTAIN (needs archive input): who may approve a version-creating repair (role/rights), and retention of superseded metadata versions beyond the OCFL chain (default: keep all versions; archive may set a review window). Recorded as open user decisions, not assumed.

### P5 — "Keep original filenames" → ALREADY-COVERED with CONDITIONS + USER DECISION

Original filenames are preserved and stay: in the BagIt payload paths, the OCFL content paths, and PREMIS `originalName`, plus the transfer manifest. The conditions are storage-safety rules the thin clause omits.

Conditions:
- Normalize for storage (Unicode NFC, strip control characters, enforce path-length and reserved-name rules, reject/escape absolute/`..`/drive/symlink entries), keep an explicit original→stored mapping table, and report every normalization as a report row (never silent rename). Case-collision and duplicate-basename policies are explicit (suffix scheme, e.g. `name~2.ext`, recorded in the mapping).
- Display name = original; storage name = sanitized; both searchable. Donor-provided directory structure preserved inside `data/`; archive arrangement (collection/series) lives in metadata, not by renaming payload.
- USER DECISION: collision-suffix scheme and reserved-character table (defaults proposed above; archive confirms before build).

### P6 — "Test with three good packages" → CORRECTION (discriminating matrix; three good = smoke only)

Three good packages prove the happy path works once. They cannot discriminate any consequential claim in this brief (validation semantics, quarantine, provenance, identify-vs-validate, repair audit, portability). They are retained as the smoke subset of a larger matrix.

Corrected validation plan (all PROPOSED; nothing executed in research — no sandbox claimed, no code run, no service stood up):
- V1 BagIt interop/negatives: dual-hash bags from pinned bagit validate under a second implementation (bagit-java/bagger); one-byte mutation fails naming the exact manifest line; 0.97 single-manifest bag flagged as repair candidate; `fetch.txt` bag quarantined. Discriminates 1.0-rule compliance.
- V2 OCFL round-trip: v1→v2→v3 with dedup; one-byte content corruption reports the exact E-code/version; head/root mismatch detected; concurrent-write guard re-verifies head. Discriminates history integrity.
- V3 Malware gate: EICAR + clean + oversize + nested-archive + password-ZIP fixtures; exit 0/1/2 mapping, `--move` placement, stale-DB fail-closed, `.cvd`/`.cld` acceptance, `certs/` verification path. Discriminates quarantine correctness.
- V4 Provenance countercase: pre-manifest swap (checksum still verifies) vs post-manifest swap (fails); only the event-chain + attestation distinguishes them. Discriminates the checksum-as-provenance fallacy; keeps the B6 countercase open until run.
- V5 Identify/validate split: TIFF-version, PPT/XLS, Broadcast-WAVE fixtures through Siegfried then JHOVE; both PUID and validator verdict recorded, disagreements shown openly. Discriminates identify==validate conflation.
- V6 Repair audit: dirty CSV through OpenRefine ops log → re-apply → re-validate; every preserved change has a PREMIS event. Discriminates repair accountability.
- V7 Portability (if chosen): SWORD BagIt deposit to test DSpace; MinIO SNSD versioning/object-lock round-trip; AWS S3 SDK swap asserted config-only. Discriminates deployment portability.
- Original P6 content retained: the three good packages become the smoke preamble (upload→accept→report→history in under an hour on the reference VM).

## 2. Retained findings, conditions, alternatives (O5)

- Recommended line (Line A): donor client (Exactly pattern) → staged pipeline (ClamAV → BagIt → Siegfried → JHOVE-family → repair loop → OCFL → PREMIS → MinIO/filesystem replication) → human-readable reports. Rationale: cheapest to run, explainable to small donors, interoperable outputs.
- Retained alternative Line B (Archivematica OAIS): transfer→SIP→micro-services→AIP(METS/PREMIS)→DIP to AtoM/ArchivesSpace/DuraCloud/Dataverse. Chosen only if OAIS+access publishing is wanted now; costs documented above.
- Retained alternative Line C (repository deposit): SWORD BagIt deposit into existing DSpace/Fedora; reuses auth/search/access; still needs the pre-deposit quarantine/validation gates.
- Explicitly REJECTED but documented: bare-ZIP + sidecar hash + spreadsheet log (no standard semantics, no event chain); MD5-only new bags; Siegfried-as-validator; silent metadata edits; database-as-truth; checksum-as-provenance.
- Original constraints preserved: small donors (no CLI assumed), staff-legible reports (no bare IDs — every row carries prose, expected/observed, and next step), repeatable history (OCFL versions + PREMIS events + transfer manifest with tool/DB versions), low cost (single VM, open-source tools, SNSD MinIO, S3-compatible exit path).
- Disagreement preserved: MinIO AGPLv3 vs alternatives (SeaweedFS/Garage/RustFS) not fully adjudicated — MinIO kept for S3-ubiquity, alternatives noted for the build decision. Exactly code adoption vs UI rebuild undecided (community-fork maintenance risk) — pattern retained either way.

## 3. Uncertainty (open, not hidden)

1. B6 countercase (preserved unresolved): whether donor-signed manifests plus a transparency log could reduce (not eliminate) event-chain requirements for low-risk collections. Needs V4 plus legal/custody input. Not decided here.
2. Rights/roles for version-creating repairs and retention windows for superseded metadata (archive decision).
3. Collision-suffix and reserved-character tables (archive confirms defaults).
4. SWORD vs custom upload (depends on existing SWORD server); MinIO licensing comfort; AV-coverage depth (MediaConch policies per collection).
5. No usage/billing observed for any source (anonymous public reads); recorded null.

## 4. Validations: executed vs proposed (O6)

- Executed: none. No runtime was available or claimed; no witness ran; no proposal is presented as executed.
- Proposed: V1–V7 above plus the P6 smoke preamble. Each names fixtures, oracles (exact manifest line, E-code, exit code, PUID+verdict pair, PREMIS event presence, config-only swap), and what claim it discriminates. The first build milestone runs V1–V4; V5–V7 follow with the validator routing and deployment choices.

## 5. Low-cost deployment path (conditions)

Reference: one VM (Ubuntu LTS pinned with the Archivematica-avoidance note), Docker Compose or systemd units for `clamd`+`freshclam`, bagit-python service, `sf`+JHOVE workers, OCFL filesystem root + MinIO SNSD bucket, Postgres/SQLite index (derived view), static report UI. Health: `sigtool --info`, `sf -update` vintage, OCFL validator, MinIO console/Prometheus. Swap path: MinIO→AWS S3 config change; filesystem OCFL root rsyncs anywhere; Fedora 6+ later if a repository is wanted. Costs stay at one VM + disks until collections outgrow SNSD, at which point the same MinIO binary scales out.

## 6. Source notes

Discovery evidence: source-map.json S01–S16 (RFC 8493; bagit-python README/issues/commits; OCFL 1.1; ClamAV docs/CVD/releases; Siegfried repo/issues; NLW/DPC identify-vs-validate; Archivematica wiki/dev-stack/install issue; Exactly repo/guide; PREMIS understanding/usecase; OpenRefine/ExifTool workflow; SWORD/DSpace/Fedora; MinIO). Bounded excerpts in sources/ with navigable sources/index.md. IDs immutable; mutable pages bound by URL+access timestamp+locator; no silent rebind. Usage/billing null throughout.
