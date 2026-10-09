# ER11 S12 archive-transfer — discovery (pre-reveal)

Case: S12 archive-transfer. Stage: treatment/research. Block A-M12-A. Method M12 v1 adaptive-evidence-state-branching.
Written: 2026-10-09T18:57:00Z. Evidence kind: full-discovery.
Scope: brief alone (O1–O6). Plan not read. No predecessor. Source roots: none declared; all sources independently chosen public primary sources.

## 0. M12 branch ledger (parent–child search states)

Propositions are tied to product recommendation, applicability, plan correction, or useful alternative. After each retrieval the branch records supported / refuted / conditional / unknown transitions, new conditions / options / duplicates. Next-retrieval attention follows observed state change per minute: +4 consequential proposition transition, +2 new applicability condition, +2 viable alternative, −2 duplicate. One unresolved countercase branch plus obligation/alternative coverage floor are preserved; zero-change branches pause only after all mandatory coverage is accounted for.

| Branch | Proposition (initial) | Retrievals → transitions | End state |
|---|---|---|---|
| B1 package validation: BagIt RFC 8493 suffices for donor handoff validation | RFC page + bagit-python docs → supported for transfer/validation; OCFL spec → conditional (BagIt has no versioning/history) | CONDITIONAL: BagIt for handoff, OCFL for stored history |
| B1a child: bagit-python defaults are safe to adopt as-is | README evolution MD5-default → SHA256+SHA512-default; issue #86 + #158 → transition | CONDITIONAL: pin ≥1.9, set SHA512 explicitly, expect hashlib flag surface |
| B2 malware/quarantine: ClamAV at transfer meets low-cost need | docs.clamav.net features + configuration + CVD/faq + release notes → supported with conditions | CONDITIONAL: clamd+freshclam+quarantine dir; on-access prevention off by default; archive-bomb limits required |
| B3 format ID: Siegfried/PRONOM preferred over DROID for pipeline | Siegfried repo/wiki + PRONOM/DROID comparisons + NLW TIFF note → supported for ID, refuted as sole validator | SPLIT: Siegfried=identify, JHOVE/veraPDF/Jpylyzer/MediaConch=validate |
| B4 metadata repair: ExifTool→CSV→OpenRefine loop covers staff repair | OpenRefine/ExifTool/archival workflows + PREMIS docs → supported | SUPPORTED with condition: templates + logged transforms, PREMIS event per repair |
| B5 suite choice: full Archivematica overkill; lightweight line better for small donors | Archivematica wiki/docs/hack README + install issue #1766 + AtoM/SWORD docs + Exactly guide/repo → conditional | CONDITIONAL: Exactly-style donor client + server micro-pipeline; Archivematica-compatible outputs (BagIt/METS/PREMIS), optional SWORD deposit to DSpace/AtoM |
| B6 countercase (PRESERVED UNRESOLVED): checksum+signed manifest could suffice for provenance without event chain | PREMIS understanding/data-model + fixity-event notes + BagIt tagmanifest semantics → checksum proves integrity-at-time, not custody/intent; signed manifest narrows but does not close gap | UNKNOWN/CONDITIONAL, deliberately unresolved: seek discriminating validation V4 |
| B7 low-cost deployment: single-VM Compose + S3-compatible store viable | MinIO docs + Archivematica system requirements + storage-service install → supported | SUPPORTED with condition: SNSD MinIO + filesystem OCFL root, swap path to AWS S3 later |
| B8 transfer history: OCFL inventory chain gives repeatable history | OCFL 1.1 spec + validation codes + implementation notes → supported | SUPPORTED: inventory.json+sidecar per version, vN dirs, head pointer, no-gap rule |

Attention trace (qualitative, per M12 weights): B1→B1a transition (+4) plus new SHA-default condition (+2) kept BagIt attention high until OCFL alternative (+2) forked B8. B2 yielded two conditions (freshclam cadence, quarantine/move semantics) (+4) so it retained attention through CVD-signing retrieval. B3 yielded viable-alternative split (JHOVE family) (+2) and a refutation of identify==validate (+4), the largest single-step change, which pulled the next retrieval into validation tools. B6 produced no transition for two retrievals (−2 duplicate risk) but is preserved by rule as the unresolved countercase. No branch was paused before O1–O3+O6 coverage floor was met.

## 1. O1 — useful unfamiliar tools, products, materially different approaches

Brief asks for package validation, malware/quarantine separation, understandable rejection reports, metadata repair, repeatable transfer history without checksum-as-provenance, plus interoperable tools, competing workflows, version conditions, low-cost deployment.

### 1.1 Interoperable core (recommended line)

1. **BagIt 1.0 (RFC 8493) for handoff.** Hierarchical file layout: `data/` payload + tag files (`bagit.txt`, `bag-info.txt`, manifests). Payload manifests list checksums; tag manifests optionally cover tags. Validation = every payload file listed in every payload manifest (1.0 rule), every checksum recomputes, required elements present. Interoperable with DSpace/Fedora/Archivematica. Limitations: no versioning, no dedup, no locking; `fetch.txt` allows remote-file bags (must decide allow/deny).
2. **OCFL 1.1 for stored/preserved history.** Application-independent preservation layout. Object root has NAMASTE `0=ocfl_object_1.1`, root `inventory.json` + `inventory.json.<digest>` sidecar, sequential version dirs `v1..vN` (no gaps), each with its own inventory+sidecar and `content/`. `inventory.json` carries `head`, `manifest` (digest→content paths, enabling dedup/forward-delta), `fixity`, `type: https://ocfl.io/1.1/spec/#inventory`. Write order is content → version inventory+sidecar → root inventory+sidecar last; digest computed only after all inventory changes (validation code E062). No built-in locking: serialize writers externally and re-verify `head`. Validation codes E001–E112 / W001–W016 give machine-checkable rejection reasons. Works on filesystem or S3-style storage. This is the repeatable-history answer BagIt cannot give.
3. **ClamAV (clamd + freshclam + clamscan) for malware/quarantine.** GPLv2 toolkit: multithreaded daemon, CLI scanner, signed CVD signature databases, bytecode runtime (LLVM or interpreter), broad archive/format parsing (Zip/RAR/7z/Tar/Gzip/Bzip2/DMG/ISO/OLE2/OOXML/PDF/HTML/RTF/PE/ELF/Mach-O/mail formats, etc.) with archive-bomb protection. Quarantine via `clamscan --move=/quarantine/dir` (or `--remove`); daemon configs separate scan from milter. `freshclam` handles CVD + incremental `.cdiff` + external `.sign` verification; certs dir `<prefix>/etc/certs`. Interoperates as a pre-ingest gate: scan → infected/quarantine vs clean/ingest, record PREMIS virus-check event either way.
4. **Siegfried (`sf`) + PRONOM for format identification.** Go tool, `go install .../cmd/sf@latest` then `sf -update` to fetch latest PRONOM signature file (`default.sig`, built from `DROID_SignatureFile_Vnnn.xml` + `container-signature-YYYYMMDD.xml`) into per-user `siegfried/` dir. Uses byte + container signatures; `roy` builds custom signature files (MIME-info/LOC signatures, buffer limits). Default has no buffer limits (may full-scan). Output YAML/JSON/CSV with `siegfried`, `scandate`, `signature`, `created`, `identifiers`, per-file `ns: pronom`, `puid` (e.g. fmt/59), `format`, `mime`. DROID-like priorities applied after identification. Interoperable identifier: PUID.
5. **JHOVE family for validation (not just identification).** Siegfried/DROID/FIDO identify; they do not validate well-formedness. Use JHOVE (well-formed/valid/neither, ~14 formats incl. TIFF/PDF/WAVE), veraPDF (PDF/A conformance), Jpylyzer (JP2), DPF Manager (TIFF), MediaConch (AV policy checking). National Library of Wales case is the discriminator: files passed DROID+JHOVE manual check but failed Archivematica's Siegfried identify step because Siegfried does not differentiate TIFF versions; fix was to add CLI JHOVE for version discovery. Design rule: identify with Siegfried, validate version-sensitive formats with JHOVE-family, report both.
6. **ExifTool + OpenRefine + CSV templates for metadata repair.** ExifTool reads/writes/edits embedded metadata, exports CSV; OpenRefine facets/cleans/reconciles CSV, logs transforms; Excel/hand review for final pass. Archival pattern: ExifTool inventory → OpenRefine cleanup → controlled CSV template → re-embed or sidecar. Keep transform log as PREMIS event detail.
7. **PREMIS 3 + METS + Dublin Core for preservation metadata and history.** PREMIS entities Object/Event/Agent/Rights; fixity = checksum + algorithm on Object; every consequential action (ingest, virus check, identification, validation, fixity check, transformation, replication, accession) is an Event with outcome, date, agents (softwareAgent e.g. `hashlib.sha256`, human). Message-digest calculation itself is an Event that generates a Fixity. METS wraps, Dublin Core describes. Transfer history = ordered PREMIS events + OCFL version chain, not a checksum column.
8. **Exactly (AVPreserve/Nunn Center, now community `uk-exactly`) for donor-side capture.** Simple donor app: creates validated BagIt packages at source, transfers via FTP/Dropbox/Drive/USB/hard-drive, archives-side quick BagIt validation on receipt. Fits small donors better than asking them to hand-roll bags. Note lineage: Gates Archive → AVPreserve + Nunn Center; original `avpreserve/uk-exactly` link rotted, community fork `galabs/uk-exactly`; user guide v0.1. Treat as donor-client pattern even if rebuilding UI.
9. **SWORD v2/v3 as deposit-protocol alternative.** AtomPub-profile CRUD deposit (Create/Retrieve/Update/Delete) into DSpace/EPrints/Fedora; mediated deposit (`on-behalf-of`) lets staff deposit for donors without donor accounts; v3 has explicit BagIt package support. Useful if the archive already runs DSpace/AtoM: donor service can SWORD-deposit SIPs instead of inventing an upload API.
10. **MinIO (SNSD) + local filesystem as low-cost store.** Single statically linked Go binary, no external DB, S3 SigV4 API, erasure coding, bitrot detection, at-rest/in-transit encryption, bucket versioning, object locking (WORM), embedded console, Prometheus `minio_*` metrics. SNSD (single-node single-drive) runs on one VM; same binary scales to distributed. Any S3 SDK/tool works unchanged, so later migration to AWS S3 is a config change. AGPLv3. Pair with OCFL storage root on filesystem for transparency plus MinIO bucket for replication/access.

### 1.2 Competing workflows (three materially different lines)

- **Line A — lightweight pipeline (recommended for this brief).** Exactly-pattern donor client → HTTPS upload to quarantine staging → ClamAV gate → BagIt validate (bagit-python) → Siegfried identify → JHOVE-family validate → ExifTool/OpenRefine repair loop → OCFL version commit → PREMIS event log → MinIO/filesystem replication → human-readable rejection/acceptance report. Cheapest to run, easiest to explain to donors, Archivematica-compatible outputs without running Archivematica.
- **Line B — Archivematica OAIS suite.** Transfer → SIP → micro-services (virus scan, identify, validate, normalize) → AIP (METS/PREMIS) → DIP to AtoM/ArchivesSpace/DuraCloud/Dataverse via Storage Service. Strengths: standards compliance, preservation planning, access integration. Costs: Dashboard + Storage Service + dependency stack, ~50 GB baseline, Ubuntu-server comfort, Docker/Ansible install fragility (see O3). Right answer only if the archive wants full OAIS + access publishing now.
- **Line C — repository-deposit line.** Donor web form → SWORD deposit into DSpace/Fedora (BagIt+ORE package) → repository ingest pipeline → OCFL persistence (Fedora 6+ is OCFL-native). Strengths: reuses repository auth/search/access. Costs: repository must exist and be SWORD-capable; quarantine/validation still needed pre-deposit.

Retained alternative that loses but stays documented: bare Zip + sidecar SHA256 manifest + spreadsheet log. It is the cheapest thing donors already do, but it has no standard validation semantics, no tag/payload distinction, no PREMIS mapping, and Zip-slip/encoding pitfalls. Keep as explicitly rejected fallback with a migration note, not as a silent option.

## 2. O2 — consequential primary-source / code behavior, defaults, units, limits, applicability

### 2.1 BagIt 1.0 (RFC 8493) + bagit-python

- **Required elements / validity.** `bagit.txt` (version+encoding declaration), `data/` payload dir, at least one payload manifest (`manifest-<alg>.txt`). A valid bag meets all MUSTs: every payload file listed in **every** payload manifest (changed at 1.0; 0.97 allowed listing in just one), every checksum in every payload and tag manifest validates, required files parse. Tag manifests (`tagmanifest-<alg>.txt`) are optional; when present, listed tag files MUST checksum-validate but their contents are otherwise ignored by validators.
- **Algorithms.** Spec: tools MUST support SHA-256 and SHA-512, SHOULD enable SHA-512 by default for new bags; SHOULD support MD5/SHA-1 for backwards compat. bagit-python current README: `--md5/--sha1/--sha256/--sha512` flags, **SHA256 and SHA512 generated by default** (`DEFAULT_CHECKSUMS = ["sha256","sha512"]`); older README defaulted MD5. Implication: pin behavior explicitly (`--sha512` minimum; dual SHA256+SHA512 matches current default and spec SHOULD).
- **Units/types.** Manifest lines: `<checksum-hex> <path>`; paths are relative, UTF-8; bagit.txt declares `BagIt-Version: 1.0` + `Tag-File-Character-Encoding: UTF-8`. `bag-info.txt` is `Tag: value` pairs (contact, source-org, dates). No integer-size field semantics to misread; sizes come from filesystem.
- **Exceptions/limits.** No versioning (re-bag = new bag, no chain). No dedup. No atomicity/locking. `fetch.txt` remote-file bags shift fixity to retrieval time — applicability condition: **deny `fetch.txt` for donor handoff** or quarantine until fetched bytes validate. Encoding mismatches and CR/LF vs LF in manifests are classic interop failures; rejection report must name the exact manifest line.
- **Applicability.** Use for handoff validation and donor/transfer interchange. Do NOT use as the preservation-history store; that is OCFL's job.

### 2.2 OCFL 1.1

- **Layout/behavior.** Object root: `0=ocfl_object_1.1` (NAMASTE), root `inventory.json` + sidecar `inventory.json.<ALG>`, `v1/`, `v2/`, … each with `inventory.json`+sidecar and `content/`. `inventory.json`: `id`, `type`, `digestAlgorithm`, `head` (e.g. `v3`), `manifest` (digest→[content paths across versions]), `versions` (per-version state), `fixity` (additional algorithms). Content files with already-known digests are not rewritten (dedup/forward-delta); new files go under new `vN/content/`.
- **Write/locking.** Spec has no locking. Required order: new version content → new version inventory+sidecar → replace root inventory+sidecar last; inventory digest computed only after all inventory edits (E062). Writers must serialize externally and re-verify `head` before commit. Sidecar algorithm follows `digestAlgorithm` (commonly SHA512).
- **Validation.** Machine codes E001–E112 errors, W001–W016 warnings; validators check no-gap versions, head/root agreement, every manifest digest recomputes, sidecar matches. These codes map directly to rejection-report rows.
- **Limits.** JSON inventory grows with versions; very large objects need inventory hygiene (storage-root layout `ocfl_layout.json`, extension `0005-hierarchical-layout` for sharding). Human-readability is a goal but large inventories are machine-first.
- **Applicability.** Use for preserved store + repeatable transfer history. Pairs with BagIt: accept BagIt, persist OCFL, record both in PREMIS.

### 2.3 ClamAV (clamd / clamscan / freshclam)

- **Components.** `clamd` multithreaded daemon + `clamdscan` client; `clamscan` standalone CLI; `freshclam` updater; `clamav-milter` for mail (not needed here); `sigtool --info` inspects CVD. Configs: `freshclam.conf`, `clamd.conf` (source installs ship `.example`/`.sample`; `clamconf -g <name>` generates; delete `Example` line).
- **Governing defaults/limits (applicability conditions).** On-access prevention exists (Linux only, via ClamOnAcc) but blocking on scan/connection error defaults off — do NOT rely on on-access for quarantine; use explicit pre-ingest scan gate. Archive scanning enabled per-format (Zip/RAR/7z/Tar/OLE2/OOXML/PDF/HTML/PE/ELF/Mach-O…); archive-bomb protection enforced via `MaxScanSize`/`MaxFileSize`/`MaxRecursion`/`MaxFiles`/`StreamMaxLength` family — must size for donor media (set and document; oversize = quarantine+report, not silent skip). No per-scan CPU/memory throttle beyond those scan limits; schedule scans and cap threads (`MaxThreads`) to VM size. Default action is report-only: `clamscan` does NOT remove/quarantine unless `--remove`/`--move=` given — pipeline must pass `--move=$QUARANTINE_DIR` explicitly and treat exit codes (0 clean, 1 infected, 2 error) as distinct outcomes.
- **Signatures/updates.** Signed CVD databases (`main.cvd`, `daily.cvd`, `bytecode.cvd`); `freshclam` pulls full CVD then incremental `.cdiff`, now plus external `.sign` verification files and `<prefix>/etc/certs` dir (see O3). Recommended `DatabaseMirror database.clamav.net` + `DNSDatabaseInfo current.cvd.clamav.net`, up to 4 checks/hour. After incremental update, `.cvd` may become `.cld` — presence tests must accept either.
- **Quarantine separation.** Recommended: `incoming/` (untrusted, noexec), `quarantine/` (infected+oversize+error, separate UID/perms, no auto-retry into ingest), `clean/` (ingest staging). Record virus-check PREMIS event with signature versions (`sigtool --info` daily/main/bytecode versions) for repeatability.

### 2.4 Siegfried + PRONOM (+ roy)

- **Behavior.** `sf -update` fetches latest `default.sig` (PRONOM byte+container signatures, no buffer limits → may full-scan large files). `sf file|dir|glob` emits identification with `puid`/`format`/`mime`, `signature: default.sig`, `created` timestamp, `identifiers: [{name: pronom, details: DROID_SignatureFile_Vnnn.xml; container-signature-YYYYMMDD.xml}]`. Container signatures take precedence over byte signatures unless `--doubleup`. Priorities applied after identification for DROID-like results.
- **Limits.** No version-level TIFF discrimination (see O3 NLW case); container-signature gaps for newer Office variants; full-scan cost on large AV without custom `roy`-built signature file with buffer limits. `roy build -extend` allows custom signatures for local formats.
- **Applicability.** Canonical identification step; always pair with validation step (JHOVE family) and record signature-file versions in every report (identification without `created`+`DROID_SignatureFile` version is non-repeatable).

### 2.5 JHOVE / veraPDF / Jpylyzer / MediaConch / DPF Manager

- **JHOVE:** well-formed and valid per-format modules (~14 formats); maintained by Open Preservation Foundation. Use for TIFF/WAVE/PDF version discovery and well-formedness. CLI exit + XML/JSON output map to rejection rows.
- **veraPDF:** PDF/A conformance (fixes JHOVE PDF gaps). **Jpylyzer:** JP2 validation. **DPF Manager:** TIFF policy validation. **MediaConch:** AV/matroska policy checking. Applicability: run by PUID routing (fmt/ TIFF → JHOVE+DPF; PDF → JHOVE+veraPDF; JP2 → Jpylyzer; MKV/MOV → MediaConch), not blanket-every-file.

### 2.6 ExifTool + OpenRefine + PREMIS events

- **ExifTool:** read/write embedded technical/descriptive metadata, batch via CSV/JSON (`-csv`, `-j`), `-overwrite_original` semantics, `-tagsfromfile @` repair pattern. Must scope writes (`-all:all` vs targeted tags) and preserve `icc_profile`/makernotes deliberately.
- **OpenRefine:** faceting/clustering/reconciliation over CSV; every transform logged (extract operation history into PREMIS event detail). Risk: silent mass edits — mitigation is template + review + logged history, never direct hand-edit of preserved bytes.
- **PREMIS fixity/provenance semantics.** Fixity (checksum+algorithm) is an Object property; every computation/verification is an Event with agents and outcome. Virus check, identification, validation, ingest, replication, transformation are distinct event types. Provenance = ordered event chain + agents + rights, not a hash. A checksum that verifies only proves the bytes match the manifest at verification time; it says nothing about who supplied them, whether they were swapped before manifesting, or what happened between transfers.

### 2.7 SWORD / DSpace / Fedora / MinIO / storage

- **SWORD v2:** AtomPub CRUD; collection IRI deposit (`POST entry.xml` metadata-only or multipart with bitstreams); `On-Behalf-Of` mediated deposit. v3 adds explicit BagIt packaging. Applicability: only if a SWORD server exists; otherwise custom upload + BagIt validate is simpler.
- **Fedora 6+:** OCFL-native persistence; versioning/restrictions lifted (any file type/size, any metadata model). Relevant as a later migration target, not day-one for a small archive.
- **MinIO SNSD:** single binary, S3 API, `MINIO_ROOT_USER/PASSWORD`, console + API ports, `mc` client; bucket versioning + object locking for WORM-like retention; lifecycle rules for tiering. Limits: AGPLv3 obligations; single-drive SNSD has no erasure redundancy — replicate OCFL root to second disk/bucket and verify.

## 3. O3 — issue / fix / regression / release / evolution chains

Three independent chains investigated; each carries a version condition for the build.

### Chain 1 — bagit-python default-hash evolution (+ hashlib surface regression)

- **Before:** README/CLI default MD5 (`MD5 is generated by default`). Issue `LibraryOfCongress/bagit-python#86` “Change the default hash algorithms” argues MD5 is unfit and new bagit-java generates multiples.
- **Fix:** commit `81a6123` changes default list to SHA-256 and SHA-512 and derives supported flags from `hashlib`, making future upgrades easier. Current README: `--md5/--sha1/--sha256/--sha512` flags, “SHA256 and SHA512 are generated by default.” RFC 8493 later codifies MUST-support SHA-256/512, SHOULD-default SHA-512, SHOULD-support MD5/SHA-1 for backwards compat; 1.0 also tightens every-payload-file-in-every-manifest (breaks some 0.97 bags — see uts-eresearch/datacrate#34 forward-compat note).
- **Regression открыть:** issue `#158` “Hashlib paradigm inconsistent with BagIt spec, but also causing runtime errors”: deriving flags from `hashlib` exposes non-BagIt algorithms (`shake_*`, `blake2*`, `sha3_*`) in `--help` and can produce bags other tools reject; runtime errors on some Python versions (reported 3.9.6). Downstream `bdbag 1.8.0` pins `bagit 1.9.0`, drops Python <3.8.
- **Build condition:** pin `bagit>=1.9,<2` on Python ≥3.8; invoke with explicit `--sha512` (or dual sha256+sha512); never pass exotic hashlib flags; validate with `--validate` and treat 0.97-era single-manifest bags as repair candidates, not valid 1.0.

### Chain 2 — Siegfried mis-identification + TIFF-version gap (identify ≠ validate)

- **Mis-ID:** `richardlehane/siegfried#52` PPT identified as XLS (`fmt/59`) via byte signature when container signature should win. Fix: don't include byte signatures where container signatures exist unless `-doubleup` given (commit `f7fedf6` family + CHANGELOG entry); priorities applied after identification for DROID-like results (issue #146 follow-up).
- **Persistent gap:** Siegfried does not differentiate TIFF versions. National Library of Wales workflow: files passed DROID+JHOVE manual checks yet failed Archivematica's Siegfried identify microservice because NLW standards require a TIFF version; resolution was to run CLI JHOVE over such files to discover the version. Related PRONOM-side reports (fmt/199 h264/aac; Broadcast WAVE fmt/142 vs fmt/704 depending on DROID max-byte-scan 65535 vs 10 MB vs NOLIMIT) show identification depends on signature-file version + scan limits.
- **Build condition:** record `siegfried`, `signature`, `created`, `DROID_SignatureFile_Vnn`, `container-signature-YYYYMMDD` in every report; route TIFF/WAVE/PDF/JP2/AV to JHOVE-family validators; never treat `siegfried-only` as validation.

### Chain 3 — ClamAV signature-trust + freshclam staleness/presence bugs

- **Trust evolution:** ClamAV 1.5.0 adds CVD signing/verification with external `.sign` files; `freshclam` downloads `.sign` alongside `.cvd`/`.cdiff`; `sigtool` gains sign/verify; installer lays down `<prefix>/etc/certs` (CMake `CVD_CERTS_DIRECTORY`). This is the fixity story for the malware defense itself: signatures are only trusted if verified.
- **Operational bugs:** presence checks that test only `main.cvd` break after incremental update converts `.cvd`→`.cld` (fixed in iredmail/s6 packaging by accepting either; `freshclam` stages in temp dir then renames, so no interlock needed). Stale-DB failures recur when `freshclam` timer/service not enabled (openSUSE/YaST, Debian `dpkg-reconfigure clamav-freshclam` notes) or when old `freshclam.conf` lacks `DatabaseMirror`/`DNSDatabaseInfo` (max 4 checks/hour guidance).
- **Build condition:** enable and monitor `clamav-freshclam` timer/service; assert `sigtool --info` versions in pipeline preflight; accept `.cvd` or `.cld`; ship `certs/` dir; quarantine on updater failure (fail-closed) rather than scanning with stale DB silently.

### Chain 4 (supporting) — Archivematica install fragility as version condition

- `archivematica/issues#1766`: three of four install paths fail on Ubuntu Noble 24.04 (Ansible doc path, Docker Compose `hack/` dev stack on `qa/1.x`, apt repo path). `hack/README` stack is explicitly dev-oriented (first run fails until Dashboard+Storage Service DBs created; `make restart-am-services`). Implication: do not promise one-command Archivematica on current Ubuntu for a small archive; if Line B is chosen, pin the documented OS/branch pair and budget install/test time. This reinforces Line A as the low-cost default.

No evidence was found that any single checksum, even SHA-512, establishes provenance; all preservation sources treat provenance as event-chain + agents + rights (PREMIS) plus versioned storage (OCFL). Absence-of-evidence is recorded here as evidence of absence for the checksum-as-provenance claim.

## 4. Rejection reports, repair loop, history (design synthesis pre-reveal)

- **Rejection report (human-readable, machine-repeatable).** One page per transfer + one row per failed check: check name (BagIt validate / virus scan / identify / validate / metadata completeness), file(s), expected vs observed (manifest line + recomputed digest; PUID + signature versions; JHOVE well-formed/valid), what it means in plain language, what the donor/staff should do next, and tool+DB versions. Include signature/DB versions (`bagit`, `clamav`+`daily/main/bytecode`, `siegfried`+`DROID_SignatureFile_Vnn`, `JHOVE`) so any row can be re-derived. Never emit bare IDs without prose (O5 constraint anticipated).
- **Repair loop.** Metadata: ExifTool extract → CSV template → OpenRefine clean (log ops) → staff review → re-apply to staging copy → re-validate → commit OCFL version with PREMIS transformation event. Payload bytes: donors re-supply; staff never hand-edit payload to make a checksum pass. Malware: quarantine + notify + no auto-release; re-scan after signature update before any release decision.
- **History.** OCFL version chain (v1..head) + PREMIS event log (ingest/fixity/virus/identify/validate/transform/replicate) + transfer manifest (who/when/how: donor, method, operator). Any prior version re-validates from its own inventory+sidecar.

## 5. O6 — discriminating validations: proposed vs executed

**Executed in this stage:** none at runtime. No sandbox was claimed; no code was run; no network service was stood up. All checks below are PROPOSED. This separation is intentional and honest.

- V1 BagIt interop: build dual-hash bags with pinned bagit, validate with a second implementation (bagit-java/bagger); mutate one byte, assert `--validate` fails naming exact manifest line; assert 0.97 single-manifest bag flagged. Discriminates 1.0-rule compliance.
- V2 OCFL round-trip: commit v1→v2→v3 with dedup, corrupt one content byte, assert validator reports exact E-code and version; assert head/root mismatch detected; assert concurrent-write guard re-verifies head. Discriminates history integrity.
- V3 Malware gate: EICAR + clean + oversize + password-zip fixtures through clamd/clamscan; assert exit 0/1/2 mapping, `--move` quarantine placement, stale-DB fail-closed, `.cvd`/`.cld` acceptance. Discriminates quarantine correctness.
- V4 Provenance countercase: swap payload before manifesting (checksum still verifies) vs swap after manifesting (fails); present both to provenance claim and assert only event-chain+attestation distinguishes them. Discriminates checksum-as-provenance fallacy; keeps B6 open until run.
- V5 Identify/validate split: TIFF-version, PPT/XLS, Broadcast-WAVE fixtures through Siegfried then JHOVE; assert Siegfried PUID + JHOVE version both recorded and disagree openly where they do. Discriminates identify==validate conflation.
- V6 Metadata repair audit: dirty CSV through OpenRefine ops log → re-apply → re-validate; assert every preserved-byte change has a PREMIS event and no silent mass edit. Discriminates repair accountability.
- V7 SWORD/MinIO interop (if chosen): SWORD deposit BagIt package to test DSpace; MinIO SNSD bucket versioning + object-lock round-trip; assert SDK swap to AWS S3 is config-only. Discriminates deployment portability.

## 6. Uncertainty and preserved disagreement

- B6 countercase unresolved by design: whether donor-signed manifests + transparency log could ever reduce (not eliminate) the event-chain requirement for low-risk collections. Needs V4 + legal/custody input; not decided here.
- Exactly lineage/maintenance risk: community fork vs original AVPreserve repo; UI rebuild may be safer than adopting the old codebase. Donor-client pattern retained, code adoption uncertain.
- MinIO AGPLv3 vs alternatives (SeaweedFS/Garage/RustFS) licensing/ops tradeoffs not fully adjudicated; MinIO kept for S3-compat ubiquity, alternatives noted.
- SWORD vs custom upload: depends on whether the archive already runs a SWORD server; both retained.
- No usage/billing observed for any source (all public docs/repos accessed anonymously); recorded as null in source-map.

## 7. Sources

See `source-map.json` (immutable IDs S01–S16) and `sources/index.md` for bounded retained evidence. All URLs/versions/commits/locators/access timestamps recorded there. Mutable pages flagged; stable specs/releases preferred where available.
