# Stable source ID index (ER10 I-ANCHOR-MUSE control critic-v1)

IDs are stable and never rebound. C-IDs are this critic's independently retrieved evidence. S-IDs are the
predecessor's (research-v1) sources, listed here as locators only; their content lives under
`/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-ANCHOR-MUSE/control/research-v1/`.

## New critic evidence (C-IDs)

- C1 — bagit-python source at pinned tag v1.9.0, file bagit.py (independent re-read; read, not executed).
  URL: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
  Range: DEFAULT_CHECKSUMS/HASH_BLOCK_SIZE (L128/L131); validate/is_valid/_validate_contents (L586-795)
  incl. always-run oxum + early-return ordering; _validate_oxum (L797-838); _validate_entries error
  collection (L860-910); CLI --validate/--fast/--completeness-only + main() gating + success messages;
  _load_manifests v0.97+ tag coverage; _make_tagmanifest_file/_find_tag_files generation scope.
  Retrieved: 2026-10-07T18:37:55Z (HTTP 200, 54632 bytes). Evidence: sources/C1-bagit-python-v1.9.0.md
- C2 — BagIt File Packaging Format V1.0, RFC 8493 (Informational, Oct 2018; independent re-read).
  URL: https://www.rfc-editor.org/rfc/rfc8493.html
  Range: S1.3 (complete/valid); S2.1 (required) / S2.2 (optional incl. tagmanifest, bag-info, fetch);
  S2.4 (SHA-256/512 MUST, SHA-512 default SHOULD); S3 rule 4 (1.0 every-file-in-every-manifest); S5.1
  (path traversal); S5.2 (fetch URL control + older-algorithm spoofing); S5.3 (fetch sizes untrusted);
  S5.4 (general active-attack limit + signatures); S6.1.2 (Windows/Unix naming); Payload-Oxum purpose.
  Retrieved: 2026-10-07T18:38:24Z (HTTP 200, 63600 bytes). Evidence: sources/C2-rfc8493.md
- C3 — SQLite, "Atomic Commit In SQLite" (versionless rolling doc; independent re-read).
  URL: https://www.sqlite.org/atomiccommit.html
  Range: S3 (single-file commit); S4 (hot journals/rollback); S5 (multi-file gap); S9 (failure modes);
  absence check for "backup".
  Retrieved: 2026-10-07T18:38:47Z (HTTP 200, 77968 bytes). Evidence: sources/C3-sqlite-atomiccommit.md
- C4 — Omeka S User Manual, "Items" page (versionless rolling doc; independent re-read).
  URL: https://omeka.org/s/docs/user-manual/content/items/
  Range: mixed-visibility rule (verbatim); per-property eyes + role-scoped visibility (verbatim); roles
  table; site auto-add + per-user Default-sites (verbatim); user-deletion orphaning (verbatim); Browse
  items public views.
  Retrieved: 2026-10-07T18:38:52Z (HTTP 200, 64527 bytes). Evidence: sources/C4-omeka-items.md
- C5 — bagit-python issue #177 state, PR #174 state + discussion, v1.9.0 release record (GitHub API).
  URLs: https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177 ;
  https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174 ;
  https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0 ;
  https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/174/comments
  Range: issue state/created/comments; PR state/merged/created/closed + 6 discussion comments (maintainer
  refutation + reporter reporting complaint + author close); release tag/published_at/created_at + full
  "What's Changed" body (#154/#140/#184 behavioral; #162/#183/#167 maintenance).
  Retrieved: 2026-10-07T18:39:03Z–18:39:04Z (HTTP 200 x3). Evidence: sources/C5-issue177-pr174-release.md
  + sources/C5-issue177.json + sources/C5-pr174.json + sources/C5-release190.json
- C6 — Archivematica 1.18 intro page, scope count (what retrieved S6 ranges do NOT cover).
  URL: https://www.archivematica.org/en/docs/archivematica-1.18/getting-started/overview/intro/
  Range: full page term counts (normaliz 0, BagIt 0, PREMIS 0, "format policy" 0, AtoM 2, preservation 7).
  Retrieved: 2026-10-07T18:39:20Z (HTTP 200, 24438 bytes). Evidence: sources/C6-archivematica-scope.md

Byte-match note: C1–C4 fetched byte counts (54632/63600/77968/64527) exactly match the predecessor's S2/S1/
S4/S5 counts, confirming identical upstream content at critic retrieval time.

## Predecessor source locators (S-IDs; immutable, owned by research-v1)

- S1 — RFC 8493. Index: research-v1/SOURCES.md; note: research-v1/sources/S1-bagit-rfc8493.md.
- S2 — bagit-python v1.9.0 bagit.py. Index: research-v1/SOURCES.md; note: research-v1/sources/S2-bagit-python-v1.9.0.md.
- S3 — issue #177 / PR #174 / v1.9.0 release. Index: research-v1/SOURCES.md; note: research-v1/sources/S3-issue177-pr174-release.md.
- S4 — SQLite atomic commit. Index: research-v1/SOURCES.md; note: research-v1/sources/S4-sqlite-atomiccommit.md.
- S5 — Omeka S Items manual. Index: research-v1/SOURCES.md; note: research-v1/sources/S5-omeka-items.md.
- S6 — Archivematica 1.18 docs (index + 1.18 root + intro). Index: research-v1/SOURCES.md; note: research-v1/sources/S6-archivematica-1.18.md.

Selection note: C1–C6 were selected to independently verify the draft's consequential claims (pinned
component behavior, RFC rules, crash semantics, rights semantics, issue/release states, S6 citation scope).
No other arms, reviews, evaluator answers, root/historical analyses, or costs were read. No code executed.
