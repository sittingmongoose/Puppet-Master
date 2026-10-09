# S07 documentation-portal — research-q1 draft (architecture / data / storage / transport)

Control parallel investigator q1 planning deliverable for this scope. Covers
the FULL brief's architecture/data/storage/transport obligations plus
governing implementation/evolution conditions and cross-topic dependencies.
Complementary q2 covers product workflow/options and validation; the two
drafts TOGETHER cover the brief — this half alone is not a final.

Sources S01..S07 are defined in source-map.json with retained excerpts in
sources/ and navigable sources/index.md. Discovery.md is frozen and was NOT
rewritten after reveal. Disposition labels used below: CORRECTION, OPTIONAL
ENHANCEMENT, USER DECISION, ALREADY-COVERED, REJECTED, UNCERTAIN.

## 1. Exact per-P disposition (O4)

Thin plan text (revealed-plan.md, frozen): "P1: Crawl main branches nightly.
P2: Put every chunk in one vector index. P3: Answer with the top five chunks
and links. P4: Let maintainers approve suggested rewrites. P5: Keep old
documentation pages separately. P6: Test by asking maintainers ten familiar
questions."

### P1: "Crawl main branches nightly" — CORRECTION

The clause as written ingests the wrong corpus: main branches hold
unreleased/current content (S01: working `docs/` is always the unreleased
version), so a main-branch crawl answers from docs the reader's release may
not have. It directly violates "search should return the relevant released
version".

Corrected form: ingest per-RELEASE content — git tags/refs aggregated at
build (Antora model, S02) or per-release snapshots (Docusaurus
`docs:version`, S01) — with every stored unit carrying its release
coordinate (version + codebase + locale). A nightly main-branch crawl is
retained ONLY as a clearly-labeled draft/preview corpus, never the default
released scope. Crawl cadence itself (nightly vs per-release-tag trigger) is
a USER DECISION: tag-triggered builds fit "frequent releases" better than
nightly polling, but either is acceptable once the corpus is release-pinned.

### P2: "Put every chunk in one vector index" — CORRECTION

A single unscoped index cannot satisfy version-correct retrieval: without a
version/codebase/locale scoping rule, queries mix passages across releases.
Corrected forms (two retained architectures, section 2):

- (a) Static per-build index with enforced filters: Pagefind post-build
  index over versioned HTML with `version:`/`codebase:`/`locale:` filters
  (S03 `data-pagefind-filter` mechanics), default query pre-filtered to the
  reader's release.
- (b) Shared server index with enforced scoping: every document carries
  version+codebase+locale fields and the backend mints short-lived
  tenant tokens embedding the reader's filters (Meilisearch model, S04);
  tokens restrict the search endpoint only, admin/indexing stays backend-held.

Further corrections inside P2: (i) chunking must preserve citable passage
boundaries and stable anchors — arbitrary fixed-size chunks break exact
citation; (ii) vector-only retrieval weakens exact-passage matching, so
retain keyword/hybrid retrieval or stored verbatim passages alongside
vectors. Embedding-model selection and chunk-size tuning are UNCERTAIN
(unobserved in q1 window; q2-owned) — no model is named here.

### P3: "Answer with the top five chunks and links" — CORRECTION + ALREADY-COVERED (in part)

"Top five" is an arbitrary fixed count; a score/threshold + version-filter
rule is the corrected retrieval contract (fixed-k truncates good sixth
passages and pads with bad fifths). The citation half is corrected to:
every cited passage resolves to its exact released-version page + anchor,
with version-pinned URLs (S01 versioned paths / S02 version-coordinate
resource IDs); unpinned `main`-branch links are linted as rot (discovery
section 4). The "links" half is ALREADY-COVERED by the versioned-URL
mechanisms above — no new invention needed, only the pinning rule.

### P4: "Let maintainers approve suggested rewrites" — REJECTED (with replacement)

Rejected for this brief. The brief requires helping maintainers "see
contradictions without silently rewriting documentation". Approval-gated
rewrite suggestions keep a write path from retrieval to stored docs and
normalize machine rewriting of versioned truth; even with approval clicks,
this is the wrong architecture (and approval fatigue makes it silent in
practice).

Replacement (correction): a READ-ONLY contradiction surface — cross-version/
cross-codebase match comparison ("this passage differs in v2.3 vs v2.4",
each side an exact cited passage), plus optional lint-style review queues
(Vale/textlint-class rules or similarity flags). No write path exists from
the contradiction view to stored docs. OPTIONAL ENHANCEMENT: suggestions may
be offered as review items applied ONLY through the normal documentation PR
process, never written back by the portal.

### P5: "Keep old documentation pages separately" — CORRECTION (underspecified, direction right)

"Separately" says nothing about retrievability, scope, or retention, so it
cannot be implemented as written. Corrected form: old releases are retained
as a FIRST-CLASS versioned corpus — snapshots (S01), git refs (S02), or
version-tagged documents (S04) — EXCLUDED from the default reader scope and
EXPLICITLY searchable under a cross-version scope for maintainers (the input
to the P4 contradiction view). Public-SEO hiding of old versions (noindex,
S06 lead) must NOT propagate to internal search config. Retention depth (how
many releases stay built/searchable) is a USER DECISION with direct
storage/index-size cost.

### P6: "Test by asking maintainers ten familiar questions" — CORRECTION, q2-owned

Ten familiar questions cannot discriminate the brief's hard requirements
(version-correctness, citation exactness, contradiction recall): familiar
askers guess the intended version and overlook wrong-version passages. The
validation DESIGN is q2's scope; q1's binding input is that validation must
include architecture-discriminating probes (section 5, P-V1..P-V6), notably
version-confusion probes (same question, answer differs by release),
citation-resolution checks, and cross-version recall measurement. Disposition
is CORRECTION of method, with detailed test design deferred to q2 (not
decided here).

## 2. Retained architecture (self-contained, q1 scope)

Storage (git is the source of truth; every index is derived and rebuildable):

- Option A — snapshot versioning (S01): `docs:version` freezes full-tree
  snapshots; simple for Markdown teams; cost grows ~linearly per release;
  three codebases need a sync/copy pipeline or a docs monorepo.
- Option B — git-ref aggregation (S02): playbook + per-ref `antora.yml`
  version keys; docs live beside code and tag with releases; best fit for
  three codebases × frequent releases; imposes AsciiDoc.
- Option C (retained alternative) — database wiki (Wiki.js/BookStack/
  Outline/Confluence class): content in DB rows, history as revisions;
  "released version" must be modeled explicitly via snapshots/exports;
  weakest code/release linkage; acceptable only with a snapshot/export
  design (q2 workflow decision).

Retrieval (default scope = reader's release; cross-version scope explicit):

- Default R1 — Pagefind static index (S03): zero search infrastructure;
  index ships with the site; `version:`/`codebase:`/`locale:` filters
  enforced by the UI template; internal access gated at the hosting/SSO
  edge since static files carry no per-user scoping.
- Upgrade R2 — Meilisearch tenant-scoped search (S04): stateful service +
  indexing pipeline; per-session backend-minted tokens embed version/
  codebase/locale (and team-visibility) filters; justified by scale,
  faceted analytics, typo/synonym tuning, or per-team visibility rules.

Multilingual (S05): locale-scoped file storage; locale as a first-class
retrieval facet in R1 and R2; reader-locale → source-locale fallback with a
stale-translation badge as portal logic; translation staleness computed by
git diff against the source locale feeds the contradiction view.

Code/doc linkage: only release-pinned links (tag/version coordinates)
satisfy version-correctness; unpinned `main` links are linted as rot
sources. Antora resource IDs pin by construction; Docusaurus pins by
versioned-URL convention; wikis pin only by manual discipline.

## 3. Governing conditions and evolution chains

- Docusaurus maintainer condition (S01): versioning suits high-traffic,
  rapidly-changing docs; it raises build time and contributor complexity —
  adopt deliberately, and prune to supported releases.
- Antora condition (S02): version identity = `antora.yml` version key per
  ref; playbook ref patterns select versions; sorting/prerelease rules
  govern "latest" resolution — configure, don't assume.
- Pagefind condition (S03): index is per-build static output; UI layer
  churns faster than the index contract (1.5.0 Component UI REPLACES the
  Default UI — release-evolution Chain A): pin versions, treat UI upgrades
  as visible changes.
- Meilisearch condition (S04): tenant tokens scope search only; indexing/
  settings/keys stay behind backend admin keys; tokens short-lived,
  minted per session.
- Chain B (S06, LEAD): cross-version canonical-tag request reportedly
  wontfix with a noindex/sitemap mitigation — internal search must index
  old versions even where public SEO hides them. Unconfirmed; q2/critic to
  verify against the primary issue + sitemap-plugin docs.
- Chain C (S07, LEAD): downstream `useDocsVersion()` fix (`version` →
  `name` on GlobalVersion) — version-aware UI must program against the
  typed contract; verify via P-V6 typecheck.

## 4. User decisions, optional capabilities, disagreements, uncertainty

User decisions (research cannot make): (a) docs-in-code-repos vs
docs-monorepo; (b) releases retained built/searchable; (c) auth placement
(edge SSO vs app-level scoping); (d) source locale + fallback display
policy; (e) AsciiDoc vs Markdown authoring; (f) crawl cadence (tag-triggered
vs nightly) once release-pinned.

Optional capabilities (enhancements, not requirements): faceted analytics
("which versions mention X"); synonym/typo tuning; per-team visibility
scoping; lint-rule review queues; stale-translation badges; draft/preview
corpus from main branches.

Disagreement preserved: snapshots (A) are simpler to adopt but sprawl with
three codebases × frequent releases; git-ref aggregation (B) fits the
release shape but imposes AsciiDoc. No forced consensus; synthesis must
carry both with costs.

Uncertainty preserved: Typesense scoped-key exact shape (unobserved after
404s); Chain B primary text/issue number (unobserved); Chain C upstream
type text (unobserved); CJK/analyzer quality per engine (unobserved);
Pagefind index size at this corpus scale (unmeasured); Meilisearch
single-node sufficiency at 60-person load (unmodeled, likely fine).

Original constraints honored: 60-person group, three codebases,
multilingual notes, frequent releases, version-correct search, exact
citations, contradiction visibility, NO silent rewriting (P4 rejection is
the load-bearing reading of that constraint).

## 5. Validations: executed vs proposed (O6)

EXECUTED (read-only web observation 2026-10-09 ~18:25–18:28 UTC; no runtime,
no witness sandbox available — no executed code checks exist): E1 Docusaurus
versioning+i18n primary docs (S01, S05); E2 Antora versioning docs (S02); E3
Pagefind filtering+indexing docs (S03); E4 Meilisearch tenant-token model
(S04); E5 issue/fix background search → one primary evolution chain (S03
banner) + two honesty-noted leads (S06, S07).

PROPOSED discriminating validations (none executed; each discriminates
between retained alternatives): P-V1 storage-scale pilot (3 components × 5
releases in A and B; build minutes, bytes, author steps); P-V2 retrieval
correctness (version-scoped queries never leak; citations resolve; R1 vs
R2); P-V3 multilingual recall in the group's real languages (R1 vs R2);
P-V4 linkage-rot lint after a simulated release; P-V5 contradiction-view
timing + read-only proof (no write path from view to store); P-V6
typecheck of version-UI code against installed Docusaurus GlobalVersion.
"No runtime available" is stated honestly; nothing proposed is represented
as run. Detailed test design (including P6's replacement) is q2-owned.
