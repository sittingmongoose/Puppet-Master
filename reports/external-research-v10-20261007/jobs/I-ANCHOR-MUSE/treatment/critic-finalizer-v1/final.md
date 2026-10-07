# Final proposal — community archive digital preservation (I-ANCHOR-MUSE)

Complete usable proposal from the treatment research-v1 draft as
critic-finalized with live re-verification (C01–C04). Source IDs S01–S14
(predecessor) are preserved unbound; C01–C04 (critic) are defined in
`sources/SOURCES.md`. Nothing was executed: OBSERVED = page/code read;
everything else is PROPOSED.

## 1. What the frozen plan gets and what it must change

Frozen plan v1: directory tree of uploads; dedup by filename+size;
metadata in SQLite; previews beside originals; nightly tree copy to a
second disk; web catalog with filename/notes search. Unspecified:
checksums, fixity scheduling, crash recovery, derivative provenance,
rights changes, preservation formats.

| # | Frozen-plan behavior | Verdict |
|---|---|---|
| F1 | Dedup by filename+size | UNSAFE — replace with content-hash identity (S01/S02/C01); filename stays display metadata only |
| F2 | No checksums / fixity schedule | Add manifest checksums at ingest + scheduled fixity audits with repair-from-good-copy (S01/S02/S07) |
| F3 | Nightly raw copy of tree + live SQLite file | UNSAFE for the DB — Backup-API snapshot for SQLite, checksum-verified sync for payload (S08/S09/S10) |
| F4 | Previews beside originals, no provenance | Split preservation masters from access derivatives with derivation records (S11) |
| F5 | No crash/interrupt recovery | Staged atomic ingest: temp dir + manifest + atomic rename + DB transaction, with boot resume/repair (S08/S09) |
| F6 | Filename/notes search, no rights model | Notice visibility × file access level × embargo, enforced at serve time (S12) |
| F7 | No preservation formats | Keep originals AND normalize to preservation masters + service derivatives (S13/S14) |
| F8 | Single second disk, same site implied | ≥2 copies, ≥1 offsite/different-threat, documented, tested restores (S07) |
| F9 | SQLite as metadata store | KEEP, conditioned: Backup-API snapshots, per-location WAL/journal choice, file+row ingest protocol (S08/S09/S10) |
| F10 | Web catalog with search | KEEP, conditioned: rights-aware metadata search over derivatives, never restricted masters (S11/S12) |

## 2. Recommended mechanisms (each differs in kind from the frozen plan)

M1 — BagIt-packaged ingest units (S01/S02/C01). Every accession or
digitization batch becomes a bag: `bagit.txt` + `data/` + per-algorithm
manifests + tagmanifest + `bag-info.txt` with Payload-Oxum. Ingest,
transfer, and scheduled audits all re-validate the same manifests. Cost:
a file layout plus a small library; no server needed.

M2 — Content-addressed identity (S01/S02/C01). Identity = SHA-256 hash
(+SHA-512 per bagit-python defaults where BagIt manifests are used;
sha256-alone is acceptable for internal dedup — dual hashing doubles
ingest CPU for marginal benefit outside manifest convention). Same hash
⇒ single storage with multiple catalog references + refcounts;
different hash ⇒ distinct objects. Name+size is at most a pre-screen.

M3 — Fixity audit + repair, not copy-without-verify (S02/S07/C01).
Weekly full re-hash plus daily random sample; per-file mismatch reports;
repair = copy good replica bytes, re-verify, log the event.

M4 — AIP/DIP role separation (S11). Preservation masters (original +
normalized copy) live in read-only preservation storage, never served;
access derivatives are generated with recorded tool/version/settings and
served by the catalog. Same base names, different role/format/location.

M5 — Staged atomic ingest (S08/S09). Write to `incoming/<uuid>/`, hash
as bytes land, build manifest, fsync, THEN transactionally register in
SQLite and atomically rename into place. Boot recovery completes or
discards staged units by journal state. DB atomicity covers rows; the
staging protocol covers files+rows together.

M6 — Online DB snapshot + verified payload sync (S10). Nightly:
Backup-API snapshot of the catalog DB (incremental, lock-only-while-
reading — the preferred nightly path), `VACUUM INTO` reserved for
periodic compacting snapshots; manifest-verified payload sync. Never raw
`cp` of the live `.db`, never piecemeal `-wal`/`-shm` copies.

M7 — Notice/file rights split (S12). Catalog notice visibility is
independent of per-file access (free/restricted/protected/forbidden +
embargo + request/IP/token workflows). Rights changes are metadata
updates effective at serve time; restricted originals never sit under
the public web root.

M8 — Preservation normalization at ingest (S13/S14). (1) Keep original
bytes immutable; (2) normalize to preservation master (photo/scan →
uncompressed TIFF; oral history → BWF/WAV PCM; text → PDF/A); (3)
generate service derivatives (JPEG, MP3/Opus, web PDF). Record the full
derivation chain (source hash → tool/version/settings → output hash).

## 3. Pinned component behavior: bagit-python v1.9.0 — OBSERVED (C01/C04)

Read at tag v1.9.0 (raw `bagit.py`, 54,632 bytes; predecessor read
v1.8.1 — identical validator structure):

- `DEFAULT_CHECKSUMS = ["sha256", "sha512"]` (line 128).
- `validate(fast=False)` docstring promises full mode recalculates
  fixities; fast mode trusts Payload-Oxum.
- `_validate_contents` (lines 778–796) calls `self._validate_oxum()`
  UNCONDITIONALLY before `if fast: return`, then completeness (manifest↔
  filesystem set comparison → FileMissing/UnexpectedFile), then
  `_validate_entries` (re-hash every entry → per-file ChecksumMismatch).
- Consequence: any Payload-Oxum mismatch aborts full validation before
  per-file results exist — the operator learns aggregate counts, not
  which file changed. `--completeness-only` is likewise gated behind oxum.
- `_validate_oxum` returns silently when Payload-Oxum is absent: the
  trap bites exactly oxum-carrying bags (which §5 P1 mandates), and an
  oxum-less "valid" report must never be presented as a fixity verdict
  without per-file hashes having run.
- CLI (lines 1452–1550): `--fast`/`--completeness-only` require
  `--validate` (argparse errors otherwise); `--fast` help honestly states
  it skips checksum validation. Hash block-size internals
  (predecessor-observed "512 KiB blocks") were not re-verified here.
- `validate_fetch` accepts file-scheme URLs without netloc (the v1.9.0
  #154 behavior, observed in code).

## 4. Issue / fix / regression / release chain — OBSERVED (S03–S06, C01–C03)

- #137 (2019, OPEN at re-check): `--validate` prints only the oxum
  aggregate line; a 3-byte silent change yields no actionable diagnosis.
- #177 (2024, OPEN at re-check): root cause identified — oxum check sits
  outside the `if fast` gate, so validation "always defaults to fast."
- PR #174 (2024): 5-line move of `_validate_oxum()` inside `if fast:`;
  re-checked live: `state=closed, merged_at=null` — closed WITHOUT merge.
- v1.9.0 (2025-06-13): changelog omits #174 AND direct code read (C01)
  shows oxum-first verbatim — the trap ships at v1.9.0 as FACT (this
  resolves the predecessor's U1 inference).

Release applicability: pin bagit-python v1.9.0 WITH the known behavior
documented; do not wait for upstream (two releases, no fix). Fixity jobs
must use full validation through a warn-and-continue wrapper: on oxum
failure, record the screening signal and still run completeness +
per-file hashes (S05 semantics — dropping oxum from full mode entirely —
are the acceptable alternative). Re-run regression T2 on every upgrade.

Regression tests (PROPOSED): T1 — 1-byte-flipped payload file, correct
oxum → exactly that file reported ChecksumMismatch. T2 — same bag, stale
oxum → per-file mismatch STILL reported (not oxum-only); doubles as the
per-upgrade gate. T3 — `--validate --fast` must not recalculate hashes.
T4 — missing/extra files → FileMissing/UnexpectedFile.

## 5. Build plan (concrete, minimal-affordable) — all PROPOSED

P1. Per-batch BagIt ingest: every batch a bag (sha256+sha512 manifests,
tagmanifest, bag-info with Payload-Oxum + contact/rights fields).
Validate on ingest, on transfer, on schedule.
P2. Content-hash identity + safe dedup: files table keyed by
(content_hash, size); hash during staging; duplicates link with
refcounts; deletion removes references, bytes last; periodic
orphan/refcount-consistency sweep in the fixity job (covers crash
between refcount-zero and delete).
P3. Staged atomic ingest: `incoming/<uuid>` → hash → manifest → fsync →
DB transaction + atomic rename → verify. Boot recovery replays/discards
by journal state; every commit/abort logged.
P4. Fixity scheduler with honest modes: weekly full re-hash + daily
random sample through the §4 warn-and-continue wrapper; oxum as triage
screen only; mismatch ⇒ quarantine report (file, expected/found hash,
replica comparison) + repair-from-good-copy + event log.
P5. AIP/DIP storage split: `preservation/` (originals + normalized
masters, read-only after commit) vs `access/` (derivatives + catalog);
METS-lite derivation record per derivative.
P6. SQLite done right: local SQLite per station + push protocol as the
PRIMARY topology (S08's failure list includes broken network locking, so
even journal mode on a share needs a known-good lock story); WAL on
local disks with periodic checkpoint, rollback-journal on shares only
where locking is verified; nightly Backup-API snapshot (VACUUM INTO for
periodic compaction); sidecars excluded from cleanup; `integrity_check`
in the scheduled job.
P7. Rights model: notice visibility × file access × embargo; serve-time
enforcement across pages, search, thumbnails, and API; rights-change
log; restricted originals never under web root; derivatives inherit the
stricter of source rights and derivative policy.
P8. Preservation formats per M8; upload originals immutable alongside.
P9. 3-2-1-ish storage on a budget: live + local replica + offsite
(encrypted rotation or cheap object storage); quarterly tested restores;
documented storage inventory (what/where/media/needed-to-read).
P10. Volunteer-proof operations: one-button ingest with plain-language
validation report; fixity results green/amber/red with named files; no
destructive action without second confirmation + log entry.

## 6. Why these choices (analogous systems + yardstick)

- Archivematica 1.13 (S11): OAIS SIP→AIP→DIP with "normalize for
  preservation and access"; AIPs in BagIt archival storage, DIPs served
  separately. Adopted as ROLES, not software.
- Omeka S + Access module 3.4.47 (S12): file-level access + embargo +
  request workflows over core public/private; notice/file separation with
  item-set→item→media cascade. Rights = serve-time enforcement, not
  folder secrecy.
- NDSA Levels v2.1 (S07): the yardstick — 2+ copies, 1 offsite/
  different-threat, scheduled fixity, access control, format monitoring
  is a defensible Level 2–3 posture for a community archive (level
  numbering hedged — see §9 U2).

## 7. Hidden risks and their mitigations

R1. Fast-mode confusion: label modes honestly (oxum screen vs fixity
audit); default scheduled jobs to wrapped full validation. (C04: CLI
help already warns; the risk concentrates in library/API + wrappers.)
R2. Live-DB copy corruption: P6 snapshots; never raw-copy the live DB.
R3. SQLite-on-network-share: P6 local-first topology; journal-on-share
only with verified locking; WAL never on shares (S09).
R4. Hot-journal deletion: exclude `-journal`/`-wal`/`-shm` from all
cleanup; treat stale journals as a crash signal.
R5. Derivative overwrite: immutable preservation dirs; derivatives
written elsewhere (P5).
R6. Rights drift: access checks on search, thumbnails, API — not just
downloads (P7 + V5).
R7. Single-threat geography: offsite leg in a different threat envelope
+ tested restores (P9 + V7).
R8. Format obsolescence: normalize at ingest; migration under duress
costs more (P8).

## 8. Optional opportunities (not required for the brief) — PROPOSED

O1. `fetch.txt` for large oral-history donations (S01; v1.9.0 file-URL
handling now OBSERVED in C01): defers storage cost, adds availability
risk. Optional.
O2. Multiprocess validation once batches exceed ~1k files; measure first.
O3. Object-storage replica with native checksums as the offsite leg:
small bill + credentials management vs drive rotation.
O4. PREMIS-style event-log upgrade later: keep today's ingest/fixity/
rights event vocabulary stable so it grows without rework.

## 9. Uncertainties (justified, with resolvers)

U1. RESOLVED: oxum-first ships at v1.9.0 (C01) — converted to
regression T2, no longer a question.
U2. PRESERVED: NDSA matrix cell wording (v2.1) not re-read cell-by-cell;
level claims must cite the matrix PDF once retrieved.
U3. PRESERVED: normalization toolchain (converters + versions) needs a
small selection pass with license/format-fidelity checks.
U4. PRESERVED: if oral-history backlog exceeds ~1 TB, rescale P4 sampling
windows (sample math, not new mechanisms).

## 10. Validation plan — all PROPOSED, none executed

V1. Ingest torture: kill -9 the ingester mid-batch 10× at random points;
every batch ends fully registered+verified or fully staged-pending;
boot recovery converges with zero manual fixes.
V2. Corruption drill: 1-byte flip, extra file, deleted file (separate
drills); scheduler names exact files with expected/found hashes and
repairs from replica.
V3. Dedup traps: same bytes/different names (must link); different
bytes/same name+size (must NOT link); accession re-ingest (must link all).
V4. Backup realism: power-loss mid-nightly-job; DB snapshot restores
with clean `integrity_check`; payload replica re-verifies.
V5. Rights probe: anonymous/logged-in/expired-embargo across pages,
search, thumbnails, APIs, direct URLs; 403/redirect with no byte or
snippet leak; public notices still render where policy allows.
V6. Format round-trip: decode each preservation master with an
independent tool; compare significant properties against the original;
record tool versions.
V7. Quarterly restore rehearsal: rebuild catalog + random 5% of masters
from offsite onto clean media; manifests verify; catalog serves.

## 11. Source conditions carried into any build

- BagIt layout pinned (v1.0 per S01); algorithms explicit per manifest;
  `bag-info.txt` keys documented, no format extensions.
- bagit-python pinned at v1.9.0 WITH documented oxum-first behavior;
  scheduled jobs call wrapped full validation explicitly; T2 re-run on
  every upgrade; oxum-absent "valid" never presented as a fixity verdict.
- SQLite mode chosen per storage location and documented; Backup API /
  VACUUM INTO mandatory for DB replicas; sidecars protected.
- AIP/DIP roles enforced by path + permissions with or without
  Archivematica; derivation records mandatory.
- Access enforced at every serving surface; V5 re-run on every catalog
  change. Originals always retained beside masters.

## 12. Executed vs proposed — honest ledger

- OBSERVED: S01–S14 reads (predecessor, `research-v1/sources/`);
  critic re-verification C01–C04 (v1.9.0 code read, PR/issue live
  states, CLI wiring) saved in `critic-finalizer-v1/sources/`.
- PROPOSED: T1–T4, V1–V7, P1–P10, O1–O4.
- EXECUTED: read-only inspection only (fetch/grep/sed/date/ls) plus
  directory/file creation for this deliverable. No installs, downloads
  executed, accounts, purchases, product implementation, or host-state
  changes.
