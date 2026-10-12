# Independent Critique — B10-P02-treatment

## Scope and overall disposition

Reviewed the assigned brief, the complete investigator discovery, draft, source map, revealed plan, plan-reveal record and source index. The revealed plan's SHA-256 and byte count match the one-time reveal record: 9dd516db81413121e2bdacf096072668379c7d1d4e1169f0d16489a2f1a10fe6, 2,424 bytes. I did not inspect other candidates, campaign history, or unlisted files.

The draft is a careful, scope-aligned proposal. It preserves the hard constraints, does not choose a product, and correctly rejects the plan's automatic completion carry-forward and shared-renderer accessibility guarantees. The source context I checked supports those corrections. I found no material wrong correction and no false claim that a proposed validation was executed. The findings below address two material evidence gaps, one minor condition omission, and unresolved input that the proposal already labels as owner decisions.

## Classified findings

### C1 — Material incomplete: H5P accessibility issue is missing its later version/reproduction context

**Draft locator:** “Workflow and distribution alternatives,” WordPress/H5P row (draft.md, line 41); “Research checks actually executed,” line 108; “Rejected assumptions,” line 116. The carried source record is S11.

The upstream issue remains open, but its current record is more qualified than the draft reports. A contributor responded on 2026-09-22 that they could not reproduce the missing-label behavior with NVDA on an exercise, said the report might predate the Multiple Choice content-type overhaul, and asked for the screen-reader/browser and installed content-type version. The project moved it from Backlog to Waiting for Contributor. The issue still contains a 2026-10-09 request for the reporter's information, and no linked pull request or package version is recorded. The repository Releases page has no formal releases listed, so the installed content-type version cannot be inferred from a release tag. See S11.

This does not resolve the report, reproduce it independently, or establish that every current environment is unaffected. It does mean the issue is not simply an open, unchallenged defect report: current-version behavior is specifically disputed and version details remain unknown. That condition could affect how strongly the H5P alternative is discounted. Preserve the proposed per-type/version keyboard and screen-reader test; keep this as an unresolved, version-sensitive report rather than general evidence against H5P.

### C2 — Material incomplete: export fidelity is proposed for testing but not sufficiently researched as an output contract

**Draft locators:** per-clause disposition rows for handouts and word-processor material (lines 21 and 29); “Workflow and distribution alternatives” (lines 39–43); “Print and offline outputs” (line 54); validation rows for DOCX, print and package output (lines 97 and 99).

The draft investigates DOCX reader behavior well: Pandoc's manual confirms that the reader only converts styles it can map, the styles extension preserves style markers, and the default track-changes option accepts insertions/deletions while ignoring comments. It also correctly distinguishes print from interactive behavior. But the requested export-fidelity question is not yet answered by evidence about the proposed output routes. The material says offline HTML/ZIP is promising and proposes separate HTML/PDF or word-processor output, while the validation table defers the actual comparisons. It does not specify which structures or semantics are expected to survive from the canonical content model into each output, which are knowingly lost, or which output-specific accessibility behavior must be inspected.

This is a proposal, so no converter run was required here and no test result should be invented. The gap is in the research-backed proposal: give the synthetic pilot an explicit fidelity matrix for HTML/offline and print/PDF outputs (headings and sequence, links, tables, diagram alternatives, form behavior, page breaks, and any unsupported blocks), and keep each cell marked as documented, inferred, or still to be tested. Do not imply equivalent fidelity across formats.

### C3 — Minor locator/wording: H5P package download is conditional

**Draft locator:** WordPress/H5P alternative row, line 41; source S09.

The H5P author guide says an H5P file cannot be opened locally and must be uploaded to a supporting H5P site. It also says the Download button must be enabled in Display options. The draft's exported-package limitation is correct, but its summary omits that precondition. Retain it as a configuration condition when comparing authoring/export workflows; this is not a reason by itself to exclude H5P.

### C4 — Unsupported, low consequence: “lowest installation burden” is a comparative inference

**Draft locator:** custom web/PWA row, line 42.

A browser-delivered app may avoid an installation step when it is served from a stable origin, but the claim that it is the lowest-burden option has not been established for this volunteer group. The draft later makes the trade conditional on a stable origin and unknown device/browser requirements, which limits the overreach. Treat the comparison as a hypothesis for the synthetic pilot, not a researched fact or architecture decision.

### C5 — Honestly unresolved external input: audience and governance choices

**Draft locators:** “Workflow and distribution alternatives,” final paragraph (line 45); “Owner decisions required before implementation” (lines 67–77); “Rejected assumptions and remaining uncertainty” (line 119).

Volunteer comfort with Git versus hosted editing, available maintainer time, target devices/browsers, acceptable local backup support, exercise materiality/equivalence authority, retired-content retention and search grouping, and the required accessibility conformance target are not supplied by the brief or determinable from product documentation. The draft correctly leaves them as owner decisions. They should not be silently resolved by a tooling preference.

## Brief and released-plan coverage review

| Requirement or plan disposition | Review |
|---|---|
| Maintain pages, diagrams and short exercises | Covered by structured lesson blocks, stable identities and revisioned exercises. This is a reasonable proposed model, not a product fact. |
| Offline reading and topic search; make versions/retired pages understandable | Covered with local package/search, current/retired labels, archive access, and an explicitly proposed search policy. Material's offline plugin supports local-file search but explicitly requires disabling its versioning plugin; the draft reports that limit accurately (S01–S02). Docusaurus version labels/routes and maintenance cost are accurately described, and offline search is left for proof (S03). No build or search test was run. |
| Local personal progress without learner account/upload | Covered by a separate local store, minimal fields, no answer/identity/telemetry payload, and a clear browser-storage caveat. MDN confirms best-effort is the browser default and describes persistent storage as a separate request (S08). The network boundary is a proposed acceptance condition, not an executed finding. |
| Updates must not silently erase progress | Covered by store/package separation, atomic-update or rollback requirement, and synthetic interrupted-update validation. These are design and validation proposals, not verified behavior. |
| Changed exercises must not inherit misleading completion | The correction rejects the revealed plan's reset-flag default. Exact-revision history plus owner-reviewed equivalence for non-material changes is conservative and within scope; materiality remains an owner policy. No false correction found. |
| Keyboard navigation, reading order, diagram text alternatives, no image-of-text substitute | Covered by meaningful sequence, keyboard/control/status criteria and complete text equivalents for complex diagrams. The normative WCAG and WAI sources support the cited criteria; the draft does not claim that a generator or proposed checklist proves conformance (S06–S07). |
| Printable handouts for non-installers and no print/interactive equivalence claim | Preserved as a static, readable handout with separate QA and no progress-persistence claim. Output fidelity remains finding C2; there is no evidence of an actual generated handout. |
| Word-processor paste/import limits and export fidelity | DOCX import limits and tracked-change/comment defaults are well supported by Pandoc's manual and release history (S04–S05). The export side remains materially underspecified as described in C2. |
| Modest author review before distribution | Covered as author preview plus second-volunteer review and a recorded release checklist. GitHub review and WordPress draft/preview are presented as workflow options, not conformance proof. |
| Compare feasible authoring/storage and offline/export approaches; propose phased adoption | Git/Material, Docusaurus, WordPress/H5P, browser-local web and native/SQLite routes are compared without a winner. Phase 0–3 uses synthetic material and maintains the no-publication/no-install boundary. Local SQLite transaction guarantees are not misrepresented as backup or sync guarantees. |
| No publication, volunteer installation, or actual learner-data processing | Preserved throughout. The proposal correctly separates future authorization from this research task. |

## Evidence and validation status

I independently checked the governing primary or official context catalogued in the critic source map. The consequential negative/default claims about Material's offline/versioning restriction, Pandoc's DOCX behavior, browser storage, H5P export/accessibility, and the historical Material maintenance statement were checked with their stated conditions. Material's 2025 feature-freeze discussion is correctly time-bounded in the draft; the current official release page shows version 9.7.7 published 2026-07-17, but that fact alone does not establish whether feature development resumed (S19–S20). Do not turn either item into a current roadmap conclusion.

Checks actually performed: read the mapped brief and artifacts; verified the revealed-plan digest/length; inspected the listed official documentation, standard and upstream issue/release records; recorded exact URLs and locators in source-map.json. No app, package, DOCX fixture, accessibility tool, browser-storage behavior, or offline build was executed. The draft's build, update, search, keyboard/screen-reader, print, import and network checks remain proposals.
