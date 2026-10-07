# Stable source ID index (ER10 I-ANCHOR-MUSE control research-v1)

IDs are stable and never rebound. Each entry: ID, exact URL, version/range, retrieval timestamp (UTC, from fetch-completion file mtime).

- S1 — BagIt File Packaging Format V1.0, RFC 8493 (Informational, Oct 2018).
  URL: https://www.rfc-editor.org/rfc/rfc8493.html
  Range: Abstract; Sections 1.3 (terminology), 2.1–2.4 (structure, manifests, algorithms), 3 (complete/valid bags), 5.2–5.4 (fetch/security), 6.1.2 (Windows/Unix naming).
  Retrieved: 2026-10-07T18:29:47Z. Evidence: sources/S1-bagit-rfc8493.md
- S2 — bagit-python source at pinned tag v1.9.0, file bagit.py (single-module library + CLI).
  URL: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
  Range: DEFAULT_CHECKSUMS/HASH_BLOCK_SIZE; Bag.validate/is_valid/_validate_contents/_validate_oxum/_validate_entries; CLI --validate/--fast/--completeness-only; main() dispatch.
  Retrieved: 2026-10-07T18:30:03Z. Evidence: sources/S2-bagit-python-v1.9.0.md
- S3 — bagit-python issue #177 (OPEN, opened 2024-05-02 by finoradin), PR #174 (closed unmerged 2024-09-18 by author), v1.9.0 release notes (released "13 Jun", year not displayed on page; changelog v1.8.0...v1.9.0).
  URLs: https://github.com/LibraryOfCongress/bagit-python/issues/177 ; https://github.com/LibraryOfCongress/bagit-python/pull/174 ; https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0
  Range: issue body + state; PR conversation incl. maintainer reply; release "What's Changed" (behavioral #154/#140/#184, maintenance incl. #183).
  Retrieved: 2026-10-07T18:30:03Z (issue), 18:30:21Z (PR), 18:30:41Z (release). Evidence: sources/S3-issue177-pr174-release.md
- S4 — SQLite, "Atomic Commit In SQLite" (versionless rolling doc).
  URL: https://www.sqlite.org/atomiccommit.html
  Range: Sections 3 (single-file commit), 4 (rollback, hot rollback journals), 9 (things that can go wrong).
  Retrieved: 2026-10-07T18:30:29Z. Evidence: sources/S4-sqlite-atomiccommit.md
- S5 — Omeka S User Manual, "Items" page (versionless rolling doc).
  URL: https://omeka.org/s/docs/user-manual/content/items/
  Range: Item permissions table; Site permissions; Visibility (public/private item + media); per-property eye icons; user-deletion orphaning note.
  Retrieved: 2026-10-07T18:31:03Z. Evidence: sources/S5-omeka-items.md
- S6 — Archivematica documentation, stable-current 1.18.0: docs index + "What is Archivematica?" overview.
  URLs: https://www.archivematica.org/en/docs/ ; https://www.archivematica.org/en/docs/archivematica-1.18/ ; https://www.archivematica.org/en/docs/archivematica-1.18/getting-started/overview/intro/
  Range: version list (1.18.0 stable-current); OAIS compliance; microservices; SIP arrangement/appraisal; AGPL/CC-BY-SA licensing; low-capacity target audience.
  Retrieved: 2026-10-07T18:30:54Z (index), 18:31:19Z (1.18 root), 18:31:27Z (intro). Evidence: sources/S6-archivematica-1.18.md

Selection note: all six were selected independently from the user-level brief (ingest/fixity/catalog/rights/recovery needs). No other arms, reviews, historical answers, or campaign analysis were read. No code was executed; all component-behavior claims come from reading the pinned source text (S2) and rendered pages above.
