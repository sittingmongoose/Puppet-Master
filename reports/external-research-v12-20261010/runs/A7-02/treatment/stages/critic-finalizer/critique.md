# Independent critique of investigator package

## Scope and method

I read the frozen brief, the full discovery, full draft, source map, revealed plan, plan-reveal record, and carried source index. I opened the 23 reachable primary-source URLs directly and inspected the cited passages for the consequential identity, version, interchange, lookup, and release-history claims. The Paperpile Auto Update page again returned HTTP 502; I preserve its official indexed-result status rather than treating that interface as independently observed. Retrieval was read-only. No application, API, importer, exporter, or validation fixture was run.

The proposal is substantially responsive and should retain its app-independent submission ledger, two-manager comparison, OpenRefine analogy, version separation, editor approval, optional bibliography route, narrow JabRef example, owner roles, and explicit NOT_RUN validations. The following points need correction or sharper limits before finalization.

## Criticisms

### C01 — OpenRefine analogy overstates user review as its default

- **Classification:** material incomplete
- **Draft locator:** “Candidate workflows and tradeoffs” and “Workflow comparison and alternatives,” OpenRefine row; also “DOI-less records, duplicates, and scholarly versions.”
- **Evidence:** S13, “Reconciling,” sections “Overview,” “When the process is done,” and “Reconciliation actions”; S14, “Reconciliation API,” opening definition. The current manual calls reconciliation semi-automated, says confident matches may not need manual checking, retains the original cell value alongside a matched link, and supports matching every cell to its best candidate in bulk. The API returns ranked potential entities. This is a useful analogy, but the draft’s broad “user selects among candidates” wording can imply manual choice always occurs.
- **Required treatment:** Explain those automatic and bulk actions as observed OpenRefine behavior; state that the proposed citation workflow deliberately requires editor approval before it treats any match as identity, merge, or correction. Retain the original-plus-link insight without presenting OpenRefine as a scholarly identity resolver.

### C02 — File-transfer boundary needs to be operational in the product comparison

- **Classification:** material incomplete
- **Draft locator:** “Recommendation,” Zotero/Paperpile rows in “Workflow comparison and alternatives,” and “Optional lookup and downloadable bibliography.”
- **Evidence:** S01, “Via your web browser” and “PDFs,” says Zotero may save an accessible/open-access PDF when saving a record and that saving a PDF directly imports it. S08, “Uploading RIS and BibTeX files with PDFs,” documents that PDFs may be uploaded alongside RIS/BibTeX. S07 documents Zotero exporter file controls; S10 confirms Paperpile library-data export excludes PDFs. The draft later says not to use workflows that download PDFs, but the recommendation/table should make setup and operating conditions clear where both products are introduced.
- **Required treatment:** Make the citation/link-only rule concrete: do not use the Zotero Connector or save a PDF, do not include PDF files/attachment paths in Paperpile imports, turn off Zotero file export, and do not use bulk-PDF download routes. This is a proposal constraint; no product settings were changed or exercised.

### C03 — Provider “no result” is a proposed handling case, not a verified Crossref interface outcome

- **Classification:** unsupported
- **Draft locator:** “Identity, version, correction, and export model,” “DOI-less records, duplicates, and scholarly versions,” and the DOI-less enrichment validation row.
- **Evidence:** S16, “Using Simple Text Query to match references with DOIs,” documents requesting multiple possible DOIs and says a citation or registered record can be insufficient for one unique match; this review issued no query and did not observe its zero-result presentation. S11 shows Paperpile search is a user-run candidate search, not an identity guarantee.
- **Required treatment:** Keep a local no-candidate/ambiguous state as a design requirement and proposed test. Describe Crossref evidence as supporting multiple or non-unique matches; do not imply that this review verified a particular no-hit response or result-screen behavior.

### C04 — Interchange-format authority is not explicitly assigned in the brief

- **Classification:** minor locator/wording
- **Draft locator:** “Proposed pilot workflow and record model,” step 6; “Optional lookup and downloadable bibliography”; “Authority and unresolved owner inputs.”
- **Evidence:** The brief assigns the group lead presentation style and acceptable lookup providers; it authorizes but does not require a downloadable bibliography in a commonly supported interchange format. It does not name the group lead as the decision maker for the exact interchange format.
- **Required treatment:** Keep the format decision open and recommend confirming it with the group lead/owners. Do not portray the exact format choice as an already assigned role. Citation style remains within the brief’s presentation-style decision.

### C05 — JabRef report’s version evidence is broader than the final’s impact sentence

- **Classification:** material incomplete
- **Draft locator:** “Released importer/exporter failure chain,” “Affected scope,” and the JabRef validation row.
- **Evidence:** S22, issue #15106 “JabRef version,” “Details on version and operating system,” and reproduction: reporter names JabRef 5.15 on Ubuntu 24.04.4 LTS and checks the then-latest development build, reporting the problem persisted. S23, PR #15315, describes the delimiter fix and merge commit `d687c08`. S24, release `v6.0-alpha.6`, is a prerelease tagged at `6d24100` and lists #15106 as fixed.
- **Required treatment:** Preserve the report as a user-reported reproduction (including the development-build statement), not independent confirmation. Bound the defect to the described BibTeX-pages-to-RIS path and page-range input; say the linked fix is present in the named alpha, not that all later/stable versions or products were tested.

### C06 — Paperpile Auto Update behavior remains an external uncertainty

- **Classification:** honestly unresolved external input
- **Draft locator:** Paperpile row in “Workflow comparison and alternatives,” “Optional lookup and downloadable bibliography,” and current uncertainty/validation statements.
- **Evidence:** S12 is the official Auto Update help URL and indexed result. The frozen source record says direct open timed out/502 twice; this stage’s direct open at 2026-10-10T04:47:55Z again returned 502. No Paperpile interface or account was used.
- **Required treatment:** Retain the field-preview/Apply flow only as information from an official indexed result whose live page could not be inspected; use it as a design analogy, not as verified current product behavior. Require a selected-build check if Paperpile is later chosen.

## Scope and plan coverage assessment

The draft has relevant evidence for the eight obligations and treats the revealed plan as fallible. Its major corrections to title-only merging, DOI authority, identifier-less exclusion, and three-record “validation” are sound. It preserves submitter credit/raw text, separate scholarly versions and relations, editor approval, optional metadata-only RIS/BibTeX, group-lead choices, and negative constraints. No scope reduction or removal of the authorized optional export is warranted. Product behavior, manager selection, exact export format/style, approved lookup provider, required export fields, and real round-trip outcomes remain open or NOT_RUN.
