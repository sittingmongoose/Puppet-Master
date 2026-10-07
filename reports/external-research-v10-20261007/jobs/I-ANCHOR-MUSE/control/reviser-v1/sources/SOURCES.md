# Stable source ID index (ER10 I-ANCHOR-MUSE control reviser-v1)

IDs are stable and never rebound. R-IDs are this reviser's independently retrieved evidence,
used to source-check every changed consequential claim (C-1–C-13 dispositions). S-IDs are the
researcher's (research-v1) sources and C-IDs the critic's (critic-v1) sources, listed here as
locators only; their content lives in the predecessor directories. No S-ID or C-ID was rebound.

## New reviser evidence (R-IDs)

- R1 — BagIt File Packaging Format V1.0, RFC 8493 (Informational, Oct 2018; reviser re-read).
  URL: https://www.rfc-editor.org/rfc/rfc8493.html
  Range: S1.3 (complete/valid); S2.1 (required) / S2.2 (optional); S2.4 (SHA-256/512 MUST,
  SHA-512 default SHOULD); S3 rule 4 (1.0 every-file-in-every-manifest); S5.1 (path traversal);
  S5.2 (fetch URL control + older-algorithm spoofing); S5.3 (fetch sizes untrusted); S5.4 (general
  active-attack limit + signatures); S6.1.2 (naming); Payload-Oxum purpose.
  Retrieved: 2026-10-07T18:45:28Z (HTTP 200, 63600 bytes). Evidence: sources/R1-rfc8493.md
- R2 — bagit-python v1.9.0 release record + issue #177 state (GitHub API; reviser re-check).
  URLs: https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0 ;
  https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177
  Range: release tag/published_at/created_at + full "What's Changed" body; issue
  state/created_at/title.
  Retrieved: 2026-10-07T18:45:32Z (HTTP 200 x2). Evidence: sources/R2-release190-issue177.md
- R3 — Omeka S User Manual, "Items" page (versionless rolling doc; reviser re-read).
  URL: https://omeka.org/s/docs/user-manual/content/items/
  Range: mixed-visibility rule; per-property eyes + role-scoped visibility; orphaning note; site
  auto-add + per-user Default-sites; structured-property display.
  Retrieved: 2026-10-07T18:45:32Z (HTTP 200, 64527 bytes). Evidence: sources/R3-omeka-items.md
- R4 — bagit-python source at pinned tag v1.9.0, file bagit.py (reviser re-read; read, not executed).
  URL: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
  Range: DEFAULT_CHECKSUMS/HASH_BLOCK_SIZE (L128/L131); validate/is_valid/_validate_contents
  incl. always-run oxum + early-return ordering; _validate_entries error collection; CLI
  --validate/--fast/--completeness-only + main() gating + success messages; v0.97+ tag coverage;
  missing_optional_tagfiles generation-scope caveat.
  Retrieved: 2026-10-07T18:45:28Z (HTTP 200, 54632 bytes). Evidence: sources/R4-bagit-python-v1.9.0.md

Byte-match note: R1/R3/R4 fetched byte counts (63600/64527/54632) exactly match the S- and C-stage
counts for the same URLs; R2 JSON byte counts (4260/3149) match C5. Identical upstream content at
reviser retrieval time.

Deliberately not re-fetched: SQLite atomic-commit page (no changed consequential claim depends on
new SQLite wording; F4/F5 premises already verified twice via S4/C3 with matching bytes) and
Archivematica pages (C-1/C-2 resolved by reframing, not by new Archivematica claims; no new
Archivematica claim is made, so no new source is required).

## Predecessor source locators (immutable)

Research-v1 (index: research-v1/SOURCES.md; notes: research-v1/sources/):
- S1 — RFC 8493. Note: sources/S1-bagit-rfc8493.md.
- S2 — bagit-python v1.9.0 bagit.py. Note: sources/S2-bagit-python-v1.9.0.md.
- S3 — issue #177 / PR #174 / v1.9.0 release. Note: sources/S3-issue177-pr174-release.md.
- S4 — SQLite atomic commit. Note: sources/S4-sqlite-atomiccommit.md.
- S5 — Omeka S Items manual. Note: sources/S5-omeka-items.md.
- S6 — Archivematica 1.18 docs (index + 1.18 root + intro). Note: sources/S6-archivematica-1.18.md.

Critic-v1 (index: critic-v1/sources/SOURCES.md; notes: critic-v1/sources/):
- C1 — bagit.py v1.9.0 re-read. Note: sources/C1-bagit-python-v1.9.0.md.
- C2 — RFC 8493 re-read. Note: sources/C2-rfc8493.md.
- C3 — SQLite atomic commit re-read. Note: sources/C3-sqlite-atomiccommit.md.
- C4 — Omeka Items re-read. Note: sources/C4-omeka-items.md.
- C5 — issue/PR/release API re-check. Notes: sources/C5-issue177-pr174-release.md +
  sources/C5-issue177.json + sources/C5-pr174.json + sources/C5-release190.json.
- C6 — Archivematica intro scope count. Note: sources/C6-archivematica-scope.md.

Selection note: R1–R4 were selected to independently verify the reviser's changed consequential
claims (RFC REQUIRED/OPTIONAL + section attributions + traversal rule; release date and issue
state; rights leak vectors and hiding scope; pinned validation ordering and tag coverage). No other
arms, reviews, evaluator answers, parent/historical analyses, campaign costs, or state were read.
No code executed.
