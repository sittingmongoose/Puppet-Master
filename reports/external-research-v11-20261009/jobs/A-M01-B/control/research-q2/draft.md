# research-q2 draft — S07 documentation-portal (q2 scope: products / workflow / usability / options + validation)

Self-contained planning deliverable for q2 scope. Companion q1 covers architecture/data/storage/transport; combined drafts must cover the full brief. Cross-topic contracts are preserved below so the join is coherent. Discovery (`discovery.md`) was frozen before plan reveal and is not rewritten here.

Brief: internal documentation portal for 60 engineers, three codebases, multilingual notes, frequent releases. Search returns the relevant released version, cites exact passages, helps maintainers see contradictions without silently rewriting documentation. Research products/mechanisms, code/doc linkage, retrieval conditions, migration/export options.

Thin plan under comparison (exact, frozen):
P1: Crawl main branches nightly. P2: Put every chunk in one vector index. P3: Answer with the top five chunks and links. P4: Let maintainers approve suggested rewrites. P5: Keep old documentation pages separately. P6: Test by asking maintainers ten familiar questions.

Disposition vocabulary: correction (plan clause is wrong/insufficient as stated; this draft replaces it), already-covered (discovery already satisfies it), optional enhancement (may add later), user decision (requires org choice), rejected (do not do), uncertain (evidence inconclusive; validation decides).

## Per-P disposition

### P1 “Crawl main branches nightly.” — CORRECTION (narrow retention as labeled preview only)

Main-branch nightly crawl serves unreleased `next`, not the relevant released version. With three codebases and frequent releases, `main` mixes unreleased changes across repos, ignores tags, locales, and per-codebase cadence, and makes “relevant released version” undefinable.

Replace with release-triggered version snapshots per codebase:
- Cut a docs version from each code release tag (Docusaurus `docusaurus docs:version <ver>` → `versioned_docs/version-<ver>/` + `versions.json` + `docs.lastVersion`; or MkDocs `mike deploy --push --update-aliases <ver> latest` + `mike set-default` + `versions.json`; or Antora tag/branch component versions via playbook + `antora.yml`; or Starlight layout-versioned sections). Emit a manifest mapping doc version → code tags.
- Rebuild versioned site + search scope on tag push (idempotent; rerunning the same tag changes nothing). Update `latest`/default alias explicitly; keep `next` visibly distinct and never the default search scope.
- Retain nightly `main` crawl only as an explicitly labeled “unreleased preview” scope, excluded from default results.

User decisions: version retention (e.g. last three minors per major), preview visibility, alias semantics (redirect vs copy). q1 contract: version key set + tag→build→index pipeline + artifact store.

### P2 “Put every chunk in one vector index.” — CORRECTION (unscoped single index REJECTED; scoped retrieval required)

One unscoped index cannot satisfy released-version + locale + codebase scoping. It leaks `next`/wrong-version/wrong-locale/wrong-codebase passages, defeats exact citation, and hides contradictions by blending versions. Vector similarity is a ranking signal, not a scoping mechanism.

Replace with one of two scoped designs (same contract: displayed version = searched version):
- (a) Per-version/per-locale static bundle (Pagefind): post-build index per version output (`output_subdir` default `pagefind`), UI loads the index matching the selected version/locale/codebase so a result can never lead to another version. Zero infra, offline-friendly; CJK locales need the extended build + language config verification.
- (b) One service index with mandatory scope attributes (Typesense/Meilisearch): every record carries `version`, `locale`, `codebase`, `release_tag`; queries always filter (Typesense `filter_by`, e.g. version+locale equality; Meilisearch `filterableAttributes` declared at index creation — mandatory before filtering, updates trigger full re-index). `per_page` default 10; highlight snippets with `<mark>` feed citations.
- Vector search, if wanted, is an OPTIONAL ENHANCEMENT inside the version-scoped candidate set — never a substitute for scoping.

Already-covered: chunk/excerpt/highlight mechanics from discovery are retained, but each hit must carry scope badges. Rejected: single unscoped vector index as sufficient retrieval.

### P3 “Answer with the top five chunks and links.” — CORRECTION (citation + scope contract missing)

Top-5 with bare links fails three brief requirements: relevant released version (no scope badges), exact passages (no anchors/excerpt integrity), contradiction visibility (no cross-version hint). “Five” is also arbitrary.

Replace with a citation contract for every result:
- Each hit shows version + locale + codebase badges, exact-passage excerpt with highlight, and a link resolving to the anchored passage in the built HTML of that version. Citation = version + locale + path + anchor + excerpt hash; the anchor must resolve to the quoted passage (drift check).
- Fallback honesty: if the page falls back to another locale, both page and excerpt are labeled as fallback, never masquerading as translated.
- Contradiction hint: when the same page differs across versions/locales, show “other versions say otherwise” with links — surfacing, not rewriting.
- Optional enhancements: adjustable k, group-by-page vs passage view, snippet length. User decisions: default k, snippet verbosity, search UX (modal vs dedicated page), per-codebase default version (latest stable for that codebase, not global latest).
- Uncertain: optimal k and snippet length for 60-person internal use — decided by V1/V2/V8 validation, not by fiat.

### P4 “Let maintainers approve suggested rewrites.” — REJECTED as framed; CORRECTION to contradiction queue

Approval-gated auto-rewrite still centers rewriting and risks silent drift through bulk approval. The brief forbids silently rewriting documentation; the deliverable must help maintainers SEE contradictions.

Replace with a contradiction queue, not a rewrite queue:
- Inputs: Vale CI errors (terminology/consistency rules; `.vale.ini` with `MinAlertLevel`, `BasedOnStyles`, `vale sync` in onboarding, pinned minimum Vale for `[formats]` filename/glob behavior) + dead-link build failures (`--strict`-class gates) + cross-version/cross-locale diff reports listing pages whose passages conflict.
- Queue item: competing passages side by side, each with full citation (version/locale/path/anchor), grouped by page/version/locale. Maintainer actions: human-authored edit, accept-as-intended-difference, or retire. No auto-apply path exists in the portal.
- Any model suggestion is at most an explicitly labeled, cited proposal attached to one item, requiring per-passage human rewrite/accept; bulk-approve and silent-apply are rejected.
- Already-covered: human-in-the-loop approval is retained, but its object changes from “rewrite” to “triage.” Optional enhancement: Vale JSON feed (`vale --output=JSON`) + custom contradiction-pattern rules.

### P5 “Keep old documentation pages separately.” — ALREADY-COVERED in intent; CORRECTION to a versioning contract

“Separately” is directionally right but underspecified: without version keys, aliases, redirects, search scoping, retention, and UX, routing/search/citation are undefined and old pages become dead or misleading duplicates (including the known cross-version canonical-duplication trap: do not rely on SEO canonical across versions).

Specify first-class versions:
- Platform options retained: (a) Docusaurus snapshots; (b) MkDocs Material + mike (`versions.json`, alias redirect, stay-on-page, warning banner on non-latest); (c) Starlight + layout versioning + default Pagefind; (d) Antora component versions with stable resource-ID xrefs (AsciiDoc cost); (e) Sphinx gettext + builders (rST cost, PDF/gettext rigor); (f) Backstage TechDocs as discovery shell over any versioned backend (core lacks multi-version/preview per backstage/backstage#16711; community addon is WIP, not production-ready — do not promise versioning from core TechDocs alone).
- Contract: stable per-version URLs, stay-on-page switching, non-latest warning banner, redirect/alias policy for renamed pages, scheduled retirement of unsupported versions to bound build/search cost.
- User decisions: platform, URL scheme, retention count, alias semantics. q1 contract: version-locale-codebase key shared by router + index + citation renderer; storage/transport/auth owned by q1.

### P6 “Test by asking maintainers ten familiar questions.” — CORRECTION (retained only as qualitative supplement)

Familiar questions to familiar maintainers cannot discriminate the brief’s hard requirements: version scoping, locale fallback honesty, citation exactness, contradiction handling without rewrite, release-cut idempotence, export survival, CJK behavior. It also biases toward recall of known pages.

Replace with the discriminating battery V1–V8 (all PROPOSED; see below). Retain maintainer questioning only inside V8 as a usability walkthrough with unfamiliar + cross-version + multilingual probes, scored on task completion (found released answer ≤3 clicks with visible version badge; triaged 10-item queue), not on answer familiarity.

## Retained findings, conditions, alternatives

- Code/doc linkage: colocated `docs/` per repo + PR preview + tag-pinned code links (never `main` links in citations) + API-extractor Markdown + release manifest. Citations survive migration because they carry version + anchor + hash.
- Multilingual: filesystem-locale default (Docusaurus `i18n/<locale>/`, Starlight `locales`/`src/content/docs/<locale>/`, Sphinx PO where rigor/PDF wins); localize current version only unless demand proves otherwise; deploy locales independently; fallback always labeled. CJK needs extended-search-build verification.
- Migration/export: source stays portable (Markdown/MDX preferred for 60-engineer friction; AsciiDoc/rST only with explicit platform decision); export = versioned HTML bundle + PDF for release/compliance + offline search bundle or index snapshot + manifest. Anchors/version labels must survive round-trip.
- Hosted search (Algolia DocSearch) only if public/firewall permits; otherwise self-hosted Typesense/Meilisearch or static Pagefind. Weekly-crawl staleness is incompatible with frequent releases unless run-your-own with tag triggers.
- Disagreement preserved: platform choice is genuinely open (options a–f above); q2 does not force one. Vector search is optional inside scoped retrieval, not a foundation.

## Uncertainty

- Target locales (CJK?) decide extended search build and gettext-vs-filesystem weight.
- Firewall/public status decides hosted-search viability.
- Source-format preference decides Antora/Sphinx vs Markdown-family weight.
- Retention policy bounds build/index cost and stale-contradiction load.
- Whether Backstage already exists decides TechDocs-as-shell vs standalone portal.
- Optimal result count/snippet shape awaits V1/V2/V8 evidence.

## Validation: executed vs proposed

Executed: public primary-source reads via web_fetch in-window (16 sources, excerpts in sources/, map in source-map.json). No runtime, no witness, no sandbox execution — no qualified sandbox was available and arbitrary execution is out of scope. No usage/billing observed (null). No validation proposal below has run; claiming otherwise would be dishonest.

Proposed (discriminating; for build/test stage):
- V1 Released-version scoping: seed v1+v2 with deliberately different passages; from v1 UI assert only v1 excerpts/links. Discriminates per-version bundle vs filter correctness.
- V2 Citation integrity: assert every hit carries version+locale+path+anchor+hash and the anchor resolves to the quoted passage in built HTML. Fails on drift/rewrites.
- V3 Fallback honesty: request untranslated page; assert fallback badge + correctly labeled excerpt in page and search.
- V4 Contradiction without rewrite: inject terminology + cross-version conflicts; assert queue shows both cited passages and zero source files auto-modified; report Vale precision/recall.
- V5 Release-cut rehearsal: tag a test release, run tag→snapshot→build→index→alias twice; assert idempotence, `latest` correctness, old-link redirect/resolve, scope update.
- V6 Export round-trip: export HTML+PDF+offline index; assert anchors/labels/citations survive and offline search passes V1 probes.
- V7 CJK check (conditional): assert CJK queries segment and return excerpts under extended build; fails on default binary.
- V8 Usability: maintainer triages 10-item queue; author previews PR; reader finds released answer ≤3 clicks with version badge. Includes unfamiliar/cross-version/multilingual probes, not ten familiar questions.

## q1 join contract (cross-topic deps)

q2 owns: version/locale/codebase selector UX, scoped query construction, citation rendering, contradiction queue, export UX. q1 owns: artifact/index stores, hosting, cache, auth, tag→build→index pipeline mechanics. Shared contract: version-locale-codebase-release_tag key set; passage locator format (path+anchor+hash); manifest (doc version → code tags); per-version vs filtered-index choice with matching router behavior. Either scoped design (a)/(b) satisfies the contract; the choice is recorded as a user decision with validation V1/V5 as tiebreakers.
