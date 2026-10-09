# ER11 A-M01-B control critic — S07 documentation-portal

Scope: critic over own-arm predecessors only (q1 + q2 drafts, discoveries,
revealed plans, source-maps, source roots) plus the exact brief and two
independently fetched public primary sources (C-S01, C-S02). No
campaign/history/evaluator/counterpart read. Thin plan text (both
revealed-plans identical): P1: Crawl main branches nightly. P2: Put every
chunk in one vector index. P3: Answer with the top five chunks and links.
P4: Let maintainers approve suggested rewrites. P5: Keep old documentation
pages separately. P6: Test by asking maintainers ten familiar questions.

Independent verification executed in-window (read-only web fetch,
2026-10-09 ~18:38 UTC; excerpts in sources/): C-S01 Pagefind filtering page
(full, untruncated) CONFIRMS q1-S03/q2 mechanics; C-S02 Meilisearch
security/tenant-token page CONFIRMS q1-S04 scoping model. No witness
sandbox available; no code executed. Usage/billing: unobserved (null).

## Per-P verdicts (all six dispositions UPHELD, with notes)

- P1 CORRECTION (both arms): UPHELD. Main-branch crawl serves unreleased
  content, violating "relevant released version". Both arms converge on
  release-pinned ingestion + labeled preview-only main scope. No conflict.
- P2 CORRECTION (both arms): UPHELD. Unscoped single index cannot enforce
  version/locale/codebase scoping. Both arms replace with scoped retrieval;
  see M1 for the enforcement-point difference the final must resolve.
- P3 CORRECTION (both arms): UPHELD. Fixed-k + bare links lack scope
  badges, anchor integrity, and fallback honesty. q2's citation contract
  (version+locale+path+anchor+hash) is the stronger formulation; final
  should adopt it. See m1 on q1's split label.
- P4 REJECTED with read-only replacement (both arms): UPHELD. Correct
  load-bearing reading of "without silently rewriting documentation".
  Approval-gated rewrite keeps a retrieval→store write path and fails
  through approval fatigue. No false rejection. See m2 for the
  PR-process vs in-queue-proposal nuance to reconcile.
- P5 CORRECTION to versioning contract (q1 CORRECTION, q2
  ALREADY-COVERED-in-intent + CORRECTION): UPHELD as CORRECTION.
  "Separately" is unimplementable without keys/aliases/scoping/retention.
  q2's "already-covered in intent" half adds nothing; final should use
  single disposition CORRECTION. See M6 for option tiering.
- P6 CORRECTION (both arms): UPHELD. Ten familiar questions cannot
  discriminate version-correctness, citation exactness, or contradiction
  recall. Both arms propose discriminating batteries; see M7 for dedupe.

No valid plan element was wrongly rejected; no false correction found.
No P-disposition conflict exists between q1 and q2.

## Material findings (final must address)

M1 — Retrieval enforcement point differs between arms and must be
decided, not merged. q1-R1: ONE Pagefind index with `version:`/
`codebase:`/`locale:` filters enforced by the UI template. q2-(a):
PER-VERSION/PER-LOCALE static bundles where the UI loads the matching
index. These are different failure modes: q1's filter is client-side and
a template omission leaks cross-version passages silently; q2's bundle
isolation is stronger per query but multiplies build artifacts/storage
and can still cross-link via a stale selector or misdeployed shared
bundle — so q2's "a result can never lead to another version" OVERSTATES.
Both are consistent with Pagefind's per-build mechanics (C-S01 confirms
filter capture forms; per-build output confirmed by q2-S01/S02). Final
must pick ONE default, state its enforcement point and leak mode, and
cost the alternative. Recommendation: q2-(a) default for strongest
isolation at this corpus scale, q1-filter as the documented fallback
with a V1 leak probe mandatory.

M2 — Chain B (Docusaurus cross-version canonical wontfix) must stay a
LEAD in the final, not a fact. q1-S06 honesty note is exemplary
(snippet-only, issue number/verbatim text unobserved). q2 discovery O3
repeats the claim as "closed as wontfix ... (secondary report
corroborated by versioning docs structure)" — docs structure is NOT
corroboration of an issue outcome; strike that phrase. The final may
state only the design rule (internal search must index old versions
explicitly; public-SEO noindex must not propagate to internal config)
as a RULE, not as observed Docusaurus behavior, until the primary
issue + sitemap-plugin docs are fetched.

M3 — q2 CJK / pagefind_extended mechanics lack retained passages. q2
discovery asserts extended binary, `Intl.Segmenter`, `force-language`,
and CHANGELOG evolution, but retained q2-S01/S02 excerpts contain none
of that text and no CHANGELOG source ID exists. The CJK-conditional V7
stands as a proposal, but the final must carry CJK analyzer quality as
UNVERIFIED-AGAINST-PRIMARY in this window (matching q1's honest
uncertainty) and must not assert extended-binary mechanics as observed.

M4 — q1 unsourced implementation details to drop or source. "Meilisearch:
Rust + LMDB-backed persistence, primarily single-node" (discovery 2b)
and "word positions are in the index" (Pagefind citation support) appear
in NO retained q1 excerpt. My independent C-S02 fetch of the same
tenant-token page likewise contains no LMDB/single-node text, confirming
these are background knowledge, not cited-page facts. Not
disposition-load-bearing; final must drop them or attach a real source.

M5 — Typesense-vs-Meilisearch schema-cost comparison is weakly
evidenced. q2's "filter changes are query-time" for Typesense (no
reindex) vs Meilisearch's mandatory `filterableAttributes` + full
reindex (q2-S14, retained and specific) rests on q2-S13 excerpts showing
only filter SYNTAX and `per_page` default — not schema-change cost.
Direction is plausible but the final must label the Typesense half
unconfirmed or verify against Typesense collection-schema docs. P2
disposition unaffected (both scoped designs remain valid).

M6 — P5 platform options need tiering, not a flat a–f list. q2 option
(c) Starlight "layout versioning" is mechanics-thin: q2 itself admits
Starlight versioning is "not first-class" and must be "imposed by
content layout + search scoping" — that is a DIY design, not a peer of
Docusaurus snapshots / mike / Antora component versions. Option (f)
Backstage-as-shell is correctly conditioned on core's versioning gap
(q2-S16 primary issue page observed; WIP addon honestly noted) —
UPHOLD that conditioning. Final must tier: Tier 1 first-class
versioning (Docusaurus, mike, Antora) with authoring-format costs;
Tier 2 imposed-by-layout (Starlight); shell (Backstage) orthogonal.

M7 — Validation suites overlap and must be DEDUPED, not stacked. q1
P-V1..P-V6 ∩ q2 V1..V8: P-V2 ≈ V1+V2 (scoping + citation), P-V1 ≈ V5
(storage/release-cut), P-V3 ≈ V7 (multilingual/CJK), P-V5 ≈ V4
(contradiction read-only proof), P-V4 ≈ V3-adjacent (linkage/fallback
honesty). Presenting 6+8 checks double-counts. Both arms honestly state
NOTHING executed and no runtime/sandbox existed — UPHOLD that honesty;
the final must carry one deduped battery with each check marked
PROPOSED and its discriminating pair named.

## Minor findings

m1 — q1 P3 label "CORRECTION + ALREADY-COVERED (in part)" splits one
clause across two dispositions confusingly. Final: CORRECTION with the
versioned-URL reuse noted as retained mechanism, not as disposition.
m2 — P4 replacement nuance: q1 allows suggestions ONLY through the
normal docs PR process; q2 allows an explicitly labeled in-queue cited
proposal with per-passage accept. Recommend final adopt q1's stricter
rule (no accept path inside the portal at all) with q2's labeling
requirement for any proposal text shown.
m3 — q2 Vale "older installs silently(?) mis-scope" — the "(?)" is
honest; final keeps minimum-Vale pin as V4-validated, not established.
m4 — Dead-link "--strict-class gates" (q2) and unpinned-link lint (q1)
are design proposals without source IDs; fine as proposals, must not be
cited as observed product behavior.
m5 — "Antora imposes AsciiDoc" (both arms): fair first-order
simplification; Markdown-extension nuance unobserved by all. Acceptable;
final may note "AsciiDoc-first" rather than "AsciiDoc-only".
m6 — Honesty-note discipline (q1-S06/S07 leads, q2 S16 WIP, both "no
runtime" statements, both usage/billing null) is exemplary and the final
must preserve lead-vs-fact labeling (O5).
m7 — q2 "per_page default 10", highlight `<mark>` snippets (S13),
Meilisearch reindex cost (S14), mike deploy flow (S10) are retained and
specific — UPHOLD as verified details.
m8 — Vector-model selection left UNCERTAIN/optional by both arms is
ACCEPTABLE, not an omission: P2's disposition removes the vector-only
foundation, and the brief never requires embeddings. Final keeps vector
as optional ranking-inside-scope with no model named.

## Omissions check

No consequential brief obligation is dropped across the join: O1
(Antora, Pagefind, tenant tokens, Vale, mike, Starlight, Sphinx,
Backstage all beyond-thin-plan), O2 (snapshot/ref mechanics, filter
forms, filterableAttrs cost, i18n filesystem models), O3 (one primary
chain per arm: q1 Pagefind 1.5.0 banner, q2 Backstage #16711; plus
honest leads), O4 (every P disposed by both arms), O6 (executed vs
proposed separated by both). Load/scale is unmodeled by both and
honestly stated — acceptable at this scope; P-V1/V5 pilots cover it.

## Critic demands on the final

1. Resolve M1 with one default retrieval design + named leak probe.
2. Demote Chain B and CJK mechanics to labeled uncertainty (M2, M3).
3. Drop or source M4 details; label M5 Typesense half unconfirmed.
4. Tier P5 options (M6); dedupe validations (M7); single P dispositions.
5. Preserve all honest uncertainty, user decisions, and the P4 no-write-path rule.
