# Discovery — S12 archive-transfer (A-M06-B / control / research)

- Generated: 2026-10-09T21:05Z (UTC). Method M06 v1 evidence-first-challenge: this document is
  independent discovery written **before** any plan reveal; per-P comparison happens later in
  draft.md and this file is not rewritten after reveal.
- Brief scope (from `cases/S12/brief.md`, the only case document consulted): a digital handoff
  service for a regional historical archive receiving files from small donors. Needs: package
  validation; malware/quarantine separation; understandable rejection reports; metadata repair;
  repeatable transfer history; the design must not assume a checksum proves provenance.
  Also: interoperable tools and competing workflows, implementation/version conditions, and a
  low-cost deployment path.
- Evidence posture: all claims below are pinned to sources in `source-map.json` (IDs S01–S06,
  immutable; content hashes in `sources/`). Claims that rest on unfetched secondary search
  summaries are explicitly marked. No local runtime was executed for this stage; nothing here
  pretends to have run.

## 1. Tools and products discovered (brief obligation O1)

### 1.1 BagIt + bagit-python — transfer packaging with two-level validation
BagIt (RFC 8493, BagIt v1.0, October 2018; S01) is a minimalist packaging format for
digital preservation: a `data/` payload directory, a `bagit.txt` declaration, at least one
payload manifest `manifest-<algorithm>.txt` listing every payload file exactly once, optional
`bag-info.txt` metadata (Source-Organization, Bagging-Date, Payload-Oxum), optional tag
manifests, and an optional `fetch.txt` listing remote files to fetch. Tooling MUST support
SHA-256 and SHA-512; SHA-512 SHOULD be the default for new bags; MD5/SHA-1 survive only for
backwards compatibility.

The consequential design detail for this brief is that BagIt defines **two distinct verdicts**:
a bag is *complete* when all required elements are present and every payload file is listed in
every payload manifest, and *valid* only when, in addition, every checksum in every payload and
tag manifest verifies. A donor handoff service can surface these as separate, human-readable
outcomes — "package structurally complete" vs "package bit-verified" — which maps directly onto
the brief's "understandable rejection reports": a donor whose bag is complete but invalid gets a
specific, per-file checksum explanation rather than a binary fail.

The reference implementation is `bagit-python` (Library of Congress; S04), actively maintained
(latest release v1.9.0, 2025-06-13) and pip-installable — relevant to the low-cost deployment
path. Its release history also shows validation semantics moving between versions (e.g., v1.9.0
"allows fetch.txt with file URLs to validate" (#154), `is_valid()` gains a `processes` parameter
(#140), and v1.9.0 "removed `expandvars` call in unsafe path check" (#184)), so behavior is a
per-version fact to pin, not an assumption.

### 1.2 Archivematica — a full OAIS pipeline whose malware posture is itself a pattern
Archivematica (S02) is an open-source preservation system whose transfer/ingest micro-services
implement the two malware-handling mechanisms the brief separates:

1. **Quarantine as a time window, not just a place**: the Transfer quarantine micro-service
   ("Workflow decision - send transfer to quarantine", "Move to quarantine", "Remove from
   quarantine") exists to "quarantine the transfer for a set duration, to allow virus
   definitions to update, before virus scan." The rationale — that today's scan is only as good
   as today's signatures, so material is held until definitions have had time to advance — is a
   materially different approach from scan-once-and-move-on, and it is directly reusable in a
   lightweight handoff service even without adopting Archivematica itself. The wiki page states
   no default duration; the dashboard options ("Send transfer to quarantine", "Remove from
   quarantine after (days)") were seen only in search summaries and are **secondary, unfetched**.
2. **Fail-closed scanning**: "Scan for viruses: uses ClamAV to scan for viruses and other
   malware. If a virus is found, the transfer is automatically placed in
   /sharedDirectoryStructure/failed/ and all processing on the transfer is stopped." Detection
   routes material to a *failed* directory and halts — quarantine (waiting) and failure
   (detected) are distinct states, which is exactly the separation the brief asks for.

Archivematica as a product is heavy for a small regional archive (a full pipeline to adopt and
operate), so it is cited here primarily as prior art for behavior and as an interoperability
target, with the lightweight path in §4.

### 1.3 ClamAV — the de-facto scanning engine, and a lesson in version discipline
ClamAV is the engine Archivematica drives, and it is open-source with no per-seat licensing,
fitting a low-cost path. Its own vulnerability history is the load-bearing finding: ClamAV
**parses attacker-supplied container formats by design** (its DMG and HFS+ parsers were the
subject of CVE-2023-20052 and CVE-2023-20032), so the anti-malware component of a donor-facing
service is itself attack surface fed directly by donor files.

### 1.4 ExifTool — metadata repair, on untrusted input
ExifTool is the standard open-source tool for reading/writing embedded metadata, which covers
the brief's "metadata repair" need (normalizing dates, stripping private GPS data, fixing
mis-encoded fields). The same history that makes it useful makes it dangerous on donor input:
its 12.24 release (Apr. 13, 2021) is a "Security update (vulnerability in DjVu reader)" — i.e.,
a metadata *reader* was exploitable through a file format. Metadata repair and malware handling
are therefore not separable concerns: the repair step must be treated as untrusted-input
processing, sandboxed and version-pinned like everything else.

## 2. Consequential behavior, defaults, limits, applicability (O2)

- **BagIt completeness vs validity (S01)**: two independently reportable verdicts
  (§1.1). Applicability: package validation and rejection-report design. Limit: neither verdict
  says anything about authenticity (§3).
- **BagIt algorithm defaults (S01)**: SHA-512 SHOULD be default on creation; MD5/SHA-1 only for
  reading legacy bags. Applicability: accept legacy manifests read-only; emit SHA-512 on
  outbound/repaired packages.
- **fetch.txt pointer bags (S01)**: a bag may list payload as remote URLs to fetch. A handoff
  service could accept a small manifest from a donor whose files live in institutional storage,
  fetching at ingest; §5.2 of the RFC warns fetch URLs may point at hosts outside the sender's
  control, so fetched content needs the same validation as uploaded files. bagit-python's
  treatment of fetch.txt changed as recently as v1.9.0 (S04).
- **Quarantine duration semantics (S02)**: quarantine exists to let *virus definitions* advance
  before scanning; its length is configuration, with no universal default documented in the
  fetched source. Applicability: a service should make the window explicit policy, report it in
  the transfer history, and state it to donors — not hide it as an implementation detail.
- **Fail-closed on detection (S02)**: detected malware halts all processing and moves the
  transfer to a failed area; nothing silently proceeds. Applicability: rejection reports must
  distinguish "held pending quarantine window" (no finding yet) from "failed on detection".
- **ClamAV branch lifecycle (S03)**: the 2023 patch release fixed affected branches
  (≤1.0.0, ≤0.105.1, ≤0.103.7) in 1.0.1/0.105.2/0.103.8 and explicitly did **not** patch 0.104
  (end of life). Applicability: a deployment pinning an EOL branch gets no fixes — dependency
  choice must track supported branches, and the scanner's version belongs in the transfer
  history so a past "clean" verdict can be re-evaluated later.
- **ClamAV as parser-of-untrusted-files (S03)**: the scanner's own container parsers have had
  remotely exploitable bugs; running it with least privilege (unprivileged user, no network,
  resource limits) is part of the design, not an ops afterthought.
- **ExifTool version floor (S05, S06)**: any metadata-repair step must require ≥12.24-era fixes
  and track the current line (13.55 production as of access; 13.59 newest listed). Version
  lineage is split across two history pages (current page covers only 13.36+), so pinning needs
  both.

## 3. "A checksum does not prove provenance" — primary-source support (O2/O3)
BagIt's RFC states its integrity checking "is designed to provide high levels of confidence
against data corruption but is not designed to be secure against active attacks," and points
organizations needing stronger guarantees to measures "such as digital signatures," which are
out of scope of the format (S01, §5.4). It also warns (§5.2) that fetch.txt URLs may point to
hosts outside the sender's control and that older checksums may not resist intentional spoofing.
So the brief's assumption-ban is not pessimism — the packaging format itself disclaims
authenticity. Design consequence: transfer history must record *who supplied what, when, through
which channel, with which tool versions and verdicts* (chain-of-custody events), and any stronger
guarantee comes from signatures over manifests or transport, not from the checksums alone. This
is a place where the discovered tooling has a gap worth designing for rather than assuming away;
candidate mechanisms (GPG-signed manifests, RFC 3161 timestamping) were identified but **not
primary-sourced in this stage** — flagged for follow-up, not asserted.

## 4. Issue / fix / release chains investigated (O3)

### 4.1 ClamAV February 2023 patch chain (primary, complete)
Chain (S03): disclosure 2023-02-15 → affected ≤1.0.0/≤0.105.1/≤0.103.7 → fixed in 1.0.1/0.105.2/
0.103.8 same day; CVE-2023-20032 (HFS+ parser buffer overflow, possible RCE) and CVE-2023-20052
(DMG parser information leak); both reported by Simon Scannell; all three releases bump vendored
libmspack to 0.11alpha; 0.104 branch EOL and unpatched; a public PoC exists for the 20032 buffer
overflow. Release notes also carry non-security fixes (allmatch detection in 1.0.1; Yara rule
loading in 0.105.2), so patch-level choice changes scan behavior beyond the CVEs. Lesson for the
product: the quarantine window logic only helps if the definitions *and the engine* update —
the engine itself needs the patch channel watched.

### 4.2 ExifTool 12.24 security update (primary; CVE mapping uncertain)
Chain (S05): 12.23 (Apr. 1, 2021) no security notes → **12.24 (Apr. 13, 2021): "Security update
(vulnerability in DjVu reader)"** → 12.25 (Apr. 22, 2021) feature work. Honesty note: the vendor
page cites no CVE numbers. Secondary search results referenced CVE-2021-22204 (DjVu RCE,
"versions 7.44 and up") and CVE-2021-36370 (directory traversal, "versions through 12.23") and
variously attributed both to 12.24; I did not fetch NVD/CVE records, so **the specific CVE-to-fix
mapping is unverified here** — only the vendor's own note is primary. Evidence-absent statements:
no fetched source dates the DjVu vulnerability's introduction; no fetched source says whether
metadata *writing* (not just reading) was affected.

### 4.3 bagit-python v1.9.0 changes (primary release notes)
Chain (S04): v1.8.1 (Oct. 15, 2024, maintenance/PEP 263) → v1.9 betas (Oct. 15, 2024) → v1.9.0
(Jun. 13, 2025) with behavior-relevant changes: fetch.txt file-URLs now validate (#154);
`is_valid()` can pass `processes` through to `validate()` (#140); `expandvars` removed from the
unsafe path check (#184) — the last is security-adjacent (path-safety check semantics changed),
which is exactly why a validation service must pin the library version and record it with each
verdict.

## 5. Competing workflows and a low-cost deployment sketch (assembled from S01–S05)
Two materially different postures observed in the wild:
- **Monolithic pipeline** (Archivematica): adopt an OAIS system; get quarantine, scanning,
  backlog, metadata and AIP generation, at the cost of operating a heavyweight stack.
- **Composable lightweight path** (what a small archive can actually run): donors upload BagIt
  bags (bagit-python validates *complete* vs *valid* for layered rejection reports); ClamAV
  scans with fail-closed routing into a failed area, plus an explicit configurable quarantine
  window that re-scans after definition updates (Archivematica's pattern, implemented with just
  ClamAV + a scheduler); exiftool (≥12.24, current line preferred) performs metadata
  read/repair as sandboxed untrusted-input processing; every step appends an event to an
  append-only transfer history (who/what/when/tool-version/verdict), which is what carries
  provenance weight once checksums are understood as corruption-detection only (S01 §5.4).
All components are open-source and pip/package-installable; the low-cost claim rests on that
plus the absence of licensing in the fetched sources (no pricing pages were fetched — cost
claims beyond "open-source, no per-seat license mentioned in cited sources" are not made).

## 6. Candidates identified but not primary-sourced this stage (honest gaps)
Format identification (Siegfried/DROID, PRONOM) for donor-file triage; PREMIS events as the
transfer-history vocabulary; ePADD/DSpace donor-submission UX for rejection-report design;
signed-manifest/RFC 3161 mechanisms behind the §3 gap; Archivematica's dashboard default
quarantine duration (secondary-only in this stage). None of these are asserted as findings;
they are follow-up leads.

## 7. Executed vs proposed
Executed in this stage: six primary-source retrievals (WebFetch), excerpted with hashes into
`sources/`, mapped immutably in `source-map.json`. No code was run, no packages installed, no
local validation attempted. Everything in §5's sketch is therefore **proposed**, not executed;
discriminating validations belong to the draft/final per O6.
