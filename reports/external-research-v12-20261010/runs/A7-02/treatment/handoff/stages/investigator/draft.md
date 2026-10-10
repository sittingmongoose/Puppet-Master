# Research proposal: volunteer reading-list citation curation

## Recommendation

Use an app-independent, editor-reviewed citation ledger as the pilot record of truth. Let Zotero and Paperpile inform the intake/export design, but do not let either product's duplicate detector silently decide identity. Keep each submission's contributor credit and exact citation text immutable; keep normalized/corrected fields and bibliographic-version relationships in separately reviewable records. Treat identifier and metadata lookups as proposals until an editor approves specific field changes. Keep a downloadable bibliography as an authorized optional capability, initially limited to metadata and links in RIS and/or BibTeX after round-trip validation with the group's intended reference managers.

For a first pilot, Zotero is the stronger candidate for manual curation because its documented item types distinguish preprints from journal articles and its export path has explicit configurable file/note/tag options. This is a conditional recommendation only: its duplicate rules are published on a page last updated in 2017 and need verification against the selected release. Paperpile is a reasonable alternative for a hosted manager and online search, but its documented default “Skip duplicates” import behavior makes an independent submission ledger especially important. No app was selected, installed, or operated in this research stage. A small CSV intake ledger plus reviewed RIS/BibTeX exports is a lower-dependency alternative if no manager is chosen; it requires the same explicit identity, provenance, and review controls.

## Proposed pilot workflow and record model

1. **Capture submissions.** Create a unique submission row for every received citation. Retain the submitter's credit, timestamp/source when available, and exact original text byte-for-byte. Do not discard an input because another row appears similar or an importer later skips it.
2. **Parse without destroying provenance.** Store extracted title, creators, year, venue, pages, URL, and any submitted identifiers as working fields with source markers. Keep the raw string beside them. Normalization may assist candidate search but is not an identity decision.
3. **Suggest, do not merge.** Surface candidate matches using available evidence (identifier, title, authors, year, venue, URL, and type). Show why each candidate was suggested and flag uncertainty. A shared identifier can be strong evidence, but does not by itself prove that two entries are the same citable version. Exact title equality or normalized title strings alone are insufficient.
4. **Keep identity and version links separate.** Use distinct citable records for a preprint, accepted manuscript, and journal-published version when they represent distinct states. Store typed relations such as “preprint of” or “version of” when confirmed. Keep duplicate/same-record decisions separate from version relations. Do not infer that every DOI identifies one unique version: registrants can update or reuse a DOI for some changes, while different versions may also receive separate identifiers [S19–S21].
5. **Review corrections.** An editor approves every merge and every authoritative metadata correction. For each accepted field, retain the submitted value, proposed value, lookup source/identifier, retrieval time, and approving editor. An editor can reject a candidate or leave an uncertain field unchanged. Failed, ambiguous, and no-result lookups are visible outcomes, not reasons to delete or overwrite input.
6. **Export only by choice.** Make bibliography download optional and authorized. Export citations/metadata and links only. Do not include article files, full text, or unnecessary notes. Consider RIS for broad reference-manager exchange and BibTeX for LaTeX-oriented users; both are supported by the compared workflows, but format/default selection and citation style remain decisions for the group lead [S04][S06][S08][S10]. Before enabling, test the chosen export/import path on a small, representative fixture and compare fields and record counts. If a format loses a required field, adjust configuration or defer that format rather than silently dropping the field.

A minimal schema should include: `submission_id`; submitter credit; intake timestamp; exact `raw_citation`; parsed/proposed field values with per-field provenance; one or more `citation_version_id` records with type and optional DOI/other IDs; separate candidate/duplicate decisions; typed version relations; lookup-provider result snapshots; editor decisions and timestamps; and export profile/version. This is a design proposal, not a schema already implemented or validated.

## Workflow comparison and alternatives

| Workflow | Documented strengths relevant to pilot | Risks and conditions | Proposed use |
|---|---|---|---|
| Zotero [S01–S07] | Identifier-based item creation; warns that returned metadata can be wrong/incomplete; Preprint and Journal Article types; documented field-wise conflict selection on merge; imports BibTeX/RIS/CSL JSON; Quick Copy and configurable exporter options. | Duplicate help page is old (2017); its stated “cannot mark false positive as not duplicate” behavior may no longer hold. Exports can lose app-specific metadata and are not backups. Connector may fetch PDFs, outside scope. | Preferred candidate for a curator-operated pilot only after verifying the current release's duplicate controls and making attachment/file export explicitly unavailable or off. Preserve our own ledger regardless. |
| Paperpile [S08–S12] | RIS/BibTeX import and export; online search by title, authors, URL and identifiers; duplicate candidates can be dismissed; documented manual metadata update offers candidate/field review before Apply. | “Skip duplicates” is documented on by default, including later duplicates in one file. Merge consolidates selected data and moves originals to Trash. Metadata-update help was available through the official indexed result only; direct open failed twice, so its current UI is uncertain. | Viable alternative if the group lead accepts a hosted manager and the intake ledger captures all submissions before import. Verify behavior in the selected release before use. |
| OpenRefine reconciliation analogy [S13–S15] | Candidate ranking, preview, type/property constraints, and a matched link can coexist with the original cell text. Useful as a conceptual pattern for raw text + proposal + decision. | Confidence scores and providers vary; docs describe confident auto-match. Clustering is syntactic, not scholarly identity. It is not a reference-manager product comparison or a validated citation resolver. | Borrow the separation between raw input and linked candidate; configure this proposal for editor review before any authoritative update or merge. |
| Reviewed CSV + generated interchange file | Low setup and vendor dependence; all submissions and decisions can remain visible in one table. | Requires a deliberate schema, change history, quality control, and tested export generation; no evidence in this review validates an implementation. | Fallback if no manager is selected. Do not use spreadsheet sorting/deduplication as an implicit merge process. |

### Correction of the staged assumptions

- **“Normalize titles and merge identical strings.” — Reject.** Normalization can help find candidates, but title equality alone does not prove record identity. Same-title preprint/journal pairs, editions, corrections, or distinct works can be collapsed incorrectly. Require review of identifiers, creators, dates, publication type, venue, and version relationships; preserve raw text.
- **“DOI metadata is automatically authoritative.” — Reject.** Crossref metadata is largely deposited by members and can be incomplete; Simple Text Query may return multiple candidate DOIs or no single result. A DOI lookup is evidence to inspect, not authority to replace a volunteer's citation [S16][S17]. DOI reuse/version practices also vary [S20]. Apply a correction only after editor approval.
- **“Records without identifiers will be excluded from enrichment and have no manual path.” — Correct.** A DOI is optional. DOI-less submissions remain in the ledger and can be reviewed manually. If the lead approves it, a citation-based search may offer Crossref candidates; ambiguous/no-match results leave the record untouched [S16]. Optional providers and scope are owner decisions.
- **“A successful import of three DOI records is general validation.” — Reject.** It would cover neither DOI-less intake, false matches, version separation, provenance, common interchange fields, nor the reported page-range defect. No product import was executed here. Use the broader proposed validation matrix below and report each run separately.
- **“Zotero is the initial choice; JabRef is unassessed.” — Revise.** Compare Zotero with Paperpile as two reference-management workflows; JabRef is additionally useful for a concrete released-format regression. Do not claim a winner without verifying current builds. JabRef's narrow issue/fix/release chain is evidence about one BibTeX-to-RIS page-range conversion, not a broad product ranking [S22–S24].
- **“Export round-trip loss is undecided.” — Retain as an open technical condition.** Documentation confirms standardized formats but warns of loss; only fixture-based round-trip testing can establish required-field preservation for the selected build and reader [S04][S05][S10].

## DOI-less records, duplicates, and scholarly versions

A record without DOI is not excluded. Keep whatever source material the submitter provides and search only if an approved provider and workflow are chosen. Crossref's Simple Text Query accepts citations but can produce several candidates or no unique match, so the interface should show result provenance and allow “no match” or “uncertain” [S16]. Do not manufacture identifiers.

Represent a preprint and a journal article as two citable versions when appropriate, even if their title and author strings are identical. Zotero's item-type guidance explicitly distinguishes preprint from journal publication [S03]. Crossref supports typed preprint relations [S19]; DataCite describes same-DOI minor updates and new-DOI major versions under stewardship decisions, and distinct manuscript versions can have distinct DOIs [S20][S21]. These sources disprove a universal one-DOI/one-version rule. Preserve both record identities and connect them through a typed relation; never silently merge them.

Duplicate detection is a candidate-generation aid. Zotero documents title/DOI/ISBN and year/creator heuristics scoped to one library, but the page is old; Paperpile documents identifier or exact-metadata candidates plus a dismiss action, with misses possible when records differ and share no ID [S02][S09]. Both behaviors are product-specific. Keep an app-independent list of all submissions and record the editor's merge rationale. When merging, preserve all contributing submission IDs, original strings, submitter credits, and field histories.

## Optional lookup and downloadable bibliography

Keep both capabilities optional. The brief authorizes an optional downloadable bibliography; it does not require a particular format, interface, provider, or implementation. RIS and BibTeX are reasonable candidates because they appear in both compared managers' documented interoperability paths [S04][S08][S10]. Choose the default format and citation style only after the group lead decides. A pilot should confirm common target readers and required fields before enabling download. Disable file/attachment and note export explicitly; publish citations and links, not article content [S07].

If enrichment is enabled, restrict it to lead-approved public read-only providers. A query response is a candidate snapshot. Show proposed field differences and source metadata, and require an editor's explicit Apply/accept action. The Paperpile help result illustrates such a preview/apply flow but direct page access failed, so the pattern needs independent build verification [S12]. Crossref's public REST documentation says access requires no registration while setting usage limits and recommending a polite-pool identifier/backoff; no API call was made here [S18]. Do not create contributor accounts or introduce a provider that requires them. Do not use connectors or workflows that download PDFs.

### Evidence-based retention condition

**Retain the optional export path** because it is explicitly authorized and both compared workflows document RIS/BibTeX paths. Enable only after testing the selected reader/build pair, required metadata fields, record counts, Unicode and pages, optional-output controls, and the absence of attachments/full text. If no tested format preserves the group's required citation data, defer that format with the observed loss and owner decision; the present research supplies no evidence-based reason to remove the authorized option entirely.

## Released importer/exporter failure chain

JabRef issue [#15106][S22] records a specific defect: reporter on JabRef 5.15 found that BibTeX `pages={13905--13911}` exported to RIS with the whole en-dash range repeated in both `SP` and `EP`; a single dash worked. The issue closed through [PR #15315][S23], merged 2026-03-13; its change accepts en/em dash delimiters when splitting first and last page. The fix is named in the [JabRef v6.0-alpha.6 prerelease][S24], released 2026-05-14 (tag short commit `6d24100`).

**Affected scope:** records exported through the described JabRef BibTeX-to-RIS path whose pages value uses a double-hyphen range converted to an en dash, in the reported affected release. The evidence does not establish impact on every JabRef build, another manager, another RIS importer, or other fields. The reporter's repro was read, not independently run here. This history motivates a targeted round-trip regression case; it is not a claim that the proposed product has the defect.

## Authority and unresolved owner inputs

The brief assigns authority: the bibliography editor approves merges and corrections; submitters retain credit and original citation text; the group lead chooses presentation style and acceptable lookup providers. The draft plan's statement that these decisions “have not [been] obtained” is misleading about roles: those authority boundaries are already specified in the brief. The actual choices remain open and must be made by those owners when they review a pilot configuration:

- Which manager, if any, will be the curator's working environment; whether to begin with Zotero, Paperpile, or the CSV fallback.
- Which interchange format(s) and default citation style/representation the group lead wants.
- Which lookup providers, if any, the group lead approves, and whether lookups run only on demand or in a controlled batch.
- Which editor(s) approve corrections/merges and how decisions are audited or reversed.
- Which fields are required in an exported citation and which common readers define interoperability acceptance.
- Whether the optional download is enabled for the pilot and how access to its metadata/links is presented.

No product selection, provider authorization, account, production change, purchase, or live write is made by this proposal.

## Validation status and proposed checks

Research retrieval is not product validation. **Executed in this stage:** read-only review of the primary public sources listed in `sources/index.md`; checked issue, pull request, and prerelease release-note linkage for the narrow JabRef chain; saved the plan-referenced proposal. **NOT_RUN:** product installation/operation, importer/exporter, database manipulation, actual Crossref/DataCite/arXiv lookup, correction/merge, download, or end-to-end pilot. The Paperpile metadata-update UI and current Zotero duplicate behavior remain especially uncertain.

| Check | Status | Proposed method and acceptance observation |
|---|---|---|
| Identity and false-positive set | PROPOSED / NOT_RUN | Fixture with same DOI, no DOI, same title/different creator or year, exact duplicate in one batch, and conflicting identifiers. Show candidates/rationales; verify no automatic merge and that an editor can reject a false match. |
| Preprint and published version | PROPOSED / NOT_RUN | Same title/authors, different type/version/identifier fixture. Verify both remain separate and can be linked by typed relation without overwriting either. |
| DOI-less enrichment | PROPOSED / NOT_RUN | Manual path plus lead-approved citation search; include one result, multiple candidates, and no result. Verify original text remains unchanged; each proposed field shows its source; only explicit editor acceptance changes curated metadata. |
| Provenance and credit | PROPOSED / NOT_RUN | Submit near-duplicate citations from two contributors, correct a field, then approve a merge. Verify exact raw strings and both credits remain retrievable, with old/new values and decision history. |
| RIS/BibTeX interoperability | PROPOSED / NOT_RUN | Import/export a small fixture through each selected build and common reader. Compare count and required fields (DOI present/absent, URL, Unicode creator, page range, related versions, tags if used); explicitly verify export excludes files/full text and avoid treating export as backup. |
| Page-range regression | PROPOSED / NOT_RUN | Include BibTeX `13905--13911`; expected RIS `SP=13905`, `EP=13911` for a release that claims the JabRef fix. Record exact versions and raw output. |
| Optional-path control | PROPOSED / NOT_RUN | Exercise export disabled/enabled and approved-provider settings only after owners choose them. Verify no unapproved provider, accounts, article download, or attachment export is introduced. |
| Citation style and presentation | PROPOSED / NOT_RUN | After lead's choice, compare generated examples in the group's selected styles and confirm metadata-only output. |

A future test report must identify exact app/build, platform, fixture hash, operation, expected and observed result, and unresolved failures. The source review and proposed acceptance criteria must not be described as a successful product validation.

## Per-clause disposition against the released plan

| Plan clause | Disposition | Final treatment |
|---|---|---|
| 1. Compare two reference-management/export workflows and an analogous identity mechanism | **Correct and complete** | Compare Zotero and Paperpile; add OpenRefine reconciliation as an analogy and a CSV fallback. Reject normalize-and-merge-identical-title behavior. |
| 2. DOI-less, versions, duplicate detection, submitted/corrected metadata | **Correct and complete** | DOI remains optional; separate preprint/journal records and relations; matcher outputs are suggestions; preserve raw submission and corrected field history. |
| 3. Optional export and identifier enrichment; distinguish lookup and accepted correction | **Retain, with safeguards** | Keep both optional; show candidates and field diffs, retain provider provenance, require editor approval. Manual path remains for DOI-less records. |
| 4. Released failure chain and affected scope | **Add** | Document JabRef #15106 → PR #15315 → v6.0-alpha.6, its pages `--` to RIS `SP`/`EP` scope, and limits. |
| 5. Authorized optional downloadable bibliography | **Retain conditionally** | Keep metadata/link-only RIS/BibTeX candidates; enable after reader/build round-trip and no-attachment tests. No evidence here justifies removing the option. |
| 6. Owner roles | **Retain and clarify** | Roles are specified by the brief. Editor approves; submitters retain credit/raw text; group lead chooses style/providers. Their concrete pilot choices remain open. |
| 7. Negative constraints | **Binding** | No paywalled/full-text downloads, contributor accounts, universal DOI uniqueness assumption, or silent preprint/journal merges. Avoid PDF-fetching connector paths. |
| 8. Evidence-backed proposal and validation distinction | **Complete with limits** | This draft includes recommendations, alternatives, applicability, unresolved owner choices, and a validation table. All product/API checks are NOT_RUN; checks in the table are proposed only. |

## Sources

Use `sources/index.md` for the navigable primary-source index and `source-map.json` for exact URL, version/commit cue, locator, retrieval time, observed operation, conditions, exceptions, and applicability. Source IDs [S01]–[S24] are stable across discovery and this draft.

[S01]: https://www.zotero.org/support/adding_items_to_zotero
[S02]: https://www.zotero.org/support/duplicate_detection
[S03]: https://www.zotero.org/support/kb/item_types_and_fields
[S04]: https://www.zotero.org/support/kb/importing_standardized_formats
[S05]: https://www.zotero.org/support/kb/exporting
[S06]: https://www.zotero.org/support/creating_bibliographies
[S07]: https://www.zotero.org/support/dev/translators
[S08]: https://cdn.paperpile.com/h/import-ris-bibtex/
[S09]: https://paperpile.com/h/duplicates-explained/
[S10]: https://paperpile.com/h/export-library-data/
[S11]: https://paperpile.com/h/search-online/
[S12]: https://www.api.paperpile.com/h/update-metadata-automatically/
[S13]: https://openrefine.org/docs/manual/reconciling
[S14]: https://openrefine.org/docs/technical-reference/reconciliation-api
[S15]: https://openrefine.org/docs/manual/cellediting#clustering
[S16]: https://www.crossref.org/documentation/retrieve-metadata/simple-text-query/
[S17]: https://www.crossref.org/documentation/retrieve-metadata/
[S18]: https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/
[S19]: https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/
[S20]: https://support.datacite.org/docs/versioning
[S21]: https://support.datacite.org/docs/preprints-post-prints-and-author-manuscripts
[S22]: https://github.com/JabRef/jabref/issues/15106
[S23]: https://github.com/JabRef/jabref/pull/15315
[S24]: https://github.com/JabRef/jabref/releases/tag/v6.0-alpha.6
