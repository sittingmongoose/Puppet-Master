# Draft findings — community archive digital preservation (I-ANCHOR-MUSE, research-v1)

Researcher draft. Feeds a fresh same-family critic-finalizer; no verdict is
offered here. Source IDs (S01–S14) are defined in `sources/SOURCES.md` and
must not rebind. No code was executed; every check below is a PROPOSAL unless
marked OBSERVED (page/code read).

## 1. Frozen-plan gap map (what the thin plan leaves unspecified or unsafe)

Frozen plan v1: directory tree of uploads; dedup by filename+size; metadata
in SQLite; previews beside originals; nightly tree copy to a second disk; web
catalog with filename/notes search. Explicitly unspecified: checksums, fixity
scheduling, crash recovery, derivative provenance, rights changes,
preservation formats.

| # | Frozen-plan behavior | Finding | Disposition |
|---|---|---|---|
| F1 | Dedup by filename+size | Unsafe: distinct bytes can share name+size (re-ingest, volunteer renames, camera counter resets); identical bytes under different names are missed. Replace with content-hash identity (SHA-256/512), keeping filename as display metadata only | Supported correction (S01/S02) |
| F2 | No checksums / fixity schedule | Silent corruption undetectable; nightly copy propagates rot to the "backup". Add manifest checksums at ingest + scheduled fixity audits with repair-from-good-copy | Supported correction (S01/S02/S07) |
| F3 | Nightly raw copy of tree (+ live SQLite file) | A file-copy of a live SQLite DB can be corrupt after power loss mid-copy and blocks writers; copy is not a snapshot (S10). Use SQLite Online Backup API / VACUUM INTO for the DB, and checksum-verified copy for payload | Supported correction (S08/S09/S10) |
| F4 | Previews beside originals, no provenance | Public/original confusion; a preview can overwrite or be mistaken for the master; no record of how a derivative was made. Separate preservation masters from access derivatives (AIP vs DIP roles) with derivation records | Supported correction (S11/S12) |
| F5 | No crash/interrupt recovery | Interrupted ingest leaves half-written files + metadata out of sync. Ingest must be staged then committed atomically (temp dir + manifest + atomic rename; DB transaction), with resume/repair on restart | Supported correction (S08/S09) |
| F6 | Search over filenames/notes only; no rights model | Sensitive originals leak through public browse; rights changes have nowhere to land. Split notice-level (public/private) from file-level access (free/restricted/protected/forbidden + embargo), enforced at serve time, not by URL hiding | Supported correction (S12) |
| F7 | No preservation formats | Camera/scanner defaults (lossy JPEG, MP3, ad-hoc PDF) rot or obsolesce. Keep original bytes AND normalize to preservation masters (TIFF, BWF/WAV, PDF/A) plus lightweight service files | Supported correction (S13/S14) |
| F8 | Single second disk, same site implied | One local copy is not preservation (fire/theft/ransomware take both). ≥2 copies, ≥1 offsite/different-threat, documented, tested restores | Supported correction (S07) |
| F9 | SQLite as metadata store | KEEP (product choice): SQLite is a sound embedded choice for a volunteer shop — serverless, transactional, WAL-capable — provided backup uses the Backup API, WAL limitations are respected, and files+rows commit as a unit via ingest protocol (DB transactions alone do not make file+row atomic) | Already-covered w/ conditions (S08/S09/S10) |
| F10 | Web catalog with search | KEEP (product choice): volunteer-friendly access layer, but search must index rights-aware descriptive/technical metadata, not filenames; public catalog serves derivatives, never masters of restricted items | Already-covered w/ conditions (S11/S12) |

## 2. Materially different mechanisms (compare, don't just patch)

M1 — Loose tree + nightly copy (frozen plan) vs BagIt-packaged ingest units
(S01/S02). Bag: `bagit.txt` + `data/` payload + `manifest-<alg>.txt`
(`checksum filepath` lines) + optional `tagmanifest`, `bag-info.txt`
(Payload-Oxum), `fetch.txt`. Every ingest unit becomes self-describing and
self-verifying; receipt/transfer/storage all re-validate the same manifests.
Affordable: pure file layout + a small library; no server needed. Adopt per
accession/digitization batch.

M2 — Filename+size dedup vs content-addressed identity (S01/S02). Store
SHA-256 (+SHA-512 per bagit-python defaults) per file at ingest; identity =
hash, not name. Same hash ⇒ safe single-storage with multiple catalog
references + reference counts; different hash ⇒ distinct object even if names
match. Name+size remains only as a fast pre-screen before hashing, never as
the verdict.

M3 — Copy-everything-nightly vs fixity-audit + repair (S02/S07). Full
re-hash on a schedule (weekly full, daily sample for large shops) with
per-file mismatch reports; repair = copy the good replica's bytes, re-verify,
log the event. Copy-without-verify only clones corruption.

M4 — Previews-beside-originals vs AIP/DIP separation (S11). Preservation
masters (original + normalized preservation copy) live in preservation
storage, never directly served; access derivatives (JPEG/MP3/PDF thumbs) are
generated with recorded tool/version/settings and served by the catalog.
Same base filename, different role/format/location — never one folder where a
volunteer can confuse them.

M5 — Direct-write ingest vs staged atomic ingest (S08/S09). Write to
`incoming/<uuid>/`, hash as bytes land, build manifest, fsync, THEN
transactionally register in SQLite and atomically rename into place. Crash
recovery = on boot, discard/complete staged units by journal state; never
half-register. DB-level atomicity (rollback journal/WAL) covers rows; the
staging protocol covers files+rows together.

M6 — Single SQLite file copy vs online snapshot (S10). Nightly job:
`VACUUM INTO` or Backup-API snapshot of the catalog DB to the replica,
plus manifest-verified payload sync. Never `cp` the live `.db` (and never
copy `-wal`/`-shm` piecemeal).

M7 — One public/private bit vs notice/file rights split (S12). Catalog
notice (title/description/thumbnail-if-safe) has its own visibility;
each FILE has an access level (free/restricted/protected/forbidden) +
optional embargo window + request/IP/token workflows. Rights changes =
metadata updates that take effect at serve time; originals of restricted
items are never placed in the public web root.

M8 — Keep-uploads-as-is vs preservation normalization (S13/S14). At ingest:
(1) keep original bytes immutable; (2) normalize to preservation master
(photo/scan→uncompressed TIFF; oral history→BWF/WAV PCM; text→PDF/A);
(3) generate service derivatives (JPEG, MP3/Opus, web PDF). Record the
derivation chain per file (source hash → tool/version → output hash).

## 3. Component / code behavior (pinned): bagit-python v1.8.1 (S02) — OBSERVED

Read at tag v1.8.1 (raw `bagit.py`, no execution). Relevant behavior:

- `DEFAULT_CHECKSUMS = ["sha256", "sha512"]`; multi-algorithm manifests
  supported; hashes computed in 512 KiB blocks, single- or multi-process.
- `validate(processes, fast=False, completeness_only=False)`: full validation
  = `_validate_structure()` + `_validate_bagittxt()` + `validate_fetch()` +
  `_validate_contents(...)`. Docstring promises full mode recalculates
  fixities; fast mode trusts Payload-Oxum instead of recalculating.
- `_validate_contents`: FIRST calls `self._validate_oxum()` unconditionally,
  THEN `if fast: return`, else `_validate_completeness()` (manifest↔filesystem
  set comparison → FileMissing/UnexpectedFile) and `_validate_entries()`
  (re-hash every entry → per-file ChecksumMismatch with expected/found).
- Consequence: any Payload-Oxum byte-count mismatch raises before per-file
  hashes run, so the operator learns "10 files, N bytes off by k" but NOT
  which file(s) changed — exactly the S03 complaint.
- CLI: `--fast` only valid with `--validate`; `--validate` defaults to full
  (subject to the oxum-first behavior above).

Source-specific conditions: pin the tag (behavior differs across versions);
always ship `Payload-Oxum` (fast mode requires it); treat oxum as a
fail-early screen, not a fixity verdict; for repair workflows, run
completeness+entries even when oxum fails (or apply/verify the S05 fix).

## 4. Pertinent issue / fix / regression / release chain — OBSERVED

- S03 · #137 (2019-07-03, open): `--validate` output identical to
  `--validate --fast`; only `Payload-Oxum validation failed. Expected 10
  files and 50586020 bytes but found 10 files and 50586017 bytes`; user asks
  how to identify the corrupt/missing file. Pertinence: a 3-byte silent
  change — the brief's core threat — yields no actionable diagnosis.
- S04 · #177 (2024-05-02, open): reporter identifies the cause as oxum
  validation sitting outside the `if fast` gate, so validation "always
  defaults to fast … checksums are not being checked — only the payload oxum".
- S05 · PR #174 (2024-03-14, closed 2024-09-18, `merged_at: null` observed):
  5-line patch moving `self._validate_oxum()` inside `if fast:` so full
  validation proceeds to completeness + per-file checksums. Merge status
  UNCERTAIN (closed without an observed merge timestamp).
- S06 · v1.9.0 (2025-06-13): changelog enumerates merged PRs
  (#154 fetch-URL validate, #140 is_valid processes, #184, #162, #163, #165,
  #168, #171, #172, #175, #181, #182, #167, #183) — #174 is ABSENT, so the
  oxum-first behavior read at v1.8.1 plausibly still ships in v1.9.0.
  (Changelog-absence inference, not an execution proof.)

Proposed regression tests (not executed): (T1) bag with one 1-byte-flipped
payload file and correct oxum → full validate must report exactly that file
as ChecksumMismatch; (T2) same bag with stale oxum → full validate must
STILL report the per-file mismatch (not oxum-only); (T3) `--validate --fast`
must not recalculate hashes (spy on hash function); (T4) missing-file and
extra-file bags → FileMissing/UnexpectedFile respectively. Release
applicability: pin ≥v1.9.0 only after re-reading `_validate_contents` at that
tag; if oxum-first persists, carry the S05 patch locally or wrap validation
(retry entries-only on oxum failure) and re-verify each upgrade.

## 5. Analogous systems (affordable, volunteer-compatible)

- Archivematica (S11): OAIS pipeline (SIP→AIP→DIP) with "normalize for
  preservation and access" as one decision; AIPs in BagIt archival storage,
  DIPs served separately. Lesson for this shop: adopt the AIP/DIP ROLE split
  even without adopting the software — the roles are the mechanism.
- Omeka S + Access module (S12): volunteer-friendly catalog whose core
  public/private bit is extended to file-level access + embargo + request
  workflows, with notice/file separation and item-set→item→media cascade.
  Lesson: rights = serve-time enforcement over metadata, not folder secrecy.
- NDSA Levels (S07): the yardstick — climb Storage, Fixity, Security,
  Metadata, Formats level by level; a 2-copy+offsite+scheduler posture is
  already a defensible Level 2–3 claim for a community archive.

## 6. Hidden risks surfaced by the sources

R1. Fast-mode confusion (S02–S05): any "quick verify" that reports OK without
recalculating hashes teaches volunteers that corruption checks pass. Label
modes honestly (oxum screen vs fixity audit) and default scheduled jobs to
full.
R2. Live-DB copy corruption (S10): the frozen nightly copy is most dangerous
exactly when the catalog is busy. Separate DB snapshots from payload sync.
R3. WAL on network shares (S09): if digitization stations write to a NAS,
WAL mode breaks (shared-memory requirement). Either keep SQLite local per
station with a push protocol, or stay in rollback-journal mode on shares —
document the choice.
R4. Hot-journal deletion by "cleanup" scripts or volunteer tidying (S08):
deleting `-journal`/`-wal` turns a recoverable crash into a corrupt DB.
Exclude DB sidecars from cleanup; monitor for stale journals as a crash
signal, not garbage.
R5. Derivative overwrite (S11): same-folder previews invite "final_v2.jpg"
overwrites of masters. Enforce immutable preservation dirs (read-only
permissions post-commit) and write derivatives elsewhere.
R6. Rights drift (S12): filenames/notes search leaks restricted content via
snippets and thumbnails. Apply access checks to search results, thumbnails,
and API responses — not just file downloads.
R7. Single-threat geography (S07): second disk in the same building shares
fire/flood/theft/ransomware fate. Offsite can be cheap (volunteer-held
encrypted drive rotation, low-cost object storage) but must be a different
threat envelope + tested restores.
R8. Format obsolescence by default (S13/S14): today's phone audio and
scanner PDFs are tomorrow's unreadable files. Normalization at ingest is
cheaper than migration under duress.

## 7. Proposed changes (concrete, minimal-affordable)

P1. Per-batch BagIt ingest (S01/S02): every accession/digitization batch
becomes a bag (sha256+sha512 manifests, tagmanifest, bag-info with
Payload-Oxum, contact/rights fields). Validate on ingest, on transfer, on
schedule.
P2. Content-hash identity + safe dedup (S02): files table keyed by
(content_hash, size); uploads hash during staging; duplicates link to the
stored object with refcounts; deletion removes references, bytes last.
P3. Staged atomic ingest protocol (S08/S09): incoming/<uuid> → hash → manifest
→ fsync → DB transaction + atomic rename → verify. Boot recovery replays or
discards staged units; ingest log records every commit/abort.
P4. Fixity scheduler with honest modes (S02/S07): weekly full re-hash +
daily random sample; oxum screen for quick triage only; mismatch ⇒ quarantine
report (file, expected/found hash, replica comparison) + repair-from-good-copy
+ event log. Pin bagit-python version; verify oxum behavior per §4 on upgrade.
P5. AIP/DIP storage split (S11): `preservation/` (originals + normalized
masters, read-only after commit) vs `access/` (derivatives + catalog); METS-
lite derivation record per derivative (source hash, tool, version, settings,
output hash, timestamp).
P6. SQLite done right (S08/S09/S10): WAL on local disks with periodic
checkpoint; rollback-journal on network shares; nightly `VACUUM INTO`/Backup-
API snapshot (never raw `cp` of live DB); sidecar files excluded from cleanup;
integrity_check in the scheduled job.
P7. Rights model (S12): notice visibility × file access level × embargo;
serve-time enforcement across pages, search, thumbnails, API; rights-change
log; restricted originals never under the web root; derivatives inherit the
stricter of source rights and derivative policy.
P8. Preservation formats (S13/S14): photo/scan→TIFF master + JPEG service;
oral history→BWF/WAV master + MP3/Opus service; documents→PDF/A master + web
PDF; keep upload originals immutable alongside masters.
P9. 3-2-1-ish storage on a budget (S07): live + local replica + offsite
(encrypted rotation or cheap object storage); restores tested quarterly;
storage inventory documented (what/where/media/needed-to-read).
P10. Volunteer-proof operations: one-button ingest with validation report in
plain language ("3 files, all checksums OK, 1 duplicate linked"); fixity
results as green/amber/red with named files; no destructive action without a
second confirmation + log entry.

## 8. Optional opportunities (not required for the brief)

O1. `fetch.txt` (S01) for large oral-history donations: register
donor-hosted URLs in the bag and materialize on schedule — defers storage
cost but adds availability risk; validate with the v1.9.0 file-URL behavior
(S06/#154).
O2. Multiprocess validation on ingest stations (S02 `processes`, S06 #140):
worthwhile once batches exceed ~1k files; measure before enabling.
O3. Object-storage replica with native checksums as the offsite leg (S07):
trades drive rotation for a small bill + credentials management.
O4. PREMIS-style event log upgrade later: today's ingest/fixity/rights log
can grow into preservation metadata without rework if event vocabulary is
kept stable.

## 9. Uncertainties (justified, with what would resolve them)

U1. PR #174 merge state (S05/S06): closed-but-unmerged-observed; resolves by
reading `_validate_contents` at v1.9.0+ tags (2-minute code read, no
execution needed).
U2. NDSA matrix cell wording at v2.1 (S07): page fetched, OSF matrix not
re-read cell-by-cell; level claims above should cite the matrix PDF once
retrieved.
U3. Exact normalization toolchain (S13/S14 name formats, not tools):
volunteer-shop-friendly converter choices (e.g., audio/image/PDF tools and
versions) need a separate small selection pass with license/format-fidelity
checks.
U4. Scale assumptions: brief says "small stations"; if oral-history backlog
exceeds ~1 TB, sampling rates and full-audit windows in P4 need rescaling
(sample math, not new mechanisms).

## 10. Proposed validation (all PROPOSED — nothing executed)

V1. Ingest torture (crash): kill -9 the ingester mid-batch 10× at random
points; assert each run ends with every batch either fully registered +
verified or fully staged-pending, never half-registered; assert boot recovery
converges with zero manual fixes.
V2. Corruption drill: flip 1 byte in a master, add an extra file, delete a
file (three separate drills); assert the scheduler names the exact file(s)
with expected/found hashes and repairs from the replica.
V3. Dedup traps: same bytes/different names (must link), different bytes/
same name+size (must NOT link), re-ingest of an accession (must link all).
V4. Backup realism: pull power (VM snapshot) mid-nightly-job; assert the DB
snapshot restores and opens `integrity_check` clean, and payload replica
re-verifies against manifests.
V5. Rights probe: as anonymous/logged-in/expired-embargo users, request
pages, search, thumbnails, APIs, and direct file URLs for restricted items;
assert 403/redirect everywhere with no byte or snippet leak, and assert the
public notice still renders where policy says it should.
V6. Format round-trip: for each preservation master, decode with an
independent tool and compare significant properties (pixels, samples,
page count/text) against the original; record tool versions.
V7. Restore rehearsal (quarterly): rebuild catalog + a random 5% of masters
from the offsite leg onto clean media; assert manifests verify and the
catalog serves them.

## 11. Source-specific conditions (carry into any build)

- S01/S02: BagIt version pinned (1.0 layout); checksum algorithms explicit
  per manifest; never invent `goalMode`-style extensions to the format —
  use `bag-info.txt` keys and document them.
- S02/S05/S06: bagit-python version pinned; oxum behavior re-verified per
  §4 on every upgrade; scheduled jobs call full validation explicitly
  (`fast=False`), never rely on defaults.
- S08/S09/S10: SQLite mode (WAL vs journal) chosen per storage location and
  documented; Backup API/VACUUM INTO mandatory for DB replicas; sidecars
  protected.
- S11: AIP/DIP are roles with separate paths/permissions even if the shop
  never installs Archivematica.
- S12: access enforcement at every serving surface, tested by V5 on every
  catalog change.
- S13/S14: RFS hierarchies guide master formats; originals always retained;
  derivation records mandatory.

## 12. Executed vs proposed — honest ledger

- OBSERVED (read, not run): S01–S14 page/code/API reads listed in
  sources/SOURCES.md; pinned code behavior §3; issue/fix/release chain §4.
- PROPOSED (not run): T1–T4, V1–V7, P1–P10 implementation, O1–O4.
- EXECUTED: none beyond read-only inspection commands (date/ls/grep/sed over
  fetched transcripts) and directory/file creation for this deliverable. No
  installs, downloads executed, accounts, purchases, or host-state changes.
