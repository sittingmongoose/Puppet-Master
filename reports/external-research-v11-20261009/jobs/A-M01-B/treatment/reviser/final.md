# Final — A-M01-B treatment/reviser · S07 documentation-portal · complete planning deliverable

- Block/arm/stage: A-M01-B / treatment / reviser. Case S07. Method M01 coherent-batching.
- Status: final for this scope. ONE coherent self-contained document covering O1–O6 and
  every exact P clause. Every criticism (M1–M11, m1–m12, O-A–O-E) is explicitly
  adjudicated in §2 with evidence; fixes are applied in the sections they govern.
- Brief (restated so this file stands alone): internal documentation portal for a
  60-person engineering group with three codebases, multilingual notes, frequent
  releases. Search must return the relevant RELEASED version, cite exact passages, and
  help maintainers SEE contradictions WITHOUT silently rewriting documentation. Scope:
  research products/mechanisms, code/doc linkage, retrieval conditions,
  migration/export for this small product brief — not unlimited production guarantees.
- Thin plan under comparison (exact text, `revealed-plan.md`, sha256 `906fbabc…7f7ee6`):
  P1 "Crawl main branches nightly." P2 "Put every chunk in one vector index."
  P3 "Answer with the top five chunks and links." P4 "Let maintainers approve suggested
  rewrites." P5 "Keep old documentation pages separately." P6 "Test by asking maintainers
  ten familiar questions."
- Predecessors inspected COMPLETE: brief, `research/draft.md` (332 lines),
  `research/discovery.md` (439 lines), research `source-map.json` (S00–S23), revealed
  plan, `critic/critique.md` (173 lines), critic `source-map.json` (C00–C14), both
  source roots. Independent reviser verification: R10 Docusaurus versioning re-fetch
  (200, 93725 bytes, byte-identical to S01/C10, banner enum grep-verified); R11 Local
  Search spike (primary README fetch + spike search). Sources: `source-map.json`
  (R00–R11), excerpts in `sources/`. Usage/billing unobserved (null).
- No P verdict flips to acceptance. No false REJECTION (critic-confirmed). All verdicts
  below stand UNDER THE STATED CONDITIONS; rationales depending on unresolved U1–U4 are
  marked conditional (m9 — the draft's "no uncertainty about the verdicts" is withdrawn).

## 1. Per-P disposition (O4) — exact clauses, one verdict each

| P | Exact clause | Disposition | One-line rationale |
|---|--------------|-------------|--------------------|
| P1 | Crawl main branches nightly. | CORRECTION | Main-only indexing serves unreleased WIP; tags must define version scope (categorical). Freshness/reachability bullets are conditional on U4/U1. |
| P2 | Put every chunk in one vector index. | CORRECTION (flat part REJECTED) | Unpartitioned single index mixes versions/locales/codebases; needs mandatory partition attributes and hybrid retrieval. Vector-multilingual sub-claim downgraded to hypothesis. |
| P3 | Answer with the top five chunks and links. | CORRECTION + USER DECISION | Fixed top-5 without version pin, citation identity, or escape hatches; k and excerpt size are tunable user decisions. |
| P4 | Let maintainers approve suggested rewrites. | REJECTED (mechanism) + CORRECTION (report-only review retained) | Rewrite-suggestion pipeline contradicts the no-silent-rewrite constraint; narrow approval reading acknowledged and rebutted. Proposal queue struck from this scope. |
| P5 | Keep old documentation pages separately. | CORRECTION + USER DECISION | "Separately" underspecifies URLs/trees/indexes/switcher/banners/robots/redirects/backports; four concrete models offered, exactly one chosen. Banner enum fixed. |
| P6 | Test by asking maintainers ten familiar questions. | CORRECTION (kept as signal, replaced as bounded gate) | Familiar-question sampling cannot discriminate version/locale/citation behavior; bounded stratified gate + scheduled full matrix proposed. |

### P1 — Crawl main branches nightly → CORRECTION (M3 applied)

(a) Version-scoping — CATEGORICAL, decides the verdict. Main is the development branch:
indexing it as the default serves unreleased content, the exact failure Docusaurus
warns against (`includeCurrentVersion`: "Include the current version (the `./docs`
folder)"; disable when `./docs` is WIP) and that the `banner: 'unreleased'` mechanism
(R10) exists to label. Release TAGS, not branch state, must define indexed version
boundaries: one scope per (codebase, released version, locale), built at tag time
(webhook on tag push). Historical instance: PR #744 (`version:latest` hardcode) and
Chain A (wrong-version retrieval).

(b) Freshness — CONDITIONAL on U4 (release cadence unknown). "Nightly" is a cadence,
not a trigger. IF releases are sub-daily, a nightly crawl is stale within hours of a
tag and never captures the release event; a tag-triggered build plus a nightly (or
more frequent) catch-up for notes edits is required. IF releases are weekly or slower
(DocSearch's own default is a weekly crawl — a distinct cadence from P1's nightly, not
to be conflated), nightly is fresh and the staleness bullet does not bite. Corrected
text carries the condition, not a categorical staleness claim.

(c) Crawler reachability — CONDITIONAL on U1 (public vs firewalled unknown). "Crawl"
presupposes a crawler architecture (Algolia-style weekly crawl of public URLs). The
docs state the condition exactly: "if your website sits behind a firewall and is not
public, then you can run your own DocSearch crawler" (C11). IF the portal is public,
a hosted crawler is viable; IF firewalled (as "internal" suggests), the portal must
self-host (engine or own crawler) or go static. P-V2 settles this.

Corrected P1. "Build one search scope per released (codebase, version, locale) at tag
time; re-index notes on merge; keep main/next as a labeled opt-in scope, never the
default. Crawl cadence follows U4 (tag-triggered + catch-up iff releases ≪ 24h);
crawler choice follows U1 (hosted iff public)." Governing conditions: C1 (version),
C3 (release status), C4 (codebase identity), C5 (index scope), C12 (visibility).

### P2 — Put every chunk in one vector index → CORRECTION, flat part REJECTED (M2, M4, m3 applied)

What's wrong. A single unpartitioned vector index mixes versions, locales, and
codebases into one embedding space. Consequences: (a) version pollution — queries
return passages from superseded releases with no staleness signal (Chain A generalized
to vectors; the cross-engine generalization is ANALOGY, labeled hypothesis per m7,
validated by P-V1); (b) multilingual behavior — Meilisearch's verified warning covers
TYPO tolerance on multilingual data ("typo tolerance can cause false-positive
matches"), NOT dense vectors: no vector engine was sourced (S00–S23 contain none), so
dense-vector cross-language false positives are a plausible but UNOBSERVED hypothesis
requiring a cross-locale vector probe before assertion (M2); the lexical typo warning
itself is verified and retained; (c) identifier failure — version strings and API
symbols (`v2.1.0`, `getUserById`) need exact/lexical matching with typos DISABLED on
those fields, which P2's flat vector-only design AS SPECIFIED provides no field-level
control for (m3: vectors + metadata filtering / hybrid pipelines CAN implement this —
the defect is P2's flat unpartitioned specification, not vectors per se); (d) no
citation identity — chunk embeddings do not preserve excerpt→source-passage
traceability unless records carry (URL, version, locale, offsets) and the serving
layer enforces it.

Corrected P2. Partitioned, attributed, hybrid retrieval: every record carries mandatory
(version, locale, codebase, release status, source URL, offsets); the generic rule
(C6-i) is that version + locale + codebase MUST be filterable/faceted in EVERY engine
with the default query pinning the reader's context and explicit escape hatches
("search all versions"); product-specific mechanics (C6-ii) are per-engine —
Typesense `filter_by` (schema-declared), Meilisearch filterableAttributes (declared),
Algolia/Docusaurus facets (exactly `docusaurus_tag`, `language`, `lang`, `version`,
`type` — bare `tags` is wrong, M4), Pagefind author-designed `data-pagefind-filter`
or per-version indexes. Retrieve lexically first within the pinned scope (BM25/keyword
with typos off on version/identifier fields), optionally re-rank semantically INSIDE
the scope — never semantic search across unpartitioned versions. Corrected text: "Store
every chunk with (version, locale, codebase, status, source, offsets); partition and
filter on those attributes per C6; retrieve lexically first within the pinned scope,
optionally re-rank semantically."

REJECTED part: the flat single index with no partition attributes. OPTIONAL
ENHANCEMENT within the correction: dense-vector re-ranking and synonyms (Typesense v27
`synonym_prefix=false`/`synonym_num_typos=0` safe defaults — snippet-level, re-verify
if selected, m6; enable deliberately with `demote_synonym_match` considered). USER
DECISION: engine choice — Typesense vs Meilisearch (self-hosted) vs Pagefind
per-version static indexes (zero-service) vs Docusaurus Local Search (zero-service,
firewalled-safe — added by M10 spike, provisional until P-S1) vs Algolia DocSearch
(only if public/crawlable). Governing conditions: C1, C2, C4, C6, C7, C8.

### P3 — Answer with the top five chunks and links → CORRECTION + USER DECISION (m2 applied)

What's wrong. (a) Fixed k=5 with no ranking rationale ignores how engines order:
Meilisearch bucket-sort (earlier rules partition, later only tiebreak; `words` forcibly
first, right-to-left), Typesense candidate truncation (`max_candidates=4`, inherited
S09, re-verify if selected, m6) and thresholds, Pagefind tunable weights — "top five"
is meaningless without a pinned scope and stated ranking. (b) "Links" without
version-pinned permalinks rot across releases. (c) No excerpt contract: citation needs
a defined window (Pagefind `excerptLength` 30 — UNIT UNSTATED in docs, verify
tokens/words/chars before tuning, m4), query highlighting (`highlightSearchTermsOn-
TargetPage` exists but defaults false in Local Search, R11), and excerpt→passage
identity verification (identity rule defined in P-C1: exact substring vs
whitespace/diacritic-normalized — decided at build, M11). (d) No empty-result
behavior: in-scope emptiness needs the explicit-expansion fallback UX ("no results in
v2.1 — search all versions / all locales?"). NOTE (m2): Chain A (facet-schema drift →
zero/wrong-version) is cited for SCHEMA discipline (P-V1), NOT for P3's k/excerpt
problem, which is in-scope emptiness with a correct schema; P3's rationale stands
independently.

Corrected P3. Version-pinned, cited, escapable answers: default answer set from the
pinned (version, locale, codebase) scope; each item shows title, version+locale badge,
excerpt with highlights, and a version-pinned permalink (e.g. `/docs/2.1/auth#token`).
USER DECISIONS (tunable, validated by P-C1/P-R1): k (default 5 acceptable starting
point), excerpt length, ranking/weight profile, cross-version "newer exists" hints.
Corrected text: "Answer from the pinned scope with k cited passages (version badge,
excerpt, highlights, version-pinned permalink); offer explicit scope-expansion on empty
results; tune k and ranking by citation audit." Governing conditions: C1, C2, C6, C8.
Already-covered elements: excerpt/highlight mechanics reused unchanged.

### P4 — Let maintainers approve suggested rewrites → REJECTED + CORRECTION (M5 applied)

The narrow reading and its rebuttal. The brief says "WITHOUT silently rewriting
documentation." The NARROW reading holds that an explicit approval click is not
silent, so P4's gate satisfies the brief. This reading is acknowledged and REBUTTED
on two grounds independent of rubber-stamping: (1) versioning exists to provide
per-version review (C10 + P5); a parallel rewrite-approval loop bypasses per-version
PR discipline even when every click is deliberate; (2) the report-only alternative is
feasible — Vale `.vale.ini` docs expose NO mutation mechanism (observed workflow is
`vale sync`, `vale ls-config`, MinAlertLevel suggestion/warning/error: report-oriented
by configuration; the docs do not contain the literal string "never mutates," so the
stronger phrasing is withdrawn per M5/m12). If stakeholders insist the narrow reading
is intended, P4 becomes CORRECTION (route suggestions through the normal PR path with
diff/provenance) — but ONLY via explicit brief adjudication (U7/Q7, blocking), never
by quiet implementation.

Why REJECTED stands. A rewrite-suggestion pipeline centers machine-authored edits, and
rubber-stamp approval under time pressure is the PREDICTED failure mode (labeled as
prediction, not observed fact — no issue-chain exists and none is needed; the brief
constraint alone decides). Every approval would mutate versioned content outside the
docs-as-code review that versioning exists to provide.

Verdict detail. REJECTED: any suggested-rewrite generation/approval loop as the
contradiction mechanism. CORRECTION (replacement): report-only contradiction surfacing
— Vale house styles, markdownlint structure rules, lychee link/anchor checks across
versioned directories (S22 patterns are snippet-level provisional — re-verify
MD013/MD033 exclusions and lychee cache/accept-codes against pinned configs before CI
gates on them, m12), per-version diffs, CODEOWNERS routing, required CI checks; ALL
edits are human-authored PRs. The approval-gate IDEA is retained in its correct place:
human review of human edits. The draft's optional proposal queue is STRUCK from this
scope entirely (M5): a default-off suggestion pipeline reintroduces the exact mechanism
C10 forbids and invites quiet enablement, weakening the P-D1 git-clean gate. Any
future proposal requires a BRIEF AMENDMENT, not a user decision. Governing conditions:
C9, C10.

### P5 — Keep old documentation pages separately → CORRECTION + USER DECISION (M1, M6 applied)

Why correction is needed. "Separately" underspecifies every decision that matters:
separate URLs? source trees? indexes? switcher? banners? robots policy? redirects?
backports? The four versioning models (a)–(d) below were already DISCOVERED as options
(O1 provenance) — but P5 as a plan clause selects and specifies none, so
ALREADY-COVERED is dropped for the clause itself (M6): vague intent is not coverage.
The corrected P5 makes each explicit: versioned URLs with a version switcher
(`docsVersionDropdown`); status banners with the VERIFIED enum `none` / `unreleased` /
`unmaintained` (R10: above latest → unreleased, below latest → unmaintained;
`outdated`/`stable` are invalid config, M1); `lastVersion`/stable-route discussion
kept SEPARATE from the banner enum; per-version search scope (no cross-version leakage
by default); `noIndex`/canonical policy for stale versions (Docusaurus per-version
`noIndex` verified; mike `canonical_version` snippet-level); per-version redirects
(`@docusaurus/plugin-client-redirects` named but UNSOURCED — provisional, O-D);
backport discipline stating which versions accept doc PRs (Q5).

USER DECISION — the hub model (pick EXACTLY ONE; fencing per M6):
- (a) Docusaurus snapshots: per-version source trees + PRs + banners; best when versions
  need independent review and URLs; cost: duplication, V×L build growth (quantify build/
  index growth before choosing if V is large — frequent releases × long support, O-E).
- (b) Antora refs: versions as branches/tags via `antora.yml`, multi-repo aggregation;
  best for 3 repos × frequent tags; cost: AsciiDoc-first, ref hygiene (REQUIRES a named
  ref-hygiene owner). Evidence thinner than Docusaurus (single S10 fetch, no
  issue-chain — honestly "not observed, not safe," m10).
- (c) MkDocs+mike builds-only: `mike deploy`, gh-pages output, trivial rollback; best for
  minimal ops; cost: no versioned source PRs, symlink hosting caveats (REQUIRES explicit
  acceptance of no-versioned-PRs).
- (d) Hosted (Mintlify/Fern/ReadMe/RTD): zero ops, vendor-owned version semantics; best if
  API reference dominates and external hosting is acceptable; cost: lock-in mitigated only
  by OpenAPI-as-source-of-truth (REQUIRES explicit acceptance of vendor-owned semantics).
Recommendation (revisable by user): (a) Docusaurus when per-version review matters most,
(b) Antora when three-repo tag flow matters most. RECORD the choice before retrieval
build (P-V1 depends on hub URL/index shape). Governing conditions: C1, C3, C4, C11.

### P6 — Test by asking maintainers ten familiar questions → CORRECTION, bounded gate (M7 applied)

What's wrong. Ten familiar questions is a biased, undiscriminating sample: familiar
questions hit the head of the distribution (popular pages, current version, author's
own locale), never the failure modes found — wrong-version retrieval (Chain A),
CJK/IME segmentation (Chain B), typo thresholds, sort-vs-relevance trade-offs,
citation identity, contradiction recall, export fidelity. Manual, unrepeatable,
version-unpinned (which version's answer counts as correct?).

Corrected P6. Keep the maintainer session as QUALITATIVE acceptance, but gate releases
on a BOUNDED stratified matrix (§9): MINIMAL GATE (per-PR/release) = stable + previous
version × default locale + one non-default locale × 1-codebase smoke, plus full
3-codebase on release; FULL MATRIX (V×L×3×4 case types) = scheduled (nightly/weekly),
NOT per-PR; per-cell assertions in P-V1/P-L1/P-C1 with explicit sampling budgets
(20 citation audits per P-C1, 3 injected conflicts per P-D1). The unbounded
per-(version,locale,codebase)×(4 case types) gate (180 cells at V=5/L=3) is withdrawn
as unexecutable until costed (M7; if full-matrix-per-PR is later costed and funded,
the bound may be lifted — requires a cost model this plan does not provide).
Corrected text: "Gate on the bounded automated stratified matrix (§9); run maintainer
sessions as qualitative acceptance, sampling across versions, locales, and codebases
including deliberately unfamiliar and negative cases."

### O3 chains preserved (evidence, not IDs)

Chain A (Docusaurus contextual-search faceting failure → fix → current docs):
dynamoose#1486 — site search returned ZERO results with default config, worked with
`contextualSearch: false`; root cause was the Algolia index "Attributes for faceting"
holding only `lang,type` instead of the required five; fix was user-side index-schema
correction. Evolution: PR #744 (v1 `version:latest` hardcode) → v2+ contextual search
(default true) → current troubleshooting docs requiring `docusaurus_tag, language,
lang, version, type` with delete-index → recrawl → verify discipline. Lesson: version
relevance fails SILENTLY on schema drift; P-V1 + schema-declaration CI checks + the
explicit fallback UX are the mitigations. Cross-engine generalization is hypothesis
(m7), tested by P-V1. Chain B (Pagefind CJK + IME): query-side CJK segmentation via
`Intl.Segmenter` (CHANGELOG "Multilingual Improvements", fetched S16) + component-UI
IME composition fix #1284 ignoring mid-composition keystrokes (commit 50641b0,
snippet-only S17 — re-verify if CJK/IME weighted, m8). Lesson: P-L1 must include CJK
queries, IME flows, and cafe/café diacritics pairs. Chain C (ranking/typo evolution
traps, supporting): Meilisearch legacy `attribute` = attributeRank+wordPosition (old+
new together = API error; split lets `sort`/custom sit between); Typesense v27
synonym-on-prefix/typo support with safe defaults (`synonym_prefix=false`,
`synonym_num_typos=0` — snippet-level, re-verify if selected, m6). Absent evidence
(stated, not safe): no version-specific regression observed for Antora ref-mapping or
mike alias handling.

## 2. Criticism adjudication (every finding: accept / amend / reject / uncertain)

Verdict key: ACCEPT = critic correct, fixed as recommended. AMEND = critic's concern
valid but fixed differently (reason given). REJECT = critic incorrect on evidence
(reason given). UNCERTAIN = evidence cannot settle; carried as uncertainty. Every fix
below is applied in the section it governs — this table is the audit trail, not a
substitute for the fix.

### Material findings M1–M11

| ID | Criticism | Verdict | Evidence / action (where fixed) |
|----|-----------|---------|----------------------------------|
| M1 | Banner enum wrong (`outdated`/`stable` invalid) | ACCEPT | R10 independent re-fetch (93725 B, byte-identical): enum is `none/unreleased/unmaintained`; `outdated` absent. Fixed in §1-P5, §3, §5-C3. |
| M2 | Vector-multilingual geometry unevidenced | ACCEPT | No vector source in S00–S23; Meilisearch warning covers typo tolerance only (C12/R08). Downgraded to hypothesis + cross-locale probe in §1-P2. Flat-index rejection stands on independent grounds. |
| M3 | P1 rationale conditional on U1/U4; weekly misattribution | ACCEPT | C11/R08: DocSearch weekly default ≠ P1's nightly; firewall quote is conditional. Restructured §1-P1 into categorical + U4/U1 conditionals. |
| M4 | C6 conflates Algolia schema with generic rule; `tags` error | ACCEPT | C11/R08: required five are `docusaurus_tag,language,lang,version,type`; codebase via multi-instance tags. Split C6 into generic rule + per-engine lists in §1-P2, §5; `tags`→`docusaurus_tag`. |
| M5 | P4 interpretive risk + carve-out weakens C10; Vale wording | ACCEPT | Broad reading rebuttal (versioning-bypass + feasibility) added; proposal queue STRUCK (brief amendment required); rubber-stamp labeled prediction; Vale softened to config-observed. §1-P4. |
| M6 | P5 ALREADY-COVERED overused; fencing needed | ACCEPT | ALREADY-COVERED dropped for clause; CORRECTION + USER DECISION; exactly-one fencing + cost acceptance + ref owner + choice-before-retrieval in §1-P5. |
| M7 | P6 gate combinatorially unbounded | ACCEPT | Bounded gate (minimal per-PR + scheduled full matrix + sampling budgets) in §1-P6, §9. Lift condition recorded. |
| M8 | Linkage has zero primary sources (O2 gap) | ACCEPT (provisional marking) | No time to source within stage; linkage architecture marked PROVISIONAL in §3 with 3-item sourcing gate; blocks linkage build, not P verdicts. |
| M9 | Export contracts unevidenced; P-M1 no rubric | ACCEPT (provisional marking) | Export marked PROVISIONAL in §3; P-M1 fidelity rubric + threshold added in §9; MVP scoping decision recorded (Q8). |
| M10 | Local Search omission on C12 axis | ACCEPT + spiked | R11/R09: Local Search (easyops) verified at README level — offline v2/v3, firewall-safe, multi-version, lunr + zh, context scoping. Added as O1 option, §4 alternative, §9 P-S1. Measurement still open (U9 narrowed). |
| M11 | Validations need bounding/success criteria | ACCEPT (all tightenings) | P-V1 index-reset + schema assertion; P-V2 parallel local-crawler probe; P-L1 needs U3 + fixtures; P-T1 split per-engine sweep vs cross-engine; P-R1 no cross-engine porting; P-C1 identity + inter-rater rules; P-D1 rule-authoring milestone first; P-M1 rubric + threshold; E2/E3 marked unverified-by-reviser (boundary). All in §9. |

### Minor findings m1–m12

| ID | Criticism | Verdict | Evidence / action |
|----|-----------|---------|-------------------|
| m1 | C3 "WIP by default" needs route qualification; defaults snippet-level | ACCEPT | R10: current at `/docs/next`, `/docs` serves `lastVersion`. Rephrased C3; defaults carried as snippet-cross-checked. §5. |
| m2 | P3 Chain A citation conflates failure modes | ACCEPT | Chain A → schema discipline (P-V1); P3 fallback UX stands independently. §1-P3. |
| m3 | "Vectors cannot express typo-off" overstates | ACCEPT | Rephrased to flat-design-specific. §1-P2. |
| m4 | `excerptLength` unit ambiguous | ACCEPT | Carried as "30 (unit unstated; verify before tuning)". §1-P3, §5-C8. |
| m5 | `diacriticSimilarity` from truncated page | ACCEPT | Marked partially observed; fetch full section or drop before tuning. §5-C8. |
| m6 | Typesense/Meilisearch-ranking inherited confidence | ACCEPT | Re-verify selected engine's governing defaults against pinned release before build. §8-U8, §9. |
| m7 | Chain A cross-engine generalization is analogy | ACCEPT | Labeled hypothesis; P-V1 validates. §1-P2, §7. |
| m8 | S17 IME commit snippet-only | ACCEPT | Re-verify if CJK/IME weighted (depends on U3). §8, §9-P-L1. |
| m9 | "No uncertainty about verdicts" overconfident | ACCEPT | Withdrawn; verdicts stand under stated conditions. Header, §8. |
| m10 | Secondary options provisional (good); Antora thin | ACCEPT | U5 labels kept; Antora thinness flagged at §1-P5(b). |
| m11 | `prefix` default "(inferred)" qualifier | ACCEPT | Qualifier carried until verified. §5-C7. |
| m12 | S22 CI patterns snippet-level provisional | ACCEPT | Re-verify MD013/MD033 + lychee codes before CI gates. §1-P4, §9-P-D1. |

### Omissions register O-A–O-E

| ID | Criticism | Verdict | Evidence / action |
|----|-----------|---------|-------------------|
| O-A (=M10) | Local Search unevaluated | ACCEPT + spiked | See M10. |
| O-B (=M8/M9) | Linkage/export sourcing gaps | ACCEPT (provisional) | See M8/M9. |
| O-C | No per-engine recency-vs-relevance expectations table | ACCEPT (added) | Expectations table added in §3; P-R1 sharpens by measurement. |
| O-D | robots/canonical/redirects unsourced beyond naming | ACCEPT (provisional) | `noIndex` verified (R10); `canonical_version`/redirects plugin provisional — source before build. §1-P5. |
| O-E | Snapshot duplication cost unquantified | ACCEPT (measurement) | Build/index growth quantification required before choosing (a) when V large. §1-P5, §10-Q1. |

No criticism is REJECTED: all eleven material findings, all twelve minors, and all
five omissions are valid on the evidence. No AMEND was needed — every recommendation
was applicable as stated. Residual UNCERTAINTY (U1–U9) is carried in §8, not resolved
by fiat.

## 3. Recommended architecture (coherent plan for this scope)

Hub: versioned docs site (user picks §1-P5 model (a)/(b); default recommendation (a)
Docusaurus with docs multi-instance — one instance per codebase — unless the team
already writes AsciiDoc, in which case (b) Antora). Version lifecycle: tag push →
version build → indexed scope; `lastVersion`/stable points at latest release;
current/WIP built and reachable at `/docs/next` by default (m1), `/docs` serves
`lastVersion`; banners `none`/`unreleased`/`unmaintained` (R10); stale versions
`noIndex` with canonical to stable (redirects plugin provisional, O-D).

Retrieval: default query pins (version, locale, codebase) per C6(i) with explicit
expansion UX; k and excerpt length tuned by citation audit. Engine choice (user
decision): Typesense recommended default (per-field typo control, `filter_by:
version:=…`, `max_candidates` raised for identifier queries — inherited S09,
RE-VERIFY against pinned release before build, m6/U8; typos disabled on version
fields) OR Meilisearch (re-derive 5/9 thresholds and sort placement; ranking rules
S07 inherited, re-verify if selected, m6/U8) OR per-version Pagefind static indexes
if zero-service wins OR Docusaurus Local Search (easyops fork, R11 — provisional
until P-S1 measures index size/tokenizer/version isolation at scale). Algolia
DocSearch only if the portal is public and eligible (P-V2 settles U1/C12).

Per-engine recency-vs-relevance expectations (pre-build, O-C — P-R1 measures):
| Engine | Default character | Recency mechanism | Risk if mis-set |
|--------|-------------------|-------------------|-----------------|
| Typesense | relevance-ranked, truncated candidates (`max_candidates=4` inherited) | `default_sorting_field` defines "top" of truncated set | identifier queries silently truncated; recency sort unmeasured |
| Meilisearch | bucket-sort, `words` forcibly first | `sort` rule placement (high=kills relevance, low=ignored) | version-recency sort destroys relevance or is ignored |
| Pagefind | tunable weights (termFrequency 1.0, termSimilarity 1.0, pageLength 0.75) | per-version index = deploy scoping; weights hand-tuned | cross-version search needs multi-index UI |
| Local Search | lunr relevance, context-scoped | per-version indexes (snippet-level) + searchContext scoping | index size/tokenizer unmeasured at scale |

Multilingual: locale build matrix with translation workflow (Crowdin or git PRs; MT
seed + human review for notes); `en` fallback policy stated; search
tokenizer/IME/diacritics matrix validated per §9; RTL support if required locales
include it (U3).

Code/doc linkage — PROVISIONAL (M8): idiomatic extractor per codebase
(TypeDoc/rustdoc/JSDoc/Doxygen/Sphinx autodoc as applicable) emitting per-tag
reference; OpenAPI spec per release rendered (Redoc/Scalar) and stored as the
migration-proof contract; every doc code-link carries (repo, tag, path, symbol);
snippet-import from tagged sources with per-release CI rebuild. BLOCKED until sourced:
(1) one extractor's version-pinning/output contract, (2) OpenAPI render/versioning,
(3) snippet-import staleness CI pattern. Does not block P verdicts.

Contradiction net (report-only, no exceptions): Vale house styles + markdownlint +
lychee in CI (PR-blocking fast subset, scheduled full crawl), CODEOWNERS per codebase,
per-version diff review for semantic conflicts. Zero autofix, zero rewrite suggestions
in this scope. S22 CI patterns provisional (m12). Vale house rules must be AUTHORED
before P-D1 can run (rule-authoring milestone, M11).

Export — PROVISIONAL (M9): static HTML + per-version `openapi.yaml` + search-index
JSON dump + `llms.txt` (+PDF for stable only). BLOCKED until sourced: llms.txt
convention + one converter path + one PDF path. P-M1 fidelity rubric in §9; if export
is out of MVP, P-M1 becomes scheduled, not gating (Q8 records the scoping).

## 4. Retained alternatives (not chosen by default; kept with when-to-prefer)

- Antora over Docusaurus when: AsciiDoc already used, or 3-repo tag flow dominates, or
  snapshot duplication is unacceptable. (Evidence thinner — m10.)
- mike over both when: version ops must be trivial and per-version source review is
  genuinely unneeded (accepted cost: no versioned PRs).
- Hosted (Mintlify/Fern/ReadMe) when: API reference is the product and external hosting
  is acceptable; keep OpenAPI as source of truth for exit.
- Meilisearch over Typesense when: team prefers its ranking-rule model or already
  operates it; re-derive typo thresholds (5/9 vs 4/7) and sort placement. (No porting
  configs across engines — M11/P-R1.)
- Pagefind over engines when: zero-service/static/air-gapped wins; accept weaker typo
  and hand-built cross-version UI.
- Local Search (easyops) over Pagefind/engines when: Docusaurus hub + firewalled +
  zero-service wanted without Pagefind's hand-built cross-version UI cost; lunr + zh
  support fits locale set. Provisional until P-S1. Directly competes with Pagefind on
  the zero-service branch — the old "crawler vs engine vs static" trilemma is now a
  four-option axis (M10).
- Starlight when: multilingual authoring UX outranks formal versioning and versions are
  few (hand-rolled versioning accepted as tech debt). Provisional (U5).
- textlint alongside/over Vale when: JS toolchain or CJK-specific prose rules dominate.

## 5. Governing conditions (revised; M1/M4/m1/m4/m5/m11 applied)

C1 doc version (string tag; default = latest/stable route) — wrong-version answers if
ignored. C2 locale (BCP-47; fallback-or-404; diacritics normalized by default) —
mis-segmented/untranslated results. C3 release status (current/next/stable; current/WIP
built and reachable at `/docs/next` by default while `/docs` serves `lastVersion`,
R10/m1) — users land on unreleased docs. C4 codebase identity (3 scopes; single-index
mixing is the failure). C5 index scope (crawl cadence, auth reachability, static
body-tag inclusion: ANY body tag ⇒ untagged pages EXCLUDED) — stale or silently
dropped pages. C6 facet/filter schema — SPLIT (M4): (i) GENERIC RULE, every engine:
version + locale + codebase MUST be filterable/faceted, default query pins reader
context; (ii) PRODUCT-SPECIFIC required lists: Algolia/Docusaurus exactly
`docusaurus_tag, language, lang, version, type` (C11/R08; multi-codebase via
multi-instance tags like `docs-default-3.2.1`); Typesense `filter_by` fields
(schema-declared); Meilisearch filterableAttributes (declared); Pagefind
author-designed `data-pagefind-filter`. Missing attrs ⇒ silent zero/wrong results
(Chain A). C7 typo/tokenizer (Meilisearch 5/9 vs Typesense 4/7 — different engines,
not configs, M11; `max_candidates=4` inherited; CJK `Intl.Segmenter`; IME composition;
`prefix` default true (INFERRED, m11)) — false hits, missed hits, broken CJK input. C8
excerpt/citation (`excerptLength` 30, UNIT UNSTATED, m4; highlights; permalink pin;
`diacriticSimilarity` partially observed, m5) — uncitable answers. C9 prose/link
health (Vale level; lychee cache/codes — S22 provisional, m12) — invisible
contradictions. C10 rewrite posture (report-only MANDATORY; proposal queue struck,
M5) — silent rewrite, forbidden. C11 formats (md/mdx/adoc/rst + openapi.yaml + index
dumps; linkage/export provisional, M8/M9) — lock-in. C12 visibility (public vs
authed/firewalled; four retrieval options incl. Local Search, M10) — crawler
inapplicable internally.

Per-question maps (unchanged in structure): Q-linkage → per (codebase, version,
symbol), C1/C3/C4/C11, PROVISIONAL (M8). Q-retrieval → per (version, locale,
codebase), C1/C2/C4–C8. Q-contradiction → per (version-pair, locale), C9/C10,
report-only. Q-migration → per (version, format), C11/C12, PROVISIONAL (M9).

## 6. Original constraints (brief; preserved verbatim in force)

60-person internal group; three codebases; multilingual notes; frequent releases; search
returns the RELEVANT RELEASED version; EXACT-passage citation; contradiction visibility;
NO silent rewriting — ever, including via "approved" machine rewrites (broad reading
adopted; narrow reading rebutted in §1-P4, adjudicable only via brief amendment, U7).
Research scope is this product brief, not unlimited production guarantees.

## 7. Disagreement (genuine trade-offs the evidence does not collapse)

- Snapshot (Docusaurus) vs ref (Antora) versioning: reviewability vs duplication; no
  dominant choice without knowing authoring format and release cadence. Cost model
  unquantified (O-E) — measurement required when V large.
- Engine (Typesense/Meilisearch) vs zero-service (Pagefind vs Local Search): typo/
  federation power vs zero-service isolation; Local Search vs Pagefind sub-choice needs
  P-S1 measurement. No dominant choice without U1/C12 + scale data.
- Typo permissiveness (5/9 vs 4/7): recall vs false positives on multilingual/identifier
  queries; must be A/B measured per-engine (P-T1 split, M11), not argued.
- Translation depth for informal notes: full professional translation vs MT+review vs
  English-canonical with best-effort notes; cost/quality trade-off for the user.
- Chain A cross-engine generalization: established for Docusaurus/Algolia (issue +
  fix + current docs); ANALOGY for other engines (m7) — P-V1 tests it.

## 8. Uncertainty (carried forward: U1–U7 + critic U8–U9)

U1 hosting/visibility (public vs firewalled) — decides crawler viability; P-V2 settles.
Lean self-host/static until answered. U2 codebase languages — decides extractors and
identifier-typo policy; P-T1 needs it bounded. U3 locale set (diacritics vs RTL vs
CJK) — decides tokenizer/IME matrix weight; P-L1 needs it bounded; S17 re-verification
depends on it (m8). U4 release cadence (daily vs weekly) — decides snapshot-vs-ref
economics and index freshness triggers; P1(b) conditional on it. U5 secondary-snippet
provisional (Starlight/Mintlify/Fern/RTD) — EXTENDED to linkage/export (M8/M9) and S22
CI patterns (m12): provisional until verified if selected. U6 textual-vs-semantic
contradiction mix — P-D1 validates the textual/link layer ONLY; semantic-conflict
recall has no metric and stays with human review. U7 (P4 attachment): whether any
stakeholder is attached to P4's rewrite shape — if so, that attachment conflicts with
the brief and needs explicit adjudication (Q7, blocking); any future proposal queue
requires brief amendment, not silent enablement. U8 (critic, new): engine-default
confidence asymmetry (Meilisearch typo re-verified; Typesense S09 + Meilisearch
ranking S07 inherited) — re-verify the SELECTED engine against its pinned release
before build (m6). U9 (critic, new; NARROWED by R11 spike): Local Search behavior at
scale unknown — README-level facts observed (offline, multi-version, lunr+zh, context
scoping); per-version isolation config-level, index size, and tokenizer adequacy still
unmeasured — P-S1 spikes or explicitly excludes.

## 9. Validations — executed vs proposed (O6; discriminating, bounded, no pretense)

EXECUTED (this reviser stage; no sandbox, no runtime witnesses claimed):
- E1: 2 primary pages fetched (both HTTP 200): R10 versioning (93725 B, byte-identical
  to S01/C10) with banner enum + routes grep-verified; R11 Local Search README (389149
  B incl. chrome) with options rows grep-verified. 1 spike search (8 results).
- E2: 6 declared predecessors + brief + both source roots read COMPLETE; hashes/bytes
  recorded in source-map.json (R00–R08).
- E3: Freeze/reveal artifacts (freeze.json, plan-file listing, reveal timestamp) NOT
  re-read (campaign boundary) — research E2/E3 marked UNVERIFIED-BY-REVISER: inherited
  trust, not doubt (M11).
- E4: No product behavior executed (no installs, no services, no sandbox offered). Every
  mechanism claim is doc-observed; the proposal/execution boundary below is exact.

PROPOSED (each discriminates a named decision; M11 tightenings applied; gate vs
scheduled split per M7):
- P-V1 version-facet e2e (GATE, minimal matrix): identical term in vN and vN−1; assert
  disjoint top-hit version tags AND facet-schema presence; control stale index via
  index-reset discipline (Chain A fix required delete + recrawl). Discriminates faceted
  vs leaking retrieval. Kills P2-flat, validates P1. Requires hub choice first (Q1).
- P-V2 crawler/auth probe (GATE, first): hosted-crawler fetch attempt against authed
  staging URL AND parallel local-crawler dry-run (hosted probe may block on
  application/eligibility process, not tech). Discriminates public-crawler viable vs
  must self-host/static. Settles U1/C12.
- P-S1 local-search spike (GATE if Docusaurus hub): build Local Search index at
  representative scale; measure index size, version-scope isolation (config-observed),
  multilingual/tokenizer behavior per U3. Discriminates Local Search vs Pagefind vs
  engine on the zero-service branch. Settles-or-excludes U9. (New, M10.)
- P-L1 locale matrix (GATE minimal locales; FULL scheduled): same query per locale +
  CJK/IME/diacritics fixtures (not just queries); assert segmentation, fallback,
  `exactDiacritics` behavior. Requires U3 bounded. Discriminates tokenizer adequacy.
  (S17 re-verify if CJK/IME weighted, m8.)
- P-T1 typo A/B — SPLIT (M11): (a) per-engine threshold sweep (e.g., Meilisearch 5/9 vs
  4/10; Typesense 4/7 vs 5/9) with engine held constant; (b) cross-engine comparison as
  separate arm. Identifier fixtures (`v2.1.0`, `getUserById`) kept. Discriminates
  threshold choice from engine choice. Requires U2 bounded.
- P-R1 ranking placement (tuning; scheduled): version-recency `sort` high vs low vs
  between attributeRank and wordPosition; multi-word queries incl. right-to-left order
  swaps (Meilisearch; verify analogous Typesense/Pagefind/Local Search behavior
  SEPARATELY, do not port). Sharpens O-C expectations table.
- P-C1 citation audit (GATE, budget 20 samples): verify excerpt→passage identity
  (identity rule: exact substring vs whitespace/diacritic-normalized — FIX at build) +
  version pin + permalink freshness. Inter-rater rule if manual. Discriminates citable
  vs paraphrased retrieval; tunes k/excerpts (P3).
- P-D1 contradiction drill (GATE, budget 3 injected conflicts): MILESTONE 1 = author
  Vale house rules (drill cannot run before rules exist); MILESTONE 2 = inject 3 known
  conflicts (cross-version, cross-locale, stale snippet); require Vale/lychee/diff to
  surface all three with `git status` clean of content edits (reports only).
  Discriminates report-only net adequacy; enforces C10/P4 verdict. Textual/link layer
  only (U6). S22 patterns re-verified first (m12).
- P-M1 export round-trip (SCHEDULED unless export is MVP, Q8): build static+PDF+
  index-dump+llms.txt for two versions; fidelity rubric — must-preserve: headings/links/
  code/version-badges; may-drop: theme chrome; measure: index-recall delta on dumped
  JSON against a FIXED recall-regression threshold (not bare "diff"). Discriminates
  portable vs locked-in authoring (C11).

Priority order for build: P-V2 (settles U1/C12 hub/crawler choice) → Q1 hub choice →
P-V1 (schema/scope) + P-S1 (if Docusaurus) → P-T1 (needs U2) → P-L1 (needs U3) →
P-C1/P-D1 (need fixtures/rules) → P-R1 (tuning) → P-M1 (needs rubric+sourcing;
scheduled unless MVP).

## 10. Open questions for build (user decisions required)

Q1 hub model (a/b/c/d) — exactly one; fencing in §1-P5; quantify build growth if V
large (O-E); record BEFORE retrieval build. Q2 engine/static/crawler/local-search
(settled with P-V2 + P-S1 + U1). Q3 locale set + fallback policy (U3; bounds P-L1).
Q4 k/excerpt/ranking profile (settled with P-C1/P-R1). Q5 backport policy (which
versions accept doc PRs; interacts with snapshot cost). Q6 PDF/format matrix bound
(requires M9 sourcing). Q7 P4-attachment check (U7): confirm no stakeholder requires
rewrite suggestions; if one does, escalate as brief-conflict for BRIEF AMENDMENT, do
not implement quietly. Q8 export MVP scope: is export in MVP (P-M1 gating + M9
sourcing required) or scheduled (provisional suffices)? (M9.)

## 11. Method compliance and reviser limits

M01 single-investigator coherent batch: shared condition map (§5) + per-question maps,
full scope in one pass, same critic→reviser continuity via §2 adjudication. No nested
agents, no repo/canon edits, no installs, no private internals. Predecessors untouched;
this final supersedes the draft as the deliverable (draft preserved as lineage).
Science saved before native Goal terminal completion; after terminal only mechanical
delivery.

Reviser limits (honest): time-boxed to stage deadline (2 independent fetches + spike
search + adjudication + writing). Docusaurus search page, Typesense API, Meilisearch
ranking, Antora, mike, Pagefind indexing/ranking, and issue/changelog primaries were
NOT re-fetched — confidence inherits S/C provenance with byte-identical corroboration
on R10 and flags at m6/m8/U8. Linkage/export sourcing (M8/M9) deferred to build-gating
honestly rather than faked. No sandbox witnesses; no code execution. Local Search
spike is README + snippet level (R11/R09), not measured — P-S1 or explicit exclusion
required before the zero-service decision is final.
