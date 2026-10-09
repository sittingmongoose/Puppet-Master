# sources/ — navigable index

Evidence notes for ER11 case S05 (museum-search), block A-M05-A, arm treatment, stage research.
All accessed 2026-10-09 UTC via WebFetch summarized extraction of public primary sources. One file per immutable source ID (S01–S18). Raw page dumps were not retained; each file quotes the exact passages the discovery relies on, with locators.

## Keyword search engines
- [S01 — SQLite FTS5 documentation](S01-sqlite-fts5.md) — BM25 default ranking (k1=1.2, b=0.75 hard-coded), unicode61 tokenizer + diacritics default, external-content trigger obligations, 32768-byte silent token truncation, detail=none index sizing.
- [S07 — Meilisearch settings API](S07-meilisearch-settings.md) — typoTolerance defaults (enabled, oneTypo=5, twoTypos=9, disableOn*), ranking rules order.
- [S08 — Typesense docs 30.2](S08-typesense-docs.md) — num_typos=2 (Damerau–Levenshtein), typo_tokens_threshold, vector fields, auto-embed models, hybrid fusion 0.7 keyword/0.3 vector.
- [S06 — MiniSearch](S06-minisearch.md) — in-browser JS search: fuzzy 0.2 relative, prefix, boost, autoSuggest, zero deps, v7.2.0.

## Semantic search and embeddings
- [S09 — all-MiniLM-L6-v2 model card](S09-minilm-l6-v2.md) — 384-dim, 256 word-piece truncation, 1.17B training pairs, apache-2.0, 22.7M params.
- [S10 — clip-ViT-B-32 model card](S10-clip-vit-b-32.md) — image+text shared space for image search; dim/77-token/license NOT stated on page (unverified).
- [S11 — sqlite-vec](S11-sqlite-vec.md) — vector search inside SQLite, pre-v1, v0.1.9 (2026-03-31) DELETE-bug fix release.

## Metadata enrichment vocabularies
- [S05 — Getty AAT](S05-getty-aat.md) — 74,460 concepts / 503,230 terms, generic-terms-only scope, ODC-By 1.0, LOD/API formats, refresh cadence.
- [S04 — Wikidata wbsearchentities](S04-wikidata-wbsearchentities.md) — label/alias search API, limit default 7 / max 50, language fallback behavior.

## Image handling and viewers
- [S02 — IIIF Image API 3.0](S02-iiif-image-api-3.0.md) — info.json contract, request URI grammar, 400/501 semantics, compliance levels, rights property.
- [S18 — Cantaloupe releases + CVE chain](S18-cantaloupe-releases.md) — PDFBox CVE-2021-27807/CVE-2021-27906 fixed in v4.1.9 and v5.0.1 (same day); issue #634 dependency-CVE surface; latest v5.0.7 (2025-03-13).
- [S17 — OpenSeadragon releases](S17-openseadragon-releases.md) — 5.0.0 breaking (IE11 dropped, WebGL default) → 5.0.1 regression cluster (white-image bug) → 6.0.0 overhaul; latest v6.1.1 (2026-09-09).

## Access policy for changing rights and restricted material
- [S15 — RightsStatements.org data model](S15-rightsstatements-data-model.md) — all 12 statement URIs, SKOS/Turtle + JSON-LD labels split, CC0, pin 93f1613; live-site HTTP 526 outage observed.
- [S03 — IIIF Authentication API 1.0](S03-iiif-auth-api-1.0.md) — token JSON, Bearer, iframe/postMessage, login/clickthrough/kiosk/external patterns, tiered 302/401; third-party-cookie deprecation warning.
- [S16 — Local Contexts TK Labels](S16-localcontexts-tk-labels.md) — provenance/protocol/permission labels for Indigenous protocols; page's own "19 labels" vs listed names inconsistency recorded.

## Museum platforms and approaches
- [S12 — Omeka S](S12-omeka-s.md) — cultural-heritage publishing platform, LOD, DPLA templates, modules, GPL, Digital Scholar.
- [S13 — CollectiveAccess](S13-collectiveaccess.md) — Providence cataloging + Pawtucket2 public access, metadata standards, batch import/export, v2.0.11 (2026-03-15).
- [S14 — Minicomp/Wax](S14-wax.md) — minimal-computing static exhibitions (Jekyll); landing page only, repo details not fetched.

## Access-method note
Every source was fetched read-only over the public web during 2026-10-09 ~19:29–19:56 UTC. Timestamps in `source-map.json` are minute-granular fetch-round anchors. Two access failures are themselves recorded as observations: rightsstatements.org HTTP 526 (see S15) and three wrong-path Typesense URLs 404 (see S08) — neither altered source content.

## Post-reveal addendum (critic-demanded re-derivations, fetched 2026-10-09 ~20:18 UTC)
- [S19 — Cantaloupe CHANGES.md](S19-cantaloupe-changes.md) — verifies the v5.0.1 EXIF-parsing fix verbatim (critic finding M1); corrects CVE-2019-0228 attribution to 4.1.2; flags CVE-2023-37460 as not in changelog.
- [S20 — SQLite release notes](S20-sqlite-changes.md) — retains the FTS5 3.44.2→3.51.1 release chain verbatim (critic finding M3), turning the pin-and-reverify condition from asserted to evidenced.
