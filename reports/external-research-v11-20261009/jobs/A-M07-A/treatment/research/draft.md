# Research draft — documentation portal for three engineering codebases

**Status:** complete research-stage planning draft, 2026-10-09. Discovery was frozen before this plan was revealed. This draft compares every P clause in the revealed plan with the S07 brief, preserves conditional choices, and proposes validations. It is not an implementation, product benchmark, or claim that proposed checks ran. The navigable exact-byte excerpt register is [sources/exact-excerpts.json](sources/exact-excerpts.json).

## Recommendation

Keep each codebase's authored documentation in Git and build an immutable release-aware view from pinned refs. Each released passage should carry its codebase, source repository/path, full source commit, repository release, any product-release tuple, locale, stable heading anchor, exact text, and content digest. Search may use one physical index only if every record is hard-filtered by the selected released refs, locale, and publication state before ranking. Keep current/main-branch previews in a separate, visibly unreleased scope.

Pilot **Antora** first if the three repositories and their tags are independent and the existing docs can be placed in Antora's content structure. Antora's distributed component/version model maps directly to multi-repository publishing and its page model exposes source ref information. Pilot **Docusaurus** instead if a central static site or consolidated Markdown tree is already the natural authoring workflow; confirm how source repos map to release/version routes. Pilot **Backstage TechDocs** only if the team already operates Backstage or has a broader catalog/owner-navigation need that warrants it.

For search, run a controlled Typesense 30.1 evaluation for an internal-only corpus; alternatively evaluate hosted DocSearch if company policy permits indexing internal text in a hosted service. These are search engines, not substitutes for source versioning. The sources reviewed do not substantiate which backend is faster, safer or cheaper on this corpus. Treat vectors as an optional retrieval feature and compare them to lexical search, especially for API identifiers, config keys, version numbers and multilingual terms.

Do not generate a synthesized answer by default until scoped retrieval and exact passage citations pass their checks. Start with ranked passage cards and exact quotes. If a later answer feature is added, every factual claim must link to a quoted passage in the selected release/language; if nothing supports the answer, say so. Contradiction handling should be a human-reviewed candidate queue. The system can suggest pairs and a separate resolution patch; it cannot edit, replace, suppress or canonicalize source docs without an explicit repository change.

## Exact P-clause dispositions

| Plan clause | Primary disposition | Finding |
|---|---|---|
| **P1 — “Crawl main branches nightly.”** | **Correction** | Main branches are mutable and are not release identity. A nightly crawl can omit a release published after the run or make old citations point at new text. Build released records on release/tag events from immutable refs and resolve each to a full commit. If one product release spans independently released repositories, require a compatibility manifest mapping that product release to the three repo commits. Keep nightly main crawling only as an optional, separately scoped current-preview index that cannot answer a released query. |
| **P2 — “Put every chunk in one vector index.”** | **Correction; vector choice uncertain** | A single physical index is acceptable only if records preserve codebase, release tuple, locale, released/draft/retired status, source path, anchor and immutable source revision, and query filters are hard constraints before ranking. Every chunk from all branches without that context will mix releases and drafts. Vector search is not established as useful for technical tokens or these languages; compare lexical retrieval and vector retrieval on the same gold set. Preserve exact passage text and hashes outside or alongside embeddings. One index versus separate collections is an implementation choice, not a scientific requirement. |
| **P3 — “Answer with the top five chunks and links.”** | **Correction; answer synthesis optional** | Top five is an arbitrary cap and links alone do not identify the exact release, locale or bytes. Return passage cards with exact excerpts, source path, heading, repo/product release, locale and commit-pinned URL; include enough passages to show both sides of a possible contradiction. Search must filter to allowed released refs before ranking. Do not synthesize unsupported claims or silently fall back to main/another locale; use an explicit no-evidence result. A top-five display can remain a tunable UI choice after scoped recall tests. |
| **P4 — “Let maintainers approve suggested rewrites.”** | **Already-covered human-review principle; correction to boundaries** | Human approval supports the brief's no-silent-rewrite constraint, but approval of a generated rewrite is not a contradiction workflow by itself. Show both exact passages with version, locale and scope; mark the item as a candidate; let owners decide whether it is a true conflict or a version/context difference. A proposed rewrite must be a separate draft or repository patch with before/after provenance. Reject any automatic edit, suppression, replacement, or “approval” that changes source text outside normal repository review. Rewrite suggestions are optional. |
| **P5 — “Keep old documentation pages separately.”** | **Already-covered in principle; correction to identity and policy** | Separate old pages address historical preservation, which is necessary for released-version retrieval. Separation by folder or copied URL is insufficient if its source ref is mutable or the search index does not filter it. Store/pin the released source ref and keep a commit-based citation or immutable rendered snapshot. Preserve repo release and product-release tuple separately. Retention duration and whether every patch release merits a separate snapshot are user decisions; Docusaurus warns that unnecessary copies raise build and contributor costs and suggests a small active set, but that vendor rule is not an S07 requirement. |
| **P6 — “Test by asking maintainers ten familiar questions.”** | **Correction; keep as optional smoke test** | Ten familiar prompts can be a useful usability smoke test but are likely to favor known answers and do not discriminate version leakage, missing locales, wrong citations, unanswerable questions or contradiction behavior. Retain those prompts if valuable, then add a reviewed gold set with release/locale negatives, exact quote targets, conflicting and scope-different statements, missing releases, unreleased main content, source drift, code links and no-evidence cases. Set acceptance thresholds before running the evaluation. |

### Findings by disposition category

- **Corrections:** P1, P2's metadata/filtering requirement, P3, P4's workflow boundaries, P5's immutability requirements, and P6's evaluation breadth.
- **Already covered:** P4 already asks for human approval; P5 already recognizes the need to retain historical pages.
- **Optional enhancements:** nightly preview crawling in an unreleased corpus; vector retrieval after comparison; natural-language answer generation after citation gates; separate rewrite/patch suggestions; keeping the original ten prompts as a smoke test; archived static builds for older releases.
- **User decisions:** cross-repository release mapping; where docs are authored; default locale/fallback; default release selection; search hosting/privacy/procurement; historical retention; owners and adjudication policy; whether answer synthesis is wanted.
- **Rejected:** any silent or automatic source rewrite, suppression, or replacement. A vector index as the only record of truth is also rejected. The specific vector method remains unproven rather than categorically forbidden.
- **Uncertain:** which product is simplest given existing formats and tooling; whether a hosted search service is allowed; whether the three repos share a release cadence; whether vector or lexical/hybrid search performs better; appropriate retention/cost/latency; contradiction candidate precision and reviewer burden. No source read or prototype settles these.

## Proposed product and data design

### 1. Released source set

On each release, a deterministic build reads exact source tags/commits and emits a release manifest. The manifest records repo URL, codebase ID, full commit SHA, release tag, content root and selected locale roots. If product releases combine repos, a human-approved compatibility record maps the product release name to all component commits. Do not create a shared product release label merely because all three projects have tags.

Index released content only from this manifest. A distinct preview build can track main/nightly changes with publication_state=unreleased; it is disabled for released-version search by default. Missing tag, broken source, unsupported format or absent locale must fail or visibly mark a partial build, never silently substitute the current branch.

### 2. Passage/search records

Emit one row per stable heading or bounded paragraph/list passage. Keep full-page source snapshots and exact extracted text so that the search engine is rebuildable. Proposed fields:

| Field | Purpose |
|---|---|
| document_id, passage_id | Stable source/page/passage identity; passage ID includes source revision and stable anchor or digest |
| codebase_id, repo_url, path, content_root | Ownership and source/code navigation |
| product_release, repo_release, full_commit_sha | Distinguish coordinated releases from independent component tags |
| locale, source_locale, translation_of, translation_source_digest | Search scope and translation freshness relationship |
| heading_path, explicit_heading_id, start/end offsets | Passage navigation and exact extraction |
| exact_text, document_sha256, passage_sha256 | Literal quote and drift validation |
| publication_state, published_at, retired_at, supersedes | Release eligibility and retention state |
| page_url, source_permalink, code_permalink | User navigation to rendered page and source at an immutable commit |

A display label such as “current”, “latest” or “3.2” is metadata for users, not a replacement for the source commit/release key. If an anchor or excerpt changes, create a new passage revision. Do not rebind an old citation ID; mark its current page stale and retain the captured released source.

Docusaurus 3.10.2 makes current and latest distinct and copies the entire docs folder when tagging a version; configuration can exclude current work and select deployed versions. It recommends explicit heading IDs for localized docs because translated headings can change automatically generated anchors. Antora's component/version and origin fields provide another provenance route. Both products still need a stable exact-passage digest and a cross-repository release mapping for this brief ([Docusaurus versioning](sources/S01-docusaurus-versioning.md), [Docusaurus i18n tutorial](sources/S03-docusaurus-i18n-tutorial.md), [Antora source metadata](sources/S06-antora-origin-metadata.md)).

### 3. Retrieval and answer behavior

Query context includes codebase or product, selected product-release tuple (or an explicit component release selection), locale, and whether drafts may be included. Apply exact metadata filters before ranking. A UI must display active scope and allow deliberate expansion; if a release or translation is missing, say that rather than silently using another one.

DocSearch can copy locale/version meta fields onto each record and use facets; heading IDs support anchor links. Typesense supports exact string filters distinct from partial word filters. Typesense 30.1 also defaults page size to 10, allows at most 250 hits per page, defaults prefix search to true, and defaults numerical-token typo tolerance to true. Therefore an exact filter on canonical release metadata is essential; a query string containing a version number is not a release pin ([DocSearch evidence](sources/S07-docsearch-records-and-facets.md), [Typesense evidence](sources/S08-typesense-search-30.1.md)).

Initial results should quote stored exact text and show source label, release, locale, passage heading, source commit and link. Any model-produced answer must be built from only returned passages and cite each factual sentence. Verify every quote against the passage text/digest before display. If two sources conflict, show both instead of allowing ranking to hide one. If no released passage meets the filters, state that the answer was not found in the selected release.

### 4. Code and owner links

Use code repository/path at the same pinned commit as the docs, with a stable source permalink and optional symbol/line anchor. Keep link targets as structured metadata rather than extracting arbitrary URLs from prose. If code and docs release tags differ, display both. Backstage TechDocs can associate docs with catalog entities/owners; Antora exposes origin URL/ref/path/edit data. Docusaurus has version routes but the reviewed evidence does not show a native cross-repository code ownership map, so add a repository manifest or use catalog integration only if already available.

### 5. Contradiction review

No selected product source establishes native semantic contradiction detection. Build an explicit review layer:

1. Identify candidate passage pairs from shared API/config/topic identifiers and incompatible defaults, units, limits or procedures.
2. Show exact passages and all scope: codebase, product/repo release, locale, environment, feature flag and date.
3. Let relevant owners classify as confirmed conflict, scope/version difference, accepted divergence, false alarm or resolved by source change.
4. Record reviewer, timestamp, reason, referenced source revisions and any resolution PR.
5. Keep suggestions separate; never change source docs or hide a cited conflict automatically.

A different API default across releases may be legitimate. A French translation that has fallen behind English may be stale without contradicting it. A candidate generator must explain its basis and must not present its suggestion as verified fact. Do not promise exhaustive contradiction discovery from language-model output.

## Alternatives retained

| Option | Choose when | Constraints and evidence |
|---|---|---|
| Antora + Typesense/DocSearch adapter | Keep docs in three repos and assemble pinned component versions into a static site | Strong multi-repo/version and origin mapping; duplicate resource IDs fail and duplicated optional descriptors are unpredictable. Validate format and language conventions. |
| Docusaurus + search adapter | Central static site or Markdown site workflow is preferred | Built-in version routes and locale builds; copied version folders increase build/maintenance work; current/latest defaults and translated anchors require care. |
| Backstage TechDocs + added release-aware index | Backstage already exists and catalog ownership/navigation is valuable | Docs bind to catalog entities and CI publishes static output to object storage; Backstage/MkDocs infrastructure and release-aware search are additional scope. A symlink escaping the docs source tree rejects the build. |
| Hosted DocSearch | A managed crawler is useful and hosted processing of internal docs is explicitly approved | Version/locale record metadata and anchors are supported. Cost, internal-content privacy, residency, access control and deletion terms were not checked. |
| Self-hosted Typesense | Internal control of the search service is important | Exact metadata filters, facets and string search are available. This research does not measure multilingual relevance, operations, throughput or resource cost. |

No choice between these alternatives is forced by the brief alone. Existing authoring formats, Backstage presence and policy about hosted indexing should be checked before committing to a migration.

## Relevant fix/release history

Docusaurus PR 10875 documents a concrete versioning/i18n defect: when cutting a docs version, the CLI omitted the locale's version translation JSON derived from current.json. The PR added code to copy it for non-default locales when the file exists, warning and skipping otherwise, and added a CLI test. The PR says the author checked behavior on the Docusaurus website with a localized language and version cut. It merged 2025-01-31 as short commit 3b72bb4; the v3.8.0 release on 2025-05-26 includes PR 10875 ([PR code/evidence](sources/S11-docusaurus-i18n-version-fix.md), [release record](sources/S12-docusaurus-380-release.md)). This chain makes locale metadata/inventory assertions part of release validation; it does not establish absence of other failures or guarantee that a team is running a version containing the fix.

## User decisions needed before implementation

1. **Release model:** Are three codebases independently released? What source establishes a compatible product release, and who owns its mapping?
2. **Source location:** Keep notes in their code repos, use a central shared docs repo, or support both? Are there existing source formats and release tags to preserve?
3. **Released vs preview:** Should current branch documentation ever be searchable? Should the released query default require a user-selected product release, or use latest stable per component with that wording made explicit?
4. **Locale fallback:** Which locale is the default? Should a missing translation return no result, offer a labeled source-language fallback, or ask the user to expand locales?
5. **Search service:** Is sending internal docs to hosted indexing allowed? Is there an existing hosted/self-hosted search platform, SSO/access policy, procurement limit or budget?
6. **History and archive:** How many releases remain actively searchable and for how long? Can older releases move to immutable static archives? Does every patch release need a distinct docs snapshot?
7. **Conflict governance:** Who owns a pair spanning codebases? Who can mark an accepted divergence? What record and approval are required before docs change?
8. **Answer UI:** Are exact passage cards enough for the initial portal, or is synthesized prose wanted after evidence checks pass?
9. **Validation target:** Who reviews the gold queries and agrees on acceptable recall, citation accuracy, conflict recall/false-positive rate and latency?

## Proposed validations — none executed

There was no product runtime or implementation available in this research stage. The following are proposed, not completed:

1. **Release-isolation fixture:** Build records from three codebase refs, a named product-release tuple, one newer main branch and one prerelease. For a released query, assert zero returned records from main/prerelease or any commit outside the manifest. Remove one repo tag and assert an explicit partial/error state.
2. **Locale behavior:** Use a source paragraph, up-to-date translation, stale translation and missing translation. Confirm chosen locale filter and visible fallback behavior; never label fallback as the requested locale.
3. **Exact-citation round trip:** Retrieve a passage with numeric default and an API identifier. Assert displayed text equals the stored source excerpt byte-for-byte under a documented extraction rule, the link opens the same commit/heading, and a changed source digest makes an old citation stale rather than changing its target.
4. **Versioned translation regression:** If Docusaurus is selected, cut one translated docs version and inspect the version route, document inventory and locale JSON. Verify the installed package contains the fix from PR 10875 and test both existing and absent locale JSON behavior. If another generator is selected, test its equivalent version/translation manifest.
5. **Conflict/scope discrimination:** Create one same-release incompatible default pair, one valid difference across releases, one environment-specific difference, and one stale translated instruction. Measure which candidates appear, whether scope makes the difference clear, and whether review leaves source untouched until a normal source change.
6. **Search comparison:** On a representative sample, compare exact lexical, optional vector and optional combined retrieval against the same gold queries. Report recall@k for the correct release/locale, reciprocal rank, no-evidence behavior, source version leakage and latency. Decide pass thresholds before looking at results.
7. **Export/rebuild:** Recreate passage records from the normalized manifest in another backend or a static export. Compare IDs, exact text, hashes, release/locale fields and links. Treat this as a proposed vendor-neutral interchange contract; native search-index export/import was not researched.

**Executed checks:** the required plan-reveal freeze action; JSON syntax parsing for both saved maps; and artifact-index checks confirming the source IDs match, all evidence-note files exist, and discovery/draft are present. No product/runtime/evaluation checks were executed. There is no evidence here of costs, billing, hosted-service usage or performance.
