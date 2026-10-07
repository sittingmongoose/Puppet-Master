# Stable source ID map — I-ANCHOR-MUSE treatment research-v1

All retrieved 2026-10-07 in the 18:28:30–18:30:40Z window via web_fetch /
web_search (between native_goal_receipt.json save at 18:28:37Z and this
file's first save at 18:30:45Z). Per-item clock times were not individually
recorded, so a shared window is stated honestly instead of fabricated
precise timestamps. IDs are stable and must not rebind.

| ID | Exact URL | Version / range |
|----|-----------|-----------------|
| S01 | https://www.rfc-editor.org/rfc/rfc8493.txt | RFC 8493, BagIt v1.0, Oct 2018 (Abstract; ss2–3: bagit.txt, data/, manifest-algorithm.txt, tagmanifest, bag-info.txt incl Payload-Oxum, fetch.txt; complete/valid bags) |
| S02 | https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.8.1/bagit.py | Tag v1.8.1; observed: `validate/processes/fast/completeness_only`, `_validate_contents` (unconditional `_validate_oxum()` then `if fast: return`), `_validate_oxum`, `_validate_completeness`, `_validate_entries` (recalc + ChecksumMismatch), `DEFAULT_CHECKSUMS=["sha256","sha512"]`, CLI `--fast/--validate` |
| S03 | https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/137 | Issue #137 "Query re --validate output" (2019-07-03, state open at retrieval); body: `--validate` prints only `Payload-Oxum validation failed…` same as `--fast`, user cannot identify corrupt/missing file |
| S04 | https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177 | Issue #177 "Validation always defaults to fast" (2024-05-02, state open); body: indentation bug causes validation to always do fast (oxum-only), checksums not checked; points to PR #174 |
| S05 | https://patch-diff.githubusercontent.com/raw/LibraryOfCongress/bagit-python/pull/174.patch | PR #174 "Update bagit.py" patch (2024-03-14, closed 2024-09-18, merged_at null observed): moves `self._validate_oxum()` inside `if fast:` |
| S06 | https://api.github.com/repos/LibraryOfCongress/bagit-python/releases?per_page=10 | Release v1.9.0 (published 2025-06-13); changelog lists PRs 154/140/184/162/163/165/168/171/172/175/181/182/167/183 — PR #174 NOT listed |
| S07 | https://www.ndsa.org/publications/levels-of-digital-preservation/ | Levels of Digital Preservation v2.1 (Mar 2026; v2.0 2019, orig 2013); 5 functional areas incl Storage/Geographic Location, File Fixity/Data Integrity; matrix + implementation guidelines on OSF |
| S08 | https://www.sqlite.org/atomiccommit.html | SQLite "Atomic Commit In SQLite" (rollback-journal commit/rollback, hot journals, multi-file super-journal, things-that-can-go-wrong) |
| S09 | https://www.sqlite.org/wal.html | SQLite "Write-Ahead Logging" (WAL since 3.7.0; concurrency, checkpointing, WAL-file/-shm, network-FS exclusion, read-only limits) |
| S10 | https://www.sqlite.org/backup.html | SQLite "Backup API" (s1: raw file copy of live DB shortcomings — writers block, no in-memory, power-loss corruption; Online Backup API incremental snapshot; s1.1 VACUUM INTO, sqlite3_rsync) |
| S11 | https://www.archivematica.org/en/docs/archivematica-1.13/getting-started/quick-start/quick-start/ | Archivematica 1.13.2 Quick-Start (legacy): SIP→AIP+DIP, normalize for preservation and access, store AIP/DIP separately; OAIS SIP/AIP/DIP model |
| S12 | https://omeka.org/s/modules/Access/ | Omeka S "Access" module 3.4.47 (Daniel Berthereau): file-level access control beyond core public/private visibility — request/IP/auth/token, embargo dates, guest roles, download tracking; notice vs file separation |
| S13 | https://www.loc.gov/preservation/resources/rfs/audio.html | LOC Recommended Formats Statement, Audio Works (media-independent digital hierarchy; accompanying image/text pref.: TIFF/JPEG images, PDF text) |
| S14 | https://www.loc.gov/preservation/resources/rfs/stillimg.html | LOC Recommended Formats Statement, Still Image Works (photographs print/digital hierarchies; TIFF-family preference for preservation masters) |

## Bounded verbatim evidence (short quotes, fair-use excerpts)

S01 (RFC 8493): "A 'bag' has just enough structure to enclose descriptive
metadata 'tags' and a file 'payload'"; payload manifest lines are
`checksum filepath` with `/` separators; tagmanifest covers tag files;
Payload-Oxum (octet stream sum: bytes.files) enables quick completeness
screening before checksum validation.

S02 (bagit.py v1.8.1): `validate()` docstring: "If you supply the parameter
fast=True the Payload-Oxum (if present) will be used … instead of
re-calculating fixities … By default validate() will re-calculate fixities
(fast=False)." `_validate_contents` body calls `self._validate_oxum()` BEFORE
`if fast: return`, then `_validate_completeness()` and
`_validate_entries(processes)` (recomputes hashes, appends ChecksumMismatch
per file). See `sources/bagit-validate-excerpt.txt`.

S03 (#137 body excerpt): "F:\>bagit.py --validate Samples / 2019-07-03
17:57:37,366 - ERROR - Samples is invalid: Payload-Oxum validation failed.
Expected 10 files and 50586020 bytes but found 10 files and 50586017 bytes /
How can I get an output which will identify the corrupt file or the missing
file?"

S04 (#177 body excerpt): "It seems there is an indentation error / bug causing
validation to _always_ default to fast validation — meaning checksums are not
being checked — only the payload oxum." → PR #174.

S05 (PR #174 patch): removes unconditional `self._validate_oxum()` and places
it inside `if fast:` so full validation proceeds to completeness + per-file
checksum verification. Saved verbatim in `sources/pr174.patch`.

S06 (v1.9.0 notes): behavioral changes = PRs #154 (fetch.txt file-URL
validate), #140 (is_valid processes passthrough), #184; maintenance PRs
#162/#163/#165/#168/#171/#172/#175/#181/#182/#167/#183. No #174 → oxum
behavior from S02 plausibly still ships in v1.9.0 (unverified by execution;
verified by changelog absence + code read at v1.8.1).

S07 (NDSA): five areas (Storage/Geographic Location; File Fixity/Data
Integrity; Information Security; Metadata; File Formats), levels 1–4 from
"protect/know/monitor" upward; v2.1 adds environmental sustainability focus.
Small-shop reading: ≥2–3 copies, ≥1 offsite/different-threat, documented
storage, scheduled fixity, access control, format monitoring.

S08 (SQLite atomic commit): commit = journal→fsync→exclusive lock→write
pages→fsync→delete journal; crash before journal-delete ⇒ hot-journal
rollback on next access ("as if uncompleted writes never happened");
multi-file atomicity needs super-journal; failure modes: broken locking,
incomplete disk flushes, partial deletes, garbage writes, hot-journal
deletion/rename.

S09 (SQLite WAL): writers append frames to `-wal`, readers via `-shm` index;
readers don't block writers; checkpointing folds WAL into main DB; WAL does
NOT work over network filesystems (shared-memory requirement); opening a
WAL DB needs write access to `-shm` (or dir) except immutable/3.22+ cases.

S10 (SQLite backup): raw-copy-of-live-DB shortcomings: writers must wait;
power/OS failure during copy can corrupt the backup; Online Backup API copies
incrementally (lock only while reading), destination becomes bit-identical
snapshot "as it was when the copying commenced"; alternatives: VACUUM INTO,
sqlite3_rsync.

S11 (Archivematica): "Select Normalize for preservation and access …
create a preservation copy (AIP) and an access copy (DIP)"; AIP stored in
archival storage (BagIt), DIP (access copies + thumbnails + METS copy)
reviewed/served separately; masters and access copies share filenames,
differ in extension/format.

S12 (Omeka S Access): core visibility is only public/private; module adds
file-level access (free/restricted/protected/forbidden + embargo + IP/token/
request workflows); "notice visibility … apply only on files and never hide
the notice"; private item/media never public-side regardless of access level;
cascade item-set→item→media.

S13/S14 (LOC RFS): preservation masters = highest-fidelity, uncompressed or
lossless, open/documented: still images TIFF (uncompressed) family; audio
uncompressed PCM (WAV/BWF with embedded metadata) over lossy MP3/AAC;
scanned-text accompanying files TIFF/JPEG + PDF (PDF/A for text); keep
original + normalized preservation + service derivatives as distinct roles.

## What was NOT executed

No downloaded code was executed on the host; no installs, no accounts, no
network checks beyond page fetches. All "validation" below is proposed, not
executed. The only commands run were read-only (date/ls/stat/grep/sed over
already-fetched tool-output transcripts) plus mkdir for sources/.
