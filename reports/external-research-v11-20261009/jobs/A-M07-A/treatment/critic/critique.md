# ER11 scientific critique — S07 documentation portal

**Stage:** A-M07-A / treatment / critic; method M07 evidence-on-demand.  
**Review basis:** complete original brief, revealed P1–P6 plan, full own-arm discovery and draft, inherited source map/index/excerpts and S01–S12 source notes, plus Q01–Q06 primary-source captures. No other arm, evaluator, campaign history, or private source was read.  
**Scope:** This is a critique of claims, dispositions, omissions and proposed checks; it is not a repaired research draft or implementation recommendation. The navigable sources and exact excerpt bytes are in [sources/index.md](sources/index.md) and [source-map.json](source-map.json).

## Assessment

The draft is a strong, coherent conditional design. It preserves all six exact plan clauses, clearly labels alternatives and uncertainty, separates proposed validations from executed work, and does not present an implementation or benchmark. The core invariants—release/ref identity, locale scope, exact passage provenance, visible abstention, and human-reviewed contradiction candidates—fit the brief. Its main weaknesses are an overbroad Docusaurus current/latest statement, a missed Docusaurus multi-instance alternative, one overbroad rejection of explicit approved writeback, an imprecise rejection of nightly cadence, Antora latest-selection edge cases, and a material access-control omission for internal docs.

## Material findings

### M1 — Docusaurus does not force current and latest to differ

The draft says Docusaurus “makes current and latest distinct.” The official 3.10.2 guide defines two separate concepts, but says they may resolve to the same version; it documents `lastVersion: 'current'` for a one-maintained-release setup. The default Next/current versus latest split is real, but it is not universal. Tighten the claim to: Docusaurus distinguishes source-location “current” from navigation “latest”; defaults often split them, while configuration can align them. This matters to the recommendation and P1/P5 comparison because a Docusaurus portal can publish the maintained release from its current tree if the release process freezes/pins it. A copied `versioned_docs` folder is editable/removable, so the generator alone does not guarantee immutable citations or retention. Evidence: [Q01](sources/Q01-docusaurus-versioning.md), plus inherited S01.

### M2 — Docusaurus multi-instance is a missed alternative

The discovery frames Docusaurus chiefly as a central consolidated docs tree or separate site instances. The 3.10.2 docs support two or more distinct docs sets in one site, including sets with different versioning/release lifecycles; each plugin instance has distinct version storage and a versioning command. This is materially relevant to three separately released codebases and should be retained as an option alongside Antora. It does not by itself stage/pin independent Git repos, build a compatible product-release tuple, enforce search isolation, or handle citations/contradictions. The candidate is Docusaurus multi-instance plus an explicit CI source manifest; test whether the expected repo content roots and locale/version combinations fit. Evidence: [Q02](sources/Q02-docusaurus-multi-instance.md).

### M3 — P1 identifies the identity problem, but cadence alone is not the defect

The draft correctly rejects using a mutable main-branch name as a released-version identity and correctly allows a separate preview. Its P1 disposition is broader than the evidence: a nightly crawl can be valid for a preview if it records the exact commit and visible unreleased state; it can also serve as a reconciliation job for release-triggered, pinned snapshots. The failure is an unpinned or non-atomic crawl treated as “the release,” which can drift or miss an intervening release. Preserve nightly as an operational choice, but require release/ref identity, complete-manifest publication and an explicit preview/released filter. A release event is a sensible freshness mechanism, not a scientific necessity of the brief. Evidence: Q01, inherited S01/S06.

### M4 — P4’s rejection should target silent writes, not every post-approval write

The brief forbids silently rewriting docs; P4 explicitly proposes maintainer approval. The draft correctly says human approval alone is not contradiction triage, and it is right to require exact passages, scope, reviewer decision and provenance. But “reject any automatic edit” and requiring the change to occur only through a normal repository patch is stronger than the brief. An edit applied after explicit authorized approval could satisfy the no-silent-rewrite condition if the system presents a diff, records approver/time/source revisions, preserves rollback/audit, and uses an agreed write path. Whether that path is a PR or controlled writeback is a user governance decision. Reject unattended or ambiguous approval; do not label all explicitly approved writeback as incompatible. This is a correction to the draft’s P4 disposition, not a reason to remove review.

### M5 — The internal-corpus access model is absent

The draft discusses third-party indexing/privacy and names SSO/access policy as an open search-service question, but its proposed record and validation design does not define per-repository permissions, user/group identity, or revocation. “Internal” and “60 engineers” do not prove that all three codebases or notes are readable by every person. A single index, hosted crawler, result snippet, citation page, generated answer, facet count, or contradiction pair could expose content across a boundary. Make authorization a release-blocking design decision: identify source ACLs and identity provider; filter before retrieval and at document/citation delivery; propagate revocations/deletions; ensure caches, exports and contradiction queues apply the same rules. Add positive/negative per-user authorization tests before any pilot. This is a scope-critical omission, not evidence that an existing product is insecure.

### M6 — Antora latest selection needs its edge cases

The discovery and draft give the usual rule that latest is the first sorted stable version, and correctly warn that named labels can sort before SemVer. The official 3.1 guide adds that when every version is a prerelease, Antora selects the first prerelease; an unversioned component version is always considered latest (or latest prerelease). These rules can make “latest” especially unsuitable as the requested product release. The draft’s explicit-pin/manifest recommendation already avoids this; add the edge cases to the applicability warning and validation matrix. Evidence: [Q03](sources/Q03-antora-version-sorting.md), with inherited S04/S05.

## Exact P-clause disposition review

| Clause | Critic judgment | Required qualification |
|---|---|---|
| **P1 — nightly main crawl** | **Partly correct; narrow the correction.** | Reject main as an unpinned release identity. Nightly cadence itself is acceptable for a commit-pinned preview/reconciliation index; release records need immutable ref/commit and a manifest. |
| **P2 — every chunk in one vector index** | **Correction upheld; vector remains uncertain.** | One physical collection is acceptable only with verified release/locale/status and authorization filters before evidence is exposed. Vector versus lexical/hybrid is an empirical choice. Keep literal source text/digests outside embeddings. |
| **P3 — top five chunks and links** | **Correction upheld.** | Fixed top five and links alone do not establish a released quote or show both sides. But the portal may retain a tunable top-five UI after recall/citation testing; contradiction review may be a distinct queue. |
| **P4 — approve suggested rewrites** | **Human review is already covered; draft over-rejects writeback.** | Require explicit, attributable approval and no silent mutation. PR versus authorized audited application writeback remains a governance choice. |
| **P5 — keep old pages separately** | **Historical retention is already covered; identity correction is valid.** | Historical records need stable source release/commit and citation target. “Separately” may mean version route, immutable archive or content-addressed snapshot; duplicate folders are not required. Retention and patch-release granularity are user decisions. |
| **P6 — ten familiar questions** | **Correction upheld; retain as smoke coverage.** | Add a reviewed discriminating set for wrong-release/locale leakage, exact citations, missing/unreleased data, contradictions, code links, drift and abstention. Predeclare thresholds. |

**Disposition categories:** P1 and P4 need narrower correction; P2, P3 and P6 remain valid corrections; P4’s human approval and P5’s historical retention are already covered by the brief. Optional additions remain preview crawling, vectors/hybrid retrieval, answer synthesis after citation gates, rewrite suggestions, and immutable static archives. User decisions remain release mapping, source ownership/location, default locale and fallback, hosting/data policy, retention, owners/adjudication, approval/writeback policy, and answer UI. Reject silent/unreviewed source mutation and vector-only truth; do not reject a vector index or expressly approved writeback categorically. Product fit, relevance, cost, latency, privacy terms, contradiction precision and reviewer load remain uncertain.

## Minor findings and preserved correct claims

- The source review supports Typesense 30.1 exact string filter syntax (`:=`), pagination defaults/limit, prefix default, and numerical/alphanumerical typo defaults. Those query defaults do not replace hard metadata filters. Do not rely on query text as a version selector. In addition to scoped relevance, verify authorization, filter escaping, partial/empty values, locale tokenization, and how the selected collection schema handles those fields. Evidence: [Q04](sources/Q04-typesense-search-30.1.md), inherited S08.
- DocSearch’s locale/version facets and anchors are retrieval affordances, not proof that filters are applied or snippets are authorized. The draft correctly leaves hosted terms, entitlement, deletion and performance unobserved (S07).
- Backstage TechDocs provides catalog association and a static generation/publish flow; the reviewed docs do not establish this brief’s release-aware cross-repository search, exact citations or contradiction queue. Treat those as unverified needs rather than asserting the product cannot support extensions (S09/S10).
- The PR 10875 → v3.8.0 chain is accurately bounded: the PR reports a missing localized version JSON, adds copying plus a test, and the release notes list the fix. The PR’s manual test is author-reported; the release entry proves inclusion in that release, not that this team uses it or that translated content is complete. Add both present/absent sidecar cases to a Docusaurus regression test, then separately verify translation/page inventory and freshness. Evidence: [Q05](sources/Q05-docusaurus-pr-10875.md), [Q06](sources/Q06-docusaurus-v3.8.0-release.md), inherited S11/S12.
- Antora’s `page-origin-refhash` is a source-ref identifier (documented as SHA-1), not an exact passage digest; the draft correctly adds a separate digest and exact excerpt. DocSearch, Typesense and TechDocs likewise do not, by the cited evidence, supply the whole application invariant.
- The inherited exact-excerpt register was parsed and all 12 excerpt SHA-256 values recomputed successfully. This is evidence-index integrity only, not a product check. No runtime, prototype, benchmark, security test, hosted-service access or billing check was available or run; all proposed product validations remain unexecuted.

## Validation applicability and priority

The draft’s release-isolation, locale, citation-drift, regression, contradiction/scope, search-comparison and export/rebuild proposals are useful. Prioritize them as follows and add authorization:

1. **Access and release isolation:** for each user role, ensure only allowed repo/release/locale passages, snippets, facets, answers, links and contradiction candidates are visible; revoke access and delete a source record, then verify all indexes/caches/exports stop returning it. Use pinned commits and a manifest with a deliberately missing or mismatched ref; reject partial publication or label it explicitly.
2. **Locale and citation fidelity:** include current, stale, missing and untranslated pages; test no silent fallback. Compare displayed quote to source bytes under one stated canonicalization rule, stable explicit anchor, commit permalink and recorded digest; mutate a source and ensure old ID does not rebind.
3. **Versioning regressions:** if Docusaurus is selected, exercise both an existing and absent localized `current.json`, inspect per-instance routes/locale inventories, and assert which package version contains the fix. If Antora is selected, test named/semantic/prerelease/unversioned values and explicit repository refs; assert the user-selected tuple rather than the implicit `latest` alias.
4. **Contradiction and approval:** distinguish same-scope incompatible assertions from version/environment/translation differences; show both authorized exact passages; ensure no content changes before explicit approval; then test the approved write path, before/after provenance, audit and rollback.
5. **Retrieval and migration:** use a reviewed multilingual technical gold set with exact answer spans, negative release/locale cases, identifiers/numeric defaults, no-evidence prompts, and conflict pairs. Compare lexical/vector/hybrid on identical data; set recall/citation/privacy thresholds before observing results. Rebuild/export to a second backend and compare IDs, source bytes, labels and authorization metadata.

These remain proposals; the critique did not run them. No result should be attributed to a runtime or user corpus.

## Evidence limitations

The brief provides no actual repositories, formats, tag cadence, locale set, access-control policy, hosting rules, product runtime or user queries. Public primary sources establish documented mechanisms and the cited historical fix, not fit, security, licensing/contract suitability, operational cost, retrieval quality or contradiction detection for this group. `source-map.json` records exact public URLs, observed versions/commits, access operations and inherited lineage; source excerpts are bounded and do not replace cold review of the referenced sections.
