# S07 documentation-portal — final (A-M01-B control reviser, M01 coherent-batching)

Coherent join of two parallel investigators: q1 (architecture / data /
storage / transport) and q2 (products / workflow / usability / options +
validation), adjudicated against the own-arm critic. This ONE document is
the complete deliverable covering the full brief (O1–O6) and every exact P
clause. Predecessor source IDs appear parenthetically as provenance; no
material claim relies on an ID in place of prose.

Brief (exact): internal documentation portal for a 60-person engineering
group with three codebases, multilingual notes and frequent releases.
Search should return the relevant released version, cite exact passages
and help maintainers see contradictions without silently rewriting
documentation. Research existing products/mechanisms, code/doc linkage,
retrieval conditions and migration/export options.

Thin plan under comparison (exact, both revealed-plans identical):
P1: Crawl main branches nightly. P2: Put every chunk in one vector index.
P3: Answer with the top five chunks and links. P4: Let maintainers approve
suggested rewrites. P5: Keep old documentation pages separately. P6: Test
by asking maintainers ten familiar questions.

Disposition vocabulary (single disposition per P clause; element-level
labels below are sub-findings, not second dispositions): CORRECTION (plan
clause wrong/insufficient as stated; replaced), REJECTED (do not do, with
replacement where applicable), OPTIONAL ENHANCEMENT (may add later),
USER DECISION (requires an org choice research cannot make),
ALREADY-COVERED (retained mechanism already satisfies the element),
UNCERTAIN (evidence inconclusive; a named validation decides).

Original constraints honored throughout: 60-person group, three codebases,
multilingual notes, frequent releases, version-correct search, exact
citations, contradiction visibility, NO silent rewriting. The P4 rejection
is the load-bearing reading of that last constraint.

## 1. Per-P dispositions (O4)

### P1 "Crawl main branches nightly" — CORRECTION

Main branches hold unreleased/current content (Docusaurus working `docs/`
is always the unreleased version), so a main-branch crawl answers from
docs the reader's release may not have. With three codebases and frequent
releases, `main` mixes unreleased changes across repos, ignores tags,
locales and per-codebase cadence, and makes "relevant released version"
undefinable. Verdict UPHELD from both arms; no conflict.

Corrected form: ingest per-RELEASE content, cut from each code release
tag, with every stored unit carrying its release coordinate (version +
codebase + locale + release tag). Concrete cut mechanics, by platform
(section 2): Docusaurus `docusaurus docs:version <ver>` freezing the
`docs/` tree into `versioned_docs/version-<ver>/` plus sidebar JSON and a
`versions.json` registry; MkDocs `mike deploy --push --update-aliases
<ver> latest` plus `mike set-default` writing `versions.json`;
Antora tag/branch component versions via playbook content sources plus
each ref's own `antora.yml` version key; Starlight layout-versioned
sections (DIY, Tier 2). Every cut emits a manifest mapping doc version to
code tags, rebuilds the versioned site plus its search scope on tag push
(idempotent: rerunning the same tag changes nothing), and updates the
`latest`/default alias explicitly. The `next`/unreleased scope stays
visibly distinct and is never the default search scope.

Retained narrowly: a nightly `main` crawl survives ONLY as an explicitly
labeled "unreleased preview" corpus, excluded from default results
(OPTIONAL ENHANCEMENT where preview demand exists).

USER DECISIONS: version retention (e.g. last three minors per major);
preview visibility; alias semantics (redirect vs copy); crawl cadence
(tag-triggered vs nightly) once the corpus is release-pinned —
tag-triggered fits frequent releases better, either is acceptable.

### P2 "Put every chunk in one vector index" — CORRECTION

One unscoped index cannot satisfy released-version + locale + codebase
scoping. It leaks `next`/wrong-version/wrong-locale/wrong-codebase
passages, defeats exact citation, and hides contradictions by blending
versions. Vector similarity is a ranking signal, not a scoping mechanism.
Unscoped single vector index as sufficient retrieval is REJECTED. Verdict
UPHELD from both arms; enforcement point decided in M1 adjudication
(section 5) and fixed below.

Corrected form — one default, one documented fallback, one service
upgrade (same contract in all: displayed version = searched version):

- DEFAULT (a) Per-version/per-locale static bundles (Pagefind): the
  post-build indexer runs over each version's built HTML output and emits
  a bundle into that output (default output subdirectory `pagefind`); the
  UI loads the index matching the reader's selected version/locale/
  codebase. Enforcement point: bundle selection at load. Leak mode: a
  stale selector, misdeployed shared bundle, or cross-version link can
  still carry the reader across versions — isolation is strong per query
  but not absolute (the earlier "a result can never lead to another
  version" is corrected to "a result cannot come from another version's
  index shard; navigation afterward still can"). Cost: build artifacts and
  storage multiply by versions × locales; justified at this corpus scale
  by the strongest isolation with zero search infrastructure.
- FALLBACK (a′) One Pagefind index with enforced filters: pages declare
  `version:`/`codebase:`/`locale:` facets from the site template via
  `data-pagefind-filter` (element-text, attribute, and inline-literal
  forms; reserved keys `any/all/none/not` unavailable), and the default
  query is pre-filtered to the reader's release. Enforcement point:
  client-side UI template filter. Leak mode: a template omission leaks
  cross-version passages silently. Kept as the documented fallback with a
  mandatory leak probe (F-V1). Cheaper in artifacts than (a); weaker in
  failure mode.
- UPGRADE (b) One service index with mandatory scope attributes
  (Typesense / Meilisearch): every record carries `version`, `locale`,
  `codebase`, `release_tag`; every query filters on the reader's scope
  (Typesense `filter_by` equality/range syntax; Meilisearch
  `filterableAttributes` declared at index creation — mandatory before
  filtering, updates trigger a full re-index at cost proportional to the
  dataset). Backend mints short-lived per-session tenant tokens embedding
  the reader's filters so scoping is enforced even though the index is
  shared; tokens restrict the search endpoint only, while indexing,
  settings and key management stay behind backend-held admin keys.
  Justified by scale, faceted analytics ("which versions mention X"),
  typo/synonym tuning, or per-team visibility rules. Cost: a stateful
  service plus an indexing pipeline to run, secure, back up and upgrade.

Further corrections inside P2: chunking must preserve citable passage
boundaries and stable anchors — arbitrary fixed-size chunks break exact
citation (ALREADY-COVERED mechanism: retained excerpt/highlight passage
mechanics, now with mandatory scope badges per hit). Vector-only
retrieval weakens exact-passage matching; keyword/hybrid retrieval or
stored verbatim passages stay alongside any vectors. Vector search, if
wanted, is an OPTIONAL ENHANCEMENT inside the version-scoped candidate
set, never a substitute for scoping; embedding-model selection and
chunk-size tuning are UNCERTAIN (unobserved in-window; no model named —
acceptable, not an omission, since the brief never requires embeddings).

### P3 "Answer with the top five chunks and links" — CORRECTION

Fixed-k ("five") with bare links fails the brief three ways: no scope
badges (which released version?), no anchor/excerpt integrity (which
exact passage?), no cross-version hint (contradiction visibility?). "Five"
is arbitrary: fixed-k truncates good sixth passages and pads with bad
fifths. Verdict UPHELD; the stronger q2 citation contract is adopted and
q1's split label is retired to a single CORRECTION (m1).

Corrected form — citation contract for every result:

- Each hit shows version + locale + codebase badges, an exact-passage
  excerpt with highlight, and a link resolving to the anchored passage in
  the built HTML of that version. Citation = version + locale + path +
  anchor + excerpt hash; the anchor must resolve to the quoted passage
  (drift check). Version-pinned URLs are the retained mechanism
  (Docusaurus versioned paths, Antora version-coordinate resource IDs);
  unpinned `main`-branch links are linted as rot (proposal, m4).
- Score/threshold + version-filter rule replaces fixed-k as the retrieval
  contract.
- Fallback honesty: if the page falls back to another locale, both page
  and excerpt are labeled as fallback, never masquerading as translated.
- Contradiction hint: when the same page differs across
  versions/locales, show "other versions say otherwise" with links —
  surfacing, not rewriting.
- OPTIONAL ENHANCEMENTS: adjustable k, group-by-page vs passage view,
  snippet length. USER DECISIONS: default k, snippet verbosity, search UX
  (modal vs dedicated page), per-codebase default version (latest stable
  for that codebase, not global latest). UNCERTAIN: optimal k and snippet
  shape for 60-person internal use — decided by F-V1/F-V2/F-V7 evidence,
  not by fiat.

### P4 "Let maintainers approve suggested rewrites" — REJECTED (with read-only replacement)

Rejected as framed. Approval-gated rewrite suggestions keep a write path
from retrieval to stored docs and normalize machine rewriting of
versioned truth; approval fatigue makes bulk approval silent in practice.
The brief requires helping maintainers SEE contradictions without silently
rewriting documentation. Verdict UPHELD by both arms; no false rejection.

Replacement (correction): a READ-ONLY contradiction surface, with NO
write path from the contradiction view to stored docs:

- Cross-version/cross-codebase match comparison ("this passage differs in
  v2.3 vs v2.4"), each side an exact cited passage.
- Contradiction queue fed by Vale CI errors (terminology/consistency
  rules; `.vale.ini` with `MinAlertLevel`, `BasedOnStyles`, `vale sync`
  in onboarding, pinned minimum Vale for `[formats]` filename/glob
  behavior) + dead-link build failures (`--strict`-class gates) +
  cross-version/cross-locale diff reports. Queue item: competing passages
  side by side, each with full citation (version/locale/path/anchor),
  grouped by page/version/locale. Maintainer actions: human-authored edit,
  accept-as-intended-difference, or retire.
- Stricter rule adopted (m2): suggestions are applied ONLY through the
  normal documentation PR process; no accept/apply path exists inside the
  portal at all. Any model-generated proposal text shown is at most an
  explicitly labeled, cited attachment to one queue item, requiring
  per-passage human rewrite — bulk-approve and silent-apply are REJECTED.
- ALREADY-COVERED element: human-in-the-loop approval is retained, but
  its object changes from "rewrite" to "triage." OPTIONAL ENHANCEMENT:
  Vale JSON feed (`vale --output=JSON`) plus custom contradiction-pattern
  rules.

### P5 "Keep old documentation pages separately" — CORRECTION

"Separately" is directionally right but unimplementable: without version
keys, aliases, redirects, search scoping, retention and UX,
routing/search/citation are undefined and old pages become dead or
misleading duplicates. Single disposition CORRECTION adopted; q2's
"already-covered in intent" half is dropped as adding nothing (m1-analog).
Verdict UPHELD.

Corrected form: old releases are a FIRST-CLASS versioned corpus —
snapshots, git refs, or version-tagged documents — EXCLUDED from the
default reader scope and EXPLICITLY searchable under a cross-version scope
for maintainers (the input to the P4 contradiction view). Contract:
stable per-version URLs, stay-on-page switching, non-latest warning
banner, redirect/alias policy for renamed pages, scheduled retirement of
unsupported versions to bound build/search cost. Public-SEO hiding of old
versions (noindex) must NOT propagate to internal search config: the
portal's search explicitly indexes old versions while SEO config hides
them from public engines (design RULE; the Docusaurus-specific wontfix
history behind it stays a LEAD per M2).

Platform options, tiered (M6; details in section 2):

- Tier 1, first-class versioning: (a) Docusaurus snapshots (Markdown;
  snapshot sprawl at three codebases × frequent releases); (b) MkDocs
  Material + mike (`versions.json`, alias redirect, stay-on-page, warning
  banner; branch publishing); (d) Antora component versions
  (AsciiDoc-first; strongest three-codebase/tag fit, stable resource-ID
  xrefs). Authoring-format cost decides among them.
- Tier 2, imposed-by-layout/adjacent rigor: (c) Starlight + layout
  versioning + default Pagefind (DIY versioning design, not a peer of
  Tier 1; multilingual + offline search out of box); (e) Sphinx gettext +
  builders (reStructuredText cost; translation-memory/PDF rigor where
  that dominates).
- Orthogonal shell: (f) Backstage TechDocs as a discovery shell over any
  versioned backend. Core lacks multi-version/preview (primary issue
  backstage/backstage#16711 observed; community addon self-describes as
  work in progress, not production-ready) — do not promise versioning
  from core TechDocs alone.
- Retained weak alternative: database wiki class (Wiki.js/BookStack/
  Outline/Confluence): content in DB rows, history as revisions;
  "released version" must be modeled explicitly via snapshots/exports;
  weakest code/release linkage; acceptable only with a snapshot/export
  design.

USER DECISIONS: platform, URL scheme, retention count (how many releases
stay built/searchable — direct storage/index-size cost), alias semantics.

### P6 "Test by asking maintainers ten familiar questions" — CORRECTION

Ten familiar questions to familiar maintainers cannot discriminate the
brief's hard requirements: version scoping, locale fallback honesty,
citation exactness, contradiction handling without rewrite, release-cut
idempotence, export survival, CJK behavior. Familiar askers guess the
intended version, overlook wrong-version passages, and bias toward known
pages. Validation DESIGN verdict UPHELD; detailed battery in section 7.

Corrected form: replace with the deduped discriminating battery F-V1–F-V7
(all PROPOSED, none executed; each names its discriminating pair).
Retain maintainer questioning ONLY inside F-V7 as a usability walkthrough
with unfamiliar + cross-version + multilingual probes, scored on task
completion (found released answer within three clicks with visible
version badge; triaged a 10-item queue), not on answer familiarity.
q1's binding input is preserved: validation must include
architecture-discriminating probes, notably version-confusion probes
(same question, answer differs by release), citation-resolution checks,
and cross-version recall measurement.

## 2. Retained architecture (O1, O2, O5)

Storage (git is the source of truth; every index is derived and
rebuildable — the Meilisearch/Typesense index must be rebuildable from
git, never the sole store):

- Option A — snapshot versioning (Docusaurus): `docusaurus docs:version`
  freezes full-tree snapshots; simple for Markdown teams; cost grows
  roughly linearly per release; three codebases need a sync/copy pipeline
  or a docs monorepo. Maintainer condition: suits high-traffic,
  rapidly-changing docs; raises build time and contributor complexity —
  adopt deliberately, prune to supported releases, do not version
  prematurely.
- Option B — git-ref aggregation (Antora): playbook declares content
  sources (repos + branches/tags); per matched ref Antora reads that
  ref's own `antora.yml` component descriptor, whose `version` key
  determines the component version — no separate versioning config, no
  committed snapshot directory. Multi-repo is first-class: one playbook
  aggregates three codebase repos as three components, each with its own
  version line. Best fit for three codebases × frequent releases.
  AsciiDoc-first authoring is the adoption cost (m5: "AsciiDoc-first",
  not "AsciiDoc-only" — Markdown-extension nuance unobserved by all).
  Version sorting/prerelease rules govern "latest" resolution —
  configure, do not assume.
- Option B2 — branch-published version dirs (MkDocs Material + mike):
  `mike deploy <ver> latest --update-aliases --push`, `mike set-default`,
  `versions.json` on the publish branch; Material renders the selector
  with stay-on-page switching, version warning banner and alias redirect.
  Simplest version UX for Markdown teams already on MkDocs. Implies
  branch publishing and PR-preview discipline (previews must not pollute
  `latest`/default).
- Tier 2 / adjacent: Starlight layout versioning (DIY: versions modeled
  as content sections or community plugins plus imposed search scoping;
  multilingual + default Pagefind offline search out of box, low
  maintenance); Sphinx gettext flow (`sphinx-build -b gettext` emits POT,
  `sphinx-intl update` refreshes PO, per-locale builds, multiple builders
  incl. PDF/LaTeX) where translation-memory/PDF/cross-reference rigor
  outweighs Markdown simplicity; database-wiki class only with an
  explicit snapshot/export design (weakest fit, retained alternative).

Retrieval (default scope = reader's release; cross-version scope
explicit; displayed version = searched version):

- DEFAULT R-a — per-version/per-locale static bundles (Pagefind): zero
  search infrastructure; index ships with the site; offline-friendly.
  Internal access is gated at the hosting/SSO edge since static files
  carry no per-user scoping. Build mechanics: Pagefind runs as a
  POST-BUILD step over generated HTML (`pagefind --site dist`, `--site`
  required, `--serve` preview-only), emitting a static index deployed
  with the site; browser searches client-side. Defaults: indexing starts
  at `<body>`; output subdirectory `pagefind`; root selector `html`;
  filters/metadata outside the root selector are not detected.
- FALLBACK R-a′ — single static index with enforced template filters
  (same engine, weaker enforcement; section 1 P2). Chosen only with the
  mandatory F-V1 leak probe.
- UPGRADE R-b — tenant/filter-scoped service (Meilisearch/Typesense):
  stateful service + indexing pipeline pushing per-release documents with
  `version`, `codebase`, `locale`, `passage`/`release_tag` fields.
  Per-session backend-minted tokens/filters enforce scope; justified by
  scale, faceted analytics, typo/synonym tuning, or per-team visibility
  rules. Schema conditions: Meilisearch `filterableAttributes` mandatory
  before filtering (updates rebuild the index); facet search requires
  filterable fields, prefix-only, no numeric facet search (convert to
  string); Typesense query is `q` + `query_by` + `filter_by` with string
  equality/range syntax, `per_page` default 10, highlight snippets with
  `<mark>` feeding citations. The Typesense "filter changes are
  query-time, no reindex" half is UNCONFIRMED (M5) — retained excerpts
  show syntax and pagination only, not schema-change cost.
- Hosted search (Algolia DocSearch: official Docusaurus path, weekly
  crawl, free for public dev docs) applies ONLY if public/firewall
  permits; a private-behind-firewall internal portal needs run-your-own
  or self-hosted. Weekly-crawl staleness is incompatible with frequent
  releases unless tag-triggered run-your-own. `contextualSearch` is the
  observed Docusaurus version-context option.

Multilingual: locale-scoped file storage (Docusaurus `i18n/<locale>/`
with Git/Crowdin/FTP workflows and single/multi-domain deploy; Starlight
`locales` + `defaultLocale`, content under `src/content/docs/<locale>/`,
fallback serving the default-locale page with a badge when translation is
missing, RTL support; Sphinx PO where rigor/PDF wins). Localize the
current version only unless demand proves otherwise; deploy locales
independently. Locale is a first-class retrieval facet in every design
(Pagefind `locale:` bundle/filter; service `locale` field + token
filter); reader-locale → source-locale fallback with a stale-translation
badge is portal logic, not engine logic. Translation state is files, so
"which passages are stale in locale L" is answerable by git diff against
the source locale — a natural contradiction-view input. CJK/analyzer
quality per engine is UNVERIFIED-AGAINST-PRIMARY in-window (M3); CJK
locales conditionally require extended-search-build verification (F-V6).

Code/doc linkage: colocated `docs/` per repo + PR preview + tag-pinned
code links (never `main` links in citations) + API-extractor Markdown +
release manifest (doc version → code tags). Only release-pinned links
(tag/version coordinates) satisfy version-correctness; Antora resource
IDs pin by construction, Docusaurus pins by versioned-URL convention,
wikis pin only by manual discipline. Unpinned-link lint and dead-link
`--strict`-class gates are design PROPOSALS (m4), not observed product
behavior. Citations survive migration because they carry version + anchor
+ hash.

Migration/export: source stays portable (Markdown/MDX preferred for
60-engineer friction; AsciiDoc/reStructuredText only with an explicit
platform decision). Export = versioned HTML bundle + PDF for
release/compliance + offline search bundle or index snapshot + manifest.
Anchors/version labels must survive round-trip (F-V5). Static HTML is
portable; git-backed approaches export trivially (the repo IS the
export). Wiki-class stores need explicit dump/export automation.

Contradiction quality aids (no silent rewrite): Vale (Go CLI prose
linter — style/terminology, not grammar correction; YAML extension with
substitution/swap/message/level/ignorecase; `.vale.ini` core keys
`StylesPath`, `Packages`, `MinAlertLevel` suggestion|warning|error,
`IgnoredScopes`/`SkippedScopes`, `[formats]` map; unknown keys warn,
misplaced core keys error; `vale sync` installs gitignored styles after
clone; `vale ls-config` resolves effective config) as a CI gate failing
on error, feeding the queue with terminology/consistency errors. Minimum
Vale pin (v3.22.0+ for filename/glob `[formats]`) is F-V4-validated, not
established (m3). Complementary: dead-link fail-build gates,
version-aware diff reports, explicit queue UI. No investigated product
auto-reconciles versioned docs.

q1/q2 join contract (cross-topic deps): q2 owns version/locale/codebase
selector UX, scoped query construction, citation rendering, contradiction
queue, export UX. q1 owns artifact/index stores, hosting, cache, auth,
tag→build→index pipeline mechanics. Shared contract: the
version-locale-codebase-release_tag key set (router displays exactly what
the index searched); passage locator format (path + anchor + hash);
release manifest; per-version-bundle vs filtered-index choice with
matching router behavior. Either scoped design satisfies the contract;
the choice is recorded above with F-V1/F-V5 as tiebreakers for any
revisit.

## 3. Issue / fix / release chains (O3)

ESTABLISHED (primary, retained + independently confirmed where noted):

- Chain 1 — Pagefind Default UI → Component UI replacement (release
  evolution; primary docs banner observed by q1, q2 and critic C-S01):
  Pagefind 1.5.0 introduced a new Component UI (search modal,
  accessibility, customization) REPLACING the Default UI
  (`pagefind-ui.js`/`PagefindUI`). Governing condition: the search UI
  layer is the fastest-churning dependency in the static architecture;
  pin the Pagefind version and treat UI upgrades as visible changes
  (modal behavior, CSS hooks), while the index format/CLI contract is
  the stable part. No Pagefind index-format breaking change was observed;
  none is claimed.
- Chain 2 — Backstage TechDocs preview/versioning gap (primary issue
  page observed, q2-S16): core lacks PR preview and multi-version
  display (backstage/backstage#16711); the community
  `backstage-plugin-techdocs-addon-versioning` addon self-describes as
  work in progress, not production-ready. Consequence: do not promise
  released-version search + preview from core TechDocs alone; plan the
  addon or a separate versioned static portal behind catalog links.

LEADS (explicitly not facts; proposed validations confirm):

- Chain B — Docusaurus cross-version canonical handling (LEAD, q1-S06
  snippet-only): a secondary SEO-framework report claims a long-standing
  request for automatic cross-version canonicals was closed as wontfix
  with a noindex/sitemap mitigation (sitemap plugin filters `noindex`
  pages; non-latest versions can emit `noindex`). Issue number, verbatim
  maintainer text and release applicability are UNOBSERVED. The q2 phrase
  "corroborated by versioning docs structure" is STRUCK — docs structure
  cannot corroborate an issue outcome (M2). Carried forward ONLY as the
  design RULE that internal search must explicitly index old versions
  while public SEO hides them.
- Chain C — `useDocsVersion()` name/version field mixup (LEAD, q1-S07
  snippet-only): a downstream docs-site fix reportedly changed a
  destructuring from a nonexistent `version` field to the correct `name`
  field on Docusaurus's `GlobalVersion` type. PR body, merge state and
  upstream type text are UNOBSERVED. Carried forward ONLY as the
  F-V3 contract check (typecheck portal version-UI code against the
  installed type).
- Vale `[formats]` version gate and `vale sync` onboarding shape are
  retained specifics from primary docs; the "older installs mis-scope"
  failure mode keeps its honest "(?)" (m3) and is F-V4-validated.
- A stale frozen `versioned_docs/version-*` reportedly failing a whole
  site build while current builds fine (q2 background) is UNRETAINED —
  no source ID, no excerpt. Carried as UNCERTAIN background, not as an
  established failure domain; F-V5 rehearsal will confirm or refute it
  for the chosen platform.

ABSENT / INAPPLICABLE (honestly stated): no usage/billing evidence
observed anywhere (null); no silent-rewrite mechanism endorsed (absence
intentional per brief); no CJK/extended-binary mechanics verified
against primary in-window (M3); Typesense schema-change cost unconfirmed
(M5); load/scale unmodeled by both arms (acceptable at this scope;
F-V1/F-V5 pilots cover it).

## 4. Criticism adjudication (every finding explicitly decided)

Per-P verdicts: all six UPHELD — ACCEPTED. No valid plan element was
wrongly rejected; no false correction found; no P-disposition conflict
exists between q1 and q2. Single dispositions are used throughout
section 1.

- M1 (retrieval enforcement point differs; must be decided, not merged)
  — ACCEPTED. Evidence: C-S01 confirms `data-pagefind-filter` capture
  forms and reserved keys verbatim; q2-S01/S02 confirm per-build static
  output with `output_subdir`/`root_selector` defaults. q1-R1 (one index
  + template filter) fails through silent template-omission leaks;
  q2-(a) (per-version bundles) fails through stale selectors/misdeploys
  and multiplied artifacts. The final adopts the critic recommendation:
  DEFAULT q2-(a) per-version/per-locale bundles for strongest isolation
  at this corpus scale, FALLBACK q1-filter documented with mandatory
  F-V1 leak probe, service design (b) as the scale/visibility upgrade.
  q2's "a result can never lead to another version" is CORRECTED to the
  leak-mode wording in P2. Affected dependency checked: the q1/q2 join
  contract (displayed = searched) holds under all three; router behavior
  must match the chosen enforcement point.
- M2 (Chain B must stay a LEAD) — ACCEPTED. Evidence: q1-S06 honesty
  note is exemplary (snippet-only, issue/verbatim unobserved); q2's
  "corroborated by versioning docs structure" is not corroboration.
  Action: phrase struck; Chain B carried as LEAD + design RULE only
  (section 3). No new fetch was necessary to resolve this criticism —
  demotion, not verification, is the correct resolution in-window.
- M3 (q2 CJK / pagefind_extended mechanics lack retained passages) —
  ACCEPTED. Evidence: retained q2-S01/S02 excerpts contain no extended-
  binary/`Intl.Segmenter`/`force-language`/CHANGELOG text and no
  CHANGELOG source ID exists; C-S01 likewise contains no CJK text.
  Action: final carries CJK analyzer quality as
  UNVERIFIED-AGAINST-PRIMARY (matching q1's honest uncertainty); the
  CJK-conditional F-V6 stands as a proposal; no extended-binary
  mechanics asserted as observed.
- M4 (q1 unsourced implementation details) — ACCEPTED (drop). Evidence:
  "Meilisearch: Rust + LMDB-backed persistence, primarily single-node"
  and "word positions are in the index" appear in NO retained q1 excerpt;
  independent C-S02 fetch of the same tenant-token page likewise contains
  no LMDB/single-node text. Action: both details DROPPED from the final;
  neither is disposition-load-bearing. No replacement source was sought:
  dropping is cheaper and safer than sourcing trivia.
- M5 (Typesense-vs-Meilisearch schema-cost comparison weakly evidenced)
  — ACCEPTED. Evidence: q2-S14 is retained and specific (mandatory
  `filterableAttributes` + full re-index); q2-S13 shows only filter
  SYNTAX and `per_page` default, not schema-change cost. Action: the
  Typesense "query-time, no reindex" half is labeled UNCONFIRMED pending
  Typesense collection-schema docs; P2 disposition unaffected — both
  scoped designs remain valid.
- M6 (P5 options need tiering) — ACCEPTED with amendment. Evidence: q2
  itself admits Starlight versioning is "not first-class" and must be
  "imposed by content layout + search scoping" — a DIY design, not a
  peer of snapshots/mike/Antora; q2-S16 honestly conditions Backstage on
  the core gap + WIP addon. Action: Tier 1 (Docusaurus, mike, Antora)
  with authoring-format costs; Tier 2 (Starlight imposed-by-layout);
  shell (Backstage) orthogonal — UPHELD as recommended. Amendment: Sphinx
  placed in Tier 2 for gettext/PDF rigor (its evidence is i18n-only, not
  versioning), and the database-wiki class retained as a weak
  alternative; neither placement contradicts the critic.
- M7 (validation suites overlap; must be deduped) — ACCEPTED. Evidence:
  q1 P-V1..P-V6 ∩ q2 V1..V8 pairwise mapping confirmed (P-V2 ≈ V1+V2;
  P-V1 ≈ V5; P-V3 ≈ V7; P-V5 ≈ V4; P-V4 ≈ V3-adjacent). Action: one
  deduped battery F-V1–F-V7 (section 6), each PROPOSED with its
  discriminating pair named; both arms' "NOTHING executed / no
  runtime/sandbox" honesty UPHELD and carried.
- m1 (q1 P3 split label confusing) — ACCEPTED. Action: single
  CORRECTION; versioned-URL reuse noted as retained mechanism.
- m2 (P4 PR-process vs in-queue-proposal nuance) — ACCEPTED. Action:
  final adopts q1's stricter rule (no accept path inside the portal) with
  q2's labeling requirement for any shown proposal text.
- m3 (Vale "silently(?) mis-scope" honest "(?)") — ACCEPTED. Action:
  minimum-Vale pin kept as F-V4-validated, not established.
- m4 ("--strict"-class gates / unpinned-link lint unsourced) — ACCEPTED.
  Action: carried as design PROPOSALS, never cited as observed behavior.
- m5 ("Antora imposes AsciiDoc" simplification) — ACCEPTED (amended
  wording). Action: "AsciiDoc-first" throughout; Markdown-extension
  nuance noted as unobserved.
- m6 (honesty-note discipline exemplary) — ACCEPTED. Action: lead-vs-fact
  labeling, "no runtime" statements and usage/billing nulls preserved
  (sections 3, 6).
- m7 (q2 retained specifics: `per_page` 10, `<mark>`, reindex cost, mike
  flow) — ACCEPTED. Action: retained as verified details in section 2.
- m8 (vector UNCERTAIN/optional acceptable, not an omission) — ACCEPTED.
  Action: vector kept as optional ranking-inside-scope with no model
  named (P2).

Critic demands 1–5: (1) one default retrieval + leak probe — done (P2,
F-V1); (2) Chain B + CJK demoted — done (section 3); (3) M4 dropped, M5
labeled — done; (4) tiering + dedupe + single dispositions — done
(sections 1, 2, 6); (5) uncertainty, user decisions, P4 no-write-path
preserved — done (sections 5, 6).

## 5. User decisions, optional capabilities, disagreements, uncertainty (O5)

USER DECISIONS (research cannot make): (a) docs-in-code-repos vs
docs-monorepo (Antora favors the former; Docusaurus the latter);
(b) platform/authoring format (Markdown family vs AsciiDoc-first vs
reStructuredText); (c) releases retained built/searchable + URL scheme +
alias semantics (redirect vs copy); (d) auth placement (edge SSO in front
of static hosting vs app-level scoping in the service design);
(e) source locale + fallback display policy; (f) crawl cadence
(tag-triggered vs nightly) once release-pinned; (g) default k, snippet
verbosity, search UX, per-codebase default version; (h) whether Backstage
already exists (TechDocs-as-shell vs standalone portal); (i) firewall/
public status (hosted-search viability).

OPTIONAL CAPABILITIES (enhancements, not requirements): faceted analytics;
synonym/typo tuning; per-team visibility scoping; lint-rule review queues
+ Vale JSON feed + custom contradiction-pattern rules; stale-translation
badges; draft/preview corpus from main branches; adjustable k /
group-by-page / snippet length; vector ranking inside scoped retrieval.

DISAGREEMENT PRESERVED: snapshots (A) are simpler to adopt but sprawl
with three codebases × frequent releases; git-ref aggregation (B) fits
the release shape but is AsciiDoc-first; mike (B2) is simplest for
MkDocs-native teams but implies branch publishing. Platform choice is
genuinely open — no forced consensus; this final tiers rather than
collapses. Vector search stays optional inside scoped retrieval.

UNCERTAINTY PRESERVED: Chain B primary text/issue number; Chain C
upstream type text; CJK/analyzer quality per engine; Typesense
schema-change cost; stale-snapshot whole-build failure mode;
Pagefind index size/download at this corpus scale (unmeasured);
Meilisearch single-node sufficiency at 60-person load (unmodeled, likely
fine); target locales/firewall/format/retention inputs above; optimal
k/snippet shape. Each maps to a named F-V check or user decision.

## 6. Validations: executed vs proposed (O6)

EXECUTED (read-only web observation across q1/q2/critic windows,
2026-10-09 ~18:25–18:38 UTC; no runtime, no witness sandbox available —
no executed code checks exist): q1 E1 Docusaurus versioning + i18n
primary docs; E2 Antora versioning docs; E3 Pagefind filtering +
indexing docs; E4 Meilisearch tenant-token model; E5 issue/fix background
search → one primary evolution chain (Pagefind 1.5.0 banner) + two
honesty-noted leads (S06, S07). q2: 16 public primary-source reads
(Pagefind, Antora, Vale, Docusaurus, MkDocs Material/mike, Starlight,
Typesense, Meilisearch settings, Sphinx intl, Backstage #16711).
Critic: independent verbatim confirmation C-S01 (Pagefind filtering) and
C-S02 (tenant tokens). Reviser: inspection of all drafts, discoveries,
source-maps, retained excerpts and critique; no new fetches (no criticism
required one); no execution. No usage/billing observed anywhere (null).
"No runtime available" is stated honestly; nothing proposed is
represented as run.

PROPOSED — one deduped battery (each discriminates between retained
alternatives; each marked PROPOSED; none executed):

- F-V1 Released-version scoping + leak probe (merges q1-P-V2∩q2-V1):
  seed v1+v2 with deliberately different passages; from the v1 UI assert
  only v1 excerpts/links. Discriminates per-version bundles (a) vs
  template filters (a′) vs service filters (b); MANDATORY for (a′).
- F-V2 Citation integrity (merges q1-P-V2∩q2-V2): assert every hit carries
  version+locale+path+anchor+hash and the anchor resolves to the quoted
  passage in built HTML. Fails on drift/rewrites; discriminates pinning
  mechanisms (versioned URLs vs resource IDs vs manual discipline).
- F-V3 Locale fallback honesty + linkage rot (merges q1-P-V4∩q2-V3):
  request an untranslated page; assert fallback badge + correctly labeled
  excerpt in page and search; lint pilots for unpinned (`main`) code
  links and count rot after one simulated release. Discriminates
  routing-vs-index mismatch and the release-pinned linkage rule. Includes
  the F-V3b contract check (q1-P-V6∩Chain C): typecheck version-UI code
  against the installed `GlobalVersion` type — cheap, deterministic.
- F-V4 Contradiction without rewrite (merges q1-P-V5∩q2-V4): inject
  terminology + cross-version conflicts; assert the queue shows both
  cited passages, zero source files auto-modified (read-only proof: no
  write path from view to store), and report Vale precision/recall plus
  minimum-Vale behavior. Validates the no-silent-rewrite requirement
  architecturally.
- F-V5 Release-cut rehearsal + storage scale + export round-trip (merges
  q1-P-V1∩q2-V5/V6): pilot 3 components × 5 releases in Tier-1 options;
  measure build minutes, bytes, author steps; tag a test release and run
  tag→snapshot→build→index→alias twice (idempotence), asserting `latest`
  correctness and old-link redirect/resolve; export HTML+PDF+offline
  index and assert anchors/labels/citations survive with offline search
  passing F-V1 probes. Discriminates snapshot sprawl vs ref aggregation
  vs branch publishing, and backend lock-in.
- F-V6 Multilingual/CJK check, conditional (merges q1-P-V3∩q2-V7): index
  sample notes in the group's real languages across engines; assert
  recall/segmentation under the chosen build. Discriminates analyzer
  quality (current uncertainty) and the extended-vs-default build choice.
- F-V7 Usability walkthrough (q2-V8 + P6 replacement): maintainer triages
  a 10-item queue; author previews a PR; reader finds a released answer
  within three clicks with a visible version badge — using unfamiliar +
  cross-version + multilingual probes. Qualitative but discriminating
  across portal options. The ONLY surviving role for maintainer
  questioning.

Scope note: this is the validation battery for this small product brief,
not unlimited production guarantees (load/soak/security hardening beyond
F-V1/F-V5 pilots is out of scope and honestly unmodeled).

## 7. Coherent build recommendation

Default: Tier-1 versioned storage fitted to the team's authoring format
(Docusaurus snapshots for Markdown teams accepting sprawl discipline,
Antora git-ref aggregation for tag-shaped three-codebase release lines,
mike for MkDocs-native teams), per-version/per-locale Pagefind bundles
(R-a) behind edge SSO, q2 citation contract on every hit, read-only
contradiction queue (Vale + link gates + cross-version diffs, PR-process
edits only), filesystem-locale i18n with labeled fallback, tag-pinned
linkage + release manifest, HTML+PDF+offline-bundle export. Upgrade to
tenant/filter-scoped service search (R-b) when faceted analytics,
tuning, per-team visibility or index-download scale demands it. Validate
with F-V1–F-V7 before committing to Tier-1 choice and retrieval pairing;
revisit only on F-evidence or a changed user decision.

