# Independent research discovery — documentation portal for an engineering group

**Scope.** This is the frozen pre-plan discovery for the S07 brief: an internal documentation portal for 60 engineers, three codebases, multilingual notes and frequent releases. Search must retrieve the relevant released version, support exact-passage citations and help maintainers see contradictions without silently rewriting documentation. This document records independently selected product/mechanism research, application-level implications and uncertainty before the case plan was revealed. Primary-source evidence and the source access ledger are navigable from [sources/index.md](sources/index.md) and [source-map.json](source-map.json).

## Research result in brief

There is no single researched product that by itself satisfies all of release-aware retrieval, multi-repository linkage, multilingual freshness, exact auditable passage citation and contradiction review. The strongest alternatives are three different content/portal models plus two independent search backends:

1. **Antora** is a docs-as-code site generator whose distinguishing fit is aggregating content from more than one repository into a component/version while preserving origin metadata. It is the strongest researched match if each codebase remains an independent owner/repository and the site should assemble release snapshots. Its release ordering and ref policy must be explicit.
2. **Docusaurus 3.10.2** is a static site approach with documented versioned routes and locale builds. It works well when a team wants a conventional website and can manage snapshots in one site tree. Its built-in version cut copies a complete docs tree and sidebar; current and latest have distinct defaults. Its locale workflow stores translated Markdown separately and does not translate content.
3. **Backstage TechDocs** binds Markdown/MkDocs docs to a software-catalog entity and can publish static output from CI to object storage. It can put docs beside their code and owner, but requires a Backstage deployment and catalog setup; the reviewed material does not prove first-class cross-code release search, immutable passage citations or contradiction handling.
4. **DocSearch** supplies a hosted crawler/index and filters with a way to tag every passage record with locale and version and link results to heading anchors. It is a plausible managed search candidate only if indexing internal content in the service is acceptable. Commercial eligibility, cost, data residency and deletion guarantees were not researched.
5. **Typesense 30.1** supplies a self-hostable search API, facets and exact field filters. It can enforce selected release/language dimensions before ranking, but hosting and language-specific relevance on this corpus are unmeasured.

These are conditional options, not a benchmark result. A likely composable starting point is to retain authored Markdown/AsciiDoc and release refs in Git, build a normalized release-aware index from pinned commits, and put a thin portal/search and review workflow over that index. Antora can be the site layer if the repositories should compose into one site; Docusaurus is an alternative if content is consolidated or conventional Markdown site authoring is important; TechDocs becomes more attractive only if Backstage is already a maintained developer portal. For sensitive internal docs, test Typesense first unless policy explicitly approves a hosted DocSearch index. No cost estimate follows.

## Content ownership, release identity and product trade-offs

### Antora: distributed versioned content

Antora's component-version descriptor, antora.yml, declares a component name and version for a root containing a modules tree. Versions may come from descriptor metadata or a playbook mapping from a Git ref. Its distributed component mechanism can collect files with matching component/version keys from several source roots and repositories. This is materially useful for three codebases whose documentation should remain in its own repository but appear in one portal. Antora's resource identity decouples published URL from repository location. It exposes component/version plus origin URL, branch or tag, ref name/type/hash, source path and edit URL in page attributes ([S04](sources/S04-antora-descriptor.md), [S05](sources/S05-antora-distributed-versions.md), [S06](sources/S06-antora-origin-metadata.md)).

Do not equate display version with release identity: display_version is presentation metadata; use the actual version/ref for joins and source links. Latest selection depends on sorting and prerelease markings. In the documented algorithm, named versions sort ahead of semantic versions and in reverse alphabetic order; latest is the first sorted version that is not a prerelease. That can produce a surprising latest if arbitrary labels such as stable, edge or customer release are mixed with SemVer. Use validated semantic release identifiers and mark prereleases, or set a deliberate mapping rather than trusting a label. A component version distributed across repositories must not repeat conflicting optional descriptor keys, and each source must contribute unique resources; duplicate IDs fail the build and duplicated optional configuration is unpredictable ([S04](sources/S04-antora-descriptor.md), [S05](sources/S05-antora-distributed-versions.md)).

Applicability limit: Antora gives an identity and assembly model, not a coordinated product release manifest. If codebases 1, 2 and 3 release independently, a user asking for product release X needs either a compatibility/release manifest mapping X to three repo commits or separate component release selectors. A single version label shared across repositories must not be invented without evidence. Antora origin refhash is SHA-1 for a source ref, and it may be (worktree) locally; it is not a durable exact passage digest. Its docs describe component/version and origin handling, not language-specific translation status or semantic contradiction detection. Validate the chosen content format and exact stable-link behavior before selecting Antora.

### Docusaurus: localized static website and copied version snapshots

Docusaurus 3.10.2 documents a versioning CLI that copies the entire current docs directory, a sidebar configuration and a version entry. The docs/ directory is “current”; by default it is “Next” under /docs/next/, while the configured lastVersion is linked as the default latest route. Those are separate concepts. Options can omit the in-progress current version, select a subset of versions for a deploy, label/badge releases and limit actively built history. The docs warn of build-time and contributor complexity, advise against unnecessary patch-only copies and recommend a small active set (under ten as a rule of thumb); older site builds can instead be archived at immutable deployment URLs ([S01](sources/S01-docusaurus-versioning.md)).

Docusaurus locale config provides per-locale routes and separate locale builds. Translation Markdown is maintained as whole files under a locale/plugin/version folder; no automatic document translation is provided. This suits a team that can own translation review. It means locale presence/freshness is not implied by a translated theme or locale dropdown. Generated heading anchors change when translated heading text changes; the official tutorial recommends explicit heading IDs for stable localized anchors ([S02](sources/S02-docusaurus-i18n-introduction.md), [S03](sources/S03-docusaurus-i18n-tutorial.md)).

Docusaurus is the simpler static-site alternative if a central site repository is acceptable. If each codebase owns a separate docs tree, maintain an index of each source's version/ref or use separate site instances; do not silently merge separate releases into one latest. Search should distinguish current Next from a product release. The site generator alone does not create a cross-repository compatibility manifest, an immutable passage store or a human contradiction work queue.

### Backstage TechDocs: catalog-centered developer portal

TechDocs associates documentation with a Backstage catalog entity. A repository can hold docs/ Markdown, mkdocs.yml navigation and catalog-info.yaml with a backstage.io/techdocs-ref annotation. This gives a useful codebase/owner landing point and allows standalone docs entities for notes not owned by a code component. TechDocs uses MkDocs and can generate static output; its source-tree rule rejects symbolic links resolving outside that tree ([S09](sources/S09-backstage-techdocs-source.md)).

The documented CI model runs techdocs-cli generate, then publishes generated static files to a supported publisher such as S3, GCS or Azure. Generation computes an output etag; publish with skip-if-unchanged skips uploading when the etag equals the prior generated output. A read-only external-builder mode can serve CI-published output ([S10](sources/S10-backstage-techdocs-cicd.md)). This is a clear generated-site export seam, but the etag is neither a release identity nor an exact quote hash. The reviewed guides do not establish release-versioned TechDocs routes or cross-site passage search. Either route versioned outputs by immutable entity/ref or add an index service; verify this with a prototype. Backstage is conditional on owning a suitable instance; installing the entire portal stack solely for three documentation sources may be excess operational scope for this group.

## Search and retrieval behavior

### Record model: hard release and language constraints before relevance

Use an index record per stable passage, with at least:

- stable document ID, codebase/component ID, source repository URL, source path and source format;
- language/locale and source-language relationship;
- product release mapping plus that repository's tag/ref and resolved full commit;
- published site version/URL, explicit heading ID, section path and previous/next passage links;
- exact excerpt bytes and an extraction/snapshot digest, and a whole-file hash to detect drift;
- document status (released/current draft/retired), effective dates and any supersedes link.

A release should be an immutable data tuple, not a text label that the crawler can change. If the three repos are independently released, define the selected version as either three explicit ref pins or a published compatibility manifest that maps the product's release name to repo commits. Store both the human release label and the canonical tuple. Filter to eligible released refs and selected language first; only then rank passages. Do not fall back to current/unreleased or another locale without showing that change. When a user has not specified release context, require an explicit release selector or make a clearly visible “latest stable by each component” choice; never silently imply that three independently latest tags form one compatible product release.

### DocSearch managed crawler

Current DocSearch configuration supports custom record selectors. Heading elements need unique IDs/names, and a result can open the page at that anchor. Metadata tags docsearch:language and docsearch:version are copied onto every extracted record. Version tokens are SemVer or alphanumeric (latest, next), case-insensitive in facet filters; configure those fields as facetable and retrieve them for badges. The documentation distinguishes crawler record schema v3 from frontend v5; do not confuse schema upgrades with UI package upgrades ([S07](sources/S07-docsearch-records-and-facets.md)).

That is useful ready-made passage extraction and version/locale navigation, but metadata values alone do not enforce release correctness: the frontend/index query must apply hard filters and reject stale/unreleased records. Keep the source passage and digest outside the index response so that a record cannot silently transform the quote. Hosted search would expose internal text to a third-party crawler/index; the brief gives no data-handling or procurement constraint. Treat hosted use as a user/security decision until verified, and do not make unsupported cost/retention claims.

### Typesense self-hosted API

Typesense 30.1 requires q and query_by; query_by fields must be string or string-array fields. filter_by supports exact string equality (:=) and token-level partial match (:). For release, locale and codebase identifiers use exact filters, not partial token matching. Arrays can be filtered with conjunctive clauses. Pagination starts at page 1, per_page defaults to 10 and the API docs state a 250-hit maximum; prefix search and numerical query typo tolerance default to true, so short release-like tokens or incomplete identifiers need deliberate settings. Query text must not be relied on as a release pin. Facet strategy defaults to automatic and max_facet_values to 10 ([S08](sources/S08-typesense-search-30.1.md)).

Typesense is an independently operated search service, not a docs platform. It can fit an internal-only deployment and rank normalized passage records with release/locale facets. Its versioned API reference does not establish this team's hosting cost, storage use, relevant multilingual stemming, permission controls or latency; measure a real sample. A compact static build plus local/controlled search index remains an alternative if no search server is justified.

## Exact passage citations, source/code linkage and drift

A visible result should cite a literal passage from the released source snapshot, not a model-generated paraphrase presented as evidence. Store the extracted passage as text with:

- repository + full commit SHA + source path;
- product/repo release IDs and language;
- heading ID and section path;
- byte offsets or a deterministic passage key and SHA-256 under a stated canonicalization rule;
- published route/anchor and a commit-pinned source URL.

Render the exact excerpt, label its codebase, release and language, and link to the pinned source. If the source no longer matches its recorded digest, mark the citation stale and send the user to the captured release snapshot; do not silently re-resolve the same ID to the current branch. Antora's origin metadata supplies source/ref context but only exposes a SHA-1 ref hash. Docusaurus has version-specific routes; locale headings can change generated anchors, so authors should use explicit IDs. DocSearch can open heading anchors. These are useful primitives; none proves that the stored excerpt matches a produced answer unless the portal verifies it.

For code links, keep each documentation page tied to the source repo/ref/commit; link a passage to code via explicit repository path and line/definition anchor or API identifier, and preserve release. Backstage entity/owner metadata can provide routing; Antora can expose repository/ref/path/edit URL. Docusaurus needs a convention (frontmatter or generated source manifest) to map codebase/release to source. Do not infer an API default or code owner from a current path when cited docs came from an older release.

## Contradiction visibility without silent edits

None of the reviewed primary product sources claims automatic semantic contradiction detection. Treat “contradiction” as a review queue, not a document rewrite. A practical system can propose candidate pairs when passages share a topic/API/config key but assert incompatible values, defaults, units or procedures. Each candidate should show both exact passages, their scope (release, locale, codebase, environment, feature flag), dates and source links. A repeated command can be compatible when versions or preconditions differ; differing numbers alone are not enough.

Keep explicit states such as unreviewed candidate, confirmed conflict, not a conflict (scope differs), resolved by source change and accepted difference; require a maintainer decision and record who/when/why and the source revisions. Surface unreviewed candidates to maintainers and allow each implicated code owner to comment. The tool may suggest a resolution, but it must never change or suppress source text automatically. The detection technique (literal structured rules, lexical overlap, an optional model suggestion) must be labeled as candidate generation and validated for missed conflicts/false alarms. Preserve disagreement and uncertainty.

## Migration/export and scope

Keep Git Markdown/AsciiDoc plus release refs as the authoritative exportable form. Add a small normalized manifest/index format independent of search vendor; it lets a different indexer rebuild exact passage records from the same pinned sources. Build products can be static-site output. Docusaurus version folders are source copies and older deployments can be archived as immutable links. Antora collects source from repositories and emits a static site. Backstage's CI flow explicitly generates static files and publishes them to object storage. These make source and rendered output separable, but they do not promise a one-click migration from one product to another. Plan migration as Markdown/AsciiDoc and metadata transformation followed by a fidelity/anchor comparison; keep original source and hashes so output can be rebuilt. Search vendor export/import behavior was not independently researched, so a normalized JSONL or equivalent exchange format should be treated as a proposed adapter contract, not a claimed native export.

## Decisions that are still open

1. Are the three codebases released together, or does a named product release map to an explicit three-repository commit tuple?
2. Should source live in the three codebases, a central docs repo, or both? Who owns cross-code onboarding and shared notes?
3. Which locale is default for unqualified queries? Should missing translations cause no result, visible source-language fallback or a user-controlled cross-locale expansion?
4. What is the default release selection: pinned caller context, explicit selector, or latest stable per component? How many old releases must remain searchable and citable?
5. May internal text be sent to a hosted crawler/index, or is self-hosting required? Procurement/data residency/SSO constraints and budget remain unknown.
6. Who reviews contradiction candidates, what evidence resolves them, and may any group mark an accepted version difference?
7. Which source formats and existing repos actually exist, whether Backstage is already operated, and whether migration/import is needed were not provided and were not inspected.

## Evidence and proposed validations

Primary source notes and immutable IDs are linked in [sources/index.md](sources/index.md). The relevant evolution chain is Docusaurus PR 10875: the CLI previously omitted a locale's version JSON during a version cut, code and a CLI test were added, the PR merged in January 2025, and Docusaurus 3.8.0 release notes later recorded it in May 2025 ([S11](sources/S11-docusaurus-i18n-version-fix.md), [S12](sources/S12-docusaurus-380-release.md)). This is evidence of one fix and its release inclusion, not proof that other regressions are absent.

No product prototype, live service, team data, pricing or runtime test was available or run. Before choosing a product, proposed discriminating checks are: (a) a three-repo release tuple with one newer unreleased ref, one prerelease and one missing tag; confirm default search never crosses the pin; (b) the same term across two releases and two locales, including an untranslated paragraph, confirm label and fallback; (c) exact citation round-trip through heading, line/path and commit with digest mismatch detection after an edit; (d) cut a Docusaurus version with translated docs and assert locale JSON and route inventories, reproducing the PR-10875 class of defect; (e) intentionally conflicting and merely version-divergent statements, test candidate ranking, scope display, reviewer resolution and no text mutation; (f) export/rebuild the normalized record set on a second search backend and compare source IDs, passages and links. These are proposals, not executed checks. Detailed accepted/optional/conditional decisions and comparison with exact plan clauses are reserved for the post-reveal draft.
