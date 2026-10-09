# S07 documentation portal — revised research and plan adjudication

**Stage:** ER11 A-M07-A/control/reviser, method M07.  
**Scope:** The supplied S07 brief and the revealed P1–P6 plan, with the complete declared research and critic materials. This is a bounded product-research recommendation for a 60-person engineering group, not an implementation specification or a claim of unlimited production guarantees.

## Executive recommendation

Do not select a vendor or architecture from the thin plan alone. Preserve the original requirements—three codebases, multilingual notes, frequent releases, retrieval of the relevant *released* version, exact passage citations, contradiction visibility, and no silent source rewriting—and first decide how a supported product/component release maps to repository commits and locales.

A workable product-independent shape is a catalog of released documentation snapshots plus a search and review layer. Each release record should resolve to exact repository commits (a tuple where codebases release independently); search should resolve the requested release and language before returning evidence; citations should identify the immutable source and exact supporting text; and contradiction candidates should enter a human review flow that cannot write source files. This is a recommended design inferred from the brief, not a behavior established by the product sources. A nightly job can be valid if it ingests immutable promoted refs or an approved release manifest and reconciles missed updates. An event-triggered pipeline is another option, not a requirement.

Backstage TechDocs is attractive as a catalog and ownership surface when Backstage is already in use, but the reviewed docs do not establish the needed version-aware cross-repository retrieval layer. Docusaurus offers repository-native version snapshots and locale trees. Read the Docs maps Git refs to versions and exposes project/version search filters, but its child-project fallback can silently substitute a default version. GitBook combines hosted spaces and language/release variants, but search/citation behavior and migration details need a bounded trial; some captured pages could not be reopened during review. Swimm is an optional code-linked maintenance lead, not a demonstrated portal candidate, and its cited post dates from 2022 when it described the product as in beta. These are conditional alternatives; none is selected.

## Obligation coverage

- **O1 — Discover approaches:** Compared catalog-linked documentation (TechDocs), Git-backed version snapshots and locale trees (Docusaurus), Git-ref publishing and scoped search (Read the Docs), hosted multi-space/version/language variants (GitBook), and code-coupled maintenance (Swimm). They differ materially in authoring, release modeling, search, and code linkage.
- **O2 — Primary behavior and limits:** Captured relevant defaults, scope rules, version/locale behavior, and migration caveats below and in the navigable evidence notes. Rolling documentation and tenant-dependent features remain dated observations, not guarantees.
- **O3 — Issue/evolution evidence:** Retain the narrow Docusaurus 3.7.0 localized numeric-version root-page regression report, the earlier Docusaurus translation-design issue, Backstage's historical multi-version request, and GitBook's 2025 variant/search and translation-publication evolution. Do not claim a Docusaurus fix that was not found or generalize a historical issue to current releases. The cited Swimm material is a 2022 vendor post. No relevant current release/fix chain was established for every alternative; absence from this bounded review is not proof that none exists.
- **O4 — Exact plan comparison:** Every P clause is reproduced and adjudicated below, including which parts are corrected, optional, retained, uncertain, or user decisions.
- **O5 — Coherent preservation:** The original constraints, multiple product choices, useful mechanisms, disagreement, failure cases, unresolved decisions, and source freshness caveats remain in this document.
- **O6 — Validation:** Proposals are separated from the research actions actually performed. No implementation, runtime, benchmark, migration, tenant, or product test was executed.

## Exact plan clauses and dispositions

### P1 — “Crawl main branches nightly.”

**Disposition: Correct the source identity; retain nightly cadence and main-branch preview as options.**

A nightly crawl of a *mutable development main alone* cannot guarantee that the retrieved snapshot represents a released version. Main may contain unreleased changes, and three repositories may ship independently. The material requirement is to capture immutable promoted refs and map every supported product/component release to the exact repository commits (or equivalent release evidence). Polling nightly, ingesting release/build events, or combining both with reconciliation are implementation choices. If a repository's protected main is itself the approved release snapshot, document that rule and its commit identity. A separate main preview can remain searchable when clearly labeled.

Docusaurus documents a distinction between current docs and the default/latest navigation route, and its version command copies a docs snapshot. Read the Docs makes `latest` track the default branch and supports configuring a different default. Neither source says the organization must use an event pipeline. Therefore I accept the critic's correction to the target and immutable identity, and amend the draft's categorical criticism of nightly cadence.

### P2 — “Put every chunk in one vector index.”

**Disposition: Correct the guarantee; keep physical index topology and embeddings conditional.**

The brief requires relevant released-version retrieval and exact passages; it does not require vector embeddings or one physical index. A unified logical search surface may use a filtered vector collection, separate partitions, lexical search, hybrid lexical/semantic retrieval, or a combination. Before any passage can affect ranking, answer generation, or citation selection, the system needs a reliable scope for repository/codebase, resolved release/commit, locale, and access. A single physical index is acceptable only if the implementation actually enforces that scope; the same applies to snippets and contradiction pairs so inaccessible text is not exposed.

A proposed passage record can retain repo, immutable commit, product/component release mapping, locale and translation provenance/freshness, path and heading/locator, exact source text or span, content digest, access scope, and index-build time. This registry and metadata schema are design recommendations, not vendor requirements. Read the Docs demonstrates project/version filters, a 100-project query ceiling, and a limitation on querying multiple versions of one project at once; that documents one search interface's behavior, not a universal index architecture.

I accept the critic's emphasis that P2 must not be read as a requirement to use embeddings or one physical index. The draft's one-logical-search-surface proposal remains a possible design, not an established product fact.

### P3 — “Answer with the top five chunks and links.”

**Disposition: Correct the quality guarantee; keep five as an optional display default after evaluation.**

Resolve and display release and locale context before retrieval. Return exact supporting passage text with a citation pinned to repository, commit, release, language, path, and a stable span or content identity. A mutable `main`/`latest` URL or heading anchor alone can move or change. If the product synthesizes an answer, associate factual claims with their exact source passage(s), show material disagreement and applicability conditions, and ask for clarification or abstain when release or locale is ambiguous or evidence is absent. Five results can be a configurable default if testing supports it; a fixed count does not establish relevance or citation quality.

The reviewed product docs do not establish this full answer-level citation contract. The captured GitBook 2025 update says search-result breadcrumbs show up to three items and omit translation variants. Thus breadcrumbs cannot serve as the locale identity or pinned citation; show locale in context/result metadata. The exact changelog URL timed out during this reviser's direct re-open, so I accept the critic's finding based on its dated direct capture and keep this behavior marked for reconfirmation in a GitBook trial. Detailed GitBook search-scope rules also remain provisional because the relevant captured page section could not be re-opened.

### P4 — “Let maintainers approve suggested rewrites.”

**Disposition: Optional enhancement with a strict human-authored source-change boundary.**

The phrase can fit the brief if “suggested rewrite” means an evidence-linked proposal: show the conflicting passages, source owners and release/language/applicability conditions, plus a diff or draft change request. The detector, indexer, and translation pipeline must not silently write authoritative source files. A maintainer's explicit approval should lead to the ordinary reviewed authoring/repository change process, with release effects visible. Maintainers should also be able to dismiss a false positive, mark a page superseded, or record an intentional version difference.

This workflow is a proposed product design; the reviewed candidate documentation does not establish a ready-made contradiction-pair review queue. The Swimm vendor post describes IDE/code links and PR checks that could be useful as a supplement, but it was published 2022-06-28 and said the platform was then “currently in beta.” Treat its automatic minor-update claims as historical vendor evidence requiring current verification, not an adoption guarantee. GitBook's captured current translation documentation describes generated translations that update with source changes and currently cannot be edited; that is a separate generated-locale path requiring an explicit policy decision, not authority to rewrite the original language source.

I retain P4 only as an optional, explicitly gated enhancement; reject the interpretation that detector/indexer approval enables autonomous source mutation.

### P5 — “Keep old documentation pages separately.”

**Disposition: Retain and strengthen; clarify presentation and retention as policy decisions.**

Preserve immutable snapshots for supported or citation-relevant releases, and make “released,” “preview,” “retired,” and “superseded” status visible. “Separately” can mean a distinct snapshot and clear navigation/filtering; it need not require a physically separate storage system. Decide whether retired material is excluded by default, how long it stays active, and what happens to old citations and redirects. Never present an old version as an unmarked competitor to the selected release.

Docusaurus versions are copied snapshots and its docs warn about increasing maintenance/build cost. Read the Docs deletes artifacts when a version is deactivated; a hidden version is not private. Therefore retention, visibility, permission, and citation continuity must be tested against the chosen product. Backstage issue #12259 is a historical request for per-entity versions, closed as not planned at inspection; it is a status signal, not proof that no current plugin or workaround exists. I accept the critic's clarification that storage location and default archive search behavior are unresolved user choices.

### P6 — “Test by asking maintainers ten familiar questions.”

**Disposition: Retain as a navigation smoke-test seed; expand to a labeled acceptance suite.**

Ten familiar questions may expose basic navigation issues, but they cannot by themselves establish release correctness, locale selection, exact citations, contradiction quality, access isolation, or abstention. Before judging a proof of concept, create cases labeled with expected release/product-to-repo commit tuple, locale, supporting span(s), answerability, and user access scope. Include an exact-match query and a semantic paraphrase; same-release genuine contradiction; a different but valid instruction in an older release; child repository missing the requested version; stale/missing translation; ambiguous release mapping; no-answer question; and restricted docs under different user roles.

Predeclare denominators and pass/fail thresholds with maintainers for correct release/commit, correct locale, exact source-span match (a resolvable citation to the wrong revision/span fails), retrieval recall/precision, false contradiction rate, and unauthorized disclosure. Blinded maintainer adjudication can reduce familiarity bias. Ten remains a smoke-test sample size, not a threshold established by any source. No such acceptance suite was executed.

## Coherent product-independent design and conditions

### Release and source identity

First decide what makes a document “released”: Git tags, deployed-build records, or an approved release manifest. If releases span repositories, represent the product/component release as a tuple of repository commits rather than assuming a shared version number. Each tuple member should resolve to an immutable snapshot. Do not silently substitute a child's default, a development branch, a newer stable version, or a translation from another release when a requested source is missing. Return “unavailable” or ask for a choice; show a nearest eligible version only as a labeled alternative.

A nightly reconciliation can work if it reads the approved immutable release catalog and detects missed promotion/build events. Event ingestion can reduce latency, but can also miss or race events; it is not automatically more correct. The source of truth is release identity, not cadence.

### Retrieval and citation

Keep the authoritative material in repositories where practical and create a catalog mapping source documents and passage spans to release tuples and locales. Resolve release and locale before ranking. Search can combine exact/lexical and semantic modes if useful, but exact phrases and source passages need to stay verifiable. Store the original passage, commit and digest so the display can show the matched text and a pinned source. If translated text is shown, retain its source-language link and translation revision/freshness; label any fallback rather than implying a translation exists. Access checks must cover ranking, counts, snippets, links, citations, and contradiction pairs, not only page rendering.

### Contradiction review and non-writing boundary

Treat apparent disagreement as a candidate evidence pair. Group by topic/entity, then compare only after considering release, codebase, language, date, product configuration, and applicability. Differences across these dimensions may be intentional. Show each exact passage with its identity and conditions. The review queue may offer “intentional,” “superseded,” “needs owner,” and “propose correction” outcomes. Detection and indexing remain read-only; an accepted correction goes through a human-reviewed source change and a new release/build path. No reviewed source establishes a complete built-in workflow with these safeguards, which is a scoped observation rather than a market-wide absence claim.

### Product alternatives

- **Backstage TechDocs:** Catalog entity annotations (`backstage.io/techdocs-ref`) link a service/component to Markdown docs. The quickstart defaults are local backend build, Docker/MkDocs generation, and local publishing; the guide recommends CI generation and storage-backed static output for its recommended setup, with external builder serving read-only artifacts. This is a strong ownership/catalog shell if already adopted. Add a version-aware release/citation layer explicitly. The closed 2022 issue requesting multiple versions per entity is historical evidence, not proof about all present-day extensions.
- **Docusaurus:** Versioned docs are copied snapshots, and current versus latest can differ; locale content has an explicit filesystem structure. It suits repository-native docs when snapshot and translation workflows are acceptable. The team must cut snapshots, map three-repo releases, and build the citation/search layer. The reported Docusaurus 3.7.0 bug concerns static serving of a localized root `index.mdx` at a numeric version and remained open/external in the checked issue record; it is not evidence of a current 3.10.2 defect, and no fix was verified. Include it as a narrow regression case if trialed.
- **Read the Docs:** Git branches/tags become versions; `latest` normally follows the repository default branch, while `stable` follows its documented stable-semver rule. Versions begin inactive; deactivation deletes artifacts. Each language is a separate project linked to a parent. Search supports project/version filters, permissions, exact phrases, and up to 100 projects, but not multiple versions of one project in one query. Crucially, `subprojects:project/version` uses a child's default version when that child lacks the requested version. The portal must detect the resolved child version/commit and fail closed or label it as an alternative. Set the root default to the chosen shipped-release identity rather than inheriting `latest` by accident.
- **GitBook:** A hosted site can assemble spaces and Git-synced repository folders into sections and language/release variants. The 2025 changelog captured by the research/critic stage describes simultaneous language and version selectors, search result breadcrumbs capped at three and omitting translation variants, plus a fix for published content failing to update after translation generation. The latter is useful release-history evidence, not a service guarantee. Current publishing docs confirm a spaces/sections/variants model and audience settings; tenant access, plans, data boundaries, and sync need testing. Importer limits/AI refinement and detailed language-variant setup are based on earlier captures: exact importer and variants URLs failed to reopen in both critic/reviser checks. Do not use the captured 20-page/20-asset UI limit or 5,000-page Git Sync limit, importer transformation defaults, or detailed scope settings as a current migration commitment until the exact pages or vendor confirm them. Do not silently substitute a nearby URL. Translation automation is a distinct paid workflow whose captured docs state that output cannot currently be edited and glossary changes trigger retranslation; owners must choose it or human-authored language spaces deliberately.
- **Swimm:** The 2022-06-28 vendor post describes repository Markdown links from IDE code locations, GitHub PR checks, automatic minor updates, and manual approval/modification for substantive changes. The same post says the product was then in beta. This is a code-maintenance/onboarding lead that might supplement a portal. Current status and behavior, release retrieval, localization, export, and source-change controls are unverified; do not shortlist it as satisfying the portal brief without new primary evidence.

The product selection depends on existing Backstage/catalog adoption, repository and authoring preferences, release semantics, locale ownership, hosting and access requirements, migration cost, and citation behavior. A bounded comparative proof of concept is a decision aid, not yet authorization to choose or deploy one.

## Migration and export

Keep the source repository and Git history authoritative where feasible, even if the portal renders derived HTML or a hosted site. Before migration, inventory formats, assets, code blocks, anchors, redirects, locale mapping, release metadata, access scope, and source history. Convert representative material on a staging branch, compare source and imported text/structure/links, and preserve a rollback path. Verify export back to the chosen canonical format and whether citations remain resolvable after a page move or retirement. Git Sync appears a plausible bulk Markdown path from the earlier GitBook capture, but its current page limits and import transformations were not confirmed by the repeated exact-URL opens; verify them before sizing a migration. No export guarantee is asserted for Swimm or any other product here.

## Open product decisions

1. Which event or record makes a release authoritative, and how is a product release mapped to three repo commits?
2. Should default search target last deployed, newest stable, or a user-selected release? Is main available as an explicitly labeled preview?
3. Which locales are in scope, who owns translations, and may automation generate/update them? What should happen for stale or unavailable locales?
4. Is search limited to the chosen language or allowed to include other languages with explicit labels?
5. Which documentation needs code linkage, and is the preferred surface a catalog portal, static docs, hosted visual editor, or combination?
6. Which old versions remain searchable, for how long, and what retirement/redirect/citation policy applies?
7. What are the hosting, repository, SSO/access-control, data residency, audit, and budget constraints? No private account, tenant configuration, or infrastructure was inspected.
8. What constitutes a contradiction, who owns triage, and what evidence is required before changing a source?
9. What measurable acceptance thresholds are adequate for a pilot? Vendor documentation cannot supply organization-specific thresholds.

## Validation plan — proposed, not executed

1. **Three-repo release resolution:** Create an approved synthetic release tuple with distinct commits in three repos; make one child project lack the requested version. Verify it is reported missing rather than silently inherited from its default. Include a main commit that is newer but unreleased.
2. **Release and locale retrieval:** Place exact and paraphrased evidence across two releases and languages, with one stale/missing translation. Verify the resolved commit/language is visible, scope is enforced before answer/citation selection, and fallback is explicit.
3. **Citation stability:** Query a distinctive passage and compare quote, repo, immutable commit, release, locale, path, span, and digest. Change the heading and path; require old citations to resolve against the pinned source or report retirement.
4. **Contradiction triage:** Add a same-release conflict and a valid older-release difference. Require a review pair for the former and version-conditioned treatment of the latter. Confirm detection/indexing cannot write to any source.
5. **Permissions:** Search as users with distinct repository access. Check result counts, snippets, passage text, citation targets, and contradiction pairs for disclosure.
6. **Migration/export:** Compare representative Markdown/HTML/RST with images, nested headings, links, code fences, redirects, locales, and release metadata; verify content, URL, history, anchors, export, and rollback. Confirm current GitBook importer/AI/Git Sync controls directly before relying on the captured figures.
7. **Candidate-specific trials:** Docusaurus: build/serve the narrow S04 localized numeric-version root-page case. Read the Docs: verify child default fallback and version resolution. GitBook: test variant/locale identity beyond breadcrumbs, search scope, sync conflicts, importer changes, fixed slugs, and translation publication. TechDocs: test history and cross-repo release resolution in the proposed added layer. Set denominators, thresholds, and blinded adjudication before scoring.

**Execution record for this reviser:** Read the exact assignment, input map, brief, full declared draft/discovery/revealed plan/critique, both source maps, and all declared source indexes/evidence notes. Independently reopened the exact Read the Docs search syntax and versions pages, Docusaurus versioning page, and Swimm post; recorded their observed scope/date/status in the reviser source map. Attempts to reopen the exact GitBook changelog, importer, and language-variants URLs timed out; these are recorded as failed access, not evidence. No application, browser runtime, benchmark, user account, migration, or tenant test ran.

**Usage/billing:** `null` — no usage or user-specific billing was observed or estimated. Published feature pricing in the captured GitBook translation documentation is not a user cost estimate.

## Scope and uncertainty

Product documentation establishes only what was published and inspected, not a tenant's plan entitlement, deployment suitability, access/security posture, multilingual quality, search quality, performance, service guarantees, or export behavior. Backstage and Read the Docs pages are rolling; GitBook importer and variant details depend on captures that could not be refreshed; the changelog's search-scope detail also needs a successful current re-open. A direct request failure is not negative evidence, and no failed URL was rebound to another page. The current source map preserves exact URLs, available product/doc versions, commit availability, locators, original access times, and recheck outcomes. Product choice and policy decisions remain open pending an actual bounded proof of concept.
