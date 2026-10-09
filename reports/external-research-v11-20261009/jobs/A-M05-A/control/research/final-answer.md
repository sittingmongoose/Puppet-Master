# ER11 S05 museum-search — complete native answer (final delivery, exported verbatim as predeclared fallback)

Saved 2026-10-09T19:43Z, before goal terminal completion. This is the complete final answer of case A-M05-A/control/research (method M05, GLM native route); if only a short status were delivered elsewhere, this file is the authoritative complete text.

## What was investigated and delivered

Independent discovery on the brief (public search for a local museum: 40k catalog records, uneven descriptions, images, changing rights, restricted cultural material; visitor discovery without expert vocabulary; curator corrections/exports), frozen before plan reveal, then compared clause-by-clause against the revealed thin plan.

## Artifacts (all under the allowed write root)

- `discovery.md` (13.6 KB) — pre-reveal discovery: metadata enrichment, keyword/typo-tolerant/semantic search, image handling, access policy, implementation/release conditions, obligation coverage map, six proposed validations. Frozen at sha256 2b97895a… by the reveal receipt; never rewritten after reveal.
- `source-map.json` + `sources/` (10 files incl. navigable `index.md`) — 9 immutable source IDs with URL/version/locator/access timestamp/observed operations; verified evidence for SQLite FTS5 defaults, pgvector release chain, Meilisearch typo defaults, IIIF Image API 3.0, Mukurtu protocol access model, RightsStatements SKOS vocabulary, Typesense index-level docs; negative-evidence log (SRC-09) for failed fetches (rightsstatements.org HTTP 526 ×2, OpenRefine blocked, pgvector releases page unusable). Usage/billing: null (unobserved).
- `revealed-plan.md` + `plan-reveal.json` — the once-only plan reveal (P1–P6), exit 0.
- `draft.md` (12 KB) — exact per-P dispositions (O4 vocabulary): P1 correction+user decision; P2 optional enhancement+correction (per-field embeddings, pgvector ≥0.8.4 pin); P3 correction+already-covered+condition (IIIF serving; captions under visibility rules); P4 rejected (nightly removal → query-time server-side visibility filtering, Mukurtu pattern, nightly job demoted to backstop check); P5 rejected (direct writes → attributed reversible overlays with provenance); P6 correction+uncertain (curator's ten queries → six-part visitor-centered validation set). Plus retained graded findings, conditions, alternatives, user decisions, uncertainty register, proposed-vs-executed split.
- `native-goal-lifecycle.md` — the native Goal's real lifecycle record (id sess_7f3f25b0…, created 19:28:01Z, objective 1949 chars, active at record time; science mtimes 19:34–19:39Z predate every harness state write, hence any terminal timestamp; completion only via the loop's own mechanism, no handwritten receipts).

## Headline scientific findings

1. Access enforcement must be query-time and server-side (P4's nightly removal rejected on exposure-window, rebuild-fragility, sync-vs-enforcement, and curator-transparency grounds); the domain's established pattern is Mukurtu's communities/cultural-protocols model (verified product evidence).
2. Version pinning is load-bearing for semantic search: pgvector iterative index scans (0.8.0) fix filtered-scan under-return; possible HNSW vacuum index corruption fixed 0.8.3; at 40k records exact scan remains a safe fallback.
3. Governing defaults shape curator config: Meilisearch typo bands vs accession numbers (`disableOnNumbers`); FTS5 has no typo/synonym support and external-content consistency is the operator's job.
4. IIIF Image API 3.0 makes the image serving layer a rights enforcement point (per-request quality/region/watermark control; level-0 static path for minimal ops).
5. Enrichment as provenance-carrying overlays, never in-place writes (P5 rejected) — preserves exports, audit and the "transparent corrections" obligation.
6. Validation must use visitor queries, not curator favorites (P6): six discriminating validations proposed (golden visitor set nDCG@10, typo torture, filtered vector recall, rights enforcement probe, IIIF conformance smoke, reconciliation pilot) — none executed; no runtime was available and none was pretended (O6 honesty).

## Lifecycle and deadline

Native Goal (this loop): active throughout work; all science artifacts saved before terminal completion; this answer is the final delivery. All work completed inside the stage deadline 2026-10-09T19:57:45Z (final save 19:43–19:44Z). Unknown fields (provider-side goal internals, usage/billing) are UNKNOWN/null, honestly.
