# SOURCES — I-ANCHOR-GLM CONTROL reviser-v2

Stable source IDs are never rebound. S1–S7 keep their predecessor (research-v2) bindings and locators exactly; their evidence files remain in the predecessor's bounded directory `../research-v2/sources/` (not duplicated, not edited). This stage adds exactly one new source, S8, resolving the trigram-version uncertainty; full primary metadata and a bounded evidence file are recorded here under this stage's own `sources/` directory.

## Predecessor sources (IDs and locators preserved verbatim; never rebound)

| ID | Source | URL | Version/range | Retrieved (UTC) | Frozen-plan area | Evidence file |
|----|--------|-----|---------------|-----------------|------------------|---------------|
| S1 | openZIM — ZIM file format specification (major 6, minor 3) | https://wiki.openzim.org/wiki/ZIM_file_format | ZIM format major 6, minor 3; page last edited 2026-09-12; tied to libzim 9.3.0 | 2026-10-07T18:56Z (immediately after the 18:55:54Z clock check) | delivery container (frozen plan: ZIP+HTML+JSON manifest, unzip over active dir) | sources/S1-zim-format.md |
| S2 | SQLite FTS5 full-text search documentation | https://www.sqlite.org/fts5.html | FTS5 first shipped in SQLite 3.9.0 (2015-10-14); features stated on the fetched page include secure-delete (3.42.0) and contentless-delete (3.43.0) | 2026-10-07T18:56Z (immediately after the 18:55:54Z clock check) | search (frozen plan: search by scanning page text) | ../research-v2/sources/S2-sqlite-fts5.md |
| S3 | cure53/DOMPurify release history (GitHub releases) | https://github.com/cure53/DOMPurify/releases | latest at retrieval: 3.4.16; GPG-verified tags (Cure53 key 5F0CDACD24BB6BF4); e.g. 3.4.16 commit b9b9d80 | 2026-10-07T18:56Z (immediately after the 18:55:54Z clock check) | untrusted contributed content (frozen plan: unspecified; renders HTML pages directly) | ../research-v2/sources/S3-dompurify-releases.md |
| S4 | W3C — Web Content Accessibility Guidelines (WCAG) 2.2 | https://www.w3.org/TR/WCAG22/ | W3C Recommendation, 12 December 2024; SC 4.1.1 Parsing removed in 2.2 | 2026-10-07T18:57Z (between the 18:55:54Z and 18:57:41Z clock checks) | accessibility (frozen plan: unspecified) | ../research-v2/sources/S4-wcag22.md |
| S5 | Linux man-pages — rename(2) | https://man7.org/linux/man-pages/man2/rename.2.html | man-pages page as retrieved 2026-10-07 (Linux-specific notes section included) | 2026-10-07T18:57Z (between the 18:55:54Z and 18:57:41Z clock checks) | update atomicity / keep serving previous edition during power loss (frozen plan: unzip new bundle over active directory) | ../research-v2/sources/S5-rename2.md |
| S6 | Python 3.14 documentation — zipfile (extraction safety) | https://docs.python.org/3/library/zipfile.html | Python 3.14 (3.14.8) docs as retrieved | 2026-10-07T18:57Z (between the 18:55:54Z and 18:57:41Z clock checks) | unsafe extraction of untrusted bundles + hostile content / ZIP-bomb risk (frozen plan: unzip new bundle over active directory) | ../research-v2/sources/S6-python-zipfile.md |
| S7 | The Update Framework (TUF) — security model | https://theupdateframework.io/security/ | project documentation as retrieved 2026-10-07 (TUF is a CNCF incubating spec; spec version not shown on this page) | 2026-10-07T18:58Z (after the 18:57:41Z clock check) | integrity + rollback + remote editor approval (frozen plan: "trust the manifest version"; unspecified integrity/rollback) | ../research-v2/sources/S7-tuf.md |

## New stage source

| ID | Source | URL | Version/range | Retrieved (UTC) | Purpose | Evidence file |
|----|--------|-----|---------------|-----------------|---------|---------------|
| S8 | SQLite — release history / chronology (changes.html) | https://www.sqlite.org/changes.html | SQLite 3.34.0 (released 2020-12-01): "Enhanced FTS5 to support trigram indexes" — the first release with FTS5 trigram support; no other listed release mentions trigram | 2026-10-07T19:25Z (immediately after the 19:24:49Z clock check, during reviser-v2 final authoring) | resolves the reviser-stage trigram-introducing-version uncertainty; supports the pinned-pin claim in final.md §2 | sources/S8-sqlite-changes.md |

## Retrieval-time anchors (this stage)
- Clock check 2026-10-07T19:24:49Z immediately before the S8 fetch.
- Bounded re-reads of predecessor evidence files S5-rename2.md and S2-sqlite-fts5.md (no network) during finding checks, ~19:25Z.

## Proposed-vs-executed note (this stage)
- Executed: the single S8 fetch above and the bounded local evidence re-reads; all recorded receipts are honest.
- Everything architectural in final.md is proposed, not executed.

## First useful saved finding (this stage)
- S8: the trigram tokenizer's introducing version is 3.34.0, converting the predecessor's version uncertainty into a bounded, pinned fact — pin checks must compare the deployed SQLite build against it.
