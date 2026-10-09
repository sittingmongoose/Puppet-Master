# S07 documentation-portal — research-q1 discovery (architecture / data / storage / transport)

Scope: control parallel investigator q1. Focus: architecture, data, storage,
transport and governing implementation/evolution conditions for an internal
documentation portal serving a 60-person engineering group, three codebases,
multilingual notes, frequent releases, version-correct search with exact-passage
citations, and maintainer-visible contradiction reporting without silent rewrites.
Product workflow/options and validation design are q2's complementary half;
cross-topic dependencies are preserved here, not decided here.

Brief obligations addressed: O1 (unfamiliar tools/approaches), O2 (primary
source/code behavior, defaults, limits, applicability), O3 (issue/fix/release
or evolution chain), O5 (alternatives/conditions/uncertainty retained),
O6 (validations; executed vs proposed separated). O4 (per-P comparison) is
deferred to draft.md after plan reveal. This file was written BEFORE plan
reveal and is frozen as-is afterwards.

All source IDs (S01..S07) are immutable and defined in source-map.json.
Access timestamps are UTC 2026-10-09. Full-page bodies for the large doc
pages were observed in truncated form via fetch; observed operations and
locators are recorded per source. Usage/billing: unobserved (null).

## 1. Versioned-docs storage architectures (O1, O2)

Three materially different released approaches were investigated from primary docs:

### 1a. Docusaurus snapshot versioning (S01)

- Mechanism: `docusaurus docs:version <name>` freezes the current `docs/`
  tree by copying its FULL contents into `versioned_docs/version-<name>/`
  plus a versioned sidebar JSON. A `versions.json` registry lists versions.
  Observed on Docusaurus v3.10.2 versioning page: "Copy the full `docs/`
  folder contents into a new `versioned_docs/version-[versionName]/` folder."
- Defaults/governing conditions: the working `docs/` directory is ALWAYS the
  unreleased ("current"/next) version; released versions are immutable
  snapshots. Maintainers explicitly warn versioning "can become difficult
  for contributors", increases build time and codebase complexity, and is
  "best suited for websites with high-traffic and rapid changes to
  documentation between versions". If docs rarely change, do not version.
- Limits: every version multiplies build input roughly linearly; editing an
  old released version means editing its snapshot directory. Storage is plain
  files in the site repo (git), so three codebases' docs either live in one
  docs repo (decoupled from code) or require a sync/copy pipeline per release.
- Applicability to S07: fits "search returns the relevant released version"
  naturally (one static build contains every version; version picker routes),
  but frequent releases + three codebases make snapshot sprawl the dominant
  cost. Mitigations observed in the wild (S07-adjacent snippets, not primary):
  building versions from git tags at CI time instead of committing
  `versioned_docs/`.
- Code/doc linkage: Docusaurus has no built-in code-symbol linkage; linkage is
  by convention (markdown links, versioned URLs). Exact-passage citation is a
  search-UI concern (see section 2), not a versioning concern.

### 1b. Antora git-ref component versioning (S02)

- Mechanism: Antora treats each documentation version as a git ref. A playbook
  (`antora-playbook.yml`) declares content sources (repos + branches/tags);
  per matched ref Antora reads that ref's own `antora.yml` component descriptor,
  whose `version` key determines the component version. There is no separate
  versioning config and no committed snapshot directory: "just this file
  differing ref to ref" (observed via S02 versioning-methods page and
  corroborating content-source docs).
- Defaults/governing conditions: version identity comes from `antora.yml`,
  not from branch/tag names; the playbook's branches/tags patterns select
  which refs become versions. Multi-repo is first-class: one playbook can
  aggregate three codebase repos as three components, each with its own
  version line — directly matching S07's three-codebase shape. AsciiDoc is
  the native format (not Markdown), which is a migration/adoption condition.
- Limits: build fetches/clones every content source ref, so build time and
  network dependence grow with version count; version sorting rules
  (`how-component-versions-are-sorted`) govern the "latest" resolution and
  prerelease handling and must be configured deliberately. AsciiDoc-only
  authoring excludes Markdown-native contributors unless converted.
- Applicability to S07: the strongest structural fit for "three codebases,
  frequent releases": docs can live alongside code (same repo, tagged with
  releases) and the portal aggregates at build time. Version-correct search
  then depends on the search layer carrying a version facet (section 2).
- Unfamiliarity note (O1): Antora is materially different from both
  snapshot versioning (1a) and database-backed wikis; it was selected
  precisely because the thin-plan space is dominated by single-repo
  Markdown site generators.

### 1c. Database-backed wiki vs git-backed site (architectural alternative, O1/O5)

- Products in this class (noticed, not deeply investigated; q2 may cover
  workflow): Wiki.js (git-backed hybrid: Postgres + optional git sync),
  BookStack (PHP/MySQL, books/chapters/pages), Outline (Postgres + Redis),
  Confluence (proprietary). Their storage condition is inverted vs 1a/1b:
  content lives in a database, history is row revisions, and "released
  version" must be modeled explicitly (snapshots/exports) rather than
  falling out of git tags.
- Governing condition: any wiki choice forces a custom answer to
  version-correct search (section 2) and to code/release linkage (docs are
  not in the code repos), plus a backup/migration story (SQL dumps vs git
  clone). Retained as an alternative with a clear cost; not recommended for
  the version-correctness requirement without a snapshot/export design.

## 2. Retrieval: version-correct search with exact-passage citation (O1, O2)

### 2a. Pagefind: build-time static index, client-side search (S03)

- Mechanism: Pagefind runs as a POST-BUILD step over generated HTML
  (`pagefind --site dist`), emitting a static index (`dist/pagefind/`)
  deployed with the site. The browser downloads index shards and searches
  client-side; there is no search server, no API key, no runtime transport
  beyond static file serving.
- Indexing controls (observed primary, S03): default scope is `<body>`;
  `data-pagefind-body` narrows indexed regions (pages without it are dropped
  once any page uses it); `data-pagefind-ignore` (values `index`|`all`)
  excludes chrome; `data-pagefind-index-attrs` inlines element attributes;
  built-in skip of `<nav>`, `<footer>`, `<script>`, `<form>`.
- Filtering for version-correctness (observed primary, S03): pages declare
  filter facets via `data-pagefind-filter` in three forms — element text
  capture, attribute capture (`filter[attr]`), and inline literal
  (`filter:value`, must be last in a comma list). A portal can emit
  `version:<release>`, `codebase:<name>`, `locale:<lang>` filters from the
  site template and constrain search to the reader's released version.
  Reserved keys `any/all/none/not` cannot be filter names.
- Citation support: Pagefind returns per-page matches with excerpts; exact
  passage citation requires the UI to render match locations (word positions
  are in the index) and to deep-link the page/anchor. The index is per-build,
  so every released version's passages are citable as long as old version
  pages remain deployed.
- Limits: index size and first-search download grow with corpus × versions;
  no server-side ranking customization, no access control (static files are
  public to anyone who can fetch them — an internal-portal condition: gate
  at the hosting/auth proxy layer, not in search); multilingual quality
  depends on Pagefind's tokenization per language (CJK especially — verify,
  see O6); contradictions across versions are visible only if the UI
  explicitly searches across versions (a second, unfiltered query).
- Transport/storage fit: zero search infrastructure; the index IS static
  storage. Best fit for an internal portal that can already serve static
  hosting with SSO at the edge.

### 2b. Server search: Meilisearch tenant-token scoping (S04) and Typesense analogue

- Mechanism (observed primary, S04): Meilisearch separates API keys
  (authenticate, base permissions) from tenant tokens: short-lived JWTs
  generated BACKEND-side from a search key, embedding search rules
  (filter expressions such as `version = "2.4" AND codebase = "api"`).
  The frontend searches Meilisearch directly with the token; embedded
  filters apply to EVERY request, so per-release/per-codebase scoping is
  enforced even though the index is shared.
- Governing conditions: tokens restrict ONLY the search endpoint — indexing,
  settings, and key management stay behind backend-held admin keys. Tokens
  are short-lived and minted per session. This is the row-level-security
  analogue for search (Meilisearch's own comparison: Algolia secured API
  keys, Postgres RLS).
- Typesense analogue (background, S07 search snippets, not primary-fetched
  after repeated 404s on versioned doc URLs): scoped search API keys with
  embedded `filter_by`. Same architecture; exact parameter shape UNOBSERVED
  — recorded as uncertainty, not fact.
- Storage/transport fit: adds a stateful service (Meilisearch: Rust +
  LMDB-backed persistence, primarily single-node) and an indexing pipeline
  (crawl built HTML or push documents per release with `version`,
  `codebase`, `locale`, `passage` fields). Version-correctness becomes a
  data-modeling rule (every document carries version+codebase+locale) plus
  a token-minting rule (backend maps the reader's context to filters).
  Citation = stored passage fields + stable URLs. Contradiction surfacing =
  a second cross-version query the UI runs explicitly for maintainers.
- When to choose 2b over 2a: faceted analytics ("which versions mention X"),
  typo-tolerance/synonyms tuning, per-team visibility rules, or corpora too
  large for client-side index download. Cost: a service to run, secure,
  back up, and upgrade; an indexer to maintain per release.

### 2c. Contradiction visibility without silent rewriting (architecture)

- The brief forbids silent rewriting, so the contradiction mechanism must be
  READ-ONLY surfacing: cross-version/cross-codebase match comparison in the
  portal UI (e.g., "this passage differs in v2.3 vs v2.4" with links to both
  exact passages), plus optional lint-style reports (Vale/textlint-style
  rules or embedding-similarity flags) presented to maintainers as review
  queues. No investigated product auto-reconciles versioned docs; any
  proposal to do so is rejected for this brief (recorded for O4/O5).
- Storage condition: diffing requires old versions retained in retrievable
  form (static snapshots in 1a/2a; version-tagged documents in 2b; git refs
  in 1b). Retention policy (how many releases stay searchable) is a user
  decision with direct storage/index-size cost.

## 3. Multilingual notes: storage and retrieval conditions (O1, O2)

- Docusaurus i18n filesystem model (observed primary, S05, v3.10.2): each
  locale's translated files live in locale-scoped filesystem locations;
  design goals state simple file placement, flexible workflows (git
  monorepo/forks/submodules, SaaS, FTP), flexible deployment (single,
  multiple domains, hybrid), modular per-plugin i18n, low runtime overhead
  (static), scalable per-locale builds. Governing condition: translation
  state is FILES, so "which passages are stale in locale L" is answerable
  by git diff against the source locale — a natural input to the
  contradiction/maintenance view.
- Retrieval condition: locale must be a first-class facet in BOTH search
  architectures (Pagefind `locale:` filter; Meilisearch `locale` field +
  token filter), and the default locale fallback chain (reader locale →
  source locale with a "translation may be stale" badge) is portal logic,
  not search-engine logic.
- Uncertainty: quality of CJK/analyzers in Pagefind vs Meilisearch for the
  group's actual note languages is UNOBSERVED and must be validated with
  sample notes (O6). No claim is made about which engine tokenizes the
  group's languages better.

## 4. Code/doc linkage and migration/export (O1, O2)

- Linkage mechanisms compared: Antora `include::` of versioned example files
  and resource IDs with version coordinates (linkage is version-pinned by
  construction); Docusaurus code-block file references and versioned URLs
  (linkage by path convention, must be maintained); wiki class (section 1c:
  linkage is manual URLs, weakest).
- Governing condition: only linkage that carries the RELEASE coordinate
  (tag/version) satisfies "relevant released version" for code-adjacent
  passages. Unpinned `main`-branch links rot on every release and are a
  known contradiction source; the portal should lint for unpinned code links.
- Migration/export: git-backed approaches (1a/1b/2a) export trivially (the
  repo IS the export; static HTML is portable). The Meilisearch index (2b)
  is a DERIVED artifact and must be rebuildable from the git source of
  truth — never the sole store. Wiki-class stores need explicit dump/export
  automation (out of q1 scope, flagged to q2).

## 5. Issue / fix / release chains (O3)

Chain A — Pagefind Default UI → Component UI replacement (release evolution,
observed primary on pagefind.app docs banner, S03): Pagefind 1.5.0 introduced
a new Component UI (search modal, accessibility, customization) REPLACING the
Default UI (`pagefind-ui.js`/`PagefindUI`). Governing evolution condition for
S07: the search UI layer is the fastest-churning dependency in the static
architecture; portal templates must pin the Pagefind version and treat UI
upgrades as visible changes (modal behavior, CSS hooks), while the index
format/CLI contract is the stable part. Absence note: no Pagefind index-format
breaking change was observed in the fetched docs; not claimed.

Chain B — Docusaurus cross-version SEO/duplicate-content handling (issue →
wontfix → documented mitigation, secondary report S06, primary issue number
UNOBSERVED): a long-standing request for automatic canonical tags across
versions was reportedly closed as wontfix (correct cross-version canonicals
judged out of core scope); the documented mitigation is that the sitemap
plugin filters `noindex` pages and non-latest versions can emit `noindex`
automatically. Relevance: version-correct INTERNAL search must not inherit
the public-SEO default of hiding old versions — the portal's search config
must explicitly INDEX old versions while SEO config hides them from Google.
Honesty note: the underlying GitHub issue number and verbatim maintainer
text were NOT observed (seen only via the S06 secondary report); recorded
as a lead for q2/critic to confirm, not as established fact.

Chain C — `useDocsVersion()` name/version field mixup (fix snippet, S07):
a downstream docs-site fix changed a destructuring from a nonexistent
`version` field to the correct `name` field on Docusaurus's GlobalVersion
type. Relevance: version-aware portal UI code must program against the
`GlobalVersion` type (`name`, `label`, `isLast`), not assumed shapes; a
small typed-contract check belongs in O6 validations. Honesty note: observed
as a search-result snippet of a downstream PR; the upstream Docusaurus
source of the type was not fetched in this window — lead, not fact.

No campaign-internal issue data was read. Usage/billing evidence: none
observed (null).

## 6. Retained alternatives, conditions, disagreements, uncertainty (O5)

- Recommended architecture pair for this brief (q1 view): Antora-style
  git-ref aggregation (1b) OR Docusaurus snapshots (1a) for versioned
  storage, plus Pagefind filtered static search (2a) as the default
  retrieval layer, upgrading to Meilisearch tenant-scoped search (2b) only
  when scale/visibility rules demand it. Both storage options keep git as
  the source of truth and the search index derived and rebuildable.
- User decisions (cannot be made by research): (a) docs-in-code-repos vs
  docs-monorepo (Antora favors the former; Docusaurus the latter);
  (b) how many releases stay built/searchable (storage vs recall);
  (c) internal auth placement (edge SSO in front of static hosting vs
  app-level scoping in 2b); (d) source locale + fallback display policy;
  (e) AsciiDoc (Antora) vs Markdown (Docusaurus/wiki) authoring.
- Disagreement preserved: snapshot versioning (1a) is simpler to adopt for
  Markdown teams but scales poorly with three codebases × frequent releases;
  git-ref versioning (1b) fits the release shape best but imposes AsciiDoc.
  No forced consensus here; the final synthesis must carry both with costs.
- Uncertainties: Typesense scoped-key exact shape (unobserved); Docusaurus
  canonical-issue primary text (unobserved); CJK/analyzer quality per engine
  (unobserved); Pagefind index download size at this corpus scale
  (unmeasured); Meilisearch single-node sufficiency at 60-person load
  (unmodeled — likely fine, but unmodeled).

## 7. Validations: executed vs proposed (O6)

EXECUTED in this window (read-only web observation; no runtime, no witness
sandbox used — none was available/qualified, so no executed code checks exist):
- E1: fetched and compared Docusaurus versioning + i18n primary docs (S01, S05).
- E2: fetched Antora how-it-works + content-source versioning methods (S02).
- E3: fetched Pagefind filtering + indexing primary docs (S03).
- E4: fetched Meilisearch tenant-token security model (S04).
- E5: background search for issue/fix chains; two leads retained as
  leads-with-honesty-notes (S06, S07), one primary release-evolution chain
  established (S03 banner).

PROPOSED discriminating validations (none executed; each would discriminate
between the retained alternatives):
- P-V1 (storage scale): build a pilot with 3 components × 5 releases in BOTH
  1a and 1b; measure build minutes, repo bytes, and "add one release" author
  steps. Discriminates snapshot sprawl vs ref-aggregation cost.
- P-V2 (retrieval correctness): seed identical version-tagged corpora into
  Pagefind-filtered and Meilisearch-scoped pilots; assert version-scoped
  queries never return other versions' passages and citations resolve.
  Discriminates 2a vs 2b on the brief's core requirement.
- P-V3 (multilingual): index sample notes in the group's real languages in
  both engines; measure recall on native-speaker queries. Discriminates
  analyzer quality (current uncertainty).
- P-V4 (linkage rot): lint pilot docs for unpinned (`main`-branch) code
  links; count rot after one simulated release. Validates the release-pinned
  linkage rule.
- P-V5 (contradiction view): implement the cross-version diff query in both
  retrieval pilots and time it; confirm no write path exists from the
  contradiction view to stored docs (read-only proof). Validates the
  no-silent-rewrite requirement architecturally.
- P-V6 (contract check): typecheck portal version-UI code against the
  installed Docusaurus `GlobalVersion` type (Chain C). Cheap, deterministic.

No runtime was available; "no runtime available" is stated honestly and no
proposal above is represented as run.
