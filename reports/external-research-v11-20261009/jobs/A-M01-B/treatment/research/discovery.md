# Discovery — A-M01-B treatment/research · S07 documentation-portal · M01 coherent-batching

- Block/arm/stage: A-M01-B / treatment / research. Case S07. Evidence kind: full-discovery.
- Written from brief alone, BEFORE plan reveal. Plan file not read (see §8).
- Brief (frozen sha256 `11201a68…3c3bd7a`, 1426 bytes): internal documentation portal for a
  60-person engineering group with three codebases, multilingual notes, frequent releases.
  Search must return the relevant released version, cite exact passages, and help maintainers
  see contradictions WITHOUT silently rewriting documentation. Research: existing
  products/mechanisms, code/doc linkage, retrieval conditions, migration/export.
- Obligations: this document discharges O1–O3 (discover, investigate code/defaults,
  issue/fix chains) and proposes O6 validations; O4 (per-P comparison) and the final O5
  coherent deliverable complete in `draft.md` after reveal. Method M01: one investigator,
  per-question maps plus one shared governing-condition map (§5–§6).
- Access window: 2026-10-09T18:26Z–18:35Z. Sources: `source-map.json` (S00–S23, immutable),
  excerpts in `sources/`. Usage/billing unobserved (null) throughout.

## 1. O1 — Independently discovered tools, products, materially different approaches

Selection rule: useful AND likely unfamiliar (beyond "install a wiki + search box"), each
mapped to at least one brief axis: (a) three codebases, (b) multilingual notes,
(c) frequent releases / relevant released version, (d) exact-passage citation,
(e) contradiction visibility without silent rewrite, (f) migration/export.

### 1.1 Versioned docs generators (the versioning decision dominates everything else)

1. **Docusaurus (Meta, React/MDX)** — snapshot versioning: `npm run docusaurus docs:version 2.0`
   freezes `./docs` into `versioned_docs/version-2.0/` + `versions.json` + versioned sidebars.
   Per-version label/path/banner/noIndex; `lastVersion` controls what `/docs` serves;
   `docsVersionDropdown` switcher; docs multi-instance (one instance per codebase).
   i18n via locale subtrees + Crowdin/Git workflows. Search first-class Algolia DocSearch
   with contextual version+language faceting. Best fit when versions need independent
   URLs, banners ("unreleased"/"outdated"), and per-version PRs. Cost: snapshot duplication,
   build time linear in versions, stale-version index pollution unless faceted. [S01,S02,S03]
2. **Antora (AsciiDoc, refs-as-versions)** — opposite model: no in-repo snapshots. Component
   descriptor `antora.yml` (`name` + `version`) at each content root; `version: true` uses the
   git refname; playbook selects `branches`/`tags`/`start_path`; each matching tag (e.g.
   `docs/v*`) becomes a version. Versionless via reserved `master`. Multi-repo aggregation:
   three codebases contribute component versions into one site. Sorting, display_version,
   prerelease markers, latest-segment URLs. Best fit for 3 repos × frequent tags with
   AsciiDoc content. Cost: AsciiDoc-first (Markdown via converter, second-class), playbook/ref
   discipline, smaller theme/plugin ecosystem than Docusaurus. [S10]
3. **MkDocs + Material + mike** — versions as BUILT OUTPUT on `gh-pages`, not source:
   `mike deploy --push --update-aliases 2.0 latest`, `mike set-default --push latest`.
   Plugin defaults: `alias_type: symlink`, `deploy_prefix: ''`, `canonical_version: null`,
   `version_selector: true`. Source tree stays single; rollback is a gh-pages revert.
   Best fit for small-teams wanting trivial version ops. Cost: cannot PR against a released
   source tree; symlink aliases break on some static hosts (use redirect/copy); search across
   versions needs extra design. [S12]
4. **Astro Starlight** — modern content-collections docs theme: strong i18n routing
   (locale-prefixed paths, per-locale fallback), built-in Pagefind search, Expressive Code
   blocks. NO first-class versioned-docs workflow comparable to Docusaurus (versions modeled
   as sections/collections by hand). Best fit if multilingual authoring UX outranks formal
   versioning, or versions are few. Cost: hand-rolled versioning = hand-rolled version bugs.
   Observed via secondary comparison + skill docs, not fetched primary — treat as
   lower-confidence until verified. [S19]
5. **Sphinx (Python, reST/MyST)** — gettext-based i18n (`sphinx-intl`), mature
   `versionadded`/`deprecated` directives, autodoc for API linkage, Read the Docs hosting
   integration. Best fit if a codebase is Python or reST already. Cost: theme/search feel
   dated; versioning is hosting-layer (RTD flyout), not content-layer branching.
6. **Read the Docs (hosting + flyout)** — `latest` (main) vs `stable` (highest non-prerelease
   tag/branch) vs per-tag/branch builds, flyout switcher, per-version builds + search.
   Best fit as zero-ops hosting for Sphinx/MkDocs. Cost: version semantics owned by host;
   offline/air-gapped internal use needs self-hosted RTD or another host. [S21]
7. **Mintlify / Fern / ReadMe (hosted API-docs platforms)** — git-synced Markdown+OpenAPI,
   branch previews, versioned API reference, playground, `llms.txt` agent surface. Fern
   generates SDKs+docs from one spec so reference matches shipped client; Mintlify imports
   Markdown+OpenAPI. Best fit if the portal's core is API reference over three services.
   Cost: hosted/paid, content leaves repo, versioning/export semantics per-vendor; OpenAPI
   as single source of truth mitigates lock-in (swap providers by re-pointing spec). [S20]
8. **VitePress / mdBook / Docus (Nuxt)** — lightweight single-version site generators.
   Useful as per-codebase satellites feeding a federated index, not as the versioned hub.

Materially different versioning philosophies (pick ONE as hub): Docusaurus snapshots
(reviewable per-version source) vs Antora refs (zero-duplication multi-repo) vs mike
builds-only (trivial ops, no source history) vs hosted (zero ops, vendor-owned semantics).

### 1.2 Retrieval: hosted crawl vs self-hosted engine vs static index

9. **Algolia DocSearch (Docusaurus official)** — weekly crawler → Algolia index → front-end
   API queries. Free for eligible public dev docs; firewalled/internal sites must run own
   crawler. `contextualSearch: true` DEFAULT facets by version+language (`docusaurus_tag`,
   `language`, `lang`, `version`, `type`); recommended crawler config mandatory for support.
   Best fit: public docs wanting best relevance with zero ops. Fails closed (zero results)
   when faceting attributes missing — the O3 chain in §4. [S02,S13]
10. **Typesense DocSearch (community)** — same crawler shape, self-hosted engine. Best fit:
    internal/firewalled portal (data stays in-house), typo-tolerant API search with
    `filter_by: version:=v2.1` pinning. Governing defaults in §3. [S09]
11. **Pagefind (static, build-time index)** — CLI indexes built HTML (`data-pagefind-body`,
    `data-pagefind-filter/meta`, weights), ships compressed index chunks, client-side search
    with tunable ranking (`termFrequency` 1.0, `termSimilarity` 1.0, `pageLength` 0.75,
    `excerptLength` 30, `exactDiacritics` false). Zero server, works offline/air-gapped.
    CJK query segmentation via `Intl.Segmenter`; IME composition fix in component UI.
    Best fit: version-per-directory static deploys where each version carries its own index
    (version scoping = deploy scoping). Cost: no server-side typo engine like Typesense/
    Meilisearch; cross-version search needs explicit multi-index UI. [S04,S05,S06,S16,S17]
12. **Meilisearch (self-hosted engine)** — bucket-sort ranking
    (words→typo→proximity→attributeRank→sort→wordPosition→exactness), `words` forcibly
    first, typo 5/9 thresholds. Best fit: internal portal wanting hosted-engine relevance
    with full data control and per-index typo/ranking tuning. Cost: another service to run,
    index-build pipeline per version+locale. [S07,S08]
13. **Typesense (self-hosted engine)** — Damerau–Levenshtein typos (`num_typos` 2,
    4/7 thresholds — one char more permissive than Meilisearch), `max_candidates` 4,
    `typo/drop_tokens_threshold` 1, facet strategies. Best fit: same as Meilisearch with
    finer per-field typo control and prefix/infix behavior for identifier-heavy code docs.
    Silent-recall trap: short queries truncate to top-4 variations. [S09,S18]
14. **Lunr/Orama/FlexSearch (in-browser indexes)** — lighter than Pagefind for tiny sites;
    no reason to prefer over Pagefind at 60-person/3-codebase scale except bundle size.

Decision axis: WHO owns the index lifecycle. Crawler (Algolia) = simplest, needs public
URLs + weekly freshness. Engine (Meilisearch/Typesense) = freshest + most tunable, needs a
service + per-version indexing pipeline. Static (Pagefind) = zero-service + per-version
isolation by construction, weakest typo/federation story.

### 1.3 Contradiction visibility WITHOUT silent rewrite (report-only toolchain)

15. **Vale (prose linter)** — `.vale.ini` + `styles/` + `Packages` (`vale sync`) + per-glob
    `BasedOnStyles`; `MinAlertLevel` suggestion|warning|error; `WordTemplate` for non-`\b`
    languages. REPORTS violations with exit codes/annotations; NEVER mutates. Custom styles
    encode house rules ("must say v2 API requires header X", "deprecated terms per release").
    Contradiction detection = Vale rules + diff review, not AI rewrite. [S11]
16. **markdownlint + lychee (structure + links)** — markdownlint enforces heading/list/code
    consistency (disable MD013 line-length, MD033 HTML-for-callouts per observed configs);
    lychee (`lychee.toml`: accept codes, cache-max-age, excludes for localhost/placeholders/
    private IPs) scans built HTML for broken internal anchors and external links across
    versioned directories. Report-only in CI; autofix explicitly rejected in observed
    configs. [S22]
17. **textlint (JS prose engine)** — alternative to Vale with language-specific rules;
    useful if JS toolchain preferred or CJK rules needed.
18. **Docs-as-code diff review** — per-version PRs (Docusaurus/Antora) + CODEOWNERS per
    codebase + required checks (Vale/lychee/build) make contradictions visible as review
    comments, never silent. This is a PROCESS mechanism, not a product, but it is the only
    one that satisfies "help maintainers see contradictions" for semantic (not textual)
    conflicts.

Explicitly rejected: any "AI auto-fix docs" loop. The brief forbids silent rewriting;
autofix linters and RAG rewriters violate it. All tooling above is report-only by
configuration (CI fails, human edits).

### 1.4 Multilingual notes

19. **Docusaurus i18n** — `i18n: {defaultLocale: 'en', locales: ['en','fr','fa'],
    localeConfigs: {fa: {direction: 'rtl'}}}`; JSON translation catalogs per locale;
    Crowdin integration or git-based translation PRs; untranslated pages fall back or 404
    by config. Version × locale matrix multiplies build outputs (V versions × L locales).
    [S03]
20. **Starlight i18n routing** — locale-prefixed content collections, translated chrome,
    `en` fallback for untranslated pages. Simpler than Docusaurus for notes-style content.
21. **Sphinx gettext** — PO files + `sphinx-intl`; mature translator workflow, dated UX.
22. **Crowdin / Weblate / Lokalise** — translation management; Crowdin has first-class
    Docusaurus docs. Machine-translation seeding + human review fits "notes" (informal,
    high-churn) better than formal doc translation.
23. **Search-side multilingual** — Pagefind diacritics normalization + CJK segmentation;
    Meilisearch warns typo tolerance causes false positives on massive/multilingual data;
    Typesense per-field typo lengths. Tokenizer choice IS the multilingual search design.

### 1.5 Code/doc linkage (three codebases → docs that track releases)

24. **API extractors: TypeDoc / rustdoc / JSDoc / Doxygen / Sphinx autodoc / godoc** —
    generate reference from code comments per release tag; docs site embeds or links
    version-pinned output. Each codebase keeps its idiomatic extractor; portal links by
    (codebase, version, symbol).
25. **OpenAPI reference: Redoc / Scalar / Stoplight / Fern-generated** — spec-per-release
    rendered as versioned API reference; Docusaurus/Antora embed via plugin or iframe;
    Fern guarantees SDK–docs match from one spec. OpenAPI spec is the migration-proof
    artifact (every vendor imports it). [S20]
26. **Sourcegraph / Universal-ctags / LSIF-SCIP** — precise code navigation behind doc
    links ("defined in repo A @ v2.1.0, file:line"). Full Sourcegraph is heavyweight for
    60 people; version-pinned GitHub/GitLab permalinks + generated symbol indexes cover
    90% at 10% cost.
27. **Version-pinned snippets + snippet tests** — docs import code samples from tagged
    sources (Docusaurus code-from-file, Antora examples, Sphinx literalinclude) with CI
    that rebuilds samples per release. Stale-snippet detection is a special case of
    contradiction visibility.

### 1.6 Migration/export (no lock-in)

28. **Author in portable Markdown/MDX (or AsciiDoc if Antora)** — MDX = Markdown + JSX
    components; migration = `docslit import` style converters read `mint.json`/nav and
    rewrite components (observed Mintlify→DocsLit path). Keep components shallow and
    documented for export. AsciiDoc↔Markdown conversion is lossy (admonitions, includes);
    choosing Antora is choosing AsciiDoc.
29. **`llms.txt` / agent surfaces** — Mintlify/Fern-style generated index files for RAG
    agents; cheap to add to any static generator (a build step emitting page list +
    excerpts). Serves "cite exact passages" for both humans and agents.
30. **Static export + PDF/ePub** — every shortlisted generator emits static HTML (host
    anywhere); PDF via print CSS / `docusaurus-pdf` / Asciidoctor PDF; ePub via Sphinx/
    Asciidoctor. Version × format matrix must be bounded (e.g. PDF only for `stable`).
31. **OpenAPI + search-index dumps as contracts** — versioned `openapi.yaml` per release
    and a JSON dump of the search index per version are the two machine-readable exports
    that make future migrations testable (diff old vs new index for recall regressions).

## 2. O2 — Consequential code behavior, defaults, units, limits, applicability

Deep dives on the mechanisms whose defaults decide whether the brief's requirements hold.
Each entry: behavior → governing defaults (name/type/default) → exceptions/limits →
applicability to S07.

### 2.1 Docusaurus versioning + i18n + contextual search (hub candidate A)

- Versioning CLI snapshots `./docs` → `versioned_docs/version-<n>/`; registry
  `versions.json`; sidebars snapshotted. `includeCurrentVersion: boolean = true`
  (set false when `./docs` is unreleased WIP). `lastVersion: string = versions.json[0]`
  (the `/docs` route target). `onlyIncludeVersions: string[] = all` (dev tip: 2–3 for
  build time). Per-version: `label`, `path`, `banner: 'unreleased'|...`, `badge`,
  `noIndex`, `className`. Navbar `docsVersionDropdown`. Multi-instance: repeat per
  codebase. LIMIT: build time and index size scale with V×L; contributors must know
  which snapshot to edit (backport discipline). [S01]
- i18n: `defaultLocale`, `locales[]`, `localeConfigs[locale].{htmlLang, direction}`.
  Translation JSON per locale; Crowdin or git workflow. Untranslated content: fallback
  vs 404 by setup. LIMIT: V versions × L locales build outputs; translation lag means
  non-default locales show older releases unless process pins translator SLAs. [S03]
- Search: `contextualSearch: boolean = true`; merges contextual facet filters with
  `searchParameters.facetFilters`. Required index attributes for faceting:
  `docusaurus_tag, language, lang, version, type`. Disabling (`false`) drops facet queries
  (docs discourage). Crawler default cadence weekly. LIMIT: public-or-self-hosted-crawler;
  internal portal behind auth MUST run own crawler or switch engines. [S02]

### 2.2 Pagefind static search (hub candidate B / satellite default)

- Indexing: root `<body>`; `data-pagefind-body` narrows; ANY body tag ⇒ untagged pages
  EXCLUDED (silent-drop trap). `data-pagefind-ignore[=index|all]`: `index` (default)
  skips text but keeps filters/meta/title; `all` skips everything. `data-pagefind-index-attrs`
  inlines attributes. `<nav>/<footer>/<script>/<form>` auto-skipped. CLI `glob`,
  `exclude-selectors`, `root-selector` for non-template control. [S04]
- Ranking (unitless floats): `termFrequency: 0–1 = 1.0` (lower boosts long docs),
  `termSimilarity = 1.0` (`party`>`partition` for `part`; 0 equalizes),
  `pageLength: 0–1 = 0.75` (1 favors short pages), `diacriticSimilarity` (exact preferred
  under normalization). Passage API via `pagefind.options()` or `configureInstance`. [S05]
- Search-config: `baseUrl = "/"`, `excerptLength: int = 30` (citation window size),
  `highlightParam` (optional), `exactDiacritics: bool = false` (cafe↔café match; true =
  strict). 1.5.0 component UI replaces Default UI. CJK: `Intl.Segmenter` query chopping;
  IME composition keystrokes ignored in component UI (fix #1284). [S05,S06,S16,S17]
- LIMITS: no server typo engine; ranking client-side over shipped chunks (index size vs
  quality); cross-version search = multi-index UI work; filters are author-designed
  (`data-pagefind-filter="version:..."`), not automatic.

### 2.3 Meilisearch (engine candidate A)

- Ranking: 7 rules `[words, typo, proximity, attributeRank, sort, wordPosition, exactness]`,
  bucket-sort (earlier rules partition, later only tiebreak). `words` FORCIBLY first even if
  removed/demoted, evaluated right-to-left (query word order changes ranking).
  `attribute` legacy = attributeRank+wordPosition; combining old+new = API ERROR; recommend
  split so `sort`/custom sit between. `sort` high = exhaustive-but-irrelevant, low =
  relevant-but-unsorted. `proximityPrecision` lowerable for index speed at relevance cost.
  Units: rule ORDER (ordinal), not weights. [S07]
- Typo: `enabled = true`; `minWordSizeForTypos.oneTypo: int-chars = 5` (5–8 → 1 typo),
  `.twoTypos = 9` (9+ → 2); <5 → 0. Opt-outs: `disableOnAttributes/Words`, `disableOnNumbers`;
  first-letter typo counts double. Vendor warns: massive/multilingual data ⇒ false positives.
  APPLICABILITY: disable typos on `version`/`locale` attributes and numeric/identifier fields;
  place version-recency `sort` deliberately (too high kills relevance). [S08]

### 2.4 Typesense (engine candidate B)

- Typos (Damerau–Levenshtein): `num_typos: 0|1|2 = 2` (per-field supported),
  `min_len_1typo: int = 4`, `min_len_2typo: int = 7` (one char more permissive than
  Meilisearch 5/9). `typo_tokens_threshold = 1` (escalate typos until N hits; 0 disables),
  `drop_tokens_threshold = 1` (drop weakest tokens until N hits; 0 disables),
  `drop_tokens_mode = right_to_left`. `enable_typos_for_{numerical,alpha_numerical}_tokens = true`
  (set false for versions/part numbers). `max_candidates = 4` (top-4 prefix/typo variants;
  10000 if `exhaustive_search = true`, default false) — short identifier queries silently
  truncate. `prefix = true`, `infix = off`. [S09]
- Facets/filters: `filter_by` (`version:=v2.1`), `facet_strategy = automatic`
  (exhaustive↔top_values heuristic), `max_facet_values = 10`, `facet_query_num_typos = 2`,
  sampling off (`facet_sample_percent = 100`). Synonyms: `synonym_prefix = false`,
  `synonym_num_typos = 0`, `demote_synonym_match = false` (v27). Pagination `per_page = 10`.
  APPLICABILITY: version+locale MUST be facet/filter fields; typo-on-version disabled;
  `default_sorting_field` (popularity/recency) defines "top" for truncated candidate sets.

### 2.5 Antora (hub candidate C)

- `antora.yml`: `name` (required), `version` (string | `true`=refname | `master`=versionless).
  Playbook `content.sources[]`: `url, branches[], tags[], start_path`. Sources filtered by
  BRANCH/TAG name, version determined by KEY (decoupled). Each matching tag with distinct
  `version:` becomes a version; unlisted tags vanish next build. Multi-repo aggregation by
  component name. Display: `display_version`, prerelease, `latest` segment URLs, version
  facets, explorer drawer, per-version start page/nav/attributes. LIMIT: AsciiDoc-first;
  ref hygiene (stale branches/tags = stale versions); no per-version source PRs in one
  repo (versions live on refs). [S10]

### 2.6 MkDocs+mike (hub candidate D)

- `mike deploy <ver> [alias]`, `--push --update-aliases`, `mike alias`, `mike set-default`,
  `mike serve/list/delete`. Output branch `gh-pages` (default). Plugin:
  `alias_type: symlink|redirect|copy = symlink`, `redirect_template = null`,
  `deploy_prefix = ''`, `canonical_version = null`, `version_selector = true`,
  `css_dir = css`, `javascript_dir = js`. Material renders dropdown; `site_url` rewritten
  per version. LIMIT: no versioned SOURCE (can't PR v2.0); symlinks fail on some hosts;
  search/version interplay manual. [S12]

### 2.7 Vale + markdownlint + lychee (contradiction/link net)

- Vale `.vale.ini`: run-wide keys + `[formats]` + per-glob sections. Core:
  `StylesPath: string` (must exist), `Packages: string[]` (`vale sync` installs),
  `Vocab: string[]` (must exist in config/vocabularies), `MinAlertLevel: enum = suggestion`
  (CLI overrides), `IgnoredScopes/SkippedScopes/IgnoredClasses: string[]`,
  `WordTemplate: string` (non-`\b` languages). `BasedOnStyles` per glob; misplaced core key
  = ERROR, unknown key = WARNING. Packages: Google/Microsoft/proselint/alex/write-good/
  Readability/Elastic. NEVER mutates — report-only by design. [S11]
- markdownlint: heading/list/fence consistency; observed: disable MD013/MD033 for docs.
  lychee: `lychee.toml` (accept codes, cache-max-age keyed in CI, excludes for
  localhost/example/placeholders/private IPs); scans built HTML across versioned dirs;
  PR-blocking + scheduled full-crawl. Report-only; autofix rejected. [S22]
- LIMIT: textual/style contradictions only; SEMANTIC conflicts (v2 says X, v3 says ¬X)
  need human review + per-version diffs + CODEOWNERS, not linters.

## 3. O3 — Issue / fix / regression / release chains

### Chain A (primary): Docusaurus contextual-search faceting failure → fix → current docs
- Symptom (dynamoose/dynamoose#1486): site search returns ZERO results with default config;
  works when `contextualSearch: false`. Root cause: Algolia index "Attributes for faceting"
  contained only `lang,type`; missing `docusaurus_tag,language` (and per current docs also
  `lang,version,type`). Fix: add missing attributes in Algolia dashboard (user-side), i.e.
  the INDEX schema, not site code. [S14]
- Evolution: Docusaurus PR #744 (v1 era) hardcoded `version:VERSION→version:latest`
  (all versions searched latest — "unnatural" when reading 1.05 while latest is 1.2).
  v2+ introduced contextual search (default true): facet on current version+language
  automatically. Current troubleshooting docs (v3.3.2–v3.6.3 search.mdx + v3.10.2 search):
  require faceting fields `docusaurus_tag,language,lang,version,type`; fix = recommended
  crawler config → delete index → recrawl → verify fields → results with contextual search
  on. [S15,S13,S02]
- Lesson for S07: "return the relevant released version" FAILS SILENTLY (zero or
  wrong-version results) when facet/filter schema drifts. Mitigations: pin recommended
  crawler config in repo, CI check that index faceting attributes exist, e2e search test
  per (version, locale) asserting top hit's version tag, and an explicit fallback UX
  ("no results in v2.1 — search all versions?") instead of silent emptiness. Same failure
  shape recurs in Typesense (`filter_by` on non-facet field), Meilisearch (filterable
  attributes), Pagefind (missing `data-pagefind-filter`) — the chain generalizes.

### Chain B (primary): Pagefind CJK + IME multilingual fixes
- Index side already segmented CJK, but QUERY side required manual delimiting; fix: use
  browser `Intl.Segmenter` to chop CJK queries (Chinese/Japanese/Korean, non-whitespace
  delimited) — recorded in CHANGELOG "Multilingual Improvements". [S16]
- Component-UI IME bug (#1284, commit 50641b0): typing `toukyou` routes through IME
  (`とうきょう` → candidates → commit `東京`); component UI acted on mid-composition
  keystrokes. Fix: ignore keystrokes belonging to an IME composition. [S17]
- Lesson: multilingual-notes search fails in ways monolingual tests never catch (segmentation
  + input-method + diacritics). Validation must include CJK queries, IME flows, and
  diacritics pairs (cafe/café) per §2.2 `exactDiacritics` semantics.

### Chain C (supporting): ranking/typo evolution traps
- Meilisearch `attribute` → `attributeRank`+`wordPosition` split: legacy `attribute` equals
  both together; configuring old+new errors; recommended split lets `sort`/custom rules sit
  between. A version-recency `sort` placed without understanding bucket-sort + forced-`words`
  either destroys relevance or is ignored. [S07]
- Typesense v27: synonym-on-prefix/typo support with SAFE defaults (`synonym_prefix=false`,
  `synonym_num_typos=0`); enabling without demotion (`demote_synonym_match`) can promote
  synonym matches above exact version-token matches. [S18,S09]
- Absent/inapplicable: no version-specific regression found for Antora ref-mapping or mike
  alias handling in the access window; stated as not observed, not as safe.

## 4. Shared governing-condition map (M01 — one map for all questions)

| # | Condition | Values / type | Default that bites | Failure mode if ignored | Brief requirement it governs |
|---|-----------|---------------|--------------------|-------------------------|------------------------------|
| C1 | doc version | string tag (v2.1, latest, current, next) | Docusaurus `/docs`→`lastVersion`; RTD latest/stable; mike default alias | wrong-version answer; PR #744 shape | relevant released version |
| C2 | locale | BCP-47 (en, fr, fa/rtl, CJK) | en fallback or 404; `exactDiacritics=false` | untranslated or mis-segmented results | multilingual notes |
| C3 | release status | current/next/stable/unreleased | `includeCurrentVersion=true` exposes WIP | users land on unreleased docs | frequent releases |
| C4 | codebase identity | 3 instances/components | single-index mixing | cross-codebase pollution | three codebases |
| C5 | index scope | public crawl vs self-host vs static | weekly crawl; gh-pages only; body-tag flip | stale/missing pages; silent drops | search freshness |
| C6 | facet/filter schema | version,language,lang,type,tags | missing attrs ⇒ zero results | Chain A silent failure | relevant version + citation |
| C7 | typo/tokenizer | thresholds (5/9 vs 4/7), candidates=4 | typos on versions; CJK unsegmented | false hits / missed hits | search quality |
| C8 | excerpt/citation | `excerptLength=30`, highlights | too-short / unpinned passages | uncitable answers | exact passages |
| C9 | prose/link health | Vale level; lychee cache/codes | suggestion-noise or link rot | contradictions invisible | see contradictions |
| C10 | rewrite posture | report-only (mandatory) | autofix/RAG rewrite | SILENT rewrite (forbidden) | no silent rewrite |
| C11 | formats | md/mdx/adoc/rst + openapi.yaml | JSX/Adoc lock-in | unmigratable content | migration/export |
| C12 | visibility | public vs authed/firewalled | public-crawler assumption | crawler can't reach; Algolia inapplicable | internal portal |

## 5. Per-question maps (M01 — each question keeps its own + inherits §4)

- Q-code/doc linkage: per (codebase, version, symbol) → extractor output (TypeDoc/rustdoc/
  Doxygen/autodoc) + OpenAPI spec tag + permalink. Conditions: C1,C3,C4,C11. Rule: every doc
  code-link carries (repo, tag, path, symbol); CI rebuilds samples per release; stale = reported.
- Q-retrieval conditions: per (version, locale, codebase) → engine scope + facet/filter +
  typo/tokenizer + ranking placement + excerpt window. Conditions: C1,C2,C4–C8. Rule: default
  query pins (current version, current locale, current codebase) with explicit escape hatches.
- Q-contradiction visibility: per (version-pair, locale) → Vale/lychee/markdownlint reports +
  human diff review + CODEOWNERS. Conditions: C9,C10. Rule: report-only; no autofix; semantic
  conflicts surface as review tasks, never auto-resolved.
- Q-migration/export: per (version, format) → static HTML + openapi.yaml + index dump +
  llms.txt (+PDF for stable only). Conditions: C11,C12. Rule: shallow components, versioned
  machine-readable contracts, diffable exports.

## 6. Uncertainty (pre-reveal, honest)

- U1: Public vs firewalled hosting unknown — decides crawler (Algolia) vs engine/static.
  Brief says "internal" ⇒ lean self-host/static, but unconfirmed.
- U2: Source languages of the three codebases unknown — decides extractors (TypeDoc vs
  rustdoc vs Doxygen vs autodoc) and identifier-aware typo settings.
- U3: Locale set unknown (European diacritics vs RTL vs CJK?) — decides tokenizer/IME test
  matrix and translation workflow weight.
- U4: Release cadence ("frequent" = daily? weekly?) — decides snapshot (Docusaurus) vs
  ref (Antora) vs build-only (mike) economics and crawler freshness needs.
- U5: Starlight/Mintlify/Fern/RTD details are secondary-snippet level (not fetched primaries);
  treat recommendations involving them as provisional pending draft-stage verification.
- U6: Contradiction scope: textual (lintable) vs semantic (review-only) mix unknown; the
  plan may promise more automation than evidence supports — flag in O4 if so.

## 7. O6 — Validations: executed vs proposed (pre-reveal)

Executed (this investigation, no sandbox claimed):
- E1: Fetched 10 primary doc pages + 2 issue/changelog pages via harness web_fetch (200s
  recorded in source-map.json); grep-verified quoted defaults against fetched bytes.
- E2: Verified brief identity against freeze.json (path + sha256 + byte count match).
- E3: Verified plan-file EXISTENCE via directory listing WITHOUT reading contents
  (`plan-root-only.md` present, 331 bytes, unread) — proves reveal control intact.
- E4: No runtime witnesses run (no qualified sandbox offered; no services started; no
  installs). All product-behavior claims are doc-observed, not executed.

Proposed (discriminating, for draft/build; each names the decision it discriminates):
- P-V1: version-facet e2e — query identical term in vN and vN−1, assert disjoint top-hit
  version tags. Discriminates: faceted vs leaking retrieval. (C1,C6)
- P-V2: crawler/auth probe — attempt hosted-crawler fetch of an authed staging URL.
  Discriminates: public-crawler viable vs must self-host. (C5,C12)
- P-L1: locale matrix — same query in each locale + CJK/IME/diacritics cases; assert
  segmentation, fallback, and `exactDiacritics` behavior. Discriminates: tokenizer adequate
  vs needs retuning. (C2,C7)
- P-T1: typo-threshold A/B — identifier queries (`v2.1.0`, `getUserById`) at 5/9 vs 4/7 vs
  typos-off-on-version-field. Discriminates: Meilisearch vs Typesense vs pinned-field config. (C7)
- P-R1: ranking placement — version-recency `sort` high vs low vs between attributeRank and
  wordPosition; measure relevance vs recency trade-off on multi-word queries.
  Discriminates: sort placement + words-right-to-left impact. (C8)
- P-C1: citation audit — sample 20 answers, verify excerpt→source passage identity + version
  pin. Discriminates: citable vs paraphrased retrieval. (C8)
- P-D1: contradiction drill — inject 3 known conflicts (cross-version, cross-locale, stale
  snippet); verify Vale/lychee/diff surface all three with zero auto-edits (git status clean
  except reports). Discriminates: report-only net adequate vs gappy. (C9,C10)
- P-M1: export round-trip — build static+PDF+index-dump+llms.txt for two versions; diff
  index dumps for recall regressions; re-import Markdown into a second generator.
  Discriminates: portable vs locked-in authoring. (C11)

## 8. Method compliance notes

- M01 coherent-batching: single investigator, shared §4 map + per-question §5 maps, full
  scope (generators, retrieval, prose/link, i18n, linkage, export) in one pass.
- No nested agents, no repo/canon edits, no installs, no private provider internals.
- Plan discipline: `ls` confirmed `/cases/S07/plan-root-only.md` exists; contents NOT read.
  Next step: run the sanctioned `reveal-plan.py` against this stage directory to freeze this
  discovery and reveal `revealed-plan.md`; only then write `draft.md`. This file will not be
  rewritten after reveal.
