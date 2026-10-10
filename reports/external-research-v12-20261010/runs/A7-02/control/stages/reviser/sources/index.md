# Source index — A7-02-control reviser

Stable source IDs S01–S21 retain the investigator’s exact URL bindings. Each ID links to its governing public source and its identity record in [source-map.json](../source-map.json), including version/commit, locator, access UTC, observed operation, conditions, and applicability. The direct reviser checks below are additional observations against those same IDs; no ID was rebound. No downloaded papers, binaries, or source-code execution artifacts are stored here.

## Inherited evidence, all source IDs

<a id="s01"></a>
### [S01 — Zotero Duplicate Detection](https://www.zotero.org/support/duplicate_detection)
- Version/release: Living official documentation; page states last updated 2017-11-25; no application release pinned.
- Locator: Finding Duplicates and Merging Duplicates, lines 56-74
- Accessed: 2026-10-10T04:31:41Z
- Observed: Candidate detection uses title, DOI, ISBN, then publication-year proximity and creator overlap; merge allows master-item choice and field-by-field alternatives; tags and collections are retained.
- Condition and applicability: Year matches within one year; at least one creator last name plus first initial matches; title/DOI/ISBN fields must match or be absent; false-positive candidates cannot currently be marked as non-duplicates; detection is within one library only. The page's 2017 update date limits confidence about current algorithm version. Evidence for a curator-reviewed candidate/merge workflow and its limits, not proof a current app version uses identical internals.
- Full record: [source-map.json](../source-map.json)

<a id="s02"></a>
### [S02 — Zotero import of standardized formats](https://www.zotero.org/support/kb/importing_standardized_formats)
- Version/release: Living official documentation; page states last updated 2018-11-04; no application release pinned.
- Locator: Import format list, lines 54-85
- Accessed: 2026-10-10T04:31:41Z
- Observed: Zotero accepts RIS, BibTeX, BibLaTeX, CSL JSON, EndNote XML and other formats, among others.
- Condition and applicability: Format support does not establish lossless interchange; the page describes file import, not validation of arbitrary field round-tripping. Evidence that RIS is a realistic commonly supported handoff format for this candidate workflow.
- Full record: [source-map.json](../source-map.json)

<a id="s03"></a>
### [S03 — Zotero Export preferences / Quick Copy](https://www.zotero.org/support/preferences/export)
- Version/release: Living official documentation; page states last updated 2024-10-27; no application release pinned.
- Locator: Quick Copy and Character Encoding, lines 56-73
- Accessed: 2026-10-10T04:31:41Z
- Observed: Quick Copy can produce a citation style or bibliographic export format; the documentation names BibLaTeX and Zotero RDF as formats and describes copying references.
- Condition and applicability: Quick Copy defaults/settings are configurable; character encoding auto-detection is the default for imports but can be specified when incorrect. Supports bibliography-export workflow and motivates character/encoding QA; separate creating-bibliography and mapping sources cover file export and losses.
- Full record: [source-map.json](../source-map.json)

<a id="s04"></a>
### [S04 — Zotero Import/Export Field Mappings](https://www.zotero.org/support/kb/field_mappings)
- Version/release: Living official documentation; page states last updated 2017-11-22; no application release pinned.
- Locator: Data loss during import/export, lines 56-67
- Accessed: 2026-10-10T04:31:41Z
- Observed: Export/import among formats can lose information; Zotero RDF is described as generally least lossy, preserving collections, attachments, and notes; RIS/MODS include notes but not attachment files or collections.
- Condition and applicability: The warning is for whole-library transfer; format fidelity differs by standard and fields; mappings are actively developed and may go stale. Do not treat RIS as an archival copy or promise it preserves internal provenance/version relations; export only the public citation slice and test the fields required.
- Full record: [source-map.json](../source-map.json)

<a id="s05"></a>
### [S05 — Zotero Creating Bibliographies](https://www.zotero.org/support/creating_bibliographies)
- Version/release: Living official documentation; page states last updated 2025-12-12; no Zotero application release pinned.
- Locator: Quick Copy RIS/BibTeX formats, lines 59-71; bibliography output choices, lines 74-78; page update date, line 91.
- Accessed: 2026-10-10T04:31:41Z
- Observed: Zotero can create bibliographies and save as RTF/HTML, copy to clipboard, or print; Quick Copy supports BibTeX and RIS export formats.
- Condition and applicability: Rendered styles and bibliographic data interchange are different output modes; HTML embeds Zotero metadata for Zotero users. Public presentation and manager-interchange choices for an optional download.
- Full record: [source-map.json](../source-map.json)

<a id="s06"></a>
### [S06 — JabRef Find Duplicates](https://docs.jabref.org/finding-sorting-and-cleaning-entries/findduplicates)
- Version/release: Current living JabRef documentation retrieved 2026-10-10; no app release pinned on this page.
- Locator: Detection and Selecting which entry to keep, Markdown lines 1-34
- Accessed: 2026-10-10T04:31:55Z
- Observed: Potential duplicates use edit distance with extra weight on author, editor, title and journal; user can keep either entry, both, merge, or automatically remove exact duplicates.
- Condition and applicability: Automatic removal is offered for exact duplicates; candidate similarity elsewhere still requires a choice. Documentation is living and not tied to the beta tag below. A practical alternative candidate-review workflow; illustrates similarity-based detection with reversible keep-both/merge choices.
- Full record: [source-map.json](../source-map.json)

<a id="s07"></a>
### [S07 — JabRef Merge Entries](https://docs.jabref.org/finding-sorting-and-cleaning-entries/mergeentries)
- Version/release: Current living JabRef documentation retrieved 2026-10-10; no app release pinned on this page.
- Locator: Diff highlighting, merging fields, and field selection, Markdown lines 1-40
- Accessed: 2026-10-10T04:31:55Z
- Observed: Merge view compares fields and permits choosing left/right or editing values; groups, keywords, comments and files can be combined.
- Condition and applicability: The user must initiate a merge after selecting two entries and reviewing fields; merged output removes prior entries per the Find Duplicates workflow. Supports manual, curator-owned reconciliation but does not provide an immutable audit trail of submitted text by itself.
- Full record: [source-map.json](../source-map.json)

<a id="s08"></a>
### [S08 — JabRef identifier-based metadata enrichment](https://docs.jabref.org/finding-sorting-and-cleaning-entries/getbibtexdatafromdoi)
- Version/release: Current living JabRef documentation retrieved 2026-10-10; doc image mentions JabRef 5.2; current page is not release-pinned.
- Locator: Finding identifiers and completing information based on DOI/ISBN, Markdown lines 1-20
- Accessed: 2026-10-10T04:31:55Z
- Observed: JabRef can look up DOI/arXiv identifiers from metadata; DOI/ISBN-based completion opens a merge review. It defaults to keeping the original fields and fills fields absent there with DOI results; inaccurate/incomplete inputs can cause lookups to fail.
- Condition and applicability: DOI/ISBN completion is disabled without an identifier; identifier lookup depends on sufficient accurate bibliographic metadata; the product also exposes a separate full-text retrieval action that this proposal must not use. Evidence for optional lookup as a suggestion reviewed field-by-field, not an authoritative correction or guaranteed match.
- Full record: [source-map.json](../source-map.json)

<a id="s09"></a>
### [S09 — JabRef command-line import/export](https://docs.jabref.org/advanced/commandline)
- Version/release: Official documentation states its described CLI applies since JabRef 5.0; retrieved 2026-10-10.
- Locator: Import and Export file options, Markdown lines 4-9 and 74-100
- Accessed: 2026-10-10T04:31:55Z
- Observed: JabRef supports file import, export, custom formats and BibTeX default export; export can convert a loaded/imported database.
- Condition and applicability: Export format depends on a selected filter; command-line output may vary with the installed app's formats; not evidence of product validation for this task. Supports a version-pinned repeatable format conversion option if the group chooses JabRef; never run until pilot test is approved.
- Full record: [source-map.json](../source-map.json)

<a id="s10"></a>
### [S10 — JabRef v6.0-beta.1 release](https://github.com/JabRef/jabref/releases/tag/v6.0-beta.1)
- Version/release: v6.0-beta.1, Git commit 3992b12; prerelease released 2026-09-21.
- Locator: GitHub release heading/tag/date and changelog; release list / release body
- Accessed: 2026-10-10T04:31:55Z
- Observed: Official release list identifies v6.0-beta.1, tag/commit `3992b12`, and its release body includes a Zotero Compatibility Mode for CSL citations emitted by JabRef through its LibreOffice integration.
- Condition and applicability: Prerelease status. Release chronology places it after alpha.6, but this release page alone does not prove a particular alpha fix remains in this beta; pin and test the selected build. Version anchor for the current alternative workflow and cross-manager CSL discovery; do not call the beta stable or assume its behavior without a pilot.
- Full record: [source-map.json](../source-map.json)

<a id="s11"></a>
### [S11 — JabRef RIS page-range export issue #15106](https://github.com/JabRef/jabref/issues/15106)
- Version/release: Issue opened 2026-02-13, closed; reporter used JabRef 5.15; fix development PR #15315; fix listed in v6.0-alpha.6 (commit 6d24100) and thus predates v6.0-beta.1 (3992b12).
- Locator: Issue reproduction lines 167-188; closure/activity lines 420-434; linked fix PR #15315; alpha.6 release notes #15106.
- Accessed: 2026-10-10T04:31:55Z
- Observed: For a BibTeX pages range `13905--13911`, RIS export put the full range in both SP and EP; single dash `-` reportedly behaved correctly. The reporter reproduced on JabRef 5.15 and reported latest development build still affected before the fix.
- Condition and applicability: Affected case is the reported RIS export of a BibTeX `pages` range using `--`, where SP and EP each received the full range. The issue says single dash worked. Later PR tests split Unicode en/em dash at FirstPage/LastPage; exact end-to-end encoding path still merits a local test. Validates prioritizing RIS page start/end regression tests and pinning app release; not evidence every JabRef record/export was defective.
- Full record: [source-map.json](../source-map.json)

<a id="s12"></a>
### [S12 — JabRef fix PR #15315](https://github.com/JabRef/jabref/pull/15315)
- Version/release: PR #15315 merged 2026-03-13 to JabRef:main by merge-queue commit d687c08; included in v6.0-alpha.6 (commit 6d24100) per official release notes.
- Locator: PR merge/status lines 131-154 and 1225-1227; changed-file/test summary lines 910-943; official alpha.6 release notes RIS fix line 226.
- Accessed: 2026-10-10T04:31:55Z
- Observed: Merged change extends page-range splitting regex to Unicode en-dash/em-dash and adds FirstPage/LastPage unit tests for Unicode dash variants. Upstream merge reports 49 of 50 checks passed; this investigation did not execute the code.
- Condition and applicability: PR tests for FirstPage/LastPage include ASCII single/double hyphens, Unicode en/em dashes, and spaced en dash, but are formatter unit tests rather than a full application RIS export. The release note identifies the original RIS issue as fixed. Primary source for the failure/fix chain. Do not infer the fix is a cure for arbitrary bibliographic field mapping problems.
- Full record: [source-map.json](../source-map.json)

<a id="s13"></a>
### [S13 — Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- Version/release: Living official API docs retrieved 2026-10-10; no API schema version pinned; docs show v1 endpoint examples.
- Locator: API description, endpoints and DOI lookup examples
- Accessed: 2026-10-10T04:31:55Z
- Observed: REST API returns JSON metadata deposited by Crossref members and trusted sources; supports DOI retrieval and query/search endpoints.
- Condition and applicability: Coverage and fields depend on deposited records; for records outside Crossref, a DOI lookup can fail and not imply the work is invalid or absent globally. Candidate source for DOI-resolved metadata and title/citation search, with results treated as suggestions.
- Full record: [source-map.json](../source-map.json)

<a id="s14"></a>
### [S14 — Crossref REST API access and authentication](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/)
- Version/release: Living docs; page states last updated 2025-10-16; retrieved 2026-10-10.
- Locator: Access modes, rate/concurrency headers, 429/backoff guidance
- Accessed: 2026-10-10T04:31:55Z
- Observed: Public API access requires no registration; polite pool uses an email in `mailto` or agent header; response headers report current limits; 429 asks clients to slow down.
- Condition and applicability: Metadata Plus is paid/keyed and unnecessary for a pilot; exact limits depend on pool and are expressed in response headers. The group lead must decide acceptable providers and any contact email use. Supports account-free read-only lookup; avoid API account creation and build caching/backoff if provider is approved.
- Full record: [source-map.json](../source-map.json)

<a id="s15"></a>
### [S15 — Crossref REST API tips](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/)
- Version/release: Living official docs retrieved 2026-10-10; last-updated date not shown in retrieved content.
- Locator: Rows/select/cursor and responsible API usage sections
- Accessed: 2026-10-10T04:31:55Z
- Observed: Crossref recommends selective queries, caches, response-status handling and backoff; query result sets can change during reindexing.
- Condition and applicability: Recommendations concern larger queries; for the small pilot, use the smallest necessary result set and response headers. Optional lookup implementation constraints if approved; do not claim this research itself validated an integration.
- Full record: [source-map.json](../source-map.json)

<a id="s16"></a>
### [S16 — Crossref relationships schema guide](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/)
- Version/release: Living official schema guide retrieved 2026-10-10; schema versions not pinned on page.
- Locator: General typed relationships; associated research object relation vocabulary; DOI/non-DOI validation text
- Accessed: 2026-10-10T04:31:41Z
- Observed: Controlled relation types include preprint, version, identical, variant, manifestation, etc.; DOI endpoints are checked on deposit while non-DOI identifiers are not verified; DOI relation can create bidirectional relation in Crossref.
- Condition and applicability: Published relationship metadata is asserted by depositors; non-DOI identifiers are unverified and relation coverage depends on deposits. Model separate citable records with typed links and candidate status instead of collapsing all versions into a single DOI-based record.
- Full record: [source-map.json](../source-map.json)

<a id="s17"></a>
### [S17 — Crossref Posted Content / Preprint Markup Guide](https://www.crossref.org/documentation/schema-library/markup-guide-record-types/posted-content-includes-preprints/)
- Version/release: Schema-specific guidance: posted_content type available since schema 4.4.0; additional version/status fields available as of schema 5.4.0; retrieved 2026-10-10.
- Locator: Metadata elements; Updating metadata with relation to accepted manuscript/version of record; conflict behavior
- Accessed: 2026-10-10T04:31:55Z
- Observed: Posted-content records can record version number/description, posted date, status and DOI; a preprint can be linked to accepted manuscript/VoR with `isPreprintOf`.
- Condition and applicability: This model applies to Crossref-member metadata deposits, not all repositories or all scholarly outputs; relationship completeness requires provider deposits/updates. Evidence for explicit preprint status and separate version records where present; not a guarantee every citation can be enriched.
- Full record: [source-map.json](../source-map.json)

<a id="s18"></a>
### [S18 — Crossref introduction to posted content/preprints](https://www.crossref.org/documentation/research-nexus/posted-content-includes-preprints/)
- Version/release: Living official documentation; page last updated 2024-04-01; retrieved 2026-10-10.
- Locator: Obligations and limitations; Associating preprints with later published outputs
- Accessed: 2026-10-10T04:31:55Z
- Observed: Crossref recommends separate DOI and version relationships in its schema and describes title/first-author matches as candidates that are reviewed and linked by the preprint publisher.
- Condition and applicability: Crossref's recommendation describes its deposited metadata practices, not a universal DOI policy. Relationship assertions may be missing; an absent link is not evidence that outputs differ. Support for version-aware records and human-reviewed relationships; prevents treating an automatic match as an authoritative editorial decision.
- Full record: [source-map.json](../source-map.json)

<a id="s19"></a>
### [S19 — Crossref preprint-to-journal matching methods and dataset](https://www.crossref.org/blog/discovering-relationships-between-preprints-and-journal-articles/)
- Version/release: Official Crossref blog article; matching dataset scoped to records through 2023-08-31; retrieved 2026-10-10.
- Locator: Candidate matching method, counts, preprint-journal relationship dataset sections
- Accessed: 2026-10-10T04:31:55Z
- Observed: Crossref describes exact title plus first-author matching to generate possible links for review, notes missing deposited links, and reports its dataset method filters only existing records of specified types/subtypes through August 2023.
- Condition and applicability: Heuristic candidate matching can miss relations and should not force merges; historical dataset counts are time-bounded, not current coverage estimates. A bounded version-reconciliation precedent and explicit evidence that automated match is a review cue, not proof.
- Full record: [source-map.json](../source-map.json)

<a id="s20"></a>
### [S20 — JabRef v6.0-alpha.6 release notes](https://github.com/JabRef/jabref/releases/tag/v6.0-alpha.6)
- Version/release: v6.0-alpha.6 prerelease, commit 6d24100; released 2026-05-14.
- Locator: Release version/commit/date lines 134-165; RIS page-range fix for issue #15106 at lines 222-227.
- Accessed: 2026-10-10T04:33:42Z
- Observed: Changelog states JabRef fixed RIS export duplicating the full page range into both start and end page fields, issue #15106.
- Condition and applicability: This is an alpha prerelease release note and not evidence of a product test run here; release states the defect is fixed in this tag. Exact release/version anchor for defect history and version-qualified export validation.
- Full record: [source-map.json](../source-map.json)

<a id="s21"></a>
### [S21 — JabRef page-range formatter source and tests at RIS fix commit](https://raw.githubusercontent.com/JabRef/jabref/d687c08/jablib/src/main/java/org/jabref/logic/layout/format/FirstPage.java)
- Version/release: JabRef main merge commit d687c08 from PR #15315, merged 2026-03-13; later listed in v6.0-alpha.6 commit 6d24100.
- Locator: FirstPage.java lines 4-18; LastPage.java lines 4-22; FirstPageTest.java lines 14-30; LastPageTest.java lines 14-31.
- Accessed: 2026-10-10T04:43:09Z
- Observed: The page formatters split on ASCII hyphen, Unicode en-dash, and em-dash; tests include single and double ASCII hyphen, en/em dash, and a spaced en dash, checking first/last page extraction for 13905–13911.
- Condition and applicability: The formatter tests verify page-field parsing helpers; they do not constitute an investigator-run or end-to-end RIS exporter test. The released alpha.6 changelog ties the fix to the RIS issue #15106. Primary source-code grounding for the reported fix and proposed exact regression fixture; pin the user's chosen build and still test its full export path.
- Full record: [source-map.json](../source-map.json)

<a id="reviser-rechecks"></a>
## Reviser independent primary-source rechecks

These were read-only official-source checks. They test the proposal claims against primary documentation/history; they did not exercise a product, API, import/export path, or source-code tests. Access timestamps below are the UTC clock observed immediately after each grouped browser retrieval.

- **S05:** confirmed Quick Copy RIS/BibTeX and bibliography output modes; page footer states 2025-12-12. The date is not an application release. Rechecked 2026-10-10 05:05:02 UTC.
- **S11, S12, S20:** confirmed the reported 5.15 page-range case, PR #15315's en/em-dash change and merge date, and the alpha.6 release note linking the fix to #15106. This history bounds the affected case; it does not certify a full exporter. Rechecked 2026-10-10 05:05:02 UTC.
- **S14, S17:** confirmed public no-identification Crossref access, the distinct polite option, response limits/backoff, and the member XML-deposit scope/schema conditions for posted content. Rechecked 2026-10-10 05:05:02 UTC.
- **S01, S06, S07, S08:** confirmed the documented duplicate candidate conditions, field-review controls, keep-both option, and identifier lookup route; pages are living documentation rather than a pinned app test. Rechecked 2026-10-10 05:06:37 UTC.
- **S16, S18, S19:** confirmed Crossref's typed deposited relations, publisher-reviewed candidate links, and bounded historical matching coverage. Rechecked 2026-10-10 05:06:37 UTC.

See reviser_rechecks in [source-map.json](../source-map.json) for a separate identity record for each check, with exact URL, version, locator, access time, operation, governing conditions, and applicability.
