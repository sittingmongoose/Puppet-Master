# Research-backed proposal — portable training handbook

**Run/stage:** B10-P02-control / investigator  
**Released plan:** 2026-10-12T00:41:14.780Z; plan SHA-256 `9dd516db81413121e2bdacf096072668379c7d1d4e1169f0d16489a2f1a10fe6`  
**Discovery frozen before reveal:** `c2fc7c6bc8a8f8c67624b5b6d63c5de2e4853867e4dbe19217f6bb8a8a00d01e`  
**Status:** research and design proposal only. No product implementation, content publication, volunteer installation, or learner-data processing occurred.

## Recommendation

Use versioned, structured lesson content as the source of truth, build an immutable content release with a generated local search index and separate handout outputs, and keep learner progress in a browser-local store keyed to the exact exercise revision. Treat Quarto Book and MkDocs as candidates for the authoring/build layer, not as complete learning apps. Quarto is a useful first candidate when HTML, PDF and EPUB outputs matter together; its documentation does not establish offline first-load behavior or provide the required progress semantics. MkDocs is a documentation-first alternative with client-side search, but its direct `file://` guidance requires search to be disabled or replaced. A small authoring pilot should decide between those and a GUI content editor before a vendor or stack is selected. [S01–S04]

The core architecture should be independent of the authoring product:

```text
lesson source + diagrams + stable IDs + review metadata
                   |
         preview / checks / sign-off
                   |
      immutable release manifest and build
       /            |              \
 HTML + local index  PDF/EPUB       versioned release assets
       |                               |
 HTTPS app shell + service worker cache |
       |                               |
       +-- local IndexedDB progress ---+
             (no account, no upload)
```

Store only the learner's exercise state needed for the feature (exercise ID, completed revision ID, state and timestamp if useful). Do not place learner progress in page URLs, search analytics, release assets, or network request bodies. The content/search index and the learner database are different stores: IndexedDB is origin-scoped structured object storage, does not synchronize with a server, and is not a full-text search engine. [S10, S11, S17]

## Evidence-backed alternatives

| Approach | Strengths for this brief | Conditions and limits |
|---|---|---|
| **Quarto Book / structured Markdown** | One chapter-oriented source can render HTML, PDF, Word and EPUB; HTML books support website search. Search defaults to a locally built index. Useful where a printed or e-reader handbook is a first-class output. [S01, S02] | A local search index is not a PWA guarantee. A service worker, app progress UI, version/status labels and revision-aware completion remain custom work. Quarto's PDF guidance explicitly says it cannot guarantee accessibility. Dashboard pages have an open search-index issue; use ordinary HTML pages unless a pinned build proves dashboard search. [S05, S09, S12] |
| **MkDocs / docs-oriented Markdown** | Static output is easy to package, and MkDocs 1.6.1 source creates a JSON index from page text and headings; a simple documentation information architecture fits repair topics. [S03, S18] | Its own offline guide says direct `file://` viewing needs built-in search disabled or a compatible plugin and warns about theme assets loaded from CDNs. It is not a complete offline exercise app or a documented multi-format book pipeline; extra export/application pieces must be maintained. [S03] |
| **Word-first with controlled Pandoc import** | Preserves an authoring environment familiar to authors who already draft in Word and can help with initial migration. Pandoc's public reader registry routes DOCX to a binary reader, and the release has explicit default and `+styles` tests. [S04, S13, S14, S16] | Pandoc warns conversions can be lossy because its intermediate model is less expressive. `+styles` retains custom style names as attributes; it does not promise page-layout or arbitrary Word fidelity. Import must produce a reviewable draft and list losses. [S04, S13, S14] |
| **GUI CMS / structured editor** | Can lower the markup/Git barrier and make required IDs, status and alternative-text fields visible in forms. | No particular CMS was evaluated and the brief does not establish author skills, hosting, identity needs or maintenance capacity. A CMS adds its own editor/runtime and backup/update duties. Require clean versioned export and compare a small author workflow before selecting it. This is an owner decision, not a sourced product verdict. |

**Distribution alternatives:** A hosted HTTPS progressive web app can cache the application shell, content, images and generated search index for offline use after a successful download. Service workers need a secure context; the browser may keep an older worker controlling open pages while an update waits. The app therefore needs an explicit “release ready offline” state, cache versioning and an update/rollback policy. [S09] A downloadable EPUB or PDF gives install-free offline reading, while an HTML folder/ZIP may be portable only if its search and links work in the target browsers when opened locally. MkDocs documents a `file://` search limitation; Quarto's local index documentation is not evidence of local-file execution. Test this path before promising it. [S01–S03] A printed PDF is a static handout: it can show exercise prompts and writing space, but it does not contain the app's saved state or interactive behavior.

## Data and version boundaries

### Authoring and published content

Keep lesson sources, diagram files, exercise definitions and release metadata in versioned author-controlled storage. A generated release should have an immutable release ID/date and a manifest that ties every lesson and exercise to its own revision. The app downloads only public lesson assets. Build-generated search data should include version/status fields rather than flattening several editions into indistinguishable results.

Proposed identifiers and state:

- `lesson_id`: stable logical topic identifier; `lesson_revision`: immutable content revision.
- `exercise_id`: stable logical exercise identifier; `exercise_revision`: the specific task and success criteria.
- `lesson_status`: current, retired or superseded; for a retired/superseded lesson, expose retirement date and a replacement link where one exists.
- `completion`: local record tied to `(exercise_id, exercise_revision)`, not a global boolean attached to the stable exercise ID.

### Learner progress

IndexedDB is a plausible store for this small structured local state. It is scoped to an origin, so keep the app on a stable HTTPS origin: changing protocol, host or port creates a distinct origin and does not move the old database. This data remains on that browser/device profile and is not shared across devices. IndexedDB itself does not sync records. [S17] Browser data is best-effort by default; a user can clear it, a private session may remove it, and browsers may evict it under storage conditions. Persistent-storage requests vary by browser and do not justify promising permanent retention. Tell learners progress is local and may be lost; offer an explicit reset. A local export/import file could improve portability, but it creates a separate privacy and support decision and is not required by the brief. [S11, S17]

Keep static lessons and offline cache distinct from the database. Do not store account identifiers, names or demographic data; do not add an account, progress upload, cloud sync or progress analytics. A local content/search download can make normal network requests, but no request should contain the personal completion record. If the group later asks for cross-device sync, that is a new data-boundary decision, not an implicit feature.

### Exercise changes and lesson retirement

Correct the plan's carry-forward default. A completion proves completion of one exercise revision. If that revision changes, keep its old completion visible as historical and show the new revision as not completed until the learner completes it. Do not make a single mutable `completed` flag silently apply to the replacement. [S17 supports local structured record boundaries; the materiality rule below is a product policy recommendation.]

To avoid forcing repeat work for cosmetic edits, propose a controlled compatibility declaration: authors classify a change as (a) text/layout only with no change to instructions, hazards, equipment or success criteria, or (b) changed task/criteria. A carry-forward is allowed only for the first category, with a short rationale and review approval; category (b) always creates a new exercise revision with a new completion. A content owner must approve this materiality threshold and decide whether any other edit is nonmaterial. Until that policy is agreed, default to no carry-forward. Preserve the earlier completion record either way.

Keep old lesson versions inspectable and mark them `retired` or `superseded`; link them to the current replacement and say why/when they changed when authors have that information. The search UI should show a clear current/retired label, release/version and date, and lead with the current result. This metadata/result presentation is a product requirement, not a claim of built-in Quarto/MkDocs behavior; implement it in the generated index/template or application and test after upgrades. A proposed default is to keep relevant retired matches available but visibly marked and lower-ranked, with a current-only filter. The owner must decide retention duration, whether retired content remains searchable by default, and who approves retirement. This avoids presenting every historical match as current without silently erasing history. [S02, S12]

## Import, review and output fidelity

Treat pasted Word material as an import into a limited lesson schema, not as an arbitrary format round trip. Pandoc's source and tests show that DOCX is dispatched through the reader registry and that custom styles are handled differently with and without the `+styles` option; its manual warns the intermediate representation loses some source distinctions. The 3.12.1 release notes also record a fix to a regression in embedded data-URI escaping, reinforcing that imports and embedded assets should be retested on toolchain upgrades. [S04, S13–S16]

Before adoption, define and test an accepted subset such as semantic headings, paragraphs, numbered/bulleted steps, links, simple tables and images with separately reviewed alternatives. Do not promise support for arbitrary Word layout, floating objects or style fidelity before a fixture proves it. Unsupported constructs should be called out to the author rather than quietly dropped. A Word import should land as an unpublished draft; the author checks structure, link targets, table reading order, diagram assets/alt text and rendered HTML/PDF preview.

Generate a printable handout from the approved source, but validate the actual PDF separately. Quarto can request PDF/UA tagging and propagate `fig-alt`; its documentation says it cannot guarantee accessibility and recommends validation and manual attention. Run a PDF validator such as the documented veraPDF option and inspect the reading order, page breaks, diagrams and captions with a human reviewer. In HTML, keep selectable text and real controls for instructions/exercises. Do not put required directions into an image. Print output should make clear that form controls, answer persistence and current-version status are not equivalent to the interactive app. [S05–S07]

## Accessible page and exercise requirements

- Use semantic headings, page title, landmarks, ordinary links and native form controls in logical document order. Tab/focus order and screen-reader reading order should agree; make every action keyboard-operable and focus visible. WCAG 2.2 is the normative reference for text alternatives and keyboard operation; WAI-ARIA APG provides implementation guidance about aligning DOM, tab and reading order. [S06, S08]
- Give an informative diagram concise alternative text and an adjacent complete textual explanation when it conveys multiple steps, relationships or safety details. A table or ordered list may be a better long description. WAI's tutorial specifically calls for a complete text equivalent for complex graphs and diagrams. Use text as the instruction itself; do not replace it with an image of text. [S06, S07]
- Make required metadata reviewable: lesson/exercise IDs and revisions, current/retired state, alt text or long-description link, and the reviewer checklist result. Automated missing-alt, heading, link and build checks can catch some omissions, but they cannot decide whether an alternative explains the repair procedure or whether a screen-reader sequence is useful.

## Modest author review before distribution

1. Author edits/imports a lesson and checks the structured source plus generated preview.
2. A reviewer checks the lesson/exercise revision diff, current/retired status and replacement link; checks image alternatives, links, headings, keyboard flow and any materiality declaration.
3. Reviewer samples the HTML page and the printable output, confirms that the handout does not claim to preserve app state, and records a simple approval/status.
4. Build checks report missing IDs/duplicate IDs, broken local links/assets, missing required alternatives, and omitted release metadata. Produce a release package only from approved inputs.

This can be a checklist and small review record; it need not introduce learner accounts or an elaborate workflow system. Whether the group requires a second person for every lesson or only for safety-sensitive edits is an owner decision.

## Complete disposition of the released plan

| Released-plan clause | Disposition |
|---|---|
| P1: Lessons are versioned structured pages with headings, paragraphs, diagrams and exercise IDs. | **Accept and strengthen.** Add immutable lesson revision/release IDs, diagram alternative/long-description fields, exercise revision IDs, lifecycle status and successor metadata. |
| P1: Authors import supported text and review a rendered preview before creating a package. | **Accept with limits.** Define the Word subset and unsupported cases; import to an unpublished draft, show losses, and require HTML plus print preview review. |
| P1: Progress is separate/local; no account or upload. | **Accept.** Use a stable app origin and local IndexedDB; specify per-browser/device scope, no sync/network writes, data-loss disclosure and reset. |
| P1: Search includes topic terms and current-or-retired label; historical lesson versions remain inspectable. | **Accept and make explicit.** Show release/date/status and replacement links, current results first; expose a current-only filter while retaining clearly marked archived matches if owners approve retention. |
| P2: Exercise ID stays stable across revisions. | **Accept as logical identity only.** Preserve a stable exercise ID and add an immutable exercise revision ID for each changed task/criteria. |
| P2: Completed status initially carries forward unless the author flags reset. | **Correct/reject default.** Never transfer completion implicitly. A changed revision starts incomplete; only an owner-approved, reviewed nonmaterial compatibility declaration may carry it forward. |
| P2: Authors can recognize every material change and a boolean captures enough history. | **Reject as an assumption.** Keep revision-specific completion history and explicit change rationale/reviewer; define materiality with the training owner. |
| P2: Edited-exercise and retired-search policies are unresolved. | **Resolve in proposal, retain owner decisions.** Proposed defaults are no completion carry absent explicit compatibility and current-first results with labeled retired results. Owner must approve thresholds, retention and default filter. |
| P2: Package updates replace lesson assets but not the learner store. | **Accept with a boundary.** A normal content release must not reset progress. Any future database-schema migration is separate, transactional, versioned, rollback-tested and must preserve old revision records. |
| P3: Keyboard navigation follows headings and explicit links. | **Accept and strengthen.** Require semantic DOM order, logical focus/reading order, visible focus, keyboard operation for all functions and screen-reader checks. |
| P3: Diagram alternatives are authored separately. | **Accept and clarify.** Concise alt plus adjacent full text equivalent for complex instructional diagrams; text remains the primary instruction. |
| P3: Exports include a printable handout and offline readable version. | **Accept as separate artifacts.** Evaluate a PWA for cached interactive content and EPUB/PDF or tested HTML bundle for install-free reading; describe the behavior each supports. |
| P3: One shared renderer is assumed to preserve reading order/alternatives in every format. | **Reject as unsupported.** Generate from shared content where useful but validate HTML, PDF and EPUB independently; Quarto itself warns it cannot guarantee PDF accessibility. |
| P3: Actual format and assistive-technology support need investigation. | **Accept.** Select representative browsers/readers with owners and perform manual checks before any deployment. This stage did not perform those checks. |
| P3: Imported Word formatting may be reduced to supported structures, with losses shown. | **Accept and operationalize.** Publish a supported import matrix after fixture testing; warnings and author preview are required; no arbitrary formatting guarantee. |
| P3: Proposed tests cover interrupted updates, progress migration, exercise meaning, retired search, pasted tables, keyboard/screen-reader/print review. | **Accept and expand.** Add cold offline install, complete cache, stale clients, no-network-write, storage reset, embedded resource and PDF/EPUB-specific review. All remain proposed, not executed. |
| P3: No lesson package is published and no learner data inspected. | **Accept.** This work researched and drafted only; it neither published materials nor handled learner records. |
| P3: Adoption starts with synthetic lessons and one author workflow. | **Accept.** Use a small vertical slice and one author before a limited pilot; require accessibility/update gates before wider adoption. |
| P4: Plan is provisional; answer from primary evidence and keep unanswered user-data questions open. | **Accept.** This draft distinguishes sourced behavior, recommendations, proposed checks and owner decisions; browser retention, portability and authorship needs are not inferred as facts. |

## Corrections, optional improvements and owner decisions

### Corrections to the released draft

- Replace implicit completion carry-forward with revision-specific completion. An old completion cannot be attached to a changed task unless an approved compatibility rule explicitly permits it.
- Replace the single mutable completion boolean with a record keyed to the exercise revision. Preserve history and represent “completed previous version” separately from “current version complete.”
- Remove the assumption that one renderer preserves equivalent reading order and alternatives across HTML, PDF and EPUB. Shared source can help consistency; every target needs its own validation.
- Do not imply that a static output directory, local JSON search index or successful first online build proves that a complete offline app is ready. Require an explicit cache-ready signal and offline test.
- Treat arbitrary Word formatting as unsupported until a representative fixture passes. Custom style capture is conditional on a reader option and is not visual/layout fidelity. [S03, S04, S13, S14, S18]

### Optional improvements

- Offer an opt-in learner-controlled local backup/export file only if the group accepts the data sensitivity, support burden and recovery format; keep it offline and never auto-upload it.
- Provide both an EPUB/PDF handout and the PWA only if the author pilot shows both add value. EPUB/PDF are useful install-free reading paths; their forms/progress are not the app's interactive behavior.
- Add a retired-only filter, explicit release history/change notes and an author diff view. The core brief requires clear status and history; exact UI details are optional design choices.
- Add automated build checks for duplicate IDs, missing status/revision metadata, broken assets/links and missing alternative text as early warnings; retain human review for meaning, accessibility and print output.

### Owner decisions

- Whether the authors can maintain structured Markdown/version control or need a GUI editor/CMS; who owns publishing infrastructure and runtime updates.
- Which browsers/devices and assistive technologies to support, whether a stable HTTPS-hosted PWA is acceptable, and whether install-free offline HTML is required in addition to EPUB/PDF.
- The exact definition of a material exercise change, which nonmaterial edits may retain completion, who can approve a carry-forward, and how the learner sees the old completion.
- Whether and how long retired lessons remain stored/searchable, whether current-only is default, and which replacement/date fields are mandatory.
- Whether progress needs an optional learner-controlled local export, and the retention/loss disclosures. No account, upload or cloud sync is part of this proposal.
- Handout format, review cadence/sign-off roles, and accessibility acceptance evidence before release.

## Already covered, rejected and uncertain points

- **Already covered by the released plan:** versioned structured lesson pages and exercise identifiers; local progress separated from public content; no learner account or upload; current/retired search context and inspectable history; import review and preview; keyboard navigation; separately authored diagram alternatives; a printable and offline reading path; visible formatting losses; a modest review step; synthetic content and an initial author workflow; proposed update, progress, search, import, keyboard and print checks.
- **Rejected or corrected:** carry completion forward by default; rely on an author to remember a reset flag without preserving revision history; treat an exercise's stable logical ID as proof that every revision is the same task; assume a single renderer makes all exports equally accessible; infer arbitrary Word fidelity; treat static assets/local search as automatic proof of offline operation.
- **Uncertain and not inferable from sources:** author comfort with markup, the scale of content, exact browsers/AT, local retention across browser clearing/private use/device replacement, first-run distribution with no network, policy for cosmetic/material changes, archive retention/search ranking, whether reviewers need a second approver, and whether an optional local backup is desired. These remain owner questions or pilot evidence, not technical facts.

## Original brief coverage

| Original obligation | Proposed disposition |
|---|---|
| Author instructional pages, diagrams and short exercises. | Structured pages with independent lesson and exercise revision identities; required diagram alternatives; small validated schema. |
| Learners need offline reading, topic search and personal exercise progress. | Cache released HTML/assets/index in a hosted PWA after verified first download; generate offline content search; store progress locally by exercise revision. Test install-free EPUB/HTML separately. |
| Share printable handouts with non-installers. | Produce static PDF from approved content; validate its own pagination, reading order and text alternatives. No install or learner account needed to read a handout. |
| Lesson updates must not silently erase progress. | Keep the progress database separate from content package replacement and test across release updates; surface local-storage limits. |
| Old exercise completion must not prove a materially changed one. | Completion attaches to exact revision; new task revision starts incomplete by default. Nonmaterial carry is explicit and reviewed. |
| Keyboard navigation, reading order and diagram alternatives. | Semantic headings/DOM, keyboard operation, visible focus and complete equivalent text for complex diagrams; separate HTML and document tests. |
| Search results must explain versions and retired pages. | Include current/retired/superseded status, version/date, replacement relation and clear ranking/filter. Owner confirms archive retention/default. |
| Word paste/import limits and export fidelity. | Constrain supported import; report/inspect losses; use source/test/release evidence for importer changes; no round-trip promise. |
| Modest review before distribution. | Preview-and-checklist sign-off for revision diff, links, accessibility content and both digital/print outputs; approval is a release gate. |
| No learner account or progress upload. | No identity or network write for personal progress; local state only. Do not add sync/analytics without a new decision. |
| No text as images. | Selectable text is authoritative; diagrams are illustrations with equivalent text, never the only instruction. |
| No claim of print/interactive parity. | Label static forms/handouts and independently test each output. |
| Compare alternatives and set boundaries. | Conditional comparison above; content repository, release assets, application cache and local progress are distinct. CMS versus structured text and distribution channel remain owner choices. |
| Phased adoption with accessibility and update validation. | Four-phase adoption and validation matrix below; all validation is proposed except the research/workflow artifacts listed as executed. |
| Proposal only; no publication, volunteer installation or actual records. | No implementation or deployment occurred in this stage. Future pilot requires a separate authorized decision. |

## Phased adoption

1. **Policy and selection:** Ask the content owner about author comfort, review roles, expected lesson volume, retired-content retention/search, supported devices and PDF/EPUB needs. Decide the material-change rule. Compare Quarto Book, MkDocs and a GUI editor using one same sample lesson; choose the least costly workflow that authors can actually maintain.
2. **Synthetic vertical slice:** Create only test content: one repair lesson, one complex diagram with text equivalent, one exercise with unchanged and changed revisions, one retired lesson, and a representative pasted Word table. Build web/search plus PDF or EPUB. Do not use learner data. Reject any option that silently loses content, merges status, fails offline navigation or cannot expose history.
3. **Author workflow pilot:** Have one author import/edit, preview, revise and submit the sample for review. Exercise the release checklist and produce the package. Tune supported Word constructs and author instructions based on observed losses, not assumptions.
4. **Readiness gate and optional limited pilot:** Run the accessibility, privacy, offline and update matrix on agreed browsers/devices and assistive technology; document known limits and rollback. Only after those checks and a separate owner authorization should anyone consider installing or publishing to volunteers. Do not treat this research stage as approval to publish or install.

## Validation: proposed versus executed

| Check | Proposed acceptance evidence | Executed in this stage |
|---|---|---|
| Offline first use and reading/search | On each supported browser, download a complete release online, verify a ready/offline indicator, disconnect, navigate pages and diagrams, and search current plus retired content without network requests for missing assets. Test a local ZIP/EPUB separately if offered. | Not run; no app or package exists in this stage. |
| Release/update and progress preservation | Record completion for exercise revision A in a synthetic browser profile, install a release changing lesson text and exercise B, interrupt a staged update, reopen old/new clients, and confirm the database survives and new B is not complete. Confirm rollback and database schema migration preserve records. | Not run. Service-worker guidance was reviewed; no worker or browser session was built. [S09] |
| Revision semantics/retirement | Fixture tests verify unchanged exercise keeps its status, material change does not inherit it, explicit reviewed nonmaterial declaration behaves as approved, and retired results never appear unlabeled as current. | Not run; these are proposed product rules. |
| Search build | Build pinned standard HTML pages with current/retired versions, inspect index contents/snippets/status and keyboard operation, and repeat after tool upgrade. Do not use dashboard output without a dedicated search test. | Not run. Quarto issue #14756 is an open dashboard report, not a reproduction by this investigator. [S12] |
| Word import/export | Convert a curated fixture (headings, lists, links, simple/complex tables, image, custom style, page layout) with the pinned reader; compare source and draft, assert unsupported features are surfaced, manually inspect HTML/PDF. | Repository code/registry and focused tests were read at Pandoc 3.12.1 tag; no conversion command or test suite was run. [S13–S16] |
| Keyboard/screen reader and diagram content | Manual keyboard-only traversal with visible focus; test logical reading sequence with a representative screen reader; confirm complex diagram long descriptions convey the procedure and safety conditions. Add automated checks as supplements. | Not run. WCAG and WAI guidance were read only. [S06–S08] |
| PDF/EPUB handout | Inspect page breaks, scaling, captions, text extraction, tags, alt text and reading order with human review and a PDF validator; confirm no interactivity/parity claim. Test EPUB in a named reader if selected. | Not run. Quarto documentation was reviewed; no export was produced and veraPDF was not run. [S05] |
| No progress upload and local-data limits | Capture network requests while writing/completing progress; verify records never appear in requests/URLs/analytics; clear site data and private mode to verify user-facing loss/reset behavior and origin isolation. | Not run. Architecture recommendation only; source evidence describes browser storage behavior. [S11, S17] |

**Work actually performed:** Read the supplied brief, assignment and input map; activated one native Goal before case input and passed the binding guard; read primary product/standard documentation, pinned Pandoc 3.12.1 caller/reader/tests/release notes, and the Quarto search issue; wrote brief-only discovery and source index; invoked the specified plan-release helper once and read only `revealed-plan.md`. The tests cited above were inspected, not executed. No app code, repository checkout, conversion, browser, accessibility or export validation was run.

## Evidence, uncertainty and owner decisions

Source IDs remain stable in [source-map.json](source-map.json); use [sources/index.md](sources/index.md) to navigate. W3C WCAG is normative; the WAI APG is informative implementation guidance. Quarto, MkDocs, Pandoc and MDN docs were retrieved as live documentation, not all pinned to the same product release. The actual DOCX reader/caller/tests reviewed are pinned to Pandoc 3.12.1 at commit e51c9c6. The reported Quarto dashboard issue is a user report observed open; it narrows dashboard use but does not establish behavior for ordinary HTML lessons or prove a fix. [S01–S17]

**Owner decisions still required:** (1) text/markup plus version control versus GUI CMS; (2) hosting and HTTPS origin, browser/device support, and whether install-free EPUB/HTML is required alongside PWA; (3) progress retention expectations and whether an optional local export is worth the support/privacy cost; (4) material versus nonmaterial exercise edits and review authority; (5) retired-page retention and search defaults; (6) required handout format and assistive-technology matrix; (7) distribution/release cadence and who signs off. Sources support feasibility and constraints but cannot answer those organizational preferences.

**Limitations:** No author interviews, real Word samples, output artifacts, user testing or source application existed in this stage. Documentation describes capabilities, not a tested end-to-end solution. No tool was selected or declared the winner. Proposed validation must be run against pinned versions and representative sample content before a deployment decision.