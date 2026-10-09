# Sources index — A-M01-B treatment/critic (S07 documentation-portal)

All critic reads occurred 2026-10-09T18:35Z–18:40Z. Local predecessor reads via `read_file` complete; independent verification via harness `web_fetch` (5 primaries, all HTTP 200, byte-identical to research). No campaign/history/evaluator/counterpart read.

Canonical locator table is `../source-map.json` (immutable IDs C00–C05 local, C10–C14 verification, no rebind). This directory holds bounded transcribed excerpts (governing defaults + verbatim discriminators) for the 5 independently re-verified primaries. Local predecessors (C00–C05) are cited by path + sha256 + bytes in source-map.json and are not duplicated here.

| ID | File | Upstream |
|----|------|----------|
| C10 | C10-docusaurus-versioning.excerpt.txt | https://docusaurus.io/docs/versioning (v3.10.2) |
| C11 | C11-docusaurus-search.excerpt.txt | https://docusaurus.io/docs/search (v3.10.2) |
| C12 | C12-meilisearch-typo.excerpt.txt | Meilisearch typo tolerance doc |
| C13 | C13-pagefind-search-config.excerpt.txt | https://pagefind.app/docs/search-config/ |
| C14 | C14-vale.excerpt.txt | https://docs.vale.sh/topics/.vale.ini.md |

Non-re-verified research sources (S03–S05/S07/S09–S10/S12/S14/S16 + snippet-only S13/S15/S17–S23) inherit research provenance; see `critique.md` §"Critic limits" and findings M4/m6–m8 for confidence flags.

Mutable-drift note: vendor `/latest/` and unpinned doc URLs are mutable; pinned versions (Docusaurus 3.10.2, Pagefind 1.5.0 banner, Vale v3.22.0+ note) recorded in source-map.json. Re-verify before build.
Usage/billing: unobserved (null) for all sources.
