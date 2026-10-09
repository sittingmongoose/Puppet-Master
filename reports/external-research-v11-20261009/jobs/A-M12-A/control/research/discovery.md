# Discovery — S12 archive-transfer (A-M12-A / control / research)

Scope: regional historical archive receiving files from small donors. Staff needs:
package validation, malware/quarantine separation, understandable rejection reports,
metadata repair, repeatable transfer history — without assuming a checksum proves
provenance. Plus: interoperable tools, competing workflows, implementation/version
conditions, low-cost deployment path.

Method note (M12 control): competent conventional investigator; queries adapted
freely as leads emerged. All findings below were derived from the brief plus
independently chosen public primary sources BEFORE any plan reveal. Source IDs
(S01…) are immutable and mapped in `source-map.json`; bounded excerpts in `sources/`.

No runtime/sandbox was available for witness execution in this pass; every
validation listed here is PROPOSED, none executed. No witness output is claimed.

---

## 1. O1 — Independently discovered tools, products, approaches

### 1.1 BagIt packaging family (transfer-unit standard)

- **BagIt specification, RFC 8493 v1.0 (Oct 2018, Informational).** Hierarchical
  file-layout conventions for storage/transfer of arbitrary content: a "bag"
  encloses descriptive "tags" plus a file "payload" without requiring knowledge
  of payload semantics; "suitable for reliable storage and transfer" [S01].
  Originated 2007 (California Digital Library → Library of Congress web-archive
  transfer); IETF draft by Kunze Dec 2008; LoC explainer video 2009 [S01-secondary].
- **bagit-python** (LibraryOfCongress, single-file module, `pip install bagit`,
  Python 3): donor/staff-side create + validate, CLI and library [S05].
- **Bagger** (Library of Congress, Java desktop): creates/checks bags; LoC used it
  to package Selected Datasets acquisitions for permanent repository storage
  (2020) [S09c]. Counter-signal: SFU glossary marks Bagger "no longer maintained
  or supported" [S09b]. Treat as legacy/fallback, not the default donor recommendation.
- **Exactly / uk-exactly** (AVP, Java, free/open source): sender→recipient
  born-digital transfer app built on BagIt; supports FTP/SFTP plus Dropbox/Google
  Drive sync workflows plus removable media; recipients define metadata templates
  for senders; sends email notifications with transfer data and manifests on
  delivery; Mac + PC [S09d]. Direct-fetch locator UNCERTAIN (see source-map note);
  facts rest on fork README + user-guide + review excerpts, not a confirmed repo read.
- **Signed-bag pointer (shallow):** `harvard-lil/bag-nabit` ("making signed BagIt
  files") appeared as a tooling pointer [S09e]. Not investigated; candidate for
  provenance-adjacent follow-up, not a recommendation.

### 1.2 OCFL storage family (preservation-object standard)

- **Oxford Common File Layout, spec v1.1** (7 Oct 2022, updated 7 Nov 2024;
  eds. Jefferies/Metz/Morley/Warner/Woods; CC-BY 4.0): application-independent,
  transparent, predictable storage of digital objects; five requirements —
  completeness, parsability, versioning, robustness, storage diversity [S02].
  Every object MUST carry root `inventory.json` for the current version; version
  dirs SHOULD carry their own; root copy MUST equal the version-dir copy where
  both exist; digest sidecar is written LAST after all inventory changes [S02/S04].
  Forward-delta versioning; versions immutable once written; fixity baked in so
  validation implements fixity checking [S02, S04-secondary].
- **Validation codes v1.1:** ERROR↔MUST, WARNING↔SHOULD, INFO validator-specific;
  validators MUST validate objects AND storage roots; codes E001… with spec
  anchors (e.g. E001 root contents, E003 exactly-one version declaration,
  E008 version sequence, E009 continuous from 1, E103 monotonic spec versions,
  E106 manifest-is-object, E107 manifest/state key correspondence) [S04].
  These codes are directly reusable as staff-facing rejection-report keys.
- **Implementations (names discovered, shallow):** `ocfl-java` (with upgrade
  guidance + path-validation fix, UW-Madison PR #70), `gocfl` (digest-algorithm
  extensions 0001/0009, controlled vocabulary), `rocfl` (Rust, trycmd fixtures)
  [S03b]. Any of these is a "useful unfamiliar product" candidate for the build;
  version-pinning and API review are follow-up work (see §6).

### 1.3 Repository pipelines (competing workflows)

- **Archivematica (+ Storage Service):** open-source digital-preservation system;
  Transfer tab moves donor material into the pipeline and yields a Submission
  Information Package (SIP); ingest micro-services (normalization, AIP packaging,
  DIP generation) yield Archival Information Packages for long-term storage plus
  Dissemination copies [S06]. Transfer types cover: basic; descriptive/rights/event
  metadata; submission documentation; existing checksums; existing PIDs; manual
  normalization (pre-made derivatives); access-copies-only; service/mezzanine
  files [S06]. Accession number entered at transfer is copied into the AIP METS
  as a registration event (not a search key) [S06].
- **RODA (shallow):** repository with configurable ingest workflow aiming at
  ingest automation; characterization/metadata-extraction tooling; comparison
  literature positions it beside Archivematica/DAITSS/LOCKSS with
  MIME/PRONOM/extension-based identification [S10]. Not deep-dived; retained as
  the "second full-pipeline alternative" for follow-up.
- **Hosted Archivematica (ArchivesDirect/DuraCloud)** [S10b] and commercial
  **Preservica/Rosetta** (names only, from survey literature [S10c]): retained as
  named alternatives with NO verified pricing/feature claims this pass.
- **Lightweight pipeline (synthesized approach, the materially different option):**
  donor-side Exactly/bagit-python → staff-side bagit-python validate → ClamAV
  scan + quarantine dir → Siegfried/DROID identify → OCFL object store (ocfl-java/
  gocfl) → Fixity-class scheduled re-check → S3-compatible backend (MinIO-class).
  No Archivematica needed; each stage is independently re-runnable, which serves
  "repeatable transfer history" without a METS/PREMIS stack. This is the
  low-cost/low-skill default hypothesis (§5); Archivematica is the
  heavyweight alternative.

### 1.4 Format identification / characterization

- **Siegfried** (richardlehane/siegfried, "signature-based file format
  identification"): PRONOM-signature engine, CLI, fast on large batches; used by
  Archivematica's "Identify File Format" micro-service; Archivematica operators
  choose FIDO or Siegfried or extension fallback [S07].
- **DROID** (UK National Archives, PRONOM companion, GUI + batch): best starting
  point per practitioner guidance; Siegfried preferred when GUI tools get slow
  [S07b].
- **JHOVE**: well-formedness/validity + version detail; complements Siegfried
  (see §3.5 TIFF case) [S07c].
- **Known PRONOM-container gap:** ZIP-container formats whose inner signatures
  PRONOM cannot express (worked USDZ example: identified as plain ZIP) [S07d].

### 1.5 Malware / quarantine

- **ClamAV**: `clamd` multithreaded daemon over libclamav configured ONLY via
  `clamd.conf`; `freshclam` signatures required before running; `clamdscan` is a
  thin client that IGNORES most engine options (no engine reconfiguration over
  the socket); `clamscan` for one-shot scans; documented signals SIGTERM/SIGHUP
  (reopen log)/SIGUSR2 (reload db); daemon self-daemonizes (do not `&` it);
  TCP socket is UNAUTHENTICATED — never expose to the Internet [S08].
  Quarantine separation is application architecture (scan → move to quarantine
  dir → report), not a ClamAV built-in; same for "understandable" verdicts.
  Defaults/limits/hard ceiling in §2.4.

### 1.6 Fixity / integrity monitoring

- **AVP Fixity → Fixity Pro:** Fixity = GUI, scheduled checks, email
  alerts/reports, Win/Mac, Apache 2.0, purpose "fixity monitoring for digital
  collections", COPTR status Gone / superseded by Fixity Pro [S09].
  DPC practitioner guidance (2020): GUI Fixity/Bagger or CLI bagit-python for
  checksum workflows; BagIt when bundles move between organisations [S09f].
- **OCFL validation as fixity:** re-validating inventories IS the fixity check
  (digests for every file of every version) [S04-secondary]; scheduled
  re-validation replaces a separate fixity product in the lightweight pipeline.

### 1.7 Metadata repair inputs

- Verified mechanisms: `bag-info.txt` key/value metadata via CLI flags or
  `bag.info` + `save()` [S05]; recipient-defined Exactly sender templates [S09d];
  Archivematica descriptive/rights/event metadata transfer types [S06].
- Dedicated repair/characterization editors (ExifTool-class, MediaConch-class,
  JHOVE output repair loops) were NOT verified this pass and are recorded as
  follow-up candidates, not findings. The honest current repair story: re-quote
  metadata at the bag layer (templates + `bag-info.txt` + re-manifest) and at
  the repository layer (descriptive metadata transfer type), with re-validation
  after every repair.

### 1.8 Low-cost deployment shapes

- **Single-server object store:** MinIO-class S3-compatible server in one
  container (`minio/minio server /data --console-address ":9001"`); same code
  runs against MinIO locally and AWS S3 in production via env vars; known
  gotcha: path-style addressing required for MinIO [S11]. Portable across
  MinIO/AWS/R2/B2/Wasabi/GCS-S3-interop via the S3 API [S11b]. Licensing NOT
  verified this pass — pin and re-check before recommending.
- **Apache-2.0 alternative name:** SeaweedFS all-in-one S3 (`server -s3`)
  replacing MinIO in compose stacks [S11c]. Shallow; follow-up.
- **Indexless Archivematica:** Elasticsearch optional since 1.7; skipping it
  cuts compute/complexity at the cost of Backlog/Appraisal/Archival-Storage
  search tabs [S06c]. Directly relevant to "low-cost" if Archivematica is chosen.

---

## 2. O2 — Primary-source behavior, defaults, limits, applicability

### 2.1 BagIt (RFC 8493): what a validator must enforce

- A bag = payload (`data/`) + tags + manifests; the spec's contract is
  structural + fixity, NOT authenticity: checksums detect loss/corruption in
  transit/storage; they say nothing about who created the bytes [S01 + brief
  constraint]. Any plan clause implying "valid checksum ⇒ trusted donor" is a
  correction target.
- bagit-python maps spec failure modes to typed introspectable errors:
  `BagValidationError.details` entries are `ChecksumMismatch` (with
  path/algorithm/expected/found), `FileMissing`, `UnexpectedFile`; the
  payload-oxum pre-check can catch gross damage before manifest walk [S05].
  Applicability: these three types are the complete vocabulary for the
  "package validation" rejection-report section.

### 2.2 bagit-python governing defaults (consequential)

- Manifest algorithms default: **SHA-256 AND SHA-512 both generated** unless
  flags select otherwise [S05]. Cost implication: double hashing on create;
  keep both for preservation masters, allow SHA-256-only for large donor
  pre-checks (documented local option, not spec).
- `save()` does **NOT** regenerate manifests by default — deliberate guard so a
  metadata-only save cannot accidentally bless an invalid bag; payload changes
  require `save(manifests=True)` (+ optional `processes=N`) [S05]. Any repair
  workflow that edits `data/` MUST pass `manifests=True` and re-validate, or
  the repair silently invalidates the bag.
- `--validate --fast` checks structure + payload-oxum (byte count + file count)
  ONLY — it is a triage shortcut, not a validity proof; full `--validate` walks
  every manifest checksum [S05]. Rejection reports must label fast-mode results
  as preliminary.
- Parallelism: `--processes N` for create and validate [S05]. Units: processes
  are OS processes (multicore), not threads.

### 2.3 OCFL: versioning, inventory, and error vocabulary

- Versioning: new content = new version dir; old versions immutable; spec-version
  sequence across versions must be monotonic (E103) [S03]; version numbers start
  at 1, continuous (E009) [S04].
- Inventory: UTF-8 JSON [S03]; `manifest` block must be a JSON object (E106) and
  every manifest key must occur in ≥1 `state` block (E107) [S03]; sidecar digest
  written last [S02].
- Storage-root + object each declare conformance with EXACTLY ONE version
  declaration file (E003/E076) [S03].
- Applicability to "repeatable transfer history": OCFL gives per-version,
  content-addressed, re-validatable history for free; transfer events
  (quarantine hits, repairs, re-validations) still need an event log alongside
  (OCFL does not define ingest workflow events). Do not oversell OCFL as a
  transfer ledger.

### 2.4 ClamAV: limits that shape quarantine design

- Size/recursion caps (version-drifted — pin version, see §3.4): older default
  MaxFileSize 25M (0.103.8-era manpage [S08b]) vs current-guide 100M, MaxScanSize
  400M, MaxRecursion 16, MaxFiles 10000 [S08c]. Over-limit content is SKIPPED
  unless alerted — the dangerous silent-pass mode.
- **Hard ceiling: files > 2 GB cannot be scanned** ("technical design
  limitations") [S08c]. Donor policy must route >2GB files (common: video oral
  histories!) to an explicit exception lane: hold + staff decision + documented
  non-scan, never a fake "clean".
- ClamAV 1.2: MaxScanSize may exceed 4 GB (default still 2 GB) + new
  `--alert-exceeds-max` / `AlertExceedsMax` to WARN on skipped-over-limit files
  [S08d]. The plan SHOULD require this flag (or version ≥1.2 with it set):
  it converts silent skips into reportable exceptions.
- `clamdscan` cannot reconfigure the engine; all limits live in `clamd.conf`
  on the daemon [S08]. Deployment must version-control `clamd.conf` and
  `freshclam.conf` (signature freshness = detection freshness).
- Socket hygiene: TCP unauthenticated; prefer Unix socket; default Unix-socket
  mode is world-RW (explicitly tighten) [S08/S08b].
- freshclam signatures must exist before `clamd` runs [S08]. Offline/air-gapped
  operation needs a signature-mirror procedure (follow-up detail).

### 2.5 Archivematica transfer/ingest behavior

- Transfer name is REQUIRED and becomes the AIP name; accession number is
  OPTIONAL and lands in AIP METS as a registration event [S06]. Applicability:
  transfer history = transfer records + METS/PREMIS events + Storage Service
  locations; repeatability = re-runnable micro-services + processing-config
  presets [S06].
- Failure handling: ingest errors route to documented error handling; operators
  preconfigure decision points [S06]. Rejection reports map naturally onto
  micro-service failure points (virus scan, format ID, validation).
- Version conditions: 1.16.0+SS 0.22.0 (2024-05-16); 1.17.x on Elasticsearch 6;
  1.18.x on Elasticsearch 8; upgrade tooling FAILS unless the installed ES
  package is 6.x when restoring from 1.17 [S06b]. Pin the pair; never upgrade
  one side. Indexless mode removes ES entirely at the search cost noted [S06c].

### 2.6 Siegfried/DROID/JHOVE applicability

- Choose Siegfried for CLI/batch throughput, DROID for GUI-led small batches;
  both are PRONOM-signature-bound, so BOTH inherit PRONOM's container-signature
  gaps (USDZ→ZIP mis-ID) [S07d]. Format-ID "unknown" or "generic container" is
  a REPORTABLE outcome (quarantine-adjacent: hold for staff), not an error.
- Siegfried does not differentiate some format versions (proven TIFF case:
  passed DROID+JHOVE manual checks, failed Archivematica Siegfried ID; site
  added JHOVE CLI to recover version detail) [S07c]. Rule: version-sensitive
  policy (e.g. "TIFF ≥ v6") must consult JHOVE-class characterization, not
  Siegfried PUID alone. Extension-based ID is the documented last resort [S07].

### 2.7 Checksum ≠ provenance (brief's core constraint, evidenced)

- What checksums + BagIt/OCFL prove: bit-level integrity and attendance across a
  handoff [S01/S09f/S04-secondary]. What they CANNOT prove: donor identity,
  pre-bag tampering, or descriptive-metadata truth.
- Provenance substitutes evidenced this pass: submission documentation transfer
  type [S06]; accession-number registration events in METS [S06]; Exactly
  sender/recipient handshake + emailed manifests [S09d]; OCFL immutable
  version history (post-ingest chain, not pre-ingest proof) [S02].
- Consequence for design: every accepted transfer needs a provenance record
  (who/when/how-received + submission docs + scan/ID/validation verdicts)
  stored WITH the object; checksums are one field in it, not the verdict.

---

## 3. O3 — Issue / fix / regression / evolution chains

### 3.1 OCFL v1.0 → v1.1.0 → v1.1.1 (primary chain; exact issues)

Minor-version (semver) correction/clarification release [S03]:
- #544 → new "Conformance of prior versions" section: version dirs immutable,
  spec-version sequence monotonic (new E103).
- #581 → exactly-one conformance declaration per object/root (E003/E076 updated).
- #514 → inventory MUST be UTF-8 JSON.
- #541 → version-naming consistency reframed as at-rest property, not process.
- #537 → manifest-is-object (E106) + manifest/state key correspondence (E107).
- v1.1.0 → v1.1.1: further corrections (page updated 7 Nov 2024; item list
  truncated in retrieval — recorded as PARTIALLY observed, not fully enumerated).
- Ecosystem echo: gocfl digest-algorithm extensions 0001/0009 with controlled
  vocabulary [S03b]; ocfl-java path-traversal validation fix (PR #70) [S03b].
- Lesson for plan: pin OCFL 1.1 + validator version; E-code-keyed rejection
  messages must cite the validator + spec version (codes shifted between 1.0/1.1).

### 3.2 AVP Fixity → Fixity Pro (supersession chain)

Open Fixity (Apache 2.0, Win/Mac GUI, scheduled checks, email alerts) is COPTR
"Gone", superseded by Fixity Pro [S09]. Lesson: do NOT plan around the open
Fixity binary without verifying Fixity Pro's license/cost/API; the safer
default is scheduled OCFL/bag re-validation (summarized §1.6), with Fixity Pro
as an evaluated option.

### 3.3 Archivematica search-index evolution (regression hazard)

Elasticsearch optional since 1.7 (indexless mode) [S06c]; 1.17↔ES6 vs 1.18↔ES8
split with automated upgrade refusal on version mismatch [S06b]. Lesson: the
"deploy latest" reflex REGRESSES a running 1.17 site unless ES is migrated in
lockstep; low-cost sites should default to indexless unless staff search is
proven necessary.

### 3.4 ClamAV silent-skip → explicit-alert (1.2 fix chain)

Before: over-limit/over-recursion content silently unscanned under default caps
(MaxFileSize/MaxScanSize/MaxRecursion/MaxFiles) [S08c]. 1.2: MaxScanSize may
exceed 4GB (default still 2GB) + `AlertExceedsMax`/`--alert-exceeds-max` warns
on skipped files [S08d]. Persistent limit: >2GB files unscannable by design
[S08c]. Lesson: version ≥1.2 + alert flag + >2GB exception lane are jointly
required; absence of any one reintroduces silent-pass risk.

### 3.5 Siegfried TIFF-version case (identification gap → workaround)

NLW workflow: collection passed DROID+JHOVE manual checks; one TIFF failed
Archivematica's Siegfried micro-service because Siegfried doesn't split TIFF
versions; site modified pipeline to run JHOVE CLI for version detail [S07c].
Companion gap: PRONOM container signatures cannot express USDZ (→ZIP) [S07d].
Lesson: format policy must name the TOOL + SIGNATURE VERSION + fallback order
(Siegfried → JHOVE → extension + human), and "identified as generic ZIP" must
not auto-pass.

### 3.6 Donor-tooling succession: Bagger → Exactly (UX evolution)

Bagger (LoC Java desktop): established, LoC-internal use into 2020 [S09c], but
"no longer maintained or supported" per SFU [S09b]. Exactly (AVP): easier
sender UX, sync-service + removable-media paths, sender metadata templates,
delivery email with manifests [S09d]. Lesson: recommend Exactly-class (or
bagit-python CLI for capable donors) for NEW donor onboarding; keep Bagger
knowledge for legacy bags only. (Exactly locator confidence: medium — §1.1 note.)

### 3.7 Absent/inapplicable evidence (honest negatives)

- No CVE/regression record was pulled for ClamAV, bagit-python, or Siegfried
  this pass (time-boxed; not "none exist").
- No current release number verified for bagit-python master, Siegfried
  signature set, or MinIO licensing; all "current version" claims would be
  guesses and are withheld.
- No Fixity Pro feature/price evidence; no RODA deep evidence; no JHOVE/
  MediaConch/ExifTool primary reads. Each is a named follow-up, not a finding.

---

## 4. Competing-workflow comparison (carries into draft)

| Dimension | Heavyweight: Archivematica full pipeline | Lightweight: BagIt+OCFL+ClamAV+Siegfried | Hosted (ArchivesDirect/Preservica-class) |
|---|---|---|---|
| Transfer in | Transfer tab → SIP, typed transfers [S06] | Exactly/bagit-python bags, email manifests [S05/S09d] | Vendor uploader (unverified) |
| Validation | Micro-services + error handling [S06] | bagit-python typed errors; OCFL E-codes [S05/S04] | Vendor (unverified) |
| Malware | (集成 scan step; config unverified here) | clamd + quarantine dir + >2GB lane (§2.4) | Vendor (unverified) |
| Format ID | Siegfried micro-service [S07] | Siegfried → JHOVE → human (§2.6) | Vendor (unverified) |
| History | METS/PREMIS + Storage Service [S06] | OCFL versions + event log (§2.3) | Vendor (unverified) |
| Search | ES or indexless [S06c] | Filesystem/S3 + future index (gap) | Vendor (unverified) |
| Cost/effort | Server + ops skill + ES care (§3.3) | Single host + containers, low skill floor (§1.8) | Subscription (unverified) |
| Best fit | Multi-staff, normalization-heavy | THIS brief: small donors, small staff | No-ops staff (if budget allows) |

Standing recommendation hypothesis (pre-reveal): lightweight as default,
Archivematica where normalization + METS/PREMIS + multi-seat workflow justify
it, hosted only after a priced trial. RODA as the second full-pipeline name to
evaluate before committing to Archivematica.

---

## 5. Rejection-report + metadata-repair + history sketches (pre-reveal)

- **Rejection report vocabulary (all evidenced):** BagIt `ChecksumMismatch(path,
  algorithm, expected, found)` / `FileMissing` / `UnexpectedFile` [S05]; OCFL
  E-codes + spec anchors [S04]; ClamAV verdicts + exceeds-max alerts + >2GB
  non-scans [S08/S08d]; Siegfried unknown/generic-container + version-gap flags
  [S07c/S07d]. Staff view: code + tool + tool-version + signature/spec version +
  file path. Donor view: plain-language sentence + what-to-do-next + resubmit path.
- **Metadata repair loop:** template at send (Exactly) → `bag-info.txt` edit +
  `save()` (metadata-only) or `save(manifests=True)` + re-validate (payload
  touched) [S05/S09d] → repository-layer descriptive metadata top-up (typed
  transfer) [S06] → every repair re-runs validation + appends event. Never
  repair-then-ship without re-validation (§2.2 guard).
- **Repeatable history:** store per transfer: bag manifests + validation logs +
  scan verdicts + ID reports + repair events + provenance record (§2.7), then
  version the preserved result in OCFL (lightweight) or AIP/METS (heavyweight).
  Re-running validation later must reproduce the same verdicts or explain drift
  (tool/signature version recorded each run).

---

## 6. Candidate discriminating validations (PROPOSED — none executed)

Executed checks this pass: NONE (no sandbox; web-primary research only).
Proposed, each capable of changing a recommendation:

- V1 BagIt round-trip: `make_bag` → corrupt one payload byte → `validate()`
  must raise `ChecksumMismatch` naming path/algorithm/expected/found; `--fast`
  on the same bag must PASS (proves fast-mode is triage-only). Discriminates
  report wording + fast/full policy.
- V2 Repair-guard: metadata-only `save()` on an invalid bag must NOT bless it;
  `save(manifests=True)` after payload edit must restore validity. Discriminates
  repair-loop correctness.
- V3 OCFL E-code mapping: feed fixtures violating E003/E009/E106/E107 to the
  pinned validator; assert exact codes returned. Discriminates rejection-report keys.
- V4 ClamAV lanes: EICAR test file → detected + quarantined; crafted over-limit
  archive with `AlertExceedsMax` → alert (not silent pass); >2GB file → routed
  to exception lane with non-scan record. Discriminates quarantine design.
- V5 Format-ID fallback: TIFF-version-sensitive sample through
  Siegfried → JHOVE → human; container-format sample (ZIP-based) asserting
  non-blanket-pass. Discriminates ID policy wording.
- V6 Deployment smoke: single-host compose (validator + clamd/freshclam +
  OCFL store + S3-compatible backend) ingesting 3 donor bags end-to-end with
  twice-run validation reproducing verdicts. Discriminates lightweight-vs-
  Archivematica recommendation on real effort numbers.
- V7 Provenance record: accept a bag with valid checksums but missing/weak
  submission docs; assert system still flags provenance-INCOMPLETE (checksum≠
  provenance). Discriminates the brief's core constraint implementation.

## 7. Uncertainty register (pre-reveal)

- U1 Exactly canonical repo URL (medium confidence; §1.1).
- U2 Current release numbers: bagit-python, Siegfried engine + PRONOM snapshot,
  ocfl-java/gocfl/rocfl, MinIO + its license, ClamAV latest.
- U3 Fixity Pro cost/features/API; RODA depth; JHOVE/MediaConch/ExifTool roles.
- U4 OCFL v1.1.0→v1.1.1 item list (partially observed).
- U5 Archivematica virus-scan/formal-ID micro-service configuration details
  (transfer doc observed; admin micro-service config not read).
- U6 Signature-update cadence + offline-mirror procedure for ClamAV/PRONOM.

---

*Frozen pre-reveal content ends here. Per-P comparison follows in `draft.md`
after `reveal-plan.py` + `revealed-plan.md`. This file must not be rewritten
after reveal.*
