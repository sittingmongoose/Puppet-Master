# Draft — A-M01-B treatment/research · S07 documentation-portal · complete planning deliverable

- Block/arm/stage: A-M01-B / treatment / research. Case S07. Method M01 coherent-batching.
- Status: post-reveal final for this scope. Discovery (`discovery.md`, sha256
  `f4ee44da…780a2edd`, 32646 bytes) frozen at 2026-10-09T18:31:20Z and NOT rewritten after
  reveal. This draft compares every exact P clause (O4), retains alternatives, conditions,
  constraints, disagreement and uncertainty in one self-contained text (O5), and separates
  executed checks from proposed validations (O6). Later stages may correct it.
- Brief (restated so this file stands alone): internal documentation portal for a 60-person
  engineering group with three codebases, multilingual notes, frequent releases. Search must
  return the relevant RELEASED version, cite exact passages, and help maintainers SEE
  contradictions WITHOUT silently rewriting documentation. Scope: research products/mechanisms,
  code/doc linkage, retrieval conditions, migration/export for this small product brief — not
  unlimited production guarantees.
- Thin plan under comparison (exact text, `revealed-plan.md`, plan sha256 `906fbabc…7f7ee6`):
  P1 "Crawl main branches nightly." P2 "Put every chunk in one vector index."
  P3 "Answer with the top five chunks and links." P4 "Let maintainers approve suggested
  rewrites." P5 "Keep old documentation pages separately." P6 "Test by asking maintainers
  ten familiar questions."
- Sources: `source-map.json` (S00–S23), excerpts in `sources/`, full evidence in
  `discovery.md` §§1–4. Usage/billing unobserved (null).

## 1. Per-P disposition (O4) — exact clauses, one verdict each

| P | Exact clause | Disposition | One-line rationale |
|---|--------------|-------------|--------------------|
| P1 | Crawl main branches nightly. | CORRECTION | Brief demands RELEASED versions; main-only indexing serves unreleased WIP and misses tags. |
| P2 | Put every chunk in one vector index. | CORRECTION (flat part REJECTED) | Unpartitioned single index cannot satisfy version+locale+codebase relevance; needs mandatory partition attributes and hybrid retrieval. |
| P3 | Answer with the top five chunks and links. | CORRECTION + USER DECISION | Fixed top-5 without version pin, citation identity, or escape hatches; k and excerpt size are tunable user decisions. |
| P4 | Let maintainers approve suggested rewrites. | REJECTED (mechanism) + CORRECTION (report-only review retained) | Rewrite-suggestion pipeline contradicts the no-silent-rewrite constraint; approval gates are retained for HUMAN-authored edits surfaced by report-only linters. |
| P5 | Keep old documentation pages separately. | ALREADY-COVERED in principle + CORRECTION in precision + USER DECISION on model | "Separately" must become versioned URLs + switcher + banners + scoped search + index policy; four concrete models offered. |
| P6 | Test by asking maintainers ten familiar questions. | CORRECTION (kept as qualitative signal, replaced as gate) | Familiar-question sampling cannot discriminate version/locale/citation behavior; stratified automated suite proposed. |

No P clause is accepted verbatim. No finding below is uncertain ABOUT the verdicts above;
residual uncertainty (§7) concerns product choices the evidence cannot settle (hosting,
locales, cadence), not the dispositions.

### P1 — Crawl main branches nightly → CORRECTION

What's wrong. (a) Main is the development branch: indexing it as the default serves
unreleased content, the exact failure Docusaurus warns against with
`includeCurrentVersion: true` (disable when `./docs` is WIP) and that the `banner:
'unreleased'` mechanism exists to label. (b) "Nightly" is a cadence, not a trigger:
with frequent releases a nightly crawl is stale within hours of a tag, and it never
captures the release EVENT (tag push) that should define a version boundary. (c) "Crawl"
presupposes a crawler architecture (Algolia-style weekly crawl of public URLs), which is
inapplicable if — as "internal" suggests — the portal sits behind auth (firewalled sites
must run their own crawler or switch engines).

Corrected P1. Index RELEASE VERSIONS as first-class units: one indexed scope per
(codebase, released version, locale), built from tags/versioned outputs at release time
(webhook on tag push) with a nightly (or more frequent) job only as catch-up for notes
edits. Optionally index `main`/`next` as an explicitly labeled, bannered, non-default
scope for pre-release preview. Corrected text: "Build one search scope per released
(codebase, version, locale) at tag time; re-index notes on merge; keep main/next as a
labeled opt-in scope, never the default."

Governing conditions: C1 (version), C3 (release status), C4 (codebase identity),
C5 (index scope), C12 (visibility). Related O3: Chain A (wrong-version retrieval) and
PR #744 (`version:latest` hardcode) are the historical instances of P1's failure shape.

### P2 — Put every chunk in one vector index → CORRECTION, flat part REJECTED

What's wrong. A single unpartitioned vector index mixes versions, locales, and codebases
into one embedding space. Consequences evidenced in discovery: (a) version pollution —
queries return passages from superseded releases with no signal of staleness (Chain A
generalized to vectors); (b) multilingual false positives — Meilisearch's own guidance
warns typo tolerance causes false-positive matches on massive/multilingual data, and the
same geometry argument applies to dense vectors across languages; (c) identifier failure —
version strings and API symbols (`v2.1.0`, `getUserById`) need exact/lexical matching with
typos DISABLED on those fields, which pure-vector retrieval cannot express; (d) no
citation identity — chunk embeddings do not preserve excerpt→source-passage traceability
unless chunk records carry (URL, version, locale, offsets) and the serving layer enforces it.

Corrected P2. Partitioned, attributed, hybrid retrieval: every record carries mandatory
(version, locale, codebase, release status, source URL, offsets); version+locale+codebase
are facet/filter fields (Typesense `filter_by`, Meilisearch filterable attributes, Algolia
facets, or Pagefind per-version index + `data-pagefind-filter`); default queries pin the
reader's (version, locale, codebase) with explicit escape hatches ("search all versions").
Use lexical-first retrieval (BM25/keyword with per-field typo control: typos off on
version/identifier fields) with optional semantic re-ranking inside the pinned scope —
never semantic search across unpartitioned versions. Corrected text: "Store every chunk
with (version, locale, codebase, status, source, offsets); partition and filter on those
attributes; retrieve lexically first within the pinned scope, optionally re-rank
semantically."

REJECTED part: the flat single index with no partition attributes. OPTIONAL ENHANCEMENT
within the correction: dense-vector re-ranking and synonyms (Typesense v27
`synonym_prefix=false`/`synonym_num_typos=0` safe defaults; enable deliberately with
`demote_synonym_match` considered). USER DECISION: engine choice — Typesense vs
Meilisearch (self-hosted) vs Pagefind per-version static indexes (zero-service) vs Algolia
DocSearch (only if public/crawlable). Governing conditions: C1, C2, C4, C6, C7, C8.

### P3 — Answer with the top five chunks and links → CORRECTION + USER DECISION

What's wrong. (a) Fixed k=5 with no ranking rationale ignores how engines actually order:
Meilisearch bucket-sort (earlier rules partition, later only tiebreak; `words` forcibly
first, right-to-left), Typesense candidate truncation (`max_candidates=4`) and
thresholds, Pagefind tunable weights — "top five" is meaningless without a pinned scope
and a stated ranking. (b) "Links" without version-pinned permalinks rot across releases;
linking `/docs/auth` when the answer came from v2.0 misleads v3.x readers. (c) No excerpt
contract: citation needs a defined window (Pagefind `excerptLength=30`), query
highlighting, and excerpt→passage identity verification. (d) No empty-result behavior:
Chain A shows the silent-zero-results failure; P3 needs the fallback UX.

Corrected P3. Version-pinned, cited, escapable answers: default answer set drawn from the
pinned (version, locale, codebase) scope; each item shows title, version+locale badge,
excerpt with highlights, and a version-pinned permalink (e.g. `/docs/2.1/auth#token`);
empty in-scope results offer explicit expansion ("no results in v2.1 — search all
versions / all locales?") rather than silent emptiness or silent scope-widening.
USER DECISIONS (tunable, validated by P-C1/P-R1): k (default 5 is acceptable starting
point), excerpt length, ranking/weight profile, and whether cross-version "newer exists"
hints appear. Corrected text: "Answer from the pinned scope with k cited passages
(version badge, excerpt, highlights, version-pinned permalink); offer explicit
scope-expansion on empty results; tune k and ranking by citation audit."

Governing conditions: C1, C2, C6, C8. Already-covered elements: excerpt/highlight
mechanics from discovery §§2.2–2.4 are reused unchanged.

### P4 — Let maintainers approve suggested rewrites → REJECTED + CORRECTION

What's wrong. The brief's hardest constraint is "WITHOUT silently rewriting
documentation." A rewrite-suggestion pipeline — even with an approval click — centers
machine-authored edits: rubber-stamp approvals under time pressure ARE silent rewrites
with extra steps, and every approval mutates versioned content outside the docs-as-code
review that versioning exists to provide. Discovery's entire §1.3/§2.7 toolchain (Vale,
markdownlint, lychee) was selected precisely because it is REPORT-ONLY: exit codes and
annotations, never mutations. P4 as written inverts that posture.

Verdict detail. REJECTED: any suggested-rewrite generation/approval loop as the
contradiction mechanism. CORRECTION (what replaces it): report-only contradiction
surfacing — Vale house styles (per-release terminology, deprecated terms), markdownlint
structure rules, lychee link/anchor checks across versioned directories, per-version
diffs, CODEOWNERS routing, and required CI checks; ALL edits are human-authored PRs.
The approval-gate IDEA is retained in its correct place: human review of human edits.
OPTIONAL, default-off, future enhancement (user decision): a proposal queue where a tool
may file explicitly-labeled, diff-visible, provenance-carrying suggestions that land
only via the normal PR path — explicitly NOT roadmapped for this scope, recorded only
so a future request cannot claim it was never considered. Governing conditions: C9, C10.
O3 note: no issue-chain was needed to reject P4; the brief constraint alone decides it,
and the report-only evidence (Vale never mutates; observed configs reject autofix)
confirms feasibility of the alternative.

### P5 — Keep old documentation pages separately → ALREADY-COVERED + CORRECTION + USER DECISION

What's covered. Discovery §1.1/§§2.1,2.5,2.6 already provides four versioning models that
all satisfy "separately" — P5's INTENT is already covered and agreed.

Why correction is still needed. "Separately" underspecifies every decision that matters:
separate URLs? separate source trees? separate indexes? switcher? banners? robots policy?
redirects? backports? The corrected P5 makes each explicit: versioned URLs with a version
switcher; status banners (unreleased/outdated/stable); per-version search scope (no
cross-version leakage by default); `noIndex`/canonical policy for stale versions
(Docusaurus per-version `noIndex`, mike `canonical_version`); per-version redirects
(`@docusaurus/plugin-client-redirects` version-aware paths or host rules); backport
discipline stating which versions accept doc PRs.

USER DECISION — the hub model (pick exactly one):
- (a) Docusaurus snapshots: per-version source trees + PRs + banners; best when versions
  need independent review and URLs; cost: duplication, V×L build growth.
- (b) Antora refs: versions as branches/tags via `antora.yml`, multi-repo aggregation;
  best for 3 repos × frequent tags; cost: AsciiDoc-first, ref hygiene.
- (c) MkDocs+mike builds-only: `mike deploy`, gh-pages output, trivial rollback; best for
  minimal ops; cost: no versioned source PRs, symlink hosting caveats.
- (d) Hosted (Mintlify/Fern/ReadMe/RTD): zero ops, vendor-owned version semantics; best if
  API reference dominates and hosting external content is acceptable; cost: lock-in
  mitigated only by OpenAPI-as-source-of-truth.
Recommendation (revisable by user): (a) Docusaurus when per-version review matters most,
(b) Antora when three-repo tag flow matters most; both beat (c)/(d) on the brief's
version-citation axis. Governing conditions: C1, C3, C4, C11.

### P6 — Test by asking maintainers ten familiar questions → CORRECTION (kept as signal, replaced as gate)

What's wrong. Ten familiar questions from maintainers is a biased, undiscriminating
sample: familiar questions hit the head of the distribution (popular pages, current
version, author's own locale), never the failure modes this research found — wrong-version
retrieval (Chain A), CJK/IME segmentation (Chain B), typo-threshold behavior, sort-vs-
relevance trade-offs, citation identity, contradiction recall, export fidelity. It is also
manual, unrepeatable, and version-unpinned (which version's answer counts as correct?).

Corrected P6. Keep the maintainer session as QUALITATIVE acceptance (does the portal feel
right to its users?) but gate releases on the stratified validation matrix in §8:
version-facet e2e, crawler/auth probe, locale/CJK/IME/diacritics matrix, typo-threshold
A/B, ranking-placement experiment, citation audit, contradiction drill with git-clean
assertion, export round-trip. Sampling rule: per (version, locale, codebase) ×
(in-scope, cross-version, untranslated, adversarial/negative) instead of "ten familiar."
Corrected text: "Gate on the automated stratified validation matrix (§8); run maintainer
sessions as qualitative acceptance, sampling across versions, locales, and codebases
including deliberately unfamiliar and negative cases."

## 2. Recommended architecture (coherent plan for this scope)

Hub: versioned docs site (user picks §1-P5 model (a)/(b); default recommendation (a)
Docusaurus with docs multi-instance — one instance per codebase — unless the team already
writes AsciiDoc, in which case (b) Antora). Version lifecycle: tag push → version build →
indexed scope; `lastVersion`/stable points at latest release; `next`/unreleased bannered
and excluded from default search; stale versions `noIndex` with canonical to stable.

Retrieval: self-hosted engine (Typesense recommended default: per-field typo control,
`filter_by: version:=…`, `max_candidates` raised for identifier queries, typos disabled
on version fields) OR per-version Pagefind static indexes if zero-service operation wins;
Algolia DocSearch only if the portal is public and eligible. Mandatory record attributes:
(version, locale, codebase, status, URL, offsets). Default query pins reader context;
explicit expansion UX; k and excerpt length tuned by citation audit.

Multilingual: locale build matrix with translation workflow (Crowdin or git PRs; MT seed +
human review for notes); `en` fallback policy stated; search tokenizer/IME/diacritics
matrix validated per §8; RTL support if required locales include it.

Code/doc linkage: idiomatic extractor per codebase (TypeDoc/rustdoc/JSDoc/Doxygen/Sphinx
autodoc as applicable) emitting per-tag reference; OpenAPI spec per release rendered
(Redoc/Scalar) and stored as the migration-proof contract; every doc code-link carries
(repo, tag, path, symbol); snippet-import from tagged sources with per-release CI rebuild.

Contradiction net (report-only, no exceptions): Vale house styles + markdownlint + lychee
in CI (PR-blocking fast subset, scheduled full crawl), CODEOWNERS per codebase, per-version
diff review for semantic conflicts. Zero autofix, zero rewrite suggestions in this scope.

Export: static HTML + per-version `openapi.yaml` + search-index JSON dump + `llms.txt`
(+PDF for stable only). Shallow portable components; versioned machine-readable contracts
make migrations diffable.

## 3. Retained alternatives (not chosen by default; kept with when-to-prefer)

- Antora over Docusaurus when: AsciiDoc already used, or 3-repo tag flow dominates, or
  snapshot duplication is unacceptable.
- mike over both when: version ops must be trivial and per-version source review is
  genuinely unneeded (accepted cost: no versioned PRs).
- Hosted (Mintlify/Fern/ReadMe) when: API reference is the product and external hosting
  is acceptable; keep OpenAPI as source of truth for exit.
- Meilisearch over Typesense when: team prefers its ranking-rule model or already operates
  it; re-derive typo thresholds (5/9 vs 4/7) and sort placement rather than porting config.
- Pagefind over engines when: zero-service/static/air-gapped wins; accept weaker typo and
  hand-built cross-version UI.
- Starlight when: multilingual authoring UX outranks formal versioning and versions are few
  (hand-rolled versioning accepted as tech debt).
- textlint alongside/over Vale when: JS toolchain or CJK-specific prose rules dominate.

## 4. Governing conditions (restated from discovery; unchanged by reveal)

C1 doc version (string tag; default = latest/stable route) — wrong-version answers if
ignored. C2 locale (BCP-47; fallback-or-404; diacritics normalized by default) —
mis-segmented/untranslated results. C3 release status (current/next/stable; WIP exposed
by default in Docusaurus) — users land on unreleased docs. C4 codebase identity (3
scopes; single-index mixing is the failure). C5 index scope (crawl cadence, auth
reachability, static body-tag inclusion) — stale or silently dropped pages. C6
facet/filter schema (version, language, lang, type, tags — ALL required in index config)
— silent zero/wrong results (Chain A). C7 typo/tokenizer (Meilisearch 5/9 vs Typesense
4/7; `max_candidates=4`; CJK `Intl.Segmenter`; IME composition) — false hits, missed
hits, broken CJK input. C8 excerpt/citation (window size, highlights, permalink pin) —
uncitable answers. C9 prose/link health (Vale level, lychee cache/codes) — invisible
contradictions. C10 rewrite posture (report-only MANDATORY) — silent rewrite, forbidden.
C11 formats (md/mdx/adoc/rst + openapi.yaml + index dumps) — lock-in. C12 visibility
(public vs authed/firewalled) — crawler inapplicable internally.

## 5. Original constraints (brief; preserved verbatim in force)

60-person internal group; three codebases; multilingual notes; frequent releases; search
returns the RELEVANT RELEASED version; EXACT-passage citation; contradiction visibility;
NO silent rewriting — ever, including via "approved" machine rewrites. Research scope is
this product brief, not unlimited production guarantees.

## 6. Disagreement (genuine trade-offs the evidence does not collapse)

- Snapshot (Docusaurus) vs ref (Antora) versioning: reviewability vs duplication; no
  dominant choice without knowing authoring format and release cadence.
- Engine (Typesense/Meilisearch) vs static (Pagefind): typo/federation power vs zero-service
  isolation; no dominant choice without knowing hosting/auth constraints.
- Typo permissiveness (5/9 vs 4/7): recall vs false positives on multilingual/identifier
  queries; must be A/B measured (P-T1), not argued.
- Translation depth for informal notes: full professional translation vs MT+review vs
  English-canonical with best-effort notes; cost/quality trade-off for the user.

## 7. Uncertainty (carried forward + post-reveal additions)

U1 hosting/visibility (public vs firewalled) — decides crawler viability; lean
self-host/static until answered. U2 codebase languages — decides extractors and
identifier-typo policy. U3 locale set (diacritics vs RTL vs CJK) — decides tokenizer/IME
matrix weight. U4 release cadence (daily vs weekly) — decides snapshot-vs-ref economics
and index freshness triggers. U5 Starlight/Mintlify/Fern/RTD evidence is secondary-snippet
level — provisional until verified if selected. U6 textual-vs-semantic contradiction mix —
bounds how much automation can ever deliver. U7 (new, post-reveal): whether any stakeholder
is attached to P4's rewrite-suggestion shape — if so, that attachment conflicts with the
brief constraint and needs explicit adjudication, not quiet implementation.

## 8. Validations — executed vs proposed (O6; discriminating, no pretense)

EXECUTED (this research stage; no sandbox, no runtime witnesses claimed):
- E1: 10 primary doc pages + 2 issue/changelog pages fetched (all HTTP 200, byte counts in
  source-map.json); quoted defaults grep-verified against fetched bytes.
- E2: Brief identity verified against freeze.json (path + sha256 + bytes match).
- E3: Pre-reveal discipline verified: plan file presence confirmed by directory listing
  (331 bytes) without reading contents; discovery frozen (sha256 `f4ee44da…`, 32646 bytes)
  before `reveal-plan.py` ran; `plan-reveal.json` records reveal at 18:31:20Z.
- E4: No product behavior executed (no installs, no services, no sandbox offered). Every
  mechanism claim is doc-observed; the proposal/execution boundary below is exact.

PROPOSED (each discriminates a named decision; automation-first, maintainer sessions second):
- P-V1 version-facet e2e: identical term queried in vN and vN−1; assert disjoint top-hit
  version tags. Discriminates faceted vs leaking retrieval. Kills P2-flat and validates P1.
- P-V2 crawler/auth probe: hosted-crawler fetch attempt against authed staging URL.
  Discriminates public-crawler viable vs must self-host/static. Settles U1/C12.
- P-L1 locale matrix: same query per locale + CJK/IME/diacritics cases; assert
  segmentation, fallback, `exactDiacritics` behavior. Discriminates tokenizer adequacy.
- P-T1 typo A/B: identifier queries at 5/9 vs 4/7 vs typos-off-on-version-field.
  Discriminates engine choice and field policy. Settles §6 permissiveness debate.
- P-R1 ranking placement: version-recency sort high vs low vs between attributeRank and
  wordPosition; multi-word queries incl. right-to-left order swaps. Discriminates sort
  placement and quantifies words-order sensitivity.
- P-C1 citation audit: 20 sampled answers; verify excerpt→passage identity + version pin +
  permalink freshness. Discriminates citable vs paraphrased retrieval; tunes k/excerpts (P3).
- P-D1 contradiction drill: inject 3 known conflicts (cross-version, cross-locale, stale
  snippet); require Vale/lychee/diff to surface all three with `git status` clean of content
  edits (reports only). Discriminates report-only net adequacy; enforces C10/P4 verdict.
- P-M1 export round-trip: build static+PDF+index-dump+llms.txt for two versions; diff index
  dumps for recall regressions; re-import Markdown into a second generator. Discriminates
  portable vs locked-in authoring (C11).

## 9. Open questions for build (user decisions required)

Q1 hub model (a/b/c/d). Q2 engine/static/crawler (settled with P-V2 + U1). Q3 locale set +
fallback policy. Q4 k/excerpt/ranking profile (settled with P-C1/P-R1). Q5 backport policy
(which versions accept doc PRs). Q6 PDF/format matrix bound. Q7 P4-attachment check (U7):
confirm no stakeholder requires rewrite suggestions; if one does, escalate as
brief-conflict, do not implement quietly.

## 10. Method compliance

M01 single-investigator coherent batch: shared condition map (§4) + per-question coverage
inherited from discovery §5, full scope in one pass. No nested agents, no repo/canon edits,
no installs, no private internals. Discovery untouched post-reveal. Draft is a complete
planning deliverable for S07 research scope; later stages may correct it per its own §7–§9.
