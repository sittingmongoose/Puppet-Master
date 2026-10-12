# Independent Critique — Portable training handbook

**Run/stage:** B10-P02-control / critic  
**Released plan:** SHA-256 `9dd516db81413121e2bdacf096072668379c7d1d4e1169f0d16489a2f1a10fe6`  
**Scope reviewed:** the frozen brief; investigator `discovery.md`, `draft.md`, `source-map.json`, `revealed-plan.md`, `plan-reveal.json`, and `sources/index.md). No parent history, other candidates, or unlisted case files were consulted.  
**Independent check:** Read the carried source index and reopened governing primary documentation, W3C standards/guidance, pinned Pandoc implementation/caller/tests/release notes, MkDocs 1.6.1 index code, and the Quarto issue report. See this stage’s `source-map.json` and `sources/index.md`.

## Overall assessment

The investigator package is a careful, appropriately conditional proposal. It covers the original brief and gives an explicit disposition to every released-plan clause. Its central correction—keeping completion tied to an exact exercise revision instead of carrying a single boolean forward by default—is sound against the brief’s requirement that an old completion not imply completion of a materially changed exercise. The proposal also preserves user decisions where evidence cannot determine policy.

I found no material wrong claim or material scope omission. One **minor locator/wording** issue is listed below. The choices of authoring product, hosting, supported devices, archive policy, materiality rule, and review roles remain proposals or owner decisions; the draft does not falsely present them as settled facts. This critique does not authorize or perform a final rewrite.

## Released-plan disposition review

| Released-plan clause | Draft disposition and independent assessment |
|---|---|
| P1: structured, versioned lessons, diagrams and exercise IDs | Accepted and strengthened with immutable lesson/exercise revisions and status metadata. This covers maintainable content history and is consistent with the brief. |
| P1: import supported text, review preview, then package | Accepted with a constrained Word import and unpublished review draft. The loss warning is properly qualified by Pandoc’s intermediate representation and option-dependent DOCX styles (C04–C06). |
| P1: separate local progress, no account/upload | Accepted with origin-scoped local storage and explicit no-sync/data-loss boundaries. The proposal separates content/cache/index from progress and marks network/privacy checks as proposed, not executed (C09–C11). |
| P1: searchable current/retired context and inspectable history | Accepted with status, version/date, successor and current-first presentation. Ranking, retention, and default filtering are correctly left for an owner. The Quarto dashboard issue is kept scoped to dashboard pages (C12). |
| P2: stable exercise ID across revisions | Accepted as logical identity, paired with a distinct revision ID. This is the necessary distinction for retaining history. |
| P2: completion carries forward unless an author flags reset | Correctly rejects the default. Completion is revision-specific; any nonmaterial carry-forward is an explicit, reviewed policy option. This is a defensible response to the brief, while the exact materiality threshold remains a training-owner decision. |
| P2: authors detect material change; one boolean is sufficient | Correctly rejects both assumptions and recommends history plus rationale/review. No source can define the group’s instructional materiality policy, and the draft says so. |
| P2: edited-exercise and retired-search policies unresolved | Proposes conservative defaults while retaining the decisions that need owner approval. This is more useful than leaving all behavior unspecified and does not claim policy authority. |
| P2: package updates replace lessons but not learner store | Accepted with a separate progress store and proposed migration/rollback validation. The difference between ordinary content replacement and any future schema migration is clear. |
| P3: keyboard navigation via headings/links; separate diagram alternatives | Accepted and strengthened with semantic order, visible focus, keyboard operation, and complete text equivalents for complex instructional diagrams. This is supported by WCAG and WAI guidance (C07–C09). |
| P3: printable handout plus offline reading | Accepted as distinct outputs: a cached web app for offline interactive reading and a separately tested EPUB/PDF or HTML bundle. The proposal avoids promising parity for forms or progress. |
| P3: one renderer preserves order/alternatives across outputs | Correctly rejects the unsupported assumption and requires separate output checks. Quarto itself warns that its PDF configuration cannot guarantee accessibility (C07). |
| P3: investigate actual format/AT support | Preserved as future validation; no claim that it was performed. |
| P3: Word formatting may be reduced with losses shown | Accepted and operationalized as a limited, reviewed import. Pinned DOCX code and tests support conditional custom-style behavior, not arbitrary layout fidelity (C04–C06). |
| P3: update, progress, exercise, search, import, accessibility and print tests | Preserved and expanded. All remain proposed except reading documentation and inspecting repository tests; those tests were not run. |
| P3: no package publication or real learner-data inspection; begin with synthetic content and one author | Preserved. The draft makes no deployment or processing claim and adopts the staged, synthetic workflow. |
| P4: provisional plan; answer from primary evidence and retain unanswered questions | Preserved. Evidence, recommendations, proposed checks and owner decisions are separated. |

## Original brief coverage

All obligations have a proposed disposition: compare structured Markdown/book tooling, MkDocs, controlled Word import and a GUI editor; separate authored content, public release assets, cached app content/search and learner progress; support offline reading, topic search, revision-aware progress, retired/version context, keyboard access, reading order and diagram alternatives; constrain import and inspect output fidelity; add a modest author review; provide a static handout without claiming interactive parity; and phase adoption behind accessibility/update validation. The negative constraints—no learner account, progress upload, text-as-image instructions, false print/app parity, publication, volunteer installation, or actual learning-record processing—are explicitly retained.

The draft offers useful alternatives without declaring a winner. It identifies the conditions behind those alternatives instead of presenting a build tool as the whole app: Quarto supports multiple book formats and local website search, but its local index does not demonstrate offline readiness (C01–C02); MkDocs’ direct `file://` guidance has search, URL and CDN conditions (C03); Pandoc’s DOCX path is lossy and custom-style retention is conditional (C04–C06); and a CMS remains unevaluated pending author workflow evidence.

## Findings

| Classification | Locator | Assessment and evidence |
|---|---|---|
| **Minor locator/wording** | Draft, “Evidence, uncertainty and owner decisions” | The closing citation range says `[S01–S17]`, although the same draft relies on S18 for the MkDocs 1.6.1 search-index implementation. S18 exists in the carried source map and is not silently rebound. This is a citation-range omission only; the claim itself is supported by the pinned source (C17). |

No material-wrong or material-incomplete issue was identified. No correction is required on the basis of this critique.

## Conditions, applicability and evidence quality

- Quarto’s official book guide lists HTML, PDF, Word and EPUB, and HTML books inherit website full-text search. Website search defaults to a locally built index. That does not itself prove local-file operation, a complete offline cache, or offline first use; the draft states these limits (C01–C02).
- MkDocs’ offline guide applies its `file://` caveat specifically to file-distributed sites: it calls for appropriate URL settings, disabled or compatible search, relative links, and bundled theme assets. The draft does not generalize that limitation to hosted HTTPS/PWA use (C03).
- Pandoc’s current manual warns that its intermediate model is less expressive than many source formats, specifically mentioning complex tables and formatting details. At the pinned 3.12.1 tag, the DOCX reader conditions custom-style attributes on `Ext_styles`; focused tests compare default and enabled output. These are implementation and regression-test observations, not a demonstration of arbitrary Word fidelity or an executed import (C04–C06).
- The 3.12.1 release notes record a data-URI escaping regression fix affecting `--embed-resources`. The draft uses it as an upgrade-fixture reason, not as evidence that the handbook’s assets are broken (C06).
- MDN describes HTTPS (with localhost for development), selected install-time caching, and a replacement worker waiting while the old worker still controls open pages unless `skipWaiting()` is used. IndexedDB is origin-scoped and does not itself synchronize with a server or provide full-text search; browser storage is best-effort by default and can be cleared or evicted. These conditions support the draft’s explicit cache, origin, local-data and loss limits (C09–C11).
- WCAG 2.2 supplies the normative keyboard and non-text-alternative requirements. WAI image and APG pages are implementation guidance; APG specifically describes keeping tab sequence and screen-reader reading order aligned. The draft labels WCAG as normative and APG as informative, and does not claim conformance (C08–C09).
- Quarto’s PDF page supports PDF/UA settings and `fig-alt` propagation but says Quarto cannot on its own guarantee accessibility and recommends validation. A generated PDF still needs human and tool review (C07).
- The open Quarto issue reports omitted `search.json` or dashboard pages from the search index for dashboard-only/mixed websites. It is a reporter’s issue, not a reproduced test or proof about ordinary HTML lessons; the draft preserves that narrow scope (C12).
- Pinned repository tests were inspected, not run. The proposal’s browser, import, export, privacy, accessibility and update checks remain proposed. No prototype, package, app, browser session, user test or sample conversion was produced in the investigator stage.

## Critique-stage work and limits

I reviewed the complete required investigator package and independently opened the governing evidence recorded in this stage’s source map. I did not run an application, conversion, repository test, browser, accessibility audit, or export; those would test a nonexistent proposal artifact and are not represented as completed. The critique is an assessment only; it does not edit or repair the investigator draft.