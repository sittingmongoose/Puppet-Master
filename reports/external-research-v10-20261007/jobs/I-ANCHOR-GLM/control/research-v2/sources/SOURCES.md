# SOURCES — I-ANCHOR-GLM CONTROL research-v2

Stable source IDs are never rebound. All sources are independent, legitimate primary public documentation; no treatment-arm, evaluator or historical-analysis material was consulted.

| ID | Source | URL | Version/range | Retrieved (UTC) | Frozen-plan area | Evidence file |
|----|--------|-----|---------------|-----------------|------------------|---------------|
| S1 | openZIM — ZIM file format specification (major 6, minor 3) | https://wiki.openzim.org/wiki/ZIM_file_format | ZIM format major 6, minor 3; page last edited 2026-09-12; tied to libzim 9.3.0 | 2026-10-07T18:56Z (immediately after the 18:55:54Z clock check) | delivery container (frozen plan: ZIP+HTML+JSON manifest, unzip over active dir) | sources/S1-zim-format.md |
| S2 | SQLite FTS5 full-text search documentation | https://www.sqlite.org/fts5.html | FTS5 first shipped in SQLite 3.9.0 (2015-10-14); features stated on the fetched page include secure-delete (3.42.0) and contentless-delete (3.43.0) | 2026-10-07T18:56Z (immediately after the 18:55:54Z clock check) | search (frozen plan: search by scanning page text) | sources/S2-sqlite-fts5.md |
| S3 | cure53/DOMPurify release history (GitHub releases) | https://github.com/cure53/DOMPurify/releases | latest at retrieval: 3.4.16; GPG-verified tags (Cure53 key 5F0CDACD24BB6BF4); e.g. 3.4.16 commit b9b9d80 | 2026-10-07T18:56Z (immediately after the 18:55:54Z clock check) | untrusted contributed content (frozen plan: unspecified; renders HTML pages directly) | sources/S3-dompurify-releases.md |
| S4 | W3C — Web Content Accessibility Guidelines (WCAG) 2.2 | https://www.w3.org/TR/WCAG22/ | W3C Recommendation, 12 December 2024; SC 4.1.1 Parsing removed in 2.2 | 2026-10-07T18:57Z (between the 18:55:54Z and 18:57:41Z clock checks) | accessibility (frozen plan: unspecified) | sources/S4-wcag22.md |
| S5 | Linux man-pages — rename(2) | https://man7.org/linux/man-pages/man2/rename.2.html | man-pages page as retrieved 2026-10-07 (Linux-specific notes section included) | 2026-10-07T18:57Z (between the 18:55:54Z and 18:57:41Z clock checks) | update atomicity / keep serving previous edition during power loss (frozen plan: unzip new bundle over active directory) | sources/S5-rename2.md |
| S6 | Python 3.14 documentation — zipfile (extraction safety) | https://docs.python.org/3/library/zipfile.html | Python 3.14 (3.14.8) docs as retrieved | 2026-10-07T18:57Z (between the 18:55:54Z and 18:57:41Z clock checks) | unsafe extraction of untrusted bundles + hostile content / ZIP-bomb risk (frozen plan: unzip new bundle over active directory) | sources/S6-python-zipfile.md |
| S7 | The Update Framework (TUF) — security model | https://theupdateframework.io/security/ | project documentation as retrieved 2026-10-07 (TUF is a CNCF incubating spec; spec version not shown on this page) | 2026-10-07T18:58Z (after the 18:57:41Z clock check) | integrity + rollback + remote editor approval (frozen plan: "trust the manifest version"; unspecified integrity/rollback) | sources/S7-tuf.md |

## Retrieval-time anchors
- Clock check 2026-10-07T18:55:54Z immediately before fetch batch 1 (S1, S2, S3).
- Batch 2 (S4, S5, S6) between the 18:55:54Z and 18:57:41Z clock checks.
- Clock check 2026-10-07T18:57:41Z immediately before fetch batch 3 (S7).
- Index and evidence files written: 2026-10-07T18:59:33.793225+00:00

## Proposed-vs-executed note
- Executed checks: the seven fetches above (page content as summarized in each evidence file).
- Everything else in the forthcoming draft (architecture proposals, test plans) is proposed, not executed.

## First useful saved finding
- 2026-10-07T18:59:33.793225+00:00 — S5: rename(2) gives a crash-atomic directory activation primitive that directly corrects the frozen plan's risky in-place unzip-over-active-directory step; combined with S6 (destructive re-extraction, traversal warnings) and S7 (version monotonicity defeats rollback), the plan's three unspecified hazards (atomicity, integrity, rollback) have concrete primary-source mechanisms.
